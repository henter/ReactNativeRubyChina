module.exports = {
  "name": "ruby-china-topic",
  "count": 31,
  "topic": {
    "title": "利用 ActiveSupport::Notifications 在 Rails 中实现 PUB/SUB 模式",
    "info": "Rails · Victor · 于 6 天前发布 · 最后由 flypiggys 于 4 天前回复 · 1270 次阅读",
    "content": "前言\n自从 Rails 4 从核心中移除了 Observers 之后，对于复杂的业务逻辑和依赖关系该放在哪，大家就开始各显神通了。\n有人建议利用 Concerns 和 callback 来搞定。\nmodule MyConcernModule\nextend ActiveSupport::Concern\nincluded do\nafter_save :do_something\nend\ndef do_something\n...\nend\nend\nclass MyModel < ActiveRecord::Base\ninclude MyConcernModule\nend\n更多的人认为，依据单一职责原则抽出一个 Service Object 才是王道。\n在此基础上，Wisper确实是一个很好的解决方案。\n你可以这么玩：\nclass PostsController < ApplicationController\ndef create\n@post = Post.new(params[:post])\n@post.subscribe(PusherListener.new)\n@post.subscribe(ActivityListener.new)\n@post.subscribe(StatisticsListener.new)\n@post.on(:create_post_successful) { |post| redirect_to post }\n@post.on(:create_post_failed) { |post| render :action => :new }\n@post.create\nend\nend\n也可以这么玩：\nclass ApplicationController < ActionController::Base\naround_filter :register_event_listeners\ndef register_event_listeners(&around_listener_block)\nWisper.with_listeners(UserListener.new) do\naround_listener_block.call\nend\nend\nend\nclass User\ninclude Wisper::Publisher\nafter_create{ |user| publish(:user_registered, user) }\nend\nclass UserListener\ndef user_registered(user)\nAnalytics.track(\"user:registered\", user.analytics)\nend\nend\n但是 @Rei 一句 Rails 有 ActiveSupport::Notifications 竟让我无言以对。\nActiveSupport::Notifications\n在阅读了相关阅读中给出的链接，以及 Notifications in Rails 3 和官方文档之后，感觉这东西设计出来完全是为了进行统计、日志、性能分析之类的事情啊。\n那么用它能不能实现一个 PUB/SUB 模式呢？先来回顾一下 PUB/SUB 模式核心的两个要点。\nPublishers 在对象状态改变且需要触发事件的时候发布事件。\nSubscribers 仅接收它们能响应的事件，并且在每个事件中可以接收到被监控的对象。\nThe Basics of AS::Noti!cations\nActiveSupport::Notifications 主要核心就是两个方法：instrument 和 subscribe。\n你可以把 instrument 理解为发布事件。instrument 会在代码块执行完毕并返回结果之后，发布事件 my.custom.event，同时会自动把相关的一组参数：开始时间、结束时间、每个事件的唯一ID等，放入 payload 对象。\nActiveSupport::Notifications.instrument \"my.custom.event\", this: :data do\n# do your custom stuff here\nend\n现在你可以监听这个事件：\nActiveSupport::Notifications.subscribe \"my.custom.event\" do |name, started, finished, unique_id, data|\nputs data.inspect # {:this=>:data}\nend\n理解了这两个方法，我们可以试着实现一个 PUB/SUB 模式。\nPublisher# app/pub_sub/publisher.rb\nmodule Publisher\nextend self\n# delegate to ActiveSupport::Notifications.instrument\ndef broadcast_event(event_name, payload={})\nif block_given?\nActiveSupport::Notifications.instrument(event_name, payload) do\nyield\nend\nelse\nActiveSupport::Notifications.instrument(event_name, payload)\nend\nend\nend\n首先我们定了 Publisher。它把 payload 夹在事件中广播出去，代码块也可以当做一个可选参数传递进来。\n我们可以在 model 或 controller 中发布具体事件。\nif user.save\n# publish event 'user.created', with payload {user: user}\nPublisher.broadcast_event('user.created', user: user)\nend\ndef create_user(params)\nuser = User.new(params)\n# publish event 'user.created', with payload {user: user}, using block syntax\n# now the event will have additional data about duration and exceptions\nPublisher.broadcast_event('user.created', user: user) do\nUser.save!\n# do some more important stuff here\nend\nend\nSubscriber\nSubscriber 可以订阅事件，并将代码块当做参数，传递给 ActiveSupport::Notifications::Event 的实例。\n# app/pub_sub/subscriber.rb\nmodule Subscriber\n# delegate to ActiveSupport::Notifications.subscribe\ndef self.subscribe(event_name)\nif block_given?\nActiveSupport::Notifications.subscribe(event_name) do |*args|\nevent = ActiveSupport::Notifications::Event.new(*args)\nyield(event)\nend\nend\nend\nend\n# subscriber example usage\nSubscriber.subscribe('user.created') do |event|\nerror = \"Error: #{event.payload[:exception].first}\" if event.payload[:exception]\nputs \"#{event.transaction_id} | #{event.name} | #{event.time} | #{event.duration} | #{event.payload[:user].id} | #{error}\"\nend\n经典场景\n用户注册后，为该用户发送欢迎邮件。\n# app/pub_sub/publisher.rb\nmodule Publisher\nextend ::ActiveSupport::Concern\nextend self\nincluded do\n# add support for namespace, one class - one namespace\nclass_attribute :pub_sub_namespace\nself.pub_sub_namespace = nil\nend\n# delegate to class method\ndef broadcast_event(event_name, payload={})\nif block_given?\nself.class.broadcast_event(event_name, payload) do\nyield\nend\nelse\nself.class.broadcast_event(event_name, payload)\nend\nend\nmodule ClassMethods\n# delegate to ASN\ndef broadcast_event(event_name, payload={})\nevent_name = [pub_sub_namespace, event_name].compact.join('.')\nif block_given?\nActiveSupport::Notifications.instrument(event_name, payload) do\nyield\nend\nelse\nActiveSupport::Notifications.instrument(event_name, payload)\nend\nend\nend\nend\n# app/pub_sub/publishers/registration.rb\nmodule Publishers\nclass Registration\ninclude Publisher\nself.pub_sub_namespace = 'registration'\nend\nend\n# broadcast event\nif user.save\nPublishers::Registration.broadcast_event('user_signed_up', user: user)\nend\n# app/pub_sub/subscribers/base.rb\nmodule Subscribers\nclass Base\nclass_attribute :subscriptions_enabled\nattr_reader :namespace\ndef initialize(namespace)\n@namespace = namespace\nend\n# attach public methods of subscriber with events in the namespace\ndef self.attach_to(namespace)\nlog_subscriber = new(namespace)\nlog_subscriber.public_methods(false).each do |event|\nActiveSupport::Notifications.subscribe(\"#{namespace}.#{event}\", log_subscriber)\nend\nend\n# trigger methods when an even is captured\ndef call(message, *args)\nmethod = message.gsub(\"#{namespace}.\", '')\nhandler = self.class.new(namespace)\nhandler.send(method, ActiveSupport::Notifications::Event.new(message, *args))\nend\nend\nend\n# app/pub_sub/subscribers/registration_mailer.rb\nmodule Subscribers\nclass RegistrationMailer < ::Subscribers::Base\ndef user_signed_up(event)\n# lets delay the delivery using delayed_job\nRegistrationMailer.delay(priority: 1).welcome_email(event.payload[:user])\nend\nend\nend\n# config/initializers/subscribers.rb\nSubscribers::RegistrationMailer.attach_to('registration')\n醉了吗？详细的解释可以看相关阅读中的文章。如果你的队友没有把 ASN 吃透，肯定会掀桌子。\n所以是引入一个 gem 还是自己根据 ASN 来实现同样的功能，还是由你自己想吧。\n相关阅读\nDigging Deep with ActiveSupport::Notifications 视频\nDigging Deep with ActiveSupport::Notifications PDF\nActive Support Instrumentation\nImplementing PUB/SUB in Rails; using ActiveSupport::Notifications\nInstrumenting Your Code With ActiveSupport Notifications\nUsing ActiveSupport::Notifications and ActiveSupport::Concern To Create An Audit Trail"
  },
  "comments": [
    {
      "comment": "好贴",
      "info": "1楼",
      "user": {
        "nickname": "huopo125",
        "avatar": "https://ruby-china.org/avatar/e81da7bdacd6c4328e48581e11aa2508.png?s=96&d=404"
      }
    },
    {
      "comment": "https://github.com/kickstarter/rack-attack#logging--instrumentation",
      "info": "",
      "user": {
        "nickname": "",
        "avatar": ""
      }
    },
    {
      "comment": "排版很赞，文档很用心，赞",
      "info": "2楼",
      "user": {
        "nickname": "cisolarix",
        "avatar": "https://ruby-china-files.b0.upaiyun.com/user/large_avatar/3253.png"
      }
    },
    {
      "comment": "我个人是不太喜欢在同步代码中引入这些不必要的复杂性。在Javascript里面写消息非常自然，但在Ruby里面还是直接呼叫比较好理解和调试。",
      "info": "3楼",
      "user": {
        "nickname": "billy",
        "avatar": "https://ruby-china-files.b0.upaiyun.com/user/large_avatar/11222.jpg"
      }
    },
    {
      "comment": "归根结底它实现的功能就是大吼一嗓子：兄弟们，注意，我变形了！",
      "info": "",
      "user": {
        "nickname": "",
        "avatar": ""
      }
    },
    {
      "comment": "至于其他人听到这声之后干啥，那就随便了。",
      "info": "",
      "user": {
        "nickname": "",
        "avatar": ""
      }
    },
    {
      "comment": "#3楼 @billy 不是的，主要是按需选择。\n直接呼叫适用于 你知道你需要谁来执行什么，而P/S模型适用于你不知道谁需要做些什么 或者说你不关注谁想继续做些什么。",
      "info": "4楼",
      "user": {
        "nickname": "taojay315",
        "avatar": "https://ruby-china-files.b0.upaiyun.com/user/large_avatar/3210.jpg"
      }
    },
    {
      "comment": "编造和发出邮件需要时间，这些本来不需要加在#create里面的。处理邮件过程中可能会出错，那么#create可能还要想着怎么处理错误，这些本来也是不需要它关心的。",
      "info": "",
      "user": {
        "nickname": "",
        "avatar": ""
      }
    },
    {
      "comment": "还有一个问题就是调试。本来Rails都是直来直去的代码，很好调试，但加入Observer pattern调试起来就比较麻烦。",
      "info": "",
      "user": {
        "nickname": "",
        "avatar": ""
      }
    },
    {
      "comment": "我们处理邮件是用RM，其他Sidekiq, delayed_job也都很合适，这些异步的才是真正的不关心。",
      "info": "",
      "user": {
        "nickname": "",
        "avatar": ""
      }
    },
    {
      "comment": "@taojay315 这种情况确实很多，但我觉得用RabittMQ或者Sidekiq或类似真正的异步方案才合适。同一个请求里面还有很多收听消息的，太复杂了。我觉得这应该也是Rails放弃Observer pattern的原因之一。",
      "info": "5楼",
      "user": {
        "nickname": "billy",
        "avatar": "https://ruby-china-files.b0.upaiyun.com/user/large_avatar/11222.jpg"
      }
    },
    {
      "comment": "我再来描述一下这个场景：",
      "info": "",
      "user": {
        "nickname": "",
        "avatar": ""
      }
    },
    {
      "comment": "这回理清了 Pub/Sub 和 Sidekiq 的关系了吗？",
      "info": "",
      "user": {
        "nickname": "",
        "avatar": ""
      }
    },
    {
      "comment": "ActiveSupport::Notifications 真实应用场景我只见过 rack-attack 用来记日志",
      "info": "6楼",
      "user": {
        "nickname": "Rei",
        "avatar": "https://ruby-china-files.b0.upaiyun.com/user/large_avatar/1.jpg"
      }
    },
    {
      "comment": "我换个问法：注册用户触发发送邮件，你觉得写到哪里或者在哪调用发送邮件的方法好？",
      "info": "",
      "user": {
        "nickname": "",
        "avatar": ""
      }
    },
    {
      "comment": "#5楼 @billy 还是看情况吧 比如下面的例子 这种 非功能性需求 上RM之类的就没有必要了\n#6楼 @Rei 还有AR的LogSubscriber 应该还有性能的subscriber",
      "info": "7楼",
      "user": {
        "nickname": "taojay315",
        "avatar": "https://ruby-china-files.b0.upaiyun.com/user/large_avatar/3210.jpg"
      }
    },
    {
      "comment": "#5楼 @billy 还是看情况吧 比如下面的例子 这种 非功能性需求 上RM之类的就没有必要了\n#6楼 @Rei 还有AR的LogSubscriber 应该还有性能的subscriber",
      "info": "8楼",
      "user": {
        "nickname": "taojay315",
        "avatar": "https://ruby-china-files.b0.upaiyun.com/user/large_avatar/3210.jpg"
      }
    },
    {
      "comment": "我们在项目中用它来打 log 分析数据",
      "info": "9楼",
      "user": {
        "nickname": "huacnlee",
        "avatar": "https://ruby-china-files.b0.upaiyun.com/user/large_avatar/2.jpg"
      }
    },
    {
      "comment": "",
      "info": "10楼",
      "user": {
        "nickname": "amcsc",
        "avatar": "https://ruby-china-files.b0.upaiyun.com/user/large_avatar/6497.jpg"
      }
    },
    {
      "comment": "@taojay315 进了model, controller的正常代码就不能算是非功能性的了。性能之类是确实非常有用，我们用过sql.active_record做索引的比较，这个又准又方便。",
      "info": "11楼",
      "user": {
        "nickname": "billy",
        "avatar": "https://ruby-china-files.b0.upaiyun.com/user/large_avatar/11222.jpg"
      }
    },
    {
      "comment": "#11楼 @billy 非功能性 也可以叫 非商业逻辑代码 比如 @huacnlee 说的那个情况。你可以读一下我附加的链接，有人也认为像 发送欢迎邮件 之类的不属于核心功能，可以用广播来发送。",
      "info": "12楼",
      "user": {
        "nickname": "Victor",
        "avatar": "https://ruby-china.org/avatar/976b3058fc2bc02166a6a3a72b48cb62.png?s=96&d=404"
      }
    },
    {
      "comment": "@Victor 打log，各种分析都是非常合适的用途。但欢迎邮件这些是不合适的，原因就在于你说的不属于核心功能，所以你不需要把所有的过程都加在一个请求里面，比如UsersController#create。你看着代码是分散了，但实际上他们都是在一个进程，一个请求里面实现的。",
      "info": "13楼",
      "user": {
        "nickname": "billy",
        "avatar": "https://ruby-china-files.b0.upaiyun.com/user/large_avatar/11222.jpg"
      }
    },
    {
      "comment": "#13楼 @billy 异步队列和 Pub/Sub 模式不冲突。我在另外一篇帖子中提到这个问题了：Pub/Sub 模式中具体怎么处理事件，是直接打印输入，还是扔到队列中都可以啊。像你说的发送邮件这种事情，扔到队列中是毫无二异的。",
      "info": "14楼",
      "user": {
        "nickname": "Victor",
        "avatar": "https://ruby-china.org/avatar/976b3058fc2bc02166a6a3a72b48cb62.png?s=96&d=404"
      }
    },
    {
      "comment": "@Victor 你不需要和我解释pub/sub模式是怎么回事，基本的pattern没人不懂。你是看着这个好，没吃过苦头。要想分开责任，直接在Controller或者Service Object里面呼叫EmailService就可以了，单线程里面弄这么复杂是自找麻烦。",
      "info": "15楼",
      "user": {
        "nickname": "billy",
        "avatar": "https://ruby-china-files.b0.upaiyun.com/user/large_avatar/11222.jpg"
      }
    },
    {
      "comment": "#15楼 @billy 我是没看懂你在 #13 楼的回复。好像哪句都连不到一起。。。",
      "info": "16楼",
      "user": {
        "nickname": "Victor",
        "avatar": "https://ruby-china.org/avatar/976b3058fc2bc02166a6a3a72b48cb62.png?s=96&d=404"
      }
    },
    {
      "comment": "最简单就直接在Controller里面了。如果逻辑不多, Controller也是最好的。",
      "info": "17楼",
      "user": {
        "nickname": "billy",
        "avatar": "https://ruby-china-files.b0.upaiyun.com/user/large_avatar/11222.jpg"
      }
    },
    {
      "comment": "#17楼 @billy 我也觉得你这样好。只是在研究 Pub/Sub 的时候，有人建议把这个模式和 Service Object 结合到一起。我确实没有实践过这种结合法，不知道有什么坑。不过我今天就要踩踩看了，如果有新进展，我再 @ 你，并补充此文。",
      "info": "18楼",
      "user": {
        "nickname": "Victor",
        "avatar": "https://ruby-china.org/avatar/976b3058fc2bc02166a6a3a72b48cb62.png?s=96&d=404"
      }
    },
    {
      "comment": "@Victor 好，鼓励多尝试",
      "info": "19楼",
      "user": {
        "nickname": "billy",
        "avatar": "https://ruby-china-files.b0.upaiyun.com/user/large_avatar/11222.jpg"
      }
    },
    {
      "comment": "#18楼 @Victor 提醒：sub / pub 模式建议用NodeJS的解决方案。至少目前自己用的很顺。",
      "info": "20楼",
      "user": {
        "nickname": "gazeldx",
        "avatar": "https://ruby-china-files.b0.upaiyun.com/user/large_avatar/68.jpg"
      }
    },
    {
      "comment": "我更倾向于在应用间使用 pub/sub 模式进行沟通.\n现在实际应用中是使用队列进行沟通.",
      "info": "21楼",
      "user": {
        "nickname": "flypiggys",
        "avatar": "https://ruby-china-files.b0.upaiyun.com/user/large_avatar/3444.png"
      }
    }
  ],
  "url": "https://ruby-china.org/topics/24914",
  "results": {}
};

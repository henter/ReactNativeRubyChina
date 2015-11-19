
var React = require('react-native');

var {
	View,
	Text,
	TouchableHighlight,
	Image,
} = React;

var Style = require('./ListCellStyleSheet');
var timeago = require('./timeago');


module.exports = React.createClass({
	render: function(){
		var data = this.props.data;
    var avatar_url = data.user.avatar_url;
    if(avatar_url.substr(0, 2) == '//'){
      avatar_url = 'https:'+avatar_url;
    }
		return (
			<TouchableHighlight onPress={this.props.onSelect} underlayColor={'#eeeeee'}>
				<View style={Style.container}>
					<Image style={Style.avatar}
					source={{
						uri: avatar_url
					}} />

					<View style={Style.topic}>
						<Text style={Style.title}>
							{data.title}
						</Text>
						{this.renderInfo()}
					</View>

					{this.renderCommentCount()}
				</View>
			</TouchableHighlight>
		);
	},

	renderCommentCount: function(){
		var data = this.props.data;
		if(data.replies_count){
			var comment_width = 24 + data.replies_count.toString().length * 8;
			return (
					<View style={Style.replyNumWrapper}>
						<View style={[Style.replyNum, {width: comment_width}]}>
							<Text style={Style.replyNumText}>{data.replies_count}</Text>
						</View>
					</View>
				);
		}
		return;
	},

	renderInfo: function(){
		var data = this.props.data;
		if(data.replied_at){
			return (
						<Text style={Style.info}>
							<Text style={Style.node_name}>{data.node_name}</Text> • 
							<Text style={Style.user}>{data.user.login}</Text> • 
							<Text>最后由</Text>
							<Text style={Style.user}>{data.node_name}</Text> 
							<Text style={Style.time}>于{timeago(data.replied_at)}发布</Text>
						</Text>
						);
		}
		return (
						<Text style={Style.info}>
							<Text style={Style.node_name}>{data.node_name}</Text> • 
							<Text style={Style.user}>{data.user.login}</Text> • 
							<Text style={Style.time}>于{timeago(data.replied_at)}发布</Text>
						</Text>
			);
	}
});

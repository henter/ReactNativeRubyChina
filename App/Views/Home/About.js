var React = require('react-native');
var { 
  TouchableHighlight, 
  Text ,
  Image,
  View
} = React;

var Style = React.StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    flex:1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10
  },
  ad: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'left'
  },
  link: {
    marginTop: 20,
    color: '#356DD0',
  },
  logo: {
    height: 150,
    width: 150,
  }
});

var About = React.createClass({
  render: function() {
    return (
      <View style={Style.container}>
          <Image style={Style.logo} source={{uri: 'https://ruby-china-files.b0.upaiyun.com/assets/big_logo-5cdc3135cbb21938b8cd789bb9ffaa13.png'}} />
          <Text style={Style.ad}>
Ruby China，对！没错！
          </Text>
          <Text style={Style.ad}>
这里就是 Ruby 社区，目前这里已经是国内最权威的 Ruby 社区，拥有国内所有资深的 Ruby 工程师。
          </Text>


        <TouchableHighlight onPress={() => this._onPress('ReactNative RubyChina', 'http://github.com/henter/ReactNativeRubyChina')}>
          <Text style={Style.link}>
            http://github.com/henter/ReactNativeRubyChina
          </Text>
        </TouchableHighlight>


      </View>

    );
  },

  _onPress: function(title, url){

    this.props.navigator.push({
      title: title,
      component: require('../Web'),
      passProps: {url: url},
    });

  }
});

module.exports = About;





/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 */
'use strict';

var React = require('react-native');
var {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  TabBarIOS,
  NavigatorIOS,
} = React;

var RubyChina = React.createClass({
  getInitialState: function() {
      return {
          selectedTab: 'home'
      };
  },
  render: function() {
    return (
        <TabBarIOS selectedTab={this.state.selectedTab}>
            <TabBarIOS.Item accessibilityLabel={"Excellent"}
                selected={this.state.selectedTab === 'home'}
                title="精华"
                name="home"
                icon={{uri: 'icon.png', isStatic: true}}
                onPress={() => {
                    this.setState({
                      selectedTab: 'home'
                    });
                }}>
                <NavigatorIOS style={Style.container}
                    tintColor={'#333344'}
                    initialRoute={{
                      title: '社区精华',
                      component: require('./App/Views/Home/Home')
                    }}
                    itemWrapperStyle={Style.navigator} />
            </TabBarIOS.Item>

            <TabBarIOS.Item accessibilityLabel={"Nodes"}
                selected={this.state.selectedTab === 'nodes'}
                title="节点分类"
                name="nodes"
                icon={{uri:'nodes.png'}}
                onPress={() => {
                    this.setState({
                      selectedTab: 'nodes'
                    });
                }}>

                <NavigatorIOS style={Style.container}
                    tintColor={'#333344'}
                    initialRoute={{
                      title: '节点分类',
                      component: require('./App/Views/Home/Nodes')
                    }}
                    itemWrapperStyle={Style.navigator} />

            </TabBarIOS.Item>

            <TabBarIOS.Item accessibilityLabel={"About"}
                selected={this.state.selectedTab === 'about'}
                title="关于"
                name="about"
                icon={{uri: 'reactnative_logo.png'}}
                onPress={() => {
                    this.setState({
                      selectedTab: 'about'
                    });
                }}>

                <NavigatorIOS style={Style.container}
                    tintColor={'#333344'}
                    initialRoute={{
                      title: 'About',
                      component: require('./App/Views/Home/About')
                    }}
                    itemWrapperStyle={Style.navigator} />

            </TabBarIOS.Item>
        </TabBarIOS>
    );
  }
});

var Style = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E7EAEC'
  },
  navigator: {
    backgroundColor: '#E7EAEC'
  }
});

AppRegistry.registerComponent('RubyChina', () => RubyChina);

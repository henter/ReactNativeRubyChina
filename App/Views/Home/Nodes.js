'use strict';
var React = require('react-native');

var {
	Text,
	View,
	ScrollView,
	ActivityIndicatorIOS,
	TouchableHighlight,
	PixelRatio
} = React;

var Api = require('../../Network/API');
var NodeCell = require('./NodeCell');

var Style = React.StyleSheet.create({
	container: {
		backgroundColor: '#eeeeee',
		flex:1,
		justifyContent: 'center',
		alignItems: 'center'
	},
	nodes: {
		flex: 1,
		padding: 8,
		flexDirection: 'row',
	},
	nodeWrapper: {
		flex: 1,
		backgroundColor: '#ffffff',
		flexDirection: 'row',
		justifyContent: 'center',
		padding: 8,
		margin: 5,
		width: PixelRatio.get() === 3 ? 124 : PixelRatio.getPixelSizeForLayoutSize(55),
		marginBottom: 5,
	},
	node: {
		fontSize: 14,
		fontWeight: 'bold',
		textAlign: 'left',
		color: '#666E74'
	},

});
//console.log('pixeratio');
//console.log(PixelRatio.get());

module.exports = React.createClass({
	getInitialState: function(){
		return {
			nodes: [],
			loaded: false
		};
	},
	componentDidMount: function(){
		this.fetchData();
	},
	fetchData: function(){
		fetch(Api.Nodes())
		.then((response) => {
			return response.json();
		})
		.then((responseData) => {
			if(!responseData.nodes){
				return ;
			}else{
				this.setState({
					nodes: responseData.nodes,
					loaded: true
				});
			}
		})
		.done();
	},
	render: function(){
		if(!this.state.loaded){
			return this.renderLoading();
		}
		return this.renderNodeList();
	},
	renderLoading: function(){
		return (
			<View style={Style.container}>
				<ActivityIndicatorIOS color="#356DD0" style={{marginVertical: 30,marginBottom: 30}} />
			</View>
		);
	},

	//每行3个，这里将nodes切成N个数组，每个数组3条数据
	renderNodesAuto: function(){
		var nodes = this.state.nodes;
		var n = Math.ceil(nodes.length/3);
		var r = [];
		for (var i = 1; i <= n; i++) {
			r.push(nodes.slice((i-1)*3, i*3));
		};
		//console.log(r);
		return r.map(this.renderNodes);
	},
	renderNodes: function(nodes){
		//console.log(nodes);
		return (
			<View style={Style.nodes}>
				{nodes.map(this.renderNodeCell)}
			</View>
		);
	},
	renderNodeList: function(){
		return (
			<ScrollView style={{marginTop: 65, marginBottom: 50}}>
				{this.renderNodesAuto()}
			</ScrollView>
			);
	},
	renderNodeCell: function(data){
		return (
			<TouchableHighlight
				onPress={
					() => this.selectNode(data)
				}
			 	underlayColor={'#eeeeee'}>
				<View style={Style.nodeWrapper}>
					<Text style={Style.node}>
						{data.name}
					</Text>
				</View>
			</TouchableHighlight>

		);
	},

	//跳转到node topic列表
	selectNode: function(data){
	    this.props.navigator.push({
	      title: data.name,
	      component: require('../Topic/List'),
	      passProps: {data: data},
	    });
	},

});

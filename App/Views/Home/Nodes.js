'use strict';
var React = require('react-native');

var {
	Text,
	View,
	ListView,
	ActivityIndicatorIOS
} = React;

var Api = require('../../Network/API');
var SectionCell = require('./SectionCell');

var Style = React.StyleSheet.create({
	container: {
		backgroundColor: '#eeeeee',
		flex:1,
		justifyContent: 'center',
		alignItems: 'center'
	}
});


module.exports = React.createClass({
	getInitialState: function(){
		return {
			dataSource: new ListView.DataSource({
				rowHasChanged: (r1, r2) => r1 !== r2
			}),
			loaded: false
		};
	},
	componentDidMount: function(){
		this.fetchData();
	},
	fetchData: function(){

		//fake data
		/*
		var fake_json = require('../../Network/Fake/nodes');
		this.setState({
				dataSource: this.state.dataSource.cloneWithRows(fake_json.results.collection1),
				loaded: true
			});
		return true;
		*/
		

		console.log(Api.Nodes());
		fetch(Api.Nodes())
		.then((response) => {
			return response.json();
		})
		.then((responseData) => {
			console.log(responseData);
			if(!responseData.results){
				return ;
			}else{
				this.setState({
					dataSource: this.state.dataSource.cloneWithRows(responseData.results.collection1),
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
	renderNodeList: function(){
		// console.log(this.props);
		return (
			<ListView
				dataSource={this.state.dataSource}
				renderRow={this.renderSectionCell}
				style={{marginTop:0}} />
		);
	},
	renderSectionCell: function(data){
		return (
			<SectionCell 
				onSelectNode={
					(data) => this.selectNode(data)
				}
			data={data} />
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
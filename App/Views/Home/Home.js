'use strict';
var React = require('react-native');

var {
	Text,
	View,
	ListView,
	ActivityIndicatorIOS
} = React;

var Api = require('../../Network/API');
var TopicListCell = require('../Topic/ListCell');
var TopicView = require('../Topic/View');

var Style = React.StyleSheet.create({
	container: {
		backgroundColor: '#eeeeee',
		flex:1,
		justifyContent: 'center',
		alignItems: 'center'
	},
	listView: {
		marginTop: 65,
		marginBottom: 0
	},
});


var CACHE = [];

var TopicList = React.createClass({
	getInitialState: function(){
		return {
			dataSource: new ListView.DataSource({
				rowHasChanged: (r1, r2) => r1 !== r2
			}),
			loaded: false,
			loadingPage: 0,
			currentPage: 0,
		};
	},
	componentDidMount: function(){
		this.fetchData(1);
	},
	cache: function(items){
          for (var i in items) {
            CACHE.push(items[i]);
          }
	},
	fetchData: function(page){
		console.log('loading page '+page+'...');

		this.setState({
			loaded: false,
      loadingPage: page
		});

		var limit = 50;
		var offset = (page-1)*limit;

		console.log(Api.HomeTopics(offset, limit));
		fetch(Api.HomeTopics(offset, limit))
		.then((response) => {
			//console.log(response.json());
			return response.json();
		})
		.catch((error) => {
		    React.AlertIOS.alert(
		      'error',
		      '请求失败:'+error.message
		    );
		})
		.then((responseData) => {
			this.cache(responseData.topics);

			console.log('loaded data, page'+page);

			if(responseData.error){
				React.AlertIOS.alert(
			      'error',
			      responseData.error
			    );
			}else{
				this.setState({
					dataSource: this.state.dataSource.cloneWithRows(CACHE),
					loaded: true,
					currentPage: this.state.currentPage+1,
				});
			}
		})
		.done();
	},

	render: function(){
		if(this.state.loadingPage == 1 && !this.state.loaded){
			return (
				<View style={{height: 50}}>
					<ActivityIndicatorIOS color="#356DD0" style={{marginVertical: 30,marginBottom: 30}} />
				</View>
			);
		}
		return this.renderTopicList();
	},

	renderFooter: function() {
	    if(this.state.loaded){
	    	return <View style={{marginVertical: 30}} ><Text>...</Text></View>;
	    }
	    return <ActivityIndicatorIOS color="#356DD0"  style={{marginVertical: 30,marginBottom: 30}} />;
	},

	onEndReached: function() {
	    if(!this.state.loaded) {
	      return;
	    }
	    return this.fetchData(this.state.currentPage + 1);
	},

	renderTopicList: function(){
		// console.log(this.props);
		return (
			<ListView
			style={Style.listView}
	        ref="listview"
	        pageSize={15}
	        dataSource={this.state.dataSource}
	        renderFooter={this.renderFooter}
	        renderRow={this.renderTopicListCell}
	        onEndReached={this.onEndReached}
	        automaticallyAdjustContentInsets={false}
	        showsVerticalScrollIndicator={false} />
		);
	},

	renderTopicListCell: function(data){
		return (
			<TopicListCell
				onSelect={
					() => this.selectTopic(data)
				}
				data={data} />
		);
	},
	selectTopic: function(data){
		this.props.navigator.push({
			title: '详细' + (data.replies_count ? '（' + data.replies_count.toString() + '条回复）' : ''),
			component: TopicView,
			passProps: {
				data: data
			}
		});
	},

});

module.exports = TopicList;

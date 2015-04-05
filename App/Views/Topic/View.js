'use strict';
var React = require('react-native');

var {
	Text,
	View,
	Image,
	ListView,
	ScrollView,
	ActivityIndicatorIOS
} = React;

var Style = require('./StyleSheet');
var Api = require('../../Network/API');

var CommentCell = require('./CommentCell');

var TopicView = React.createClass({
	getInitialState: function(){
		return {
			commentsDataSource: new ListView.DataSource({
				rowHasChanged: (r1, r2) => r1 !== r2
			}),
			loaded: false,
		};
	},
	componentDidMount: function(){
		this.fetchData();
	},
	fetchData: function(){
		//fake data
		/*
		var fake_json = require('../../Network/Fake/topic');
		this.setState({
				topic: fake_json.topic,
				commentsDataSource: this.state.commentsDataSource.cloneWithRows(fake_json.comments),
				loaded: true
			});
		return true;
		*/

		fetch(Api.Topic(this.props.data.id))
		.then((response) => {
			// console.log(response);
			return response.json();
		})
		.then((responseData) => {
			this.setState({
				topic: responseData.topic,
				commentsDataSource: this.state.commentsDataSource.cloneWithRows(responseData.comments),
				loaded: true
			});
		})
		.done();
	},

	render: function(){
		return (

			<View style={{flex:1, marginTop: 65}}>
				{this.renderTopicHeader()}
				{this.renderLoaded()}
			</View>

			);
	},

	renderLoaded: function(){
		if(!this.state.loaded){
			return (
				<View style={{height: 20}}>
					<ActivityIndicatorIOS color="#356DD0" style={{marginVertical: 30,marginBottom: 30}} />
				</View>
			);
		}

		var topic = this.state.topic;
		var data = this.props.data;

		return (
			<ListView renderHeader={this.renderTopicContent}
			dataSource={this.state.commentsDataSource}
			renderRow={this.renderComments}
			style={Style.TopicList} />
		);
	},

	renderTopicContent: function(){
		var topic = this.state.topic;
		return (
			<View style={Style.container}>
				<View style={[Style.contentWrapper, {marginTop: -65}]}>
					<Text style={Style.content}>
						{topic.content}
					</Text>
				</View>
			</View>
		);
	},

	renderTopicHeader: function(){
		var data = this.props.data;
		return (
			<View style={Style.header}>
				<View style={{flex:1}}>
					<Text style={Style.title}>
						{data.title}
					</Text>
					<Text style={Style.info}>
						{data.info}
					</Text>
				</View>
				<Image style={Style.avatar} 
						source={{
							uri: data.user.avatar
					}}/>
			</View>
		);
	},

	renderComments: function(data){
		return (
			<CommentCell data={data} />
		);
	},

});

module.exports = TopicView;

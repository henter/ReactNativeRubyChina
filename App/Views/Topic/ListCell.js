
var React = require('react-native');

var {
	View,
	Text,
	TouchableHighlight,
	Image,
} = React;

var Style = require('./ListCellStyleSheet');

module.exports = React.createClass({
	render: function(){
		var data = this.props.data;

		if(data.comment_count){
			var comment_width = 20 + data.comment_count.toString().length * 8;
		}else{
			var comment_width = 20;
		}
		
		//console.log(comment_width);
		return (
			<TouchableHighlight onPress={this.props.onSelect} underlayColor={'#eeeeee'}>
				<View style={Style.container}>
					<Image style={Style.avatar}
					source={{
						uri: data.user.avatar
					}} />

					<View style={Style.topic}>
						<Text style={Style.title}>
							{data.title}
						</Text>
						<Text style={Style.info}>
							{data.info}
						</Text>
					</View>
					<View style={Style.replyNumWrapper}>
						<View style2={Style.replyNum}
style={[Style.replyNum, {width: comment_width}]}
						>
							<Text style={Style.replyNumText}
							>{data.comment_count}</Text>
						</View>
					</View>

				</View>
			</TouchableHighlight>
		);
	}
});
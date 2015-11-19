
var React = require('react-native');

var {
	View,
	Text,
	Image,
	StyleSheet,
} = React;

var Style = StyleSheet.create({
	container: {
		backgroundColor: '#ffffff',
		flex: 1,
		flexDirection: 'row',
		justifyContent: 'center',
		padding: 8,
		borderBottomWidth: 1,
		borderColor: '#eeeeee',
	},
	infobar: {
		flexDirection: 'row',
	},
	content: {
		flex: 1,
		marginBottom: 5,
		marginLeft: 10
	},
	nickname: {
		fontSize: 12,
		color: '#356DD0'
	},
	info: {
		fontSize: 12,
		marginLeft: 5,
		color: '#666666',
	},
	comment: {
		fontSize: 12,
		color: '#666666',
		paddingTop: 5
	},
	avatar: {
		width: 30,
		height: 30,
		marginLeft: 5,
		borderRadius: 4
	},
});

var timeago = require('./timeago');

module.exports = React.createClass({
	render: function(){
		var data = this.props.data;
		var body = data.body_html.replace(/<\/?[^>]+>/g, '');

    var avatar_url = data.user.avatar_url;
    if(avatar_url.substr(0, 2) == '//'){
      avatar_url = 'https:'+avatar_url;
    }

		return (
			<View style={Style.container}>
				<Image style={Style.avatar}
					source={{
						uri: avatar_url
					}} />

				<View style={Style.content}>
					<View style={Style.infobar}>
						<Text style={Style.nickname}>
							{data.user.name}
						</Text>

						<Text style={Style.info}>
							{timeago(data.created_at)}
						</Text>
					</View>

					<Text style={Style.comment}>
						{body}
					</Text>
				</View>

			</View>
		);
	}
});


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
		marginLeft: 5,
		color: '#666666',
	},
	comment: {
		fontSize: 12,
		color: '#666666'
	},
	avatar: {
		width: 30,
		height: 30,
		marginLeft: 5,
		borderRadius: 4
	},
});


module.exports = React.createClass({
	render: function(){
		var data = this.props.data;

		return (
			<View style={Style.container}>
				<Image style={Style.avatar}
					source={{
						uri: data.user.avatar
					}} />

				<View style={Style.content}>
					<View style={Style.infobar}>
						<Text style={Style.nickname}>
							{data.user.nickname}
						</Text>

						<Text style={Style.info}>
							{data.info}
						</Text>
					</View>

					<Text style={Style.comment}>
						{data.comment}
					</Text>
				</View>

			</View>
		);
	}
});


var React = require('react-native');

var {
	View,
	Text,
	ListView,
	TouchableHighlight,
	StyleSheet
} = React;

var Style = StyleSheet.create({
	sectionCell: {
		backgroundColor: '#eeeeee',
		flex:1,
		justifyContent: 'center',
		alignItems: 'flex-start'
	},
	nodes: {
		flex: 1,
		padding: 8,
		flexDirection: 'row',
	},
	sectionWrapper: {
		flex: 1,
		backgroundColor:'#eeeeee',
		padding: 20,
		justifyContent: 'center',
		alignItems: 'flex-start',
		alignSelf: 'flex-start',
		borderBottomWidth: 1,
		borderColor: '#eeeeee',
	},
	section: {
		fontSize: 14,
		color: '#666666'
	},

	nodeWrapper: {
		flex: 1,
		backgroundColor: '#ffffff',
		flexDirection: 'row',
		justifyContent: 'center',
		padding: 8,
		margin: 5,
		width: 110,
		borderWidth: 1,
		borderColor: '#eeeeee',
		marginBottom: 5,
	},
	node: {
		fontSize: 14,
		fontWeight: 'bold',
		textAlign: 'left',
		color: '#666E74'
	}

});


var NodeCell = React.createClass({
	render: function(){
		var data = this.props.data;
		return (
			<TouchableHighlight
				onPress={
					() => this.props.onSelectNode(data)
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
});


module.exports = React.createClass({
	render: function(){
		var data = this.props.data;
		return (
			<View style={Style.sectionCell}>
				<View style={Style.sectionWrapper}>
					<Text style={Style.section}>
						{data.section}
					</Text>
				</View>
				{this.renderNodesAuto()}
			</View>
		);
	},

	//每行3个，这里将nodes切成N个数组，每个数组3条数据
	renderNodesAuto: function(){
		var nodes = this.props.data.nodes;
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
	renderNodeCell: function(data){
		return (
			<NodeCell
				onSelectNode={this.props.onSelectNode} 
				onSelectNode={
					(data) => this.props.onSelectNode(data)
				}

				data={data} />
			);
	},

});
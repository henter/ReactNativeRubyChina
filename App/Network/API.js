'use strict';
var BASE = 'https://www.kimonolabs.com/api/ondemand/';
var APIKEY = 'qbbazNSlIkurzMJrDEHR8HiI4I0iihBG';

function api(api, v){
	if(v instanceof Object){
		var p = Object.keys(v).map(function(k) {
			return encodeURIComponent(k) + "=" + encodeURIComponent(v[k]);
		}).join('&');
	}else{
		var p = v;
	}
	return BASE + api + '?apikey=' + APIKEY + '&' + p;
}

function getNodes(){
	return api('1wy2ekno', {'kimmodify': 1});
	return 'https://www.kimonolabs.com/api/ondemand/1wy2ekno?apikey=qbbazNSlIkurzMJrDEHR8HiI4I0iihBG&kimmodify=1';
}


function getHomeTopics(page){
	return api('92vscx2s', {'page': page, 'kimmodify': 1});
	return 'https://www.kimonolabs.com/api/ondemand/92vscx2s?apikey=qbbazNSlIkurzMJrDEHR8HiI4I0iihBG&kimmodify=1&page=3';
}

function getNodeTopics(node_id, page){
	return api('b4w7f3h6', {'kimpath2':'node'+node_id, 'page': page, 'kimmodify': 1});
	return 'https://www.kimonolabs.com/api/ondemand/b4w7f3h6?apikey=qbbazNSlIkurzMJrDEHR8HiI4I0iihBG&&kimpath2=node29&kimmodify=1';
}

function getTopic(id){
	return api('3v0suq7k', {'kimpath2': id, 'kimmodify':1});
	return 'https://www.kimonolabs.com/api/ondemand/3v0suq7k?apikey=qbbazNSlIkurzMJrDEHR8HiI4I0iihBG&kimmodify=1&kimpath2='+id;
}

module.exports = {
	Nodes: getNodes,
	HomeTopics: getHomeTopics,
	NodeTopics: getNodeTopics,
	Topic: getTopic,
};
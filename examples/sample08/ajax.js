/*!
 * ajax.js
 *
 * Copyright (c) 2013 Yoshi 
 * This software is distributed under the MIT License.(../../MIT-LICENSE.txt)
 */

function getRotationArray (id, src, dst, type) {
	if(typeof type === 'undefined') type = 'default';
	$.ajax({
		url: "../../lib/cgi/get_rotation_array.cgi?src="+src+"&dst="+dst+"&id="+id,
		type: "GET",
		data: {},
		contentType: "application/json",
		dataType: "json",
		success: function(msg) {  
			if (msg['ret'] != 0) return 0;
			if (type == 'gw') 
				g.drawinfo_gwflows[msg['id']]['rot'] = msg['rot'];
			else 
				g.drawinfo_flows[msg['id']]['rot'] = msg['rot'];
		},
		error: function() { $("#debug").append(
			"Error: getRotationArray(): failed to get a rotation array."); },
		complete: undefined
	});
}

function getSdnObjects(key) {
	var datapath = "./get_objs.cgi?id="+key;
	g.sdn_objs = {};
	$.ajax({
		url: datapath,
		type: "GET",
		data: {},
		contentType: "application/json",
		dataType: "json",
		success: function(msg) { g.sdn_objs = msg; },
		error: function() { $("#debug").append(
			"Error: loadObject(): failed to get object parameters"); },
		complete: undefined
	});
}

function getOtherObjects(key) {
	g.other_objs = {};
	if (key != 4) return; 
	$.ajax({
		url: "../../lib/cgi/get_otherobjs.cgi",
		type: "GET",
		data: {},
		contentType: "application/json",
		dataType: "json",
		success: function(msg) { g.other_objs = msg; },
		error: function() { $("#debug").append(
			"Error: loadObject(): failed to get object parameters"); },
		complete: undefined
	});
}

function loadObject () {
	getSdnObjects(8);
	getOtherObjects(8);
	getFlowData(8);
}

function getFlowData (key) {
	if (key == undefined) key = g.flowdata_id;
	g.flowinfo = {};
	$.ajax({
		url: "get_flow.cgi?id="+key,
		type: "GET",
		data: {},
		contentType: "application/json",
		dataType: "json",
		success: function(msg) { g.flowinfo = msg; },
		error: function() { $("#debug").append(
			"Error: loadObject(): failed to get flow lists"); },
		complete: undefined
	});

	if (g.gwflowstat != undefined) return;
	g.gwflowstat = {};
	$.ajax({
		url: "../../lib/cgi/get_gwflow_dummy.cgi",
		type: "GET",
		data: {},
		contentType: "application/json",
		dataType: "json",
		success: function(msg) { g.gwflowstat = msg; },
		error: function() { $("#debug").append(
			"Error: loadObject(): failed to get gateway flow lists"); },
		complete: undefined
	});
}

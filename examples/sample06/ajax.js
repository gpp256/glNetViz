/*!
 * ajax.js
 *
 * Copyright (c) 2013 Yoshi 
 * This software is distributed under the MIT License.(../../MIT-LICENSE.txt)
 */

// ajax関数を作ればもっとシンプルにまとめられる

// get rotation array
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
			if (type == 'gw') {
				g.drawinfo_gwflows[msg['id']]['rot'] = msg['rot'];
			} else if (type == 'linkList') {
				g.sdn_objs['linkList'][msg['id']]['rot'] = msg['rot'];
			} else { 
				g.drawinfo_flows[msg['id']]['rot'] = msg['rot'];
			}
		},
        error: function() { $("#debug").append(
			"Error: getRotationArray(): failed to get a rotation array.<br>"); },
        complete: undefined
    });
}

// load objects
function loadObject () {
    $.ajax({
        url: "../../lib/cgi/get_sdnobjs_dummy.cgi?",
        type: "GET",
        data: {},
        contentType: "application/json",
        dataType: "json",
		success: function(msg) { g.sdn_objs = msg; },
        error: function() { $("#debug").append(
			"Error: loadObject(): failed to get object parameters.<br>"); },
        complete: undefined
    });

    $.ajax({
        url: "../../lib/cgi/get_otherobjs.cgi",
        type: "GET",
        data: {},
        contentType: "application/json",
        dataType: "json",
		success: function(msg) { g.other_objs = msg; updateObjectPos(); },
        error: function() { $("#debug").append(
			"Error: loadObject(): failed to get object parameters.<br>"); },
        complete: undefined
    });
	
	getFlowData();
}

// update the object position
function updateObjectPos() {
	var poslist = new Array ();
	L: for (var i in g.sdn_objs['objList']) {
		for (var objid in g.other_objs["switches"]) {
			if ( g.sdn_objs['objList'][i]["name"] == 
					g.other_objs["switches"][objid]["name"]){
				var pos = { 
					b_pos: g.sdn_objs['objList'][i]["pos"],
					a_pos: g.other_objs["switches"][objid]["pos"]
				};
				if (pos['b_pos'][0] == pos['a_pos'][0] && 
					pos['b_pos'][1] == pos['a_pos'][1] &&
					pos['b_pos'][2] == pos['a_pos'][2] ) continue L;
				poslist.push(pos);
				g.sdn_objs['objList'][i]["pos"] = 
					g.other_objs["switches"][objid]["pos"];
				continue L;
			}
		}
		for (var objid in g.other_objs["hosts"]) {
			if ( g.sdn_objs['objList'][i]["name"] == 
					g.other_objs["hosts"][objid]["name"]){
				var pos = { 
					b_pos: [
						parseFloat(g.sdn_objs['objList'][i]["origin"][0]) + 
						parseFloat(g.sdn_objs['objList'][i]["pos"][0]),
						parseFloat(g.sdn_objs['objList'][i]["origin"][1]) + 
						parseFloat(g.sdn_objs['objList'][i]["pos"][1]),
						parseFloat(g.sdn_objs['objList'][i]["origin"][2]) + 
						parseFloat(g.sdn_objs['objList'][i]["pos"][2])
						],
					a_pos: [
						parseFloat(g.other_objs["hosts"][objid]["origin"][0]) + 
						parseFloat(g.other_objs["hosts"][objid]["pos"][0]),
						parseFloat(g.other_objs["hosts"][objid]["origin"][1]) + 
						parseFloat(g.other_objs["hosts"][objid]["pos"][1]),
						parseFloat(g.other_objs["hosts"][objid]["origin"][2]) + 
						parseFloat(g.other_objs["hosts"][objid]["pos"][2])
					]
				};
				if (pos['b_pos'][0] == pos['a_pos'][0] && 
					pos['b_pos'][1] == pos['a_pos'][1] &&
					pos['b_pos'][2] == pos['a_pos'][2] ) continue L;
				poslist.push(pos);
				g.sdn_objs['objList'][i]["origin"] = 
					g.other_objs["hosts"][objid]["origin"];
				g.sdn_objs['objList'][i]["pos"] = 
					g.other_objs["hosts"][objid]["pos"];
				continue L;
			}
		} // for
	} // for 

	// update link list
	//linkList: Array[9]
	//  0: Object
	//    color: "yellow"
	//    dst: Array[3]
	//    rot: Array[2]
	//    src: Array[3]
	var tol = 1.0e-8;
	$.each(g.sdn_objs, function(k,v) {
		if (k != 'linkList') return true;
		$.each(v, function(key,val) {
			for (var i = 0; i < poslist.length; i++) {
				if (Math.abs(val['src'][0] - poslist[i]["b_pos"][0])<tol &&
					Math.abs(val['src'][1] - poslist[i]["b_pos"][1])<tol &&
					Math.abs(val['src'][2] - poslist[i]["b_pos"][2])<tol) {
					val['src'] = poslist[i]["a_pos"];
					continue;
				}
				if (Math.abs(val['dst'][0] - poslist[i]["b_pos"][0])<tol &&
					Math.abs(val['dst'][1] - poslist[i]["b_pos"][1])<tol &&
					Math.abs(val['dst'][2] - poslist[i]["b_pos"][2])<tol) {
					val['dst'] = poslist[i]["a_pos"];
				}
			} // for
			getRotationArray(key, val['src'], val['dst'], 'linkList');
		}); // each 
	}); // each
}

// get flow data
function getFlowData () {
    $.ajax({
        url: "../../lib/cgi/get_flowdata_dummy.cgi",
        type: "GET",
        data: {},
        contentType: "application/json",
        dataType: "json",
		success: function(msg) { 
			g.flowinfo = msg;
		},
        error: function() { $("#debug").append(
			"Error: loadObject(): failed to get flow lists.<br>"); },
        complete: undefined
    });

    $.ajax({
        url: "../../lib/cgi/get_gwflow_dummy.cgi",
        type: "GET",
        data: {},
        contentType: "application/json",
        dataType: "json",
		success: function(msg) { 
			g.gwflowstat = msg;
		},
        error: function() { $("#debug").append(
			"Error: loadObject(): failed to get gateway flow lists.<br>"); },
        complete: undefined
    });
}

// change the object position
function changeObjPos (pos) {
	if (g.selected_obj == -1 ||
		g.sdn_objs['objList'][g.selected_obj]['texture'] == 0) {
		alert("Please select a switch or host.");
		return 0;
	}
	var type = g.sdn_objs['objList'][g.selected_obj]['texture']; // 1: switch, 2: host
	var objid = -1;
	var rad = 5.0;
	var name = g.sdn_objs['objList'][g.selected_obj]['name'];
	if (type == 1) { // Switch
		objid = g.sdn_objs['objList'][g.selected_obj]['otherinfo']['dpid'];
	} else { // Host or Gateway
		objid = g.sdn_objs['objList'][g.selected_obj]['otherinfo']['hwaddr'];
		rad = 3.0;
	}

    $.ajax({
        url: "../../lib/cgi/change_objpos.cgi?pos="+pos+
			"&type=" + type +
			"&objid=" + objid +
			"&rad=" + rad +
			"&name=" + name,
        type: "GET",
        data: {},
        contentType: "application/json",
        dataType: "json",
//	jsonpCallback: "testdpids",
		success: function(msg) {  
			if (msg['ret'] == 0) {
			alert('The operation succeeded.');
			// reload page
			window.location.reload();
			} else {
			alert('The operation failed.');
			}
		},
        error: function() { $("#debug").append(
			"Error: changeObjPos(): failed to change object position.<br>"); },
        complete: undefined
    });
}



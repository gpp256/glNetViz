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
//			g.rinfo['rot'] = msg['rot'];
//			$("#debug").text("");
//			for (var i = 0; i< g.rinfo['rot'].length; i++) {
//				$("#debug").append(
//					g.rinfo['rot'][i][0] + ', ' + 
//					g.rinfo['rot'][i][1] + ', ' + 
//					g.rinfo['rot'][i][2] + ', ' + 
//					g.rinfo['rot'][i][3] + ': '
//				);
//			}
		},
        error: function() { $("#debug").append(
			"Error: getRotationArray(): failed to get a rotation array."); },
        complete: undefined
    });

}

function loadObject () {
    $.ajax({
        url: "../../lib/cgi/get_sdnobjs_dummy.cgi?",
        type: "GET",
        data: {},
        contentType: "application/json",
        dataType: "json",
		success: function(msg) { g.sdn_objs = msg; },
        error: function() { $("#debug").append(
			"Error: loadObject(): failed to get object parameters"); },
        complete: undefined
    });

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
	
	getFlowData();
}

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
			"Error: loadObject(): failed to get flow lists"); },
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
			"Error: loadObject(): failed to get gateway flow lists"); },
        complete: undefined
    });
}



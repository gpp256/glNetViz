/*!
 * ajax.js
 *
 * Copyright (c) 2013 Yoshi 
 * This software is distributed under the MIT License.(../../MIT-LICENSE.txt)
 */

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
			if (type == 'flow') 
				g.drawinfo_flows[msg['id']]['rot'] = msg['rot'];
			else
				g.rinfo['rot'] = msg['rot'];
		},
        error: function() { $("#debug").append(
			"Error: getRotationArray(): failed to get a rotation array."); },
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

    $.ajax({
        url: "./get_connection_array.cgi?start=a&stop=b",
        type: "GET",
        data: {},
        contentType: "application/json",
        dataType: "json",
		success: function(msg) { 
			g.conn_list = msg; 
			checkConnectionList();
			
		},
        error: function() { $("#debug").append(
			"Error: loadObject(): failed to get connection parameters"); },
        complete: undefined
    });
}

function checkConnectionList() {
	for (var i=0; i<g.conn_list.length; i++) {
		var srcport = 0; var dstport = 0;
		var srcip = 0; var dstip = 0;
		srcport = parseInt(g.conn_list[i][2])/32768.0-1.0;
		dstport = parseInt(g.conn_list[i][4])/32768.0-1.0;
		srcip = glnv.ipv4ToInt(g.conn_list[i][1]) / 2147483648 ; // (65536.0*32768.0);
		dstip = glnv.ipv4ToInt(g.conn_list[i][3]) / 2147483648 ; // (65536.0*32768.0);
		Array.prototype.push.apply(g.conn_list[i], [srcip, srcport, dstip, dstport]);
		g.drawinfo_flows.push({
			start: [srcip, srcport, -1.0],
			end: [dstip, dstport, 1.0],
			color: 'blue',
			size: 0.4,
			value: g.conn_list[i][5]
		});
		getRotationArray(g.drawinfo_flows.length-1,
			[dstip, dstport, 1.0].join(','), [srcip, srcport, -1.0].join(','), 'flow'
		);
	}
}



/*!
 * ajax.js
 *
 * Copyright (c) 2013 Yoshi 
 * This software is distributed under the MIT License.(../../MIT-LICENSE.txt)
 */

// get rotation array
function getRotationArray (id, src, dst) {
    $.ajax({
        url: "../../lib/cgi/get_rotation_array.cgi?src="+src+"&dst="+dst+"&id="+id,
        type: "GET",
        data: {},
        contentType: "application/json",
        dataType: "json",
		success: function(msg) {  
			if (msg['ret'] != 0) return 0;
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
}



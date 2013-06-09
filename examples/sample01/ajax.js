/*!
 * ajax.js
 *
 * Copyright (c) 2012 Yoshi 
 * This software is distributed under the MIT License.(../../MIT-LICENSE.txt)
 */

// get rotation array
function getRotationArray (id, src, dst, type) {
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
			$("#debug").text("");
		},
        error: function() { $("#debug").text(
			"Error: getRotationArray(): failed to get a rotation array."); },
        complete: undefined
    });

}

/*!
 * ajax.js
 *
 * Copyright (c) 2012 Yoshi 
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
			$("#debug").text("");
			//for (var i = 0; i< g.rinfo['rot'].length; i++) {
			//	$("#debug").append(
			//		g.rinfo['rot'][i][0] + ', ' + 
			//		g.rinfo['rot'][i][1] + ', ' + 
			//		g.rinfo['rot'][i][2] + ', ' + 
			//		g.rinfo['rot'][i][3] + ': '
			//	);
			//}
		},
        error: function() { $("#debug").text(
			"Error: getRotationArray(): failed to get a rotation array."); },
        complete: undefined
    });

}

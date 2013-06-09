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

function loadObject () {
	// Japan: lat=35.7, lon=139.6
	// Egypt: lat=30.0, lon=31.2
	// Australia: lat=-25.2, lon=133.7
	// Canada: lat=56.1, lon=-106.3
	// e.g.
	// fromlat, fromlon, tolat, tolon, npkt
	var atklist = [
		[30.0, 31.2, 35.7, 139.6, 100],
		[-25.2, 133.7, 35.7, 139.6, 50],
		[56.1, -106.3, 35.7, 139.6, 25]
	];
	for (var i=0; i<atklist.length; i++) {
    	$.ajax({
    	    url: "./get_objpos.cgi?id="+i+"&fromlat="+atklist[i][0]+"&fromlon="+atklist[i][1]+
				 "&tolat="+atklist[i][2]+"&tolon="+atklist[i][3],
    	    type: "GET",
    	    data: {},
    	    contentType: "application/json",
    	    dataType: "json",
			success: function(msg) {  
				if (msg['ret'] != 0) return 0;
				g.atkinfo[msg['id']] = {
					rot  : msg['rot'],
					start: msg['start'],
					end  : msg['end'],
					flows: msg['flows']
				};
			},
    	    error: function() { $("#debug").append(
				"Error: loadObject(): failed to get object parameters"); },
    	    complete: undefined
    	});
	}
}




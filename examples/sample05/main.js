/*!
 * main.js
 *
 * Copyright (c) 2013 Yoshi 
 * This software is distributed under the MIT License.(../../MIT-LICENSE.txt)
 */

// jQuery Ready Function
$(function () { glnv = new glNetViz(); glnv.initEvent(); initUI(); });

window.onload = function(){
	// ---------------------------------------------------------------
	// Main Routine
	// ---------------------------------------------------------------
	// initialize WebGL;
	var c = document.getElementById('canvas'); 
	initWebGL(c);

	// create shader programs
	var prg = {}; var texprg = {} ;
	initShader();
	// create textures
	glnv.initTextures('../../lib/textures');
	// get parameters for visualizing objects
	loadObject();
	// create arrows
	glnv.generateArrows(prg, [
		{id: 'red', r: 1.0, g: 0.0, b: 0.0, a: 1.0}, 
		{id: 'green', r: 0.0, g: 1.0, b: 0.0, a: 1.0}, 
		{id: 'blue', r: 0.0, g: 0.0, b: 1.0, a: 1.0} ]);
	// create spheres
	glnv.generateSpheres(prg, [
		{id: 'red', r: 1.0, g: 0.0, b: 0.0, a: 1.0},
		{id: 'green', r: 0.0, g: 1.0, b: 0.0, a: 1.0}, 
		{id: 'blue', r: 0.0, g: 0.0, b: 1.0, a: 1.0} ], 12);
	// create cubes
	glnv.generateCubes(prg, [ {id: 'red', r: 1.0, g: 0.0, b: 0.0, a: 1.0} ]);
	// create rectangles
	glnv.generateRectangles(texprg);
	// create cylinders
	glnv.generateCylinders(prg, [
		{id: "yellow", r: 1.0, g: 1.0, b: 0.0, a: 1.0},
		{id: "gray", r: 0.1, g: 0.1, b: 0.1, a: 1.0} ]);
	// create cones
	glnv.generateCones(prg, [{id: "yellow", r: 1.0, g: 1.0, b: 0.0, a: 1.0}]);
	// show number of polygons
	$("#displayinfo").append("Number of Polygons: " + g.polygon_num);

	// initialize Model View Matrix
	var m = new matIV();
	glnv.mMatrix = m.identity(m.create()); 
	// initialize View Projection Matrix
	var vMatrix = m.identity(m.create()); var pMatrix = m.identity(m.create()); 
	var mvpMatrix = m.identity(m.create()); var invMatrix = m.identity(m.create());
	initVPMatrix();

	// set mouse event parameters
	var then = 0.0;
	// -- Create Slider --
	createSliderUI();
 
	// drawing loop
	(function(){
		// initialize the canvas
		initCanvas();
		// draw objects
		putCones(g.intersect_pos, "yellow");
		if (g.getflow_updateflag == 1) {
			updateFlows();
			updateGatewayFlows(); //g.gwflowstat = msg; drawinfo_gwflows: [],
			g.getflow_updateflag = 0;
		}
		drawObjects();
		gl.flush();
		// update framerate
		updateFramerates();
		if (g.framerate_counter++%g.display_framerate_interval == 0) displayFramerate();
		/// update xRot/yRot
		handleKeys(); animate()
		// get data for network flow visualization
		if ((g.getstat_counter++ % g.getstat_interval) == 0) {
			getFlowData(); g.getflow_updateflag=1; //g.getstat_updateflag=1;
		}
		// recursive loop
		setTimeout(arguments.callee, 1000 / 65);
	})();

	// ---------------------------------------------------------------
	// Sub Routines
	// ---------------------------------------------------------------
	/// draw objects
	function drawObjects() {

		// Draw Lines
		$.each(g.sdn_objs, function(k,v) {
			if (k == 'linkList') {
				$.each(v, function(key,val) {
					drawCylinders(val['src'], val['dst'], val['rot'], val['color']); });
			} else { }
		});

		if (g.other_objs["links"] != undefined) {
			for (var i=0; i<g.other_objs["links"].length; i++) {
				var objinfo = g.other_objs["links"][i];
				drawCylinders(objinfo['src'], objinfo['dst'], 
					objinfo['rot'], objinfo['color']);
			}
		}

		// change shader program
		gl.useProgram(texprg);

		var result_intersect = {tmin: 1.0e30, touch_flag: -1};

		// 1回のループで済みそうだが必要
		// Draw Objcts
		var addedObj = {};
		$.each(g.sdn_objs, function(k,v) {
			if (k == 'objList') {
			$.each(v, function(key,val) {
				// 同じ名前のObjectは登録しない
				if (val['name'] != 'unknown') {
					if (addedObj[val['name']] == undefined) {
						addedObj[val['name']] = 1;
					} else {
						return true;
					}
				}
				glnv.mvPushMatrix();
				// Switch
				if (val['texture'] == 1) {
	    			m.translate(glnv.mMatrix, val['pos'], glnv.mMatrix);
					m.scale(glnv.mMatrix, [1.0, 1.1, 1.0], glnv.mMatrix);
					drawCube(1, 0.0);
				// Controller
				} else if (val['texture']==0) {
	    		    m.translate(glnv.mMatrix, val['pos'], glnv.mMatrix);
					m.scale(glnv.mMatrix, [1.2, 1.6, 1.2], glnv.mMatrix);
					drawCube(0, 0.0);
				// Host
				} else if (val['texture']==2) {
	    		    m.translate(glnv.mMatrix, val['origin'], glnv.mMatrix);
	    		    m.translate(glnv.mMatrix, val['pos'], glnv.mMatrix);
					m.scale(glnv.mMatrix, [0.6, 0.6, 0.6], glnv.mMatrix);
					drawCube(2, 90.0);
				// Others
				} else {
				}
				if (g.check_intersect == 1) 
					result_intersect = glnv.intersect(key, result_intersect);
				glnv.mvPopMatrix();
			});
		} else {
		}
		});

		if (g.other_objs["objs"] != undefined) {
		for (var i=0; i<g.other_objs["objs"].length; i++) {
			var objinfo = g.other_objs["objs"][i];
			glnv.mvPushMatrix();
			if (objinfo['origin'] != undefined) {
				m.translate(glnv.mMatrix, objinfo['origin'], glnv.mMatrix);
			} else {
				m.translate(glnv.mMatrix, [0.0, 0.0, 0.0], glnv.mMatrix);
			}
			m.translate(glnv.mMatrix, objinfo['pos'], glnv.mMatrix);
			m.scale(glnv.mMatrix, objinfo['scale'], glnv.mMatrix);
			drawCube(objinfo['texture_id'], 0.0);
			glnv.mvPopMatrix();
		}
		}

		if (g.check_intersect == 1) { 
			g.check_intersect = 0;
			if (result_intersect.touch_flag != -1) {
				$("#objinfo").text("Device Infomation: ");
				// common
				var key = result_intersect.touch_flag;
				g.selected_obj = key;
				$("#objinfo").append("<br>obj id :&nbsp;&nbsp;"	+ key);
				$("#objinfo").append("<br>name :&nbsp;&nbsp;"	+ 
					g.sdn_objs['objList'][key]['name']);
				// Host or Gateway
				if (g.sdn_objs['objList'][key]['texture']==2) {
				$("#objinfo").append("<br>ip addr :&nbsp;&nbsp;" + 
					g.sdn_objs['objList'][key]['otherinfo']['ipaddr']);
				$("#objinfo").append("<br>hw addr :&nbsp;&nbsp;" + 
					g.sdn_objs['objList'][key]['otherinfo']['hwaddr']);
				$("#objinfo").append("<br>swdpid :&nbsp;&nbsp;" + 
					g.sdn_objs['objList'][key]['otherinfo']['swdpid']);
				$("#objinfo").append("<br>swport :&nbsp;&nbsp;" + 
					g.sdn_objs['objList'][key]['otherinfo']['swport']);
				}
				// Switch
				if ('dpid' in g.sdn_objs['objList'][key]['otherinfo']) 
					$("#objinfo").append("<br>dpid :&nbsp;&nbsp;" + 
					g.sdn_objs['objList'][key]['otherinfo']['dpid']);
				for (var i=0; i<3; i++) {
					g.intersect_pos[i] = 
						-g.sdn_objs['objList'][key]['origin'][i]
						-g.sdn_objs['objList'][key]['pos'][i];
				}
			} else {
				g.selected_obj = -1;
			}
			g.intersect_index = result_intersect.touch_flag;
		}

		// draw flows
		gl.useProgram(prg);
		glnv.drawFlows(prg, texprg, g.drawinfo_gwflows, g.arrow_default_pos, g.arrow_delta);
		glnv.drawFlows(prg, texprg, g.drawinfo_flows, g.arrow_default_pos, g.arrow_delta);
	}

	// initialize canvas
	function initCanvas() {
		gl.clearColor(0.0, 0.0, 1.0, 0.9); gl.clearDepth(1.0);
		gl.viewport(0, 0, c.width, c.height);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		// active textures (ループ内に入れる必要有)
		gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, glnv.textureList[0]);
		gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, glnv.textureList[1]);
		gl.activeTexture(gl.TEXTURE2); gl.bindTexture(gl.TEXTURE_2D, glnv.textureList[2]);
		gl.activeTexture(gl.TEXTURE3); gl.bindTexture(gl.TEXTURE_2D, glnv.textureList[3]);
		gl.activeTexture(gl.TEXTURE4); gl.bindTexture(gl.TEXTURE_2D, glnv.textureList[4]);
		gl.activeTexture(gl.TEXTURE5); gl.bindTexture(gl.TEXTURE_2D, glnv.textureList[5]);
		gl.activeTexture(gl.TEXTURE6); gl.bindTexture(gl.TEXTURE_2D, glnv.textureList[6]);
		gl.activeTexture(gl.TEXTURE7); gl.bindTexture(gl.TEXTURE_2D, glnv.textureList[7]);

		if (g.view_mode != g.old_view_mode) {
			if (g.view_mode) {
			m.perspective(45, c.width / c.height, 0.1, 100, pMatrix);
			} else {
			var ratio = c.width / c.height;
			m.ortho(-5, 5, -5/ratio, 5/ratio, -50.0, 50.0, pMatrix);
			}
			m.multiply(pMatrix, vMatrix, glnv.vpMatrix);
			g.old_view_mode = g.view_mode;
		}
		// モデル座標変換行列の生成
		m.identity(glnv.mMatrix);

		// -- Keyboard Event --
		m.rotate(glnv.mMatrix, glnv.degToRad(g.xRot), [1, 0, 0], glnv.mMatrix);
		m.rotate(glnv.mMatrix, glnv.degToRad(g.yRot), [0, 1, 0], glnv.mMatrix);

		// -- Mouse Event --
		// dampen the velocity
		g.moveVelocityX *= 0.98; g.moveVelocityY *= 0.98;
		var elapsedTime;
		var now = (new Date()).getTime() * 0.001;
		elapsedTime = (then == 0.0) ? 0.0 : now - then;
		then = now;
		g.scrollX += g.moveVelocityX * elapsedTime;
		g.scrollY += g.moveVelocityY * elapsedTime;
		// trackball
		var tscale = glnv.degToRad(-g.scrollY)*0.4+2.0;
		m.scale(glnv.mMatrix, [tscale, tscale, tscale], glnv.mMatrix);
		m.rotate(glnv.mMatrix, glnv.degToRad(g.scrollX), [0, 1, 0], glnv.mMatrix);

		// -- Slider Event --
		var obj_size = g.scale / 30.0;
		obj_size = obj_size * 0.30;
		m.scale(glnv.mMatrix, [obj_size, obj_size, obj_size], glnv.mMatrix);
		m.rotate(glnv.mMatrix, glnv.degToRad(g.xaxis_rotate_param*5.0), [1, 0, 0], glnv.mMatrix);
		m.multiply(glnv.vpMatrix, glnv.mMatrix, mvpMatrix);
		// モデル座標変換行列から逆行列を生成
		m.inverse(glnv.mMatrix, invMatrix);

	}

	function drawCube(texture_num, rot) {
		gl.uniform1i(texprg.samplerUniform, texture_num);
		glnv.mvPushMatrix();
    	m.rotate(glnv.mMatrix, glnv.degToRad(rot), [0, 0, 1], glnv.mMatrix);
		m.scale(glnv.mMatrix, [0.8, 0.23, 0.8], glnv.mMatrix);
		glnv.setMatrixUniforms(texprg, 'use_texture');
		glnv.putCube(
			prg.cubes["red"]["v"], prg.cubes["red"]["n"], 
			prg.cubes["red"]["t"], prg.cubes["red"]["i"], [
				texprg.vertexPositionAttribute,
				texprg.vertexNormalAttribute, 
				texprg.textureCoordAttribute ], [ 3, 3, 2 ]);
		glnv.mvPopMatrix();
	}

	// draw cones
	function putCones(pos, color) {
		g.intersect_rot+=2;
		glnv.mvPushMatrix();
		m.translate(glnv.mMatrix, [-pos[0], -pos[1]+1.7, -pos[2]], glnv.mMatrix);
		m.scale(glnv.mMatrix, [0.45, 0.45, 0.45], glnv.mMatrix);
	    m.rotate(glnv.mMatrix, glnv.degToRad(g.intersect_rot), [0, 1, 0], glnv.mMatrix);
	    m.rotate(glnv.mMatrix, glnv.degToRad(-180), [1, 0, 0], glnv.mMatrix);
		glnv.setMatrixUniforms(prg, 'default');
		glnv.putCone(
			prg.cones[color]["v"], prg.cones[color]["n"], 
			prg.cones[color]["c"], prg.cones[color]["i"], prg.attLocation, [ 3, 3, 4 ]
		);
		glnv.mvPopMatrix();
	}

	// draw cylinders
	function drawCylinders(start, end, rot, color) {
		var length1= Math.sqrt((end[0]-start[0])*(end[0]-start[0])
			+(end[1]-start[1])*(end[1]-start[1])+(end[2]-start[2])*(end[2]-start[2]));
		length1 *= 0.31;
		
		glnv.mvPushMatrix();
		m.translate(glnv.mMatrix, [start[0],start[1],start[2]], glnv.mMatrix);
		m.scale(glnv.mMatrix, [length1, length1, length1], glnv.mMatrix);
		for (var i=0; i<rot.length; i++) 
			m.rotate(glnv.mMatrix, glnv.degToRad(
				rot[i][0]), [rot[i][1], rot[i][2], rot[i][3]], glnv.mMatrix);
		m.scale(glnv.mMatrix, [1.0, 1.4/length1, 1.4/length1], glnv.mMatrix);
		m.rotate(glnv.mMatrix, glnv.degToRad(-90.0), [0, 0, 1], glnv.mMatrix);

		m.translate(glnv.mMatrix, [0.0, 3.0/2.0, 0.0], glnv.mMatrix);

		glnv.setMatrixUniforms(prg, 'default');
		glnv.putCylinder(
			prg.cylinders[color]["v"], prg.cylinders[color]["n"], 
			prg.cylinders[color]["c"], prg.cylinders[color]["i"], 
			prg.attLocation, [ 3, 3, 4 ]
		);
		glnv.mvPopMatrix();
	}

	// initialize View Projection Matrix
	function initVPMatrix() {
		glnv.vpMatrix = m.identity(m.create());
		m.lookAt([0.0, 0.0, 2.5], [0, 0, 0], [0, 1, 0], vMatrix);
		g.mRatio = c.width / c.height;
		gl.viewportWidth = c.width; gl.viewportHeight = c.height;
		m.perspective(45, c.width / c.height, 0.1, 100, pMatrix);
		m.multiply(pMatrix, vMatrix, glnv.vpMatrix);
	}

	// initialize shader programs
	function initShader() {
		var v_shader = glnv.createShader(
			'raw', 'x-shader/x-vertex', glnv.getVertexShader('default'));
		var f_shader = glnv.createShader(
			'raw', 'x-shader/x-fragment', glnv.getFragmentShader('default'));
		prg = glnv.createProgram(v_shader, f_shader);
		glnv.initUniformLocation(prg, 'default');

		v_shader = glnv.createShader(
			'raw', 'x-shader/x-vertex', glnv.getVertexShader('use_texture'));
		f_shader = glnv.createShader(
			'raw', 'x-shader/x-fragment', glnv.getFragmentShader('use_texture'));
		texprg = glnv.createProgram(v_shader, f_shader);
		glnv.initUniformLocation(texprg, 'use_texture');

		gl.useProgram(prg);
	}

	function updateGatewayFlows() {
		g.drawinfo_gwflows = [];
		$.each(g.gwflowstat, function(i,k) {
			if (i.match(/^(\S+)\:(\S+)$/)) {
				var eobj = RegExp.$1;
				var sobj = RegExp.$2;
				var startpos = undefined;
				startpos = [ 
					parseFloat(g.sdn_objs["objList"][3]["pos"][0]), 
					parseFloat(g.sdn_objs["objList"][3]["pos"][1]), 
					parseFloat(g.sdn_objs["objList"][3]["pos"][2]), 
				];
				if (startpos == undefined) return true;
				var endpos = undefined;
				for (var j=0; j<g.other_objs["objs"].length; j++) {
					var oinfo = g.other_objs["objs"][j];
					if (oinfo["name"] != eobj) continue;
					endpos = [
						parseFloat(oinfo["pos"][0]) + parseFloat(startpos[0]),
						parseFloat(oinfo["pos"][1]) + parseFloat(startpos[1]),
						parseFloat(oinfo["pos"][2]) + parseFloat(startpos[2])
					];
					break;
				}
				if (endpos == undefined) return true;
				if (k[0] > 0) pushGatewayFlow(startpos, endpos, "red",  k[0]);
				if (k[2] > 0) pushGatewayFlow(startpos, endpos, "green",k[2]);
				if (k[4] > 0) pushGatewayFlow(startpos, endpos, "blue", k[4]);
			}
		});
	}

	function pushGatewayFlow(startpos, endpos, f_color, packet_num) {
		var move = undefined;
		if (f_color == "green") {
			move = [0.3, 0.3, 0.3];
		} else if (f_color == "blue") {
			move = [-0.3, -0.3, -0.3];
		}
		g.drawinfo_gwflows.push({
			start: startpos, end: endpos, color: f_color,
			size: (packet_num > 5) ? 0.8 : 0.4,
			translate: move,
			labelinfo: { size: 0.09, ypos: 0.20 }, 
			value: packet_num
		});
		getRotationArray(g.drawinfo_gwflows.length-1,
			endpos.join(','), startpos.join(','), 'gw'
		);
		g.drawinfo_gwflows.push({
			start: endpos, end: startpos, color: f_color,
			size: (packet_num > 5) ? 0.8 : 0.4,
			translate: move,
			labelinfo: { size: 0.09, ypos: 0.20 }, 
			value: packet_num
		});
		getRotationArray(g.drawinfo_gwflows.length-1,
			startpos.join(','), endpos.join(','), 'gw'
		);
	}

	function updateFlows() {
		//$("#noxmsg").text("【Flow情報】");
		// in_src1, in_dst1, out_src2, out_dst2, tcp_packets, tcp_bytes, 
		// udp_packets, udp_bytes, icmp_packets, icmp_bytes, others_packets, others_bytes, 
		//flows :  0x000000000001, 0x000000000002, 0x000000000002, 00:0c:29:1f:8e:8a, 11, 730, 0, 0, 0, 0, 0, 0, 

		// 位置情報取得
		// 同じobjectを複数回参照するので一度確認したら情報を保持しておく
		var objpos = {}; var linkinfo = []; var flowinfo = [];
		$.each(g.flowinfo, function(i,k) {
			// inとoutの両方(0-3)を確認
			for (var j = 0; j < 4; j++) { 
				// switchとホストで処理を分ける
				if (k[j].match(/0x/)) { // switch
					if (!(k[j] in objpos)) objpos[k[j]] = getObjInfo('dpid', k[j]);
					linkinfo.push([ objpos[k[j]] ]); // undefinedの可能性有
				} else { // host
					var hwaddrs = k[j].split(","); // hwaddr list生成
					var poslist = [];
					for (var m = 0; m < hwaddrs.length; m++) {
						if (!(hwaddrs[m] in objpos)) objpos[hwaddrs[m]] = 
							getObjInfo('hwaddr', hwaddrs[m]);
						poslist.push(objpos[hwaddrs[m]]);
					}
					linkinfo.push(poslist);
				}
			} // for 
			flowinfo.push([k[4], k[5], k[6], k[7], k[8], k[9], k[10], k[11]]);
		}); // each
	
		// 通信の流れ出力
		// フローテーブルのエントリすべてを参照できないケースもある!
		// flowinfoを辿りlinkinfo(位置情報)を参照して描画
		// 重複して描画されるパスもある。無駄なので排除すべき
		g.drawinfo_flows = [];
		for (var i = 0; i < flowinfo.length; i++) {
			var s_index = i*4; 
			var e_index = i*4+1;
			putFlows(s_index, e_index, linkinfo, flowinfo[i]) ;
			s_index = i*4+2; 
			e_index = i*4+3;
			putFlows(s_index, e_index, linkinfo, flowinfo[i]) ;
		}
	}

	function getObjInfo(searchkey, searchstr) {
		//if (!('objList' in objdata)) return undefined ;
		var pos = undefined;
		// if ('objList' in objdata)などとすることはできないので注意 $.eachを使う
		$.each(g.sdn_objs, function(k,v) {
			if (k != 'objList') return true;
			$.each(v, function(key,val) {
			if (searchkey in val['otherinfo'] && val['otherinfo'][searchkey] == searchstr) {
				pos = {
					orig: val['origin'],
					pos:  val['pos']
				};
				return false;
			}
			});
		});
		return pos;
	}

	function putFlows(s_index, e_index, linkinfo, flowinfo) {
		for (var j = 0; j < linkinfo[s_index].length; j++) {
			var startpos = [
				parseFloat(linkinfo[s_index][j]['orig'][0])+
					parseFloat(linkinfo[s_index][j]['pos'][0]),
				parseFloat(linkinfo[s_index][j]['orig'][1])+
					parseFloat(linkinfo[s_index][j]['pos'][1]),
				parseFloat(linkinfo[s_index][j]['orig'][2])+
					parseFloat(linkinfo[s_index][j]['pos'][2])
			];
			for (var k = 0; k < linkinfo[e_index].length; k++) {
				var endpos = [
					parseFloat(linkinfo[e_index][k]['orig'][0])+
						parseFloat(linkinfo[e_index][k]['pos'][0]),
					parseFloat(linkinfo[e_index][k]['orig'][1])+
						parseFloat(linkinfo[e_index][k]['pos'][1]),
					parseFloat(linkinfo[e_index][k]['orig'][2])+
						parseFloat(linkinfo[e_index][k]['pos'][2])
				];
				if (flowinfo[0] > 0) {
					g.drawinfo_flows.push({
						start: startpos, end: endpos, color: "red",
						size: (flowinfo[0] > 10) ? 0.8 : 0.4,
						labelinfo: { size: 0.09, ypos: 0.20 }, 
						value: flowinfo[0]
					});
					getRotationArray(g.drawinfo_flows.length-1,
						endpos.join(','), startpos.join(','), 'nogw'
					);
				}
				if (flowinfo[2] > 0) {
					g.drawinfo_flows.push({
						start: startpos, end: endpos, color: "blue",
						size: (flowinfo[2] > 10) ? 0.8 : 0.4,
						translate: [-0.3, -0.3, -0.3],
						labelinfo: { size: 0.09, ypos: 0.20 }, 
						value: flowinfo[2]
					});
					getRotationArray(g.drawinfo_flows.length-1,
						endpos.join(','), startpos.join(','), 'nogw'
					);
				}
				if (flowinfo[4] > 0) {
					g.drawinfo_flows.push({
						start: startpos, end: endpos, color: "green",
						size: (flowinfo[4] > 10) ? 0.8 : 0.4,
						translate: [0.3, 0.3, 0.3],
						labelinfo: { size: 0.09, ypos: 0.20 }, 
						value: flowinfo[4]
					});
					getRotationArray(g.drawinfo_flows.length-1,
						endpos.join(','), startpos.join(','), 'nogw'
					);
				}
			} // for k
		} // for j
	}
};
// __END__

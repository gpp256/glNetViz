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
	glnv.addTexture('./images/earthmap.jpg', 1024, 512, 8);
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
		{id: 'yellow', r: 1.0, g: 1.0, b: 0.0, a: 1.0}, 
		{id: 'blue', r: 0.0, g: 0.0, b: 1.0, a: 1.0} ], 24);
	// create rectangles
	glnv.generateRectangles(texprg);
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

	var flowList = [];
 
	// drawing loop
	(function(){
		for (var i=0; i<g.atkinfo.length; i++) {
			if (g.atkinfo[i]["readflag"] != undefined || g.atkinfo[i]["flows"] == undefined )
				continue;
			pushFlowList(g.atkinfo[i]["flows"]);
			g.atkinfo[i]["readflag"]=1;
		}
		// initialize the canvas
		initCanvas();
		// draw objects
		//putCones(g.intersect_pos, "yellow");
		//if (g.getflow_updateflag == 1) {
		//	updateFlows();
		//	g.getflow_updateflag = 0;
		//}
		drawObjects();
		gl.flush();
		// update framerate
		updateFramerates();
		if (g.framerate_counter++%g.display_framerate_interval == 0) displayFramerate();
		/// update xRot/yRot
		handleKeys(); animate()
		// get data for network flow visualization
		//if ((g.getstat_counter++ % g.getstat_interval) == 0) {
		//	getFlowData(); g.getflow_updateflag=1; //g.getstat_updateflag=1;
		//}
		// recursive loop
		setTimeout(arguments.callee, 1000 / 60);
	})();

	// ---------------------------------------------------------------
	// Sub Routines
	// ---------------------------------------------------------------
	/// draw objects
	function drawObjects() {
		// change shader program
		gl.useProgram(texprg);
		//var result_intersect = {tmin: 1.0e30, touch_flag: -1};
		glnv.mvPushMatrix(); 
		m.rotate(glnv.mMatrix, glnv.degToRad(-90.0), [0.0, 1.0, 0.0], glnv.mMatrix);
		// draw a texture sphere
		drawEarth(3.0);
		// draw points
		gl.useProgram(prg);
		for (var i=0; i<g.atkinfo.length; i++) {
			if (g.atkinfo[i]["rot"] == undefined) continue;
			drawPoints(
				i, g.atkinfo[i]["rot"], 
				g.atkinfo[i]["start"], g.atkinfo[i]["end"], 3.0
			);
		}
		glnv.mvPopMatrix(); // earth
	}

	function drawEarth(scale) {
		glnv.mvPushMatrix(); // earth
		m.scale(glnv.mMatrix, [scale, scale, scale], glnv.mMatrix);
		m.rotate(glnv.mMatrix, glnv.degToRad(90.0), 
			[0.0, 1.0, 0.0], glnv.mMatrix);
    	//m.translate(glnv.mMatrix, [0.0, -2.0, 0.0], glnv.mMatrix);
		glnv.setMatrixUniforms(texprg, 'use_texture');
    	gl.uniform1i(texprg.samplerUniform, 8);
		glnv.putSphere(
			prg.spheres["red"]["v"], prg.spheres["red"]["n"], 
			prg.spheres["red"]["t"], prg.spheres["red"]["i"], [
				texprg.vertexPositionAttribute,
				texprg.vertexNormalAttribute, 
				texprg.textureCoordAttribute
			], [ 3, 3, 2 ]
		);
		glnv.mvPopMatrix(); // earth
	}

	function drawPoints (index, rot, start, end, scale) {
		glnv.mvPushMatrix(); 

		m.scale(glnv.mMatrix, [scale, scale, scale], glnv.mMatrix);
		for (var i=0; i<rot.length; i++) { 
			m.rotate(glnv.mMatrix, glnv.degToRad(rot[i][0]), 
				[rot[i][1], rot[i][2], rot[i][3]], glnv.mMatrix);
		}

		// draw start point
		glnv.mvPushMatrix(); 
    	m.translate(glnv.mMatrix, start, glnv.mMatrix);
		m.scale(glnv.mMatrix, [0.05, 0.05, 0.05], glnv.mMatrix);
		glnv.setMatrixUniforms(prg, 'default');
		glnv.putSphere(
			prg.spheres["red"]["v"], prg.spheres["red"]["n"], 
			prg.spheres["red"]["c"], prg.spheres["red"]["i"], 
			prg.attLocation, [ 3, 3, 4 ]
		);
		glnv.mvPopMatrix(); 

		// draw end point
		glnv.mvPushMatrix(); 
    	m.translate(glnv.mMatrix, end, glnv.mMatrix);
		m.scale(glnv.mMatrix, [0.05, 0.05, 0.05], glnv.mMatrix);
		glnv.setMatrixUniforms(prg, 'default');
		glnv.putSphere(
			prg.spheres["yellow"]["v"], prg.spheres["yellow"]["n"], 
			prg.spheres["yellow"]["c"], prg.spheres["yellow"]["i"], 
			prg.attLocation, [ 3, 3, 4 ]
		);
		glnv.mvPopMatrix(); 

		// draw flows
		if (flowList[index] != undefined) drawFlows(index);

		glnv.mvPopMatrix(); 
	}

	function drawFlows(index) {
		g.arrow_default_pos[0] += g.arrow_delta;
		var n = 3 - (Math.round(g.arrow_default_pos[0]) % 4) ;
		if (flowList[index][n] == undefined) return;
		for (var i=0; i<flowList[index][n].length; i++) {
			var k = flowList[index][n][i];
			if (g.drawinfo_flows[k] == undefined ||
				g.drawinfo_flows[k]['rot'] == undefined) continue;
			glnv.mvPushMatrix(); 
    		m.translate(glnv.mMatrix, g.drawinfo_flows[k]['start'], glnv.mMatrix);
			for (var j = 0; j < g.drawinfo_flows[k]['rot'].length; j++) {
				m.rotate(glnv.mMatrix, glnv.degToRad(g.drawinfo_flows[k]['rot'][j][0]), [
					g.drawinfo_flows[k]['rot'][j][1],
					g.drawinfo_flows[k]['rot'][j][2],
					g.drawinfo_flows[k]['rot'][j][3]],
					glnv.mMatrix);
			} // for j
			m.rotate(glnv.mMatrix, glnv.degToRad(90.0), [0, 0, 1], glnv.mMatrix);
			m.scale(glnv.mMatrix, [
				0.01*g.drawinfo_flows[k]['size'], 
				0.01*g.drawinfo_flows[k]['size'], 
				0.01*g.drawinfo_flows[k]['size']], glnv.mMatrix);
    		m.translate(glnv.mMatrix, [0.0, 1.75/2.0, 0.0], glnv.mMatrix);
			glnv.putArrow(prg, 
				prg.arrows[g.drawinfo_flows[k]['color']]["v"], 
				prg.arrows[g.drawinfo_flows[k]['color']]["n"], 
				prg.arrows[g.drawinfo_flows[k]['color']]["c"], 
				prg.arrows[g.drawinfo_flows[k]['color']]["i"], 
				prg.attLocation, [ 3, 3, 4 ]
			);
			glnv.mvPopMatrix(); 
		} // for i
	}

	// initialize canvas
	function initCanvas() {
		gl.clearColor(0.0, 0.0, 1.0, 0.9); gl.clearDepth(1.0);
		gl.viewport(0, 0, c.width, c.height);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		// active textures (ループ内に入れる必要有)
		gl.activeTexture(gl.TEXTURE4); gl.bindTexture(gl.TEXTURE_2D, glnv.textureList[4]);
		gl.activeTexture(gl.TEXTURE5); gl.bindTexture(gl.TEXTURE_2D, glnv.textureList[5]);
		gl.activeTexture(gl.TEXTURE6); gl.bindTexture(gl.TEXTURE_2D, glnv.textureList[6]);
		gl.activeTexture(gl.TEXTURE7); gl.bindTexture(gl.TEXTURE_2D, glnv.textureList[7]);
		gl.activeTexture(gl.TEXTURE8); gl.bindTexture(gl.TEXTURE_2D, glnv.textureList[8]);

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
	
	function pushFlowList (flows) {
		if (flows == undefined) return;

		var index = flowList.length;
		var color_map = ['red', 'green', 'blue'];
		if (flowList[index] == undefined) flowList[index] = [];

		for ( var i=0; i<flows.length; i++) { 
			if (flowList[index][i] == undefined) flowList[index][i] = [];
			for ( var j=0; j<flows[i].length; j++) {
				flowList[index][i].push(g.drawinfo_flows.length);
				var spos = [
					parseFloat(flows[i][j]["start"][0]),
					parseFloat(flows[i][j]["start"][1]),
					parseFloat(flows[i][j]["start"][2])
				];
				var epos = [
					parseFloat(flows[i][j]["end"][0]),
					parseFloat(flows[i][j]["end"][1]),
					parseFloat(flows[i][j]["end"][2])
				];
				g.drawinfo_flows.push({
					start: spos, end: epos, color: color_map[index%3], 
					size: 0.3, translate: [0.0, 0.0, 0.0]
				});
				getRotationArray(
					g.drawinfo_flows.length-1, epos.join(','), spos.join(','), 'nogw'
				);
			} // for j
		} // for i
	}
};
// __END__

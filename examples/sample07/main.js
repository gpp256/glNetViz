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
	var prg = {}; var texprg = {}; 
	initShader();
	// create textures
	glnv.initTextures('../../lib/textures');
	// get parameters for visualizing objects
	loadObject();
	// create arrows
	glnv.generateArrows(prg, [
		{id: 'red', r: 1.0, g: 0.0, b: 0.0, a: 1.0}, 
		{id: 'blue', r: 0.0, g: 0.0, b: 1.0, a: 1.0} ]);
	// create spheres
	glnv.generateSpheres(prg, [
		{id: 'red', r: 1.0, g: 0.0, b: 0.0, a: 1.0},
		{id: 'yellow', r: 1.0, g: 1.0, b: 0.0, a: 1.0}, 
		{id: 'blue', r: 0.0, g: 0.0, b: 1.0, a: 1.0} ], 12);
	// create rectangles
	glnv.generateRectangles(texprg);
	glnv.generateRectanglesFromCL(prg,
		{ blue : [ 0.0, 0.0, 1.0, 0.4 ] } // id : [ r, g, b, a] 
	);
	// show number of polygons
	$("#displayinfo").text("Number of Polygons: " + g.polygon_num);

	// initialize Model View Matrix
	var m = new matIV();
	glnv.mMatrix = m.identity(m.create()); 
	// initialize View Projection Matrix
	var vMatrix = m.identity(m.create()); var pMatrix = m.identity(m.create()); 
	var mvpMatrix = m.identity(m.create()); var invMatrix = m.identity(m.create());
	initVPMatrix();

	// set mouse event parameters
	var then = 0.0;
	// set flow parameters
	var arrow_default_pos = [0, 48]; var arrow_delta = 0.5;
	// create sliders
	createSliderUI();

	var result_intersect = undefined;
 
	// drawing loop
	(function(){
		// initialize the canvas
		initCanvas();
		// draw objects
		drawObjects();
		gl.flush();
		// update framerate
		updateFramerates();
		if (g.framerate_counter++%g.display_framerate_interval == 0) displayFramerate();
		/// update xRot/yRot
		handleKeys(); animate()
		// recursive loop
		setTimeout(arguments.callee, 1000 / 65);
	})();

	// ---------------------------------------------------------------
	// Sub Routines
	// ---------------------------------------------------------------
	// draw objects
	function drawObjects() {

		// draw rectangles
		putRectangles([[0.0, 0.0, 1.0], [0.0, 0.0, -1.0]]);

		// initialize result_intersect
		result_intersect = {tmin: 1.0e30, touch_flag: -1};
		// draw spheres
		for (var i=0; i<g.conn_list.length ; i++) {
			drawSphere(i, [g.conn_list[i][7], g.conn_list[i][8], -1.0]);
			drawSphere(i, [g.conn_list[i][9], g.conn_list[i][10], 1.0]);
		}

		// draw flows
		gl.useProgram(prg);
		glnv.drawFlows(prg, texprg, g.drawinfo_flows, arrow_default_pos, arrow_delta);

		// draw labels
		gl.useProgram(texprg);
		glnv.putStr(texprg, "0 <-       Source IP Address       -> 4294967295",
			0.06, [ 0.05, -1.1, -1.0 ], 0.52, 'green');
		glnv.putStr(texprg, "0 <-     Destination IP Address     -> 4294967295",
			0.06, [ 0.05, -1.1, 1.0 ], 0.52, 'green');
		glnv.mvPushMatrix();
		m.rotate(glnv.mMatrix, glnv.degToRad(90.0), [0, 0, 1], glnv.mMatrix);
		glnv.putStr(texprg, "0 <-            Source Port            -> 65535",
			0.06, [ 0.05, 1.1, -1.0 ], 0.52, 'green');
		glnv.putStr(texprg, "0 <-          Destination  Port          -> 65535",
			0.06, [ 0.05, 1.1, 1.0 ], 0.52, 'green');
		glnv.mvPopMatrix();
		gl.useProgram(prg);

		// show host information
		if (g.check_intersect == 1) { 
			g.check_intersect = 0;
			if (result_intersect.touch_flag != -1) {
				g.selected_obj = result_intersect.touch_flag;
				$("#srcinfo").text("src_ip=" + g.conn_list[g.selected_obj][1]+ ", ");
				$("#srcinfo").append("src_port=" + g.conn_list[g.selected_obj][2]+ ", ");
				$("#dstinfo").text("dst_ip=" + g.conn_list[g.selected_obj][3]+ ", ");
				$("#dstinfo").append("dst_port=" + g.conn_list[g.selected_obj][4]+ ", ");
				$("#pktinfo").text("proto=" + g.conn_list[g.selected_obj][0]+ ", ");
				$("#pktinfo").append("n_packets=" + g.conn_list[g.selected_obj][5]+ ", ");
				$("#pktinfo").append("n_bytes=" + g.conn_list[g.selected_obj][6]);
			} 
		}
	}

	// draw Rectangles
	function putRectangles (poslist) {
		gl.enable(gl.BLEND); gl.disable(gl.DEPTH_TEST);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
	
		for (var i=0; i<poslist.length; i++) {
			glnv.mvPushMatrix();
    		m.translate(glnv.mMatrix, poslist[i], glnv.mMatrix);
			glnv.setMatrixUniforms(prg, 'default');
			glnv.putRectangle( 
				prg.rectangles["blue"]["v"], prg.rectangles["blue"]["n"], 
				prg.rectangles["blue"]["c"], prg.rectangles["blue"]["i"], 
				prg.attLocation, prg.attStride);
			glnv.mvPopMatrix();
		}

		gl.disable(gl.BLEND); gl.enable(gl.DEPTH_TEST);
	}

	// draw sphere
	function drawSphere(index, pos) {
		var color = 'red';
		var scale = 0.04;
		if (g.selected_obj != -1 && index == g.selected_obj) {
			color = 'yellow'; scale = 0.05;
		}
		glnv.mvPushMatrix();
		m.translate(glnv.mMatrix, pos, glnv.mMatrix);
		m.scale(glnv.mMatrix, [scale, scale, scale], glnv.mMatrix);
		glnv.setMatrixUniforms(prg, 'default');
		glnv.putSphere( 
			prg.spheres[color]["v"], prg.spheres[color]["n"], 
			prg.spheres[color]["c"], prg.spheres[color]["i"], prg.attLocation, prg.attStride);
		if (g.check_intersect == 1) 
			result_intersect = glnv.intersect(index, result_intersect);
		glnv.mvPopMatrix();
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

	// create slider ui
	function createSliderUI() {
		var uiElem = document.getElementById('ui');
		for (var ii = 0; ii < g_ui.length; ++ii) {
		  var ui = g_ui[ii];
		  var obj = g[ui.obj];
		  obj[ui.name] = ui.value;
		  var div = document.createElement('div');
		  setupSlider($, div, ui, obj);
		  uiElem.appendChild(div);
		}
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

	// initialize a canvas
	function initCanvas() {
		gl.clearColor(0.0, 0.0, 0.6, 1.0); gl.clearDepth(1.0);
		gl.viewport(0, 0, c.width, c.height);
		// active textures 
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
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

		m.identity(glnv.mMatrix);

		// -- Keyboard Event --
		m.rotate(glnv.mMatrix, glnv.degToRad(g.xRot+18.0), [1, 0, 0], glnv.mMatrix);
		m.rotate(glnv.mMatrix, glnv.degToRad(g.yRot-26.0), [0, 1, 0], glnv.mMatrix);

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
		var tscale = glnv.degToRad(-g.scrollY)*0.4+6.0;
		m.scale(glnv.mMatrix, [tscale, tscale, tscale], glnv.mMatrix);
		m.rotate(glnv.mMatrix, glnv.degToRad(g.scrollX), [0, 1, 0], glnv.mMatrix);

		// -- Slider Event --
		var obj_size = g.scale / 30.0;
		m.scale(glnv.mMatrix, [obj_size, obj_size, obj_size], glnv.mMatrix);
		m.rotate(glnv.mMatrix, glnv.degToRad(g.xaxis_rotate_param*5.0), [1, 0, 0], glnv.mMatrix);

		var size = 0.45;
		m.scale(glnv.mMatrix, [size, size, size], glnv.mMatrix);
		m.multiply(glnv.vpMatrix, glnv.mMatrix, mvpMatrix);
		m.inverse(glnv.mMatrix, invMatrix);

		// set uniform variables
		gl.uniformMatrix4fv(prg.uniLocation[0], false, mvpMatrix);
		gl.uniformMatrix4fv(prg.uniLocation[1], false, invMatrix);
	}
};
// __END__

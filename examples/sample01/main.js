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
	var prg = {}; 
	initShader();
	// create arrows
	glnv.generateArrows(prg, [
		{id: 'red', r: 1.0, g: 0.0, b: 0.0, a: 1.0}, 
		{id: 'green', r: 0.0, g: 1.0, b: 0.0, a: 1.0}, 
		{id: 'blue', r: 0.0, g: 0.0, b: 1.0, a: 1.0}
	]);
	// create spheres
	glnv.generateSpheres(prg, [{id: 'blue', r: 0.0, g: 0.0, b: 1.0, a: 1.0}], 12);
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
	// initialize objects parameters
	var startpos = [0.0, 0.0, 0.0]; var endpos = [1.0, 1.0, -1.0];
	getRotationArray(1, startpos.join(','), endpos.join(','));
	var arrow_default_pos = [0, 33, 66]; var arrow_delta = 5.0;
	g.drawinfo_flows.push({
		start: [0.0, 0.0, 0.0], end: [160.0, 0.0, 0.0], color: 'blue', size: 65.0
	});
	getRotationArray(g.drawinfo_flows.length-1,
		[160.0, 0.0, 0.0].join(','), [0.0, 0.0, 0.0].join(','), 'flow');
	// create slider ui
	createSliderUI();
 
	// drawing loop
	(function(){
		// initialize the canvas
		initCanvas();
		// draw Objects
		drawObjects();
		gl.flush();
		// update framerate
		updateFramerates();
		if (g.framerate_counter++%g.display_framerate_interval == 0) displayFramerate();
		// recursive loop
		setTimeout(arguments.callee, 1000 / 65);
	})();

	// ---------------------------------------------------------------
	// Sub Routines
	// ---------------------------------------------------------------
	/// draw objects
	function drawObjects() {
		// Y - Axis
		glnv.mvPushMatrix();
		glnv.putArrow(prg,
			prg.arrows["red"]["v"], prg.arrows["red"]["n"], 
			prg.arrows["red"]["c"], prg.arrows["red"]["i"], prg.attLocation, prg.attStride);
		glnv.mvPopMatrix();

		// Z - Axis
		glnv.mvPushMatrix();
		m.rotate(glnv.mMatrix, glnv.degToRad(90), [1, 0, 0], glnv.mMatrix);
		glnv.putArrow(prg,
			prg.arrows["green"]["v"], prg.arrows["green"]["n"], 
			prg.arrows["green"]["c"], prg.arrows["green"]["i"], prg.attLocation, prg.attStride);
		glnv.mvPopMatrix();

		// rotate arrow
		if (g.rinfo['rot'] != undefined) {
		glnv.mvPushMatrix();
		for (var i = 0; i< g.rinfo['rot'].length; i++) 
			m.rotate(glnv.mMatrix, glnv.degToRad(g.rinfo['rot'][i][0]), 
				[g.rinfo['rot'][i][1], g.rinfo['rot'][i][2], g.rinfo['rot'][i][3]], glnv.mMatrix);
		m.rotate(glnv.mMatrix, glnv.degToRad(-90), [0, 0, 1], glnv.mMatrix);
		m.scale(glnv.mMatrix, [0.5, 1.5, 0.5], glnv.mMatrix);
		glnv.putArrow(prg,
			prg.arrows["green"]["v"], prg.arrows["green"]["n"], 
			prg.arrows["green"]["c"], prg.arrows["green"]["i"], prg.attLocation, prg.attStride);
		glnv.mvPopMatrix();
		}

		// X - Axis
		glnv.drawFlows(prg, undefined, g.drawinfo_flows, arrow_default_pos, arrow_delta);
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
	}

	// initialize canvas
	function initCanvas() {
		gl.clearColor(0.0, 0.0, 1.0, 0.9); gl.clearDepth(1.0);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		if (g.view_mode != g.old_view_mode) {
			if (g.view_mode) {
			m.perspective(45, c.width / c.height, 0.1, 100, pMatrix);
			} else {
			var ratio = c.width / c.height;
			m.ortho(-12.0, 12.0, -12.0/ratio, 12.0/ratio, -50.0, 50.0, pMatrix);
			}
			m.multiply(pMatrix, vMatrix, glnv.vpMatrix);
			g.old_view_mode = g.view_mode;
		}

		m.identity(glnv.mMatrix);
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
		var obj_size = g.scale / 6000.0;
		m.scale(glnv.mMatrix, [obj_size, obj_size, obj_size], glnv.mMatrix);
		m.rotate(glnv.mMatrix, glnv.degToRad(g.xaxis_rotate_param*5.0), [1, 0, 0], glnv.mMatrix);
		m.multiply(glnv.vpMatrix, glnv.mMatrix, mvpMatrix);
		m.inverse(glnv.mMatrix, invMatrix);

		// set uniform variables
		gl.uniformMatrix4fv(prg.uniLocation[0], false, mvpMatrix);
		gl.uniformMatrix4fv(prg.uniLocation[1], false, invMatrix);
	}
};
// __END__

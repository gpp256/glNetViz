/*!
 * main.js
 *
 * Copyright (c) 2013 Yoshi 
 * This software is distributed under the MIT License.(../../MIT-LICENSE.txt)
 */

// jQuery Ready Function
$(function () { glNetViz.initEvent(); initUI(); });

window.onload = function(){
	// ---------------------------------------------------------------
	// Main Routine
	// ---------------------------------------------------------------
	// initialize WebGL;
	var c = document.getElementById('canvas'); 
	initWebGL(c);

	// create shader programs
	var prg = {}; 
	var uniLocation = new Array(); var attLocation = new Array();
	var attStride = new Array();
	initShader();

	// create objects
	var pos_vbo = {}; var nor_vbo = {}; var col_vbo = {}; var ibo = {};
	var arrows = {};
	// create arrows
	createArrows();
	// show number of polygons
	$("#displayinfo").text("Number of Polygons: " + g.polygon_num);
    
	// initialize projection matrix
	var mvMatrixStack = [];
	var m = new matIV();
	var mMatrix = m.identity(m.create()); var vMatrix = m.identity(m.create());
	var pMatrix = m.identity(m.create()); var tmpMatrix = m.identity(m.create());
	var mvpMatrix = m.identity(m.create()); var invMatrix = m.identity(m.create());
	m.lookAt([0.0, 0.0, 25.0], [0, 0, 0], [0, 1, 0], vMatrix);
	m.perspective(45, c.width / c.height, 0.1, 100, pMatrix);
	m.multiply(pMatrix, vMatrix, tmpMatrix);
	var then = 0.0;

	// initialize objects parameters
	var startpos = [0.0, 0.0, 0.0]; var endpos = [1.0, 1.0, -1.0];
	getRotationArray(1, startpos.join(','), endpos.join(','));
	arrow_default_pos = [0, 100, 200]; arrow_delta = 2;

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
		setTimeout(arguments.callee, 1000 / 60);
	})();

	// ---------------------------------------------------------------
	// Sub Routines
	// ---------------------------------------------------------------
	/// draw objects
	function drawObjects() {
		// Y - Axis
		mvPushMatrix();
		drawArrow(arrows["red"]["v"], arrows["red"]["n"], arrows["red"]["c"], attLocation, attStride);
		mvPopMatrix();
		// Z - Axis
		mvPushMatrix();
		m.rotate(mMatrix, glNetViz.degToRad(90), [1, 0, 0], mMatrix);
		drawArrow(arrows["green"]["v"], arrows["green"]["n"], arrows["green"]["c"], attLocation, attStride);
		mvPopMatrix();

		// rotate arrow
		if (g.rinfo['rot'] != undefined) {
		mvPushMatrix();
		for (var i = 0; i< g.rinfo['rot'].length; i++) 
			m.rotate(mMatrix, glNetViz.degToRad(g.rinfo['rot'][i][0]), [g.rinfo['rot'][i][1], g.rinfo['rot'][i][2], g.rinfo['rot'][i][3]], mMatrix);
		m.rotate(mMatrix, glNetViz.degToRad(-90), [0, 0, 1], mMatrix);
		m.scale(mMatrix, [0.5, 1.5, 0.5], mMatrix);
		drawArrow(arrows["green"]["v"], arrows["green"]["n"], arrows["green"]["c"], attLocation, attStride);
		mvPopMatrix();
		}

		// X - Axis
		var arrow_movelen = {x: 0.0, y: 0.0, z: 0.0};
		var start = [0.0, 0.0, 0.0];
		var end = [250.0, 0.0, 0.0];
		for (var i=0; i<3; i++) {
			arrow_default_pos[i]+=arrow_delta;
			arrow_movelen.x = (arrow_default_pos[i] % 300) / 300 * (end[0]-start[0]);
			arrow_movelen.y = (arrow_default_pos[i] % 300) / 300 * (end[1]-start[1]);
			arrow_movelen.z = (arrow_default_pos[i] % 300) / 300 * (end[2]-start[2]);
			mvPushMatrix();
    		m.translate(mMatrix, 
				[start[0]+arrow_movelen.x, start[1]+arrow_movelen.y, start[2]+arrow_movelen.z], 
				mMatrix);
			m.rotate(mMatrix, glNetViz.degToRad(-90), [0, 0, 1], mMatrix);
			drawArrow(arrows["blue"]["v"], arrows["blue"]["n"], arrows["blue"]["c"], 
				attLocation, attStride);
			mvPopMatrix();
		}
	}

	// push model view matrix
	function mvPushMatrix() {
	    var copy = m.create();
	    m.set(mMatrix, copy);
	    mvMatrixStack.push(copy);
	}

	// pop model view matrix
	function mvPopMatrix() {
	    if (mvMatrixStack.length == 0) {
	        throw "Invalid popMatrix!";
	    }
	    mMatrix = mvMatrixStack.pop();
	}

	// set Matirx Uniforms
	function setMatrixUniforms() {
		m.multiply(tmpMatrix, mMatrix, mvpMatrix);
		m.inverse(mMatrix, invMatrix);
		gl.uniformMatrix4fv(uniLocation[0], false, mvpMatrix);
		gl.uniformMatrix4fv(uniLocation[1], false, invMatrix);
	}
	
	// draw Arrow Objects
	function drawArrow(pos_vbo, nor_vbo, col_vbo, attLocation, attStride) {
		m.translate(mMatrix, [0.0, 35.0/2.0, 0.0], mMatrix);
		setMatrixUniforms();
		var objs = ['cylinder', 'cone'];
		for (var i = 0; i<objs.length; i++) {
			if (objs[i] == 'cone') {
				m.translate(mMatrix, [0.0, 35.0, 0.0], mMatrix);
				setMatrixUniforms();
			}
			glNetViz.setAttribute(
				[pos_vbo[objs[i]], nor_vbo[objs[i]], col_vbo[objs[i]]], attLocation, attStride);
			// bind ibo 
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo[objs[i]]);
			gl.drawElements(ibo[objs[i]].drawMethod, ibo[objs[i]].numItems, gl.UNSIGNED_SHORT, 0);
		}
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

	// initialize shader programs
	function initShader() {
		var v_shader = glNetViz.createShader(
			'raw', 'x-shader/x-vertex', glNetViz.getVertexShader('default'));
		var f_shader = glNetViz.createShader(
			'raw', 'x-shader/x-fragment', glNetViz.getFragmentShader('default'));
		prg = glNetViz.createProgram(v_shader, f_shader);

		// get parameter locations for prg
		uniLocation[0] = gl.getUniformLocation(prg, 'mvpMatrix');
		uniLocation[1] = gl.getUniformLocation(prg, 'invMatrix');
		uniLocation[2] = gl.getUniformLocation(prg, 'lightDirection');
		uniLocation[3] = gl.getUniformLocation(prg, 'eyeDirection');
		uniLocation[4] = gl.getUniformLocation(prg, 'ambientColor');
		attLocation[0] = gl.getAttribLocation(prg, 'position');
		attLocation[1] = gl.getAttribLocation(prg, 'normal');
		attLocation[2] = gl.getAttribLocation(prg, 'color');
		attStride[0] = 3; attStride[1] = 3; attStride[2] = 4;

		// set the default shader program
		gl.useProgram(prg);
		var lightDirection = [-0.5, 0.5, 0.5]; 
		var eyeDirection = [0.0, 0.0, 25.0]; 
		var ambientColor = [0.2, 0.2, 0.2, 1.0]; 
		gl.uniform3fv(uniLocation[2], lightDirection);
		gl.uniform3fv(uniLocation[3], eyeDirection);
		gl.uniform4fv(uniLocation[4], ambientColor);
	}

	// create arrows
	function createArrows() {
		glNetViz.createArrow({r: 1.0, g: 0.0, b: 0.0, a: 1.0}, 
			pos_vbo, nor_vbo, col_vbo, ibo);
		arrows["red"] = {v: pos_vbo, n: nor_vbo, c: $.extend({}, col_vbo), i: ibo};
		glNetViz.changeArrowColor({r: 0.0, g: 1.0, b: 0.0, a: 1.0}, col_vbo, ibo);
		arrows["green"] = {v: pos_vbo, n: nor_vbo, c: $.extend({}, col_vbo), i: ibo};
		glNetViz.changeArrowColor({r: 0.0, g: 0.0, b: 1.0, a: 1.0}, col_vbo, ibo);
		arrows["blue"] = {v: pos_vbo, n: nor_vbo, c: $.extend({}, col_vbo), i: ibo};
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
			m.multiply(pMatrix, vMatrix, tmpMatrix);
			g.old_view_mode = g.view_mode;
		}

		m.identity(mMatrix);
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
		var tscale = glNetViz.degToRad(-g.scrollY)*0.4+2.0;
		m.scale(mMatrix, [tscale, tscale, tscale], mMatrix);
		m.rotate(mMatrix, glNetViz.degToRad(g.scrollX), [0, 1, 0], mMatrix);

		// -- Slider Event --
		var obj_size = g.scale / 30.0;
		m.scale(mMatrix, [obj_size, obj_size, obj_size], mMatrix);
		m.rotate(mMatrix, glNetViz.degToRad(g.xaxis_rotate_param*5.0), [1, 0, 0], mMatrix);
		var size = 0.015;
		m.scale(mMatrix, [size, size, size], mMatrix);

		m.multiply(tmpMatrix, mMatrix, mvpMatrix);
		m.inverse(mMatrix, invMatrix);

		// set uniform variables
		gl.uniformMatrix4fv(uniLocation[0], false, mvpMatrix);
		gl.uniformMatrix4fv(uniLocation[1], false, invMatrix);
	}
};
// __END__

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
	// create arrows
	glnv.generateArrows(prg, [
		{id: 'red', r: 1.0, g: 0.0, b: 0.0, a: 1.0}, 
		{id: 'green', r: 0.0, g: 1.0, b: 0.0, a: 1.0}, 
		{id: 'blue', r: 0.0, g: 0.0, b: 1.0, a: 1.0}
	]);
	// create spheres
	glnv.generateSpheres(prg, [
		{id: 'red', r: 1.0, g: 0.0, b: 0.0, a: 1.0},
		{id: 'blue', r: 0.0, g: 0.0, b: 1.0, a: 1.0}
		], 12);
	// create cubes
	glnv.generateCubes(prg, [
		{id: 'red', r: 1.0, g: 0.0, b: 0.0, a: 1.0}, 
		{id: 'green', r: 0.0, g: 1.0, b: 0.0, a: 1.0}
	]);
	// create rectangles
	glnv.generateRectangles(texprg);
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
		gl.useProgram(prg);
		glnv.drawFlows(prg, undefined, g.drawinfo_flows, arrow_default_pos, arrow_delta);

		// draw spheres
		glnv.mvPushMatrix();
		m.scale(glnv.mMatrix, [20.0, 20.0, 20.0], glnv.mMatrix);
    	m.translate(glnv.mMatrix, [0.0, 5.0, 0.0], glnv.mMatrix);
		glnv.setMatrixUniforms(prg, 'default');
		glnv.putSphere(
			prg.spheres["red"]["v"], prg.spheres["red"]["n"], 
			prg.spheres["red"]["c"], prg.spheres["red"]["i"], prg.attLocation, [ 3, 3, 4 ],
			1 // wireframe flag
		);
		glnv.mvPopMatrix();

		// draw cubes
		glnv.mvPushMatrix();
		m.scale(glnv.mMatrix, [12.0, 12.0, 12.0], glnv.mMatrix);
    	m.translate(glnv.mMatrix, [0.0, 0.0, 8.0], glnv.mMatrix);
		glnv.setMatrixUniforms(prg, 'default');
		glnv.putCube(
			prg.cubes["green"]["v"], prg.cubes["green"]["n"], 
			prg.cubes["green"]["c"], prg.cubes["green"]["i"], prg.attLocation, [ 3, 3, 4 ]
		);
		glnv.mvPopMatrix();

		// change shader program
		gl.useProgram(texprg);

		// draw a texture cube
		glnv.mvPushMatrix();
		m.scale(glnv.mMatrix, [18.0, 4.5, 12.0], glnv.mMatrix);
    	m.translate(glnv.mMatrix, [0.0, 0.0, 12.0], glnv.mMatrix);
		glnv.setMatrixUniforms(texprg, 'use_texture');
    	gl.uniform1i(texprg.samplerUniform, 1);
		glnv.putCube(
			prg.cubes["red"]["v"], prg.cubes["red"]["n"], 
			prg.cubes["red"]["t"], prg.cubes["red"]["i"], [
				texprg.vertexPositionAttribute,
				texprg.vertexNormalAttribute, 
				texprg.textureCoordAttribute ], [ 3, 3, 2 ]
		);
		glnv.mvPopMatrix();

		glnv.putStr(texprg, "switch01", 3.5, [0.0, 9.0, 144.0], 0.45, "red");

		// draw a texture sphere
		glnv.mvPushMatrix();
		m.scale(glnv.mMatrix, [20.0, 20.0, 20.0], glnv.mMatrix);
    	m.translate(glnv.mMatrix, [0.0, -2.0, 0.0], glnv.mMatrix);
		glnv.setMatrixUniforms(texprg, 'use_texture');
    	gl.uniform1i(texprg.samplerUniform, 4);
		glnv.putSphere(
			prg.spheres["red"]["v"], prg.spheres["red"]["n"], 
			prg.spheres["red"]["t"], prg.spheres["red"]["i"], [
				texprg.vertexPositionAttribute,
				texprg.vertexNormalAttribute, 
				texprg.textureCoordAttribute
			], [ 3, 3, 2 ]
		);
		glnv.mvPopMatrix();

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

	// initialize canvas
	function initCanvas() {
		gl.clearColor(0.0, 0.0, 1.0, 0.9); gl.clearDepth(1.0);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		// active textures 
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
		m.rotate(glnv.mMatrix, glnv.degToRad(g.scrollX-30.0), [0, 1, 0], glnv.mMatrix);

		// -- Slider Event --
		var obj_size = g.scale / 6500.0;
		m.scale(glnv.mMatrix, [obj_size, obj_size, obj_size], glnv.mMatrix);
		m.rotate(glnv.mMatrix, glnv.degToRad(g.xaxis_rotate_param*5.0), [1, 0, 0], glnv.mMatrix);
		m.multiply(glnv.vpMatrix, glnv.mMatrix, mvpMatrix);
		m.inverse(glnv.mMatrix, invMatrix);

		// uniform変数の登録
		gl.uniformMatrix4fv(prg.uniLocation[0], false, mvpMatrix);
		gl.uniformMatrix4fv(prg.uniLocation[1], false, invMatrix);
	}
};
// __END__

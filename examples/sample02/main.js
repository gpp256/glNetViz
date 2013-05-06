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
	var prg = {}; var texprg = {} ;
	var uniLocation = new Array(); var attLocation = new Array();
	var attStride = new Array();
	initShader();

	// create textures
	var textureList = new Array(); initTexture();

	// create objects
	var pos_vbo = {}; var nor_vbo = {}; var col_vbo = {}; var ibo = {};
	var arrows = {};
	// create arrows
	createArrows();
	// create spheres
	glNetViz.generateSphereObjects(prg);
	// create cubes
	glNetViz.generateCubeObjects(prg);
	// create rectangles
	glNetViz.generateRectangles(texprg);
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

	// -- Create Slider --
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

		// draw spheres
		mvPushMatrix();
		m.scale(mMatrix, [20.0, 20.0, 20.0], mMatrix);
    	m.translate(mMatrix, [0.0, 5.0, 0.0], mMatrix);
		setMatrixUniforms();
		glNetViz.putSphere(
			prg.spheres["red"]["v"], prg.spheres["red"]["n"], 
			prg.spheres["red"]["c"], prg.spheres["red"]["i"], 
			attLocation, [ 3, 3, 4 ]
		);
		mvPopMatrix();

		// draw cubes
		mvPushMatrix();
		m.scale(mMatrix, [12.0, 12.0, 12.0], mMatrix);
    	m.translate(mMatrix, [0.0, 0.0, 8.0], mMatrix);
		setMatrixUniforms();
		glNetViz.putCube(
			prg.cubes["green"]["v"], prg.cubes["green"]["n"], 
			prg.cubes["green"]["c"], prg.cubes["green"]["i"], 
			attLocation, [ 3, 3, 4 ]
		);
		mvPopMatrix();

		// change shader program
		gl.useProgram(texprg);

		// draw txture cube
		mvPushMatrix();
		m.scale(mMatrix, [18.0, 4.5, 12.0], mMatrix);
    	m.translate(mMatrix, [0.0, 0.0, 12.0], mMatrix);
		setMatrixTextureUniforms();
    	gl.uniform1i(texprg.samplerUniform, 0);
		glNetViz.putCube(
			prg.cubes["red"]["v"], prg.cubes["red"]["n"], 
			prg.cubes["red"]["t"], prg.cubes["red"]["i"], [
				texprg.vertexPositionAttribute,
				texprg.vertexNormalAttribute, 
				texprg.textureCoordAttribute
			], [ 3, 3, 2 ]
		);
		mvPopMatrix();

		putStr("switch01", 3.5, [0.0, 9.0, 144.0], 0.45, "red");

		// draw spheres
		mvPushMatrix();
		m.scale(mMatrix, [20.0, 20.0, 20.0], mMatrix);
    	m.translate(mMatrix, [0.0, -2.0, 0.0], mMatrix);
		setMatrixTextureUniforms();
    	gl.uniform1i(texprg.samplerUniform, 4);
		glNetViz.putSphere(
			prg.spheres["red"]["v"], prg.spheres["red"]["n"], 
			prg.spheres["red"]["t"], prg.spheres["red"]["i"], [
				texprg.vertexPositionAttribute,
				texprg.vertexNormalAttribute, 
				texprg.textureCoordAttribute
			], [ 3, 3, 2 ]
		);
		mvPopMatrix();

		gl.useProgram(prg);
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

	// set Matirx Uniforms
	function setMatrixTextureUniforms() {
		gl.uniformMatrix4fv(texprg.pMatrixUniform, false, tmpMatrix);
		gl.uniformMatrix4fv(texprg.mvMatrixUniform, false, mMatrix);
		var normalMatrix = new Float32Array(9);
		gl.uniformMatrix3fv(texprg.nMatrixUniform, false, normalMatrix);
	}
	
	// draw Arrow Objects
	function drawArrow(pos_vbo, nor_vbo, col_vbo, attLocation, attStride) {
		m.translate(mMatrix, [0.0, 35.0/2.0, 0.0], mMatrix);
		setMatrixUniforms();
		// VBO を登録する
		var objs = ['cylinder', 'cone'];
		for (var i = 0; i<objs.length; i++) {
			if (objs[i] == 'cone') {
				m.translate(mMatrix, [0.0, 35.0, 0.0], mMatrix);
				setMatrixUniforms();
			}
			glNetViz.setAttribute(
				[pos_vbo[objs[i]], nor_vbo[objs[i]], col_vbo[objs[i]]], attLocation, attStride);
			// IBOをバインドして登録する
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo[objs[i]]);
			// モデルの描画
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

	// initialize  textures
	function initTexture() {
		glNetViz.createTexture(textureList, 
			'../../lib/textures/sw_texture01.png', 0, 256, 128);
		glNetViz.createTexture(textureList, 
			'../../lib/textures/pc_texture01.png', 1, 256, 128);
		glNetViz.createTexture(textureList, 
			'../../lib/textures/pfc_texture01.png', 2, 256, 128);
		glNetViz.createTexture(textureList, 
			'../../lib/textures/fw_texture01.png', 3, 256, 128);
		glNetViz.createTexture(textureList, 
			'../../lib/textures/earthmap.png', 4, 256, 128);
		glNetViz.createTexture(textureList, 
			'../../lib/textures/font_red.png', 5, 256, 256);
		glNetViz.createTexture(textureList, 
			'../../lib/textures/font_green.png', 6, 256, 256);
		glNetViz.createTexture(textureList, 
			'../../lib/textures/font_blue.png', 7, 256, 256);
	}

	// initialize shader programs
	function initShader() {
		var v_shader = glNetViz.createShader(
			'raw', 'x-shader/x-vertex', glNetViz.getVertexShader('default'));
		var f_shader = glNetViz.createShader(
			'raw', 'x-shader/x-fragment', glNetViz.getFragmentShader('default'));
		prg = glNetViz.createProgram(v_shader, f_shader);
		v_shader = glNetViz.createShader(
			'raw', 'x-shader/x-vertex', glNetViz.getVertexShader('use_texture'));
		f_shader = glNetViz.createShader(
			'raw', 'x-shader/x-fragment', glNetViz.getFragmentShader('use_texture'));
		texprg = glNetViz.createProgram(v_shader, f_shader);

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

		// get parameter locations
        texprg.vertexPositionAttribute = gl.getAttribLocation(texprg, "aVertexPosition");
        gl.enableVertexAttribArray(texprg.vertexPositionAttribute);
        texprg.vertexNormalAttribute = gl.getAttribLocation(texprg, "aVertexNormal");
        gl.enableVertexAttribArray(texprg.vertexNormalAttribute);
        texprg.textureCoordAttribute = gl.getAttribLocation(texprg, "aTextureCoord");
        gl.enableVertexAttribArray(texprg.textureCoordAttribute);

        texprg.mvMatrixUniform = gl.getUniformLocation(texprg, "uMVMatrix");
        texprg.pMatrixUniform = gl.getUniformLocation(texprg, "uPMatrix");
        texprg.nMatrixUniform = gl.getUniformLocation(texprg, "uNMatrix");
        texprg.ambientColorUniform = gl.getUniformLocation(texprg, "uAmbientColor");
        texprg.lightingDirectionUniform = gl.getUniformLocation(texprg, "uLightingDirection");
        texprg.directionalColorUniform = gl.getUniformLocation(texprg, "uDirectionalColor");
        texprg.useLightingUniform = gl.getUniformLocation(texprg, "uUseLighting");

        texprg.alphaUniform = gl.getUniformLocation(texprg, "uAlpha");
        texprg.samplerUniform = gl.getUniformLocation(texprg, "uSampler");
        texprg.useTextureUniform = gl.getUniformLocation(texprg, "uUseTexture");
        texprg.useArrowUniform = gl.getUniformLocation(texprg, "uUseArrow");

		// initialize parameters
		gl.uniform3f(texprg.ambientColorUniform, 0.8, 0.8, 0.8);
    	var adjustedLD = new Float32Array(3);
		adjustedLD[0] = 0.0; adjustedLD[0] = 0.0; adjustedLD[0] = -1.0;
    	gl.uniform3fv(texprg.lightingDirectionUniform, adjustedLD);
		gl.uniform3f(texprg.directionalColorUniform, 0.6, 0.6, 0.6);
    	gl.uniform1i(texprg.useLightingUniform, 1);

    	gl.uniform1f(texprg.alphaUniform, 1.0);
    	gl.uniform1i(texprg.samplerUniform, 0);
    	gl.uniform1i(texprg.useTextureUniform, 1);
    	gl.uniform1i(texprg.useArrowUniform, 0);

		gl.useProgram(prg);
		var lightDirection = [-0.5, 0.5, 0.5]; 
		var eyeDirection = [0.0, 0.0, 25.0]; 
		var ambientColor = [0.2, 0.2, 0.2, 1.0]; 
		gl.uniform3fv(uniLocation[2], lightDirection);
		gl.uniform3fv(uniLocation[3], eyeDirection);
		gl.uniform4fv(uniLocation[4], ambientColor);
	}

	// draw text characters
	function putStr(outchar, size, pos, c_spacing, color) {
		gl.enable(gl.BLEND);
		gl.disable(gl.DEPTH_TEST);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
		gl.blendFuncSeparate(
		  gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA,
		  gl.ZERO, gl.ONE_MINUS_SRC_ALPHA);
	
		mvPushMatrix();
    	m.translate(mMatrix, pos, mMatrix);
		m.scale(mMatrix, [size*c_spacing, size*0.9, size], mMatrix);
		var dx = 1.4;
		var start_pos = (outchar.length/2.0-0.5)*-dx;
		for (var i=0; i<outchar.length; i++) {
			mvPushMatrix();
    		m.translate(mMatrix, [start_pos+i*dx, 0.0, 0.0], mMatrix);
			setMatrixTextureUniforms();
			glNetViz.putChar(texprg, outchar[i], color);
			mvPopMatrix();
		}
		mvPopMatrix();

		gl.disable(gl.BLEND);
		gl.enable(gl.DEPTH_TEST);
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
		// active textures 
		gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, textureList[0]);
		gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, textureList[1]);
		gl.activeTexture(gl.TEXTURE2); gl.bindTexture(gl.TEXTURE_2D, textureList[2]);
		gl.activeTexture(gl.TEXTURE3); gl.bindTexture(gl.TEXTURE_2D, textureList[3]);
		gl.activeTexture(gl.TEXTURE4); gl.bindTexture(gl.TEXTURE_2D, textureList[4]);
		gl.activeTexture(gl.TEXTURE5); gl.bindTexture(gl.TEXTURE_2D, textureList[5]);
		gl.activeTexture(gl.TEXTURE6); gl.bindTexture(gl.TEXTURE_2D, textureList[6]);
		gl.activeTexture(gl.TEXTURE7); gl.bindTexture(gl.TEXTURE_2D, textureList[7]);
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

		// uniform変数の登録
		gl.uniformMatrix4fv(uniLocation[0], false, mvpMatrix);
		gl.uniformMatrix4fv(uniLocation[1], false, invMatrix);
	}
};
// __END__

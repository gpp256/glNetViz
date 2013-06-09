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
	// create cubes
	glnv.generateCubes(prg, [ {id: 'red', r: 1.0, g: 0.0, b: 0.0, a: 1.0} ]);
	// create cylinders
	glnv.generateCylinders(prg, [
		{id: "yellow", r: 1.0, g: 1.0, b: 0.0, a: 1.0},
		{id: "gray", r: 0.1, g: 0.1, b: 0.1, a: 1.0}
	]);
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
	// -- Create Slider --
	createSliderUI();
 
	// drawing loop
	(function(){
		// initialize the canvas
		initCanvas();
		// draw objects
		drawObjects(); gl.flush();
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
			drawCylinders(objinfo['src'], objinfo['dst'], objinfo['rot'], objinfo['color']);
		}
		}

		// change shader program
		gl.useProgram(texprg);

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

		gl.useProgram(prg);
	}

	// draw Cube
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

	// initialize a canvas
	function initCanvas() {
		gl.clearColor(0.0, 0.0, 1.0, 0.9); gl.clearDepth(1.0);
    	gl.viewport(0, 0, c.width, c.height);
		// active textures 
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
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
			m.ortho(-1.2, 1.2, -1.2/ratio, 1.2/ratio, -50.0, 50.0, pMatrix);
			}
			m.multiply(pMatrix, vMatrix, glnv.vpMatrix);
			g.old_view_mode = g.view_mode;
		}
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
		var tscale = glnv.degToRad(-g.scrollY)*0.4+6.0;
		m.scale(glnv.mMatrix, [tscale, tscale, tscale], glnv.mMatrix);
		m.rotate(glnv.mMatrix, glnv.degToRad(g.scrollX), [0, 1, 0], glnv.mMatrix);

		// -- Slider Event --
		var obj_size = g.scale / 30.0;
		m.scale(glnv.mMatrix, [obj_size, obj_size, obj_size], glnv.mMatrix);
		m.rotate(glnv.mMatrix, glnv.degToRad(g.xaxis_rotate_param*5.0), [1, 0, 0], glnv.mMatrix);
		var size = 0.015;
		m.scale(glnv.mMatrix, [size, size, size], glnv.mMatrix);
		m.multiply(glnv.vpMatrix, glnv.mMatrix, mvpMatrix);
		m.inverse(glnv.mMatrix, invMatrix);

		// set uniform variables
		gl.uniformMatrix4fv(prg.uniLocation[0], false, mvpMatrix);
		gl.uniformMatrix4fv(prg.uniLocation[1], false, invMatrix);
	}
};
// __END__

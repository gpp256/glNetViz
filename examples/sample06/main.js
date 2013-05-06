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
	// get parameters for visualizing objects
	loadObject(); 
	// create arrows
	createArrows();
	// create spheres
	glNetViz.generateSphereObjects(prg);
	// create cubes
	glNetViz.generateCubeObjects(prg);
	// create rectangles
	glNetViz.generateRectangles(texprg);
	// create cylinders
	glNetViz.generateCylinderObjects(prg);
	// create cones
	glNetViz.generateConeObjects(prg);
	// show number of polygons
	$("#displayinfo").append("Number of Polygons: " + g.polygon_num);

	// initialize projection matrix
	var mvMatrixStack = [];
	var m = new matIV();
	var mMatrix = m.identity(m.create()); var vMatrix = m.identity(m.create());
	var pMatrix = m.identity(m.create()); var tmpMatrix = m.identity(m.create());
	var mvpMatrix = m.identity(m.create()); var invMatrix = m.identity(m.create());
	m.lookAt([0.0, 0.0, 18.0], [0, 0, 0], [0, 1, 0], vMatrix);
	g.mRatio = c.width / c.height;
	gl.viewportWidth = c.width; gl.viewportHeight = c.height;
	m.perspective(45, c.width / c.height, 0.1, 100, pMatrix);
	m.multiply(pMatrix, vMatrix, tmpMatrix);
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
		if (g.framerate_counter++%g.display_framerate_interval == 0) 
			displayFramerate();
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
				mvPushMatrix();
				// Switch
				if (val['texture'] == 1) {
	    			m.translate(mMatrix, val['pos'], mMatrix);
					mvPushMatrix();
					m.scale(mMatrix, [1.0, 1.1, 1.0], mMatrix);
	    			m.rotate(mMatrix, glNetViz.degToRad(g.switch_rotate_param*10), 
						[0, 1, 0], mMatrix);
					drawCube(1, 0.0);
					if (g.drawObjLabelsFlag) 
						putStr(val['name'], 0.15, [0.0, 0.48, 0.0], 0.52, "green");
					mvPopMatrix();
				// Controller
				} else if (val['texture']==0) {
	    		    m.translate(mMatrix, val['pos'], mMatrix);
					mvPushMatrix();
					m.scale(mMatrix, [1.2, 1.6, 1.2], mMatrix);
	    			m.rotate(mMatrix, glNetViz.degToRad(g.controller_rotate_param*10), 
						[0, 1, 0], mMatrix);
					drawCube(0, 0.0);
					if (g.drawObjLabelsFlag) 
						putStr(val['name'], 0.15, [0.0, 0.52, 0.0], 0.52, "green");
					mvPopMatrix();
				// Host
				} else if (val['texture']==2) {
	    		    m.translate(mMatrix, val['origin'], mMatrix);
	    		    m.translate(mMatrix, val['pos'], mMatrix);
					mvPushMatrix();
					m.scale(mMatrix, [0.6, 0.6, 0.6], mMatrix);
	    			m.rotate(mMatrix, glNetViz.degToRad(g.host_rotate_param*10), 
						[0, 1, 0], mMatrix);
					drawCube(2, 90.0);
					if (g.drawObjLabelsFlag) 
						putStr(val['name'], 0.15, [0.0, 0.72, 0.0], 0.52, "green");
					mvPopMatrix();
				// Others
				} else {
				}
				if (g.check_intersect == 1) result_intersect = intersect(key, result_intersect);
				mvPopMatrix();
			});
		} else {
		}
		});

		if (g.other_objs["objs"] != undefined) {
		for (var i=0; i<g.other_objs["objs"].length; i++) {
			var objinfo = g.other_objs["objs"][i];
			mvPushMatrix();
			if (objinfo['origin'] != undefined) {
				m.translate(mMatrix, objinfo['origin'], mMatrix);
			} else {
				m.translate(mMatrix, [0.0, 0.0, 0.0], mMatrix);
			}
			m.translate(mMatrix, objinfo['pos'], mMatrix);
			m.scale(mMatrix, objinfo['scale'], mMatrix);
			m.rotate(mMatrix, glNetViz.degToRad(g.switch_rotate_param*10), 
				[0, 1, 0], mMatrix);
			drawCube(objinfo['texture_id'], 0.0);
			mvPopMatrix();
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

		if (g.intersect_index != -1)  drawIntersectObject();

		gl.useProgram(prg);

		for (var i = 0; i < g.drawinfo_gwflows.length; i++) {
			if (g.drawinfo_gwflows[i]['rot'] == undefined) {
				putSpheres(
					g.drawinfo_gwflows[i]['start'], g.drawinfo_gwflows[i]['end'], 
					g.drawinfo_gwflows[i]['color'], g.drawinfo_gwflows[i]['size']
				);
			} else {
				putArrows(
					g.drawinfo_gwflows[i]['start'], g.drawinfo_gwflows[i]['end'], 
					g.drawinfo_gwflows[i]['color'], g.drawinfo_gwflows[i]['rot'],
					g.drawinfo_gwflows[i]['size'], g.drawinfo_gwflows[i]['value']
				);
			}
		} // for

		for (var i = 0; i < g.drawinfo_flows.length; i++) {
			if (g.drawinfo_flows[i]['rot'] == undefined) {
				putSpheres(
					g.drawinfo_flows[i]['start'], g.drawinfo_flows[i]['end'], 
					g.drawinfo_flows[i]['color'], g.drawinfo_flows[i]['size']
				);
			} else {
				putArrows(
					g.drawinfo_flows[i]['start'], g.drawinfo_flows[i]['end'], 
					g.drawinfo_flows[i]['color'], g.drawinfo_flows[i]['rot'],
					g.drawinfo_flows[i]['size'], g.drawinfo_flows[i]['value']
				);
			}
		} // for
	}

	function drawIntersectObject () {
		var posindex = $('#selected-obj-pos-slider-value-left').text();
		if (g.sdn_objs['objList'][g.intersect_index]['texture'] == 1) {
			var pos = [
				g.sdn_objs['objList'][g.intersect_index]['origin'][0]+ 
					objPosDB['pos'][posindex-1][0]*g.sdn_objs['objList'][g.intersect_index]['rad'], 
				g.sdn_objs['objList'][g.intersect_index]['origin'][1]+ 
					objPosDB['pos'][posindex-1][1]*g.sdn_objs['objList'][g.intersect_index]['rad'], 
				g.sdn_objs['objList'][g.intersect_index]['origin'][2]+ 
					objPosDB['pos'][posindex-1][2]*g.sdn_objs['objList'][g.intersect_index]['rad']
			];
			mvPushMatrix();
			m.translate(mMatrix, pos, mMatrix);
			m.scale(mMatrix, [1.0, 1.1, 1.0], mMatrix);
			m.rotate(mMatrix, glNetViz.degToRad(g.switch_rotate_param*10),
				[0, 1, 0], mMatrix);
			drawCube(1, 0.0);
			mvPopMatrix();
		} else if (g.sdn_objs['objList'][g.intersect_index]['texture'] == 2) {
			var pos = [
					objPosDB['pos'][posindex-1][0]*g.sdn_objs['objList'][g.intersect_index]['rad'], 
					objPosDB['pos'][posindex-1][1]*g.sdn_objs['objList'][g.intersect_index]['rad'], 
					objPosDB['pos'][posindex-1][2]*g.sdn_objs['objList'][g.intersect_index]['rad']
			];
			mvPushMatrix();
			m.translate(mMatrix, g.sdn_objs['objList'][g.intersect_index]['origin'], mMatrix);
			//mat4.translate(mvMatrix, val['pos']);
			m.translate(mMatrix, pos, mMatrix);
			m.scale(mMatrix, [0.6, 0.6, 0.6], mMatrix);
			m.rotate(mMatrix, glNetViz.degToRad(g.host_rotate_param*10), 
				[0, 1, 0], mMatrix);
			drawCube(2, 90.0);
			mvPopMatrix();
		}
	}

	// initialize canvas
	function initCanvas() {
		gl.clearColor(0.0, 0.0, 1.0, 0.9); gl.clearDepth(1.0);
		gl.viewport(0, 0, c.width, c.height);
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
			m.ortho(-5, 5, -5/ratio, 5/ratio, -50.0, 50.0, pMatrix);
			}
			m.multiply(pMatrix, vMatrix, tmpMatrix);
			g.old_view_mode = g.view_mode;
		}

		m.identity(mMatrix);

		// -- Keyboard Event --
		m.rotate(mMatrix, glNetViz.degToRad(g.xRot), [1, 0, 0], mMatrix);
		m.rotate(mMatrix, glNetViz.degToRad(g.yRot), [0, 1, 0], mMatrix);

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
		obj_size = obj_size * 0.30;
		m.scale(mMatrix, [obj_size, obj_size, obj_size], mMatrix);
		m.rotate(mMatrix, glNetViz.degToRad(g.xaxis_rotate_param*5.0), [1, 0, 0], mMatrix);
		m.multiply(tmpMatrix, mMatrix, mvpMatrix);
		m.inverse(mMatrix, invMatrix);

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

	// draw Cube
	function drawCube(texture_num, rot) {
		gl.uniform1i(texprg.samplerUniform, texture_num);
		mvPushMatrix();
    	m.rotate(mMatrix, glNetViz.degToRad(rot), [0, 0, 1], mMatrix);
		m.scale(mMatrix, [0.8, 0.23, 0.8], mMatrix);
		setMatrixTextureUniforms();
		glNetViz.putCube(
			prg.cubes["red"]["v"], prg.cubes["red"]["n"], 
			prg.cubes["red"]["t"], prg.cubes["red"]["i"], [
				texprg.vertexPositionAttribute,
				texprg.vertexNormalAttribute, 
				texprg.textureCoordAttribute ], [ 3, 3, 2 ]);
		mvPopMatrix();
	}

	// draw cones
	function putCones(pos, color) {
		g.intersect_rot+=2;
		mvPushMatrix();
		m.translate(mMatrix, [-pos[0], -pos[1]+1.7, -pos[2]], mMatrix);
		m.scale(mMatrix, [0.45, 0.45, 0.45], mMatrix);
	    m.rotate(mMatrix, glNetViz.degToRad(g.intersect_rot), [0, 1, 0], mMatrix);
	    m.rotate(mMatrix, glNetViz.degToRad(-180), [1, 0, 0], mMatrix);
		setMatrixUniforms();
		glNetViz.putCone(
			prg.cones[color]["v"], prg.cones[color]["n"], 
			prg.cones[color]["c"], prg.cones[color]["i"], attLocation, [ 3, 3, 4 ]
		);
		mvPopMatrix();
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

	// draw cylinders
	function drawCylinders(start, end, rot, color) {
		var length1= Math.sqrt((end[0]-start[0])*(end[0]-start[0])
			+(end[1]-start[1])*(end[1]-start[1])+(end[2]-start[2])*(end[2]-start[2]));
		length1 *= 0.315;
		
		mvPushMatrix();
		m.translate(mMatrix, [start[0],start[1],start[2]], mMatrix);
		m.scale(mMatrix, [length1, length1, length1], mMatrix);
		for (var i=0; i<rot.length; i++) 
			m.rotate(mMatrix, glNetViz.degToRad(
				rot[i][0]), [rot[i][1], rot[i][2], rot[i][3]], mMatrix);
		m.scale(mMatrix, [1.0, 1.4/length1, 1.4/length1], mMatrix);
		m.rotate(mMatrix, glNetViz.degToRad(-90.0), [0, 0, 1], mMatrix);

		m.translate(mMatrix, [0.0, 3.0/2.0, 0.0], mMatrix);

		setMatrixUniforms();
		glNetViz.putCylinder(
			prg.cylinders[color]["v"], prg.cylinders[color]["n"], 
			prg.cylinders[color]["c"], prg.cylinders[color]["i"], 
			attLocation, [ 3, 3, 4 ]
		);
		mvPopMatrix();
	}

	// initialize  textures
	function initTexture() {
		glNetViz.createTexture(textureList, 
			'../../lib/textures/pfc_texture01.png', 0, 256, 128);
		glNetViz.createTexture(textureList, 
			'../../lib/textures/sw_texture01.png', 1, 256, 128);
		glNetViz.createTexture(textureList, 
			'../../lib/textures/pc_texture01.png', 2, 256, 128);
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

		// get parameter locations for texprg
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
		gl.uniform3f(texprg.ambientColorUniform, 0.9, 0.9, 0.9);
    	var adjustedLD = new Float32Array(3);
		adjustedLD[0] = 0.0; adjustedLD[0] = 0.0; adjustedLD[0] = -1.0;
    	gl.uniform3fv(texprg.lightingDirectionUniform, adjustedLD);
		gl.uniform3f(texprg.directionalColorUniform, 0.6, 0.6, 0.6);
    	gl.uniform1i(texprg.useLightingUniform, 1);

    	gl.uniform1f(texprg.alphaUniform, 1.0);
    	gl.uniform1i(texprg.samplerUniform, 0);
    	gl.uniform1i(texprg.useTextureUniform, 1);
    	gl.uniform1i(texprg.useArrowUniform, 0);

		// set the default shader program
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
		//gl.blendEquation(gl.FUNC_ADD);
		//gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
		//gl.blendFuncSeparate(gl.SRC_ALPHA, 
		//	gl.ONE_MINUS_SRC_ALPHA, gl.SRC_ALPHA, gl.DST_ALPHA);
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

	// 視線追跡、交点調査
	// x=lt+x1
	// y=mt+y1
	// z=nt+z1
	// (x-x0)^2+(y-y0)^2+(z-z0)^2=R^2
	
	// x^2+y^2+z^2-2(x0x+y0y+z0z)+x0^2+y0^2+z0^2-R^2=0
	// (l^2+m^2+n^2)t^2+2{l(x1-x0)+m(y1-y0)+n(z1-z0)}t
	// +x1^2+y1^2+z1^2+x0^2+y0^2+z0^2-R^2-2(x1x0+y1y0+z1z0)=0
	// a=l^2+m^2+n^2
	// b=l(x1-x0)+m(y1-y0)+n(z1-z0)
	// c=x1^2+y1^2+z1^2+x0^2+y0^2+z0^2-R^2-2(x1x0+y1y0+z1z0)
	
	// at^2+2bt+c=0
	// t=(-b+-sqrt(b^2-ac))/a
	// b^2-ac>0 or b^2-ac<=0
	// var objid = intersect(g_eye.pos, g_eye.v);
	//function intersect(tmin, s, P, D) { 
	function multiplyVec3(a,b,c){
		var d=b[0],e=b[1];b=b[2];
		c[0]=a[0]*d+a[4]*e+a[8]*b+a[12];
		c[1]=a[1]*d+a[5]*e+a[9]*b+a[13];
		c[2]=a[2]*d+a[6]*e+a[10]*b+a[14];
	}
	function intersect(objid, result) { 
		var tol = 1.0e-7;
		var obj_size = g.scale / 30.0;
		var rr = obj_size*obj_size * 0.1;
		//define vecDot(A, B) ((A.x)*(B.x)+(A.y)*(B.y)+(A.z)*(B.z))
		//function vecComb(A, a, B, C) {
		//	(A.x)=((C.x)+(a)*(B.x)); //	(A.y)=((C.y)+(a)*(B.y)); //	(A.z)=((C.z)+(a)*(B.z));
		//}
		pos = [0, 0, 0];
		multiplyVec3(mMatrix, [0, 0, 0], pos); 
		//vecComb(V,-1.0,(P),pos); 
		// 視点
	    var V = [0, 0, 0];
		V[0] = pos[0]-g.eye.x;
		V[1] = pos[1]-g.eye.y;
		V[2] = pos[2]-g.eye.z;
		// 視線ベクトル
		var D = [0, 0, -1.0];
		// 透視投影の場合は視点と視線ベクトルを変える必要がある(未実装)
		//b=vecDot((D),V); 
		var b = D[0]*V[0]+D[1]*V[1]+D[2]*V[2];
		//root = b*b-vecDot(V,V)+rr; 
		var root = b*b-(V[0]*V[0]+V[1]*V[1]+V[2]*V[2])+rr;
		root = (root > 0) ? Math.sqrt(root) : 1.0e31;
		root = (b-root > tol) ? b - root : b + root;
		if ( root>=tol && root<result.tmin){ 
			result.touch_flag=objid; 
			result.tmin=root; 
		}
		return result;
	}

	function updateGatewayFlows() {
		g.drawinfo_gwflows = [];
		$.each(g.gwflowstat, function(i,k) {
			if (i.match(/^(\S+)\:(\S+)$/)) {
				var eobj = RegExp.$1;
				var sobj = RegExp.$2;
				var startpos = undefined;
				startpos = g.sdn_objs["objList"][3]["pos"];
				//$("#debug").append("spos: "+startpos[0]+", "+startpos[1]+", "+startpos[2]);
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
				//$("#debug").append("epos: "+endpos[0]+", "+endpos[1]+", "+endpos[2]);
				if (endpos == undefined) return true;
				if (k[0] > 0) pushGatewayFlow(startpos, endpos, "red",  k[0]);
				if (k[2] > 0) pushGatewayFlow(startpos, endpos, "green",k[2]);
				if (k[4] > 0) pushGatewayFlow(startpos, endpos, "blue", k[4]);
				//$("#debug").append("length: "+g.drawinfo_gwflows.length+"<br>");
			}
		});
	}

	function pushGatewayFlow(startpos, endpos, f_color, packet_num) {
		g.drawinfo_gwflows.push({
			start: startpos,
			end: endpos,
			color: f_color,
			size: (packet_num > 5) ? 0.8 : 0.4,
//			dirs: getArrowDirections(startpos, endpos)
			value: packet_num
		});
		getRotationArray(g.drawinfo_gwflows.length-1,
			startpos.join(','), endpos.join(','), 'gw'
		);
		g.drawinfo_gwflows.push({
			start: endpos,
			end: startpos,
			color: f_color,
			size: (packet_num > 5) ? 0.8 : 0.4,
//			dirs: getArrowDirections(endpos, startpos)
			value: packet_num
		});
		getRotationArray(g.drawinfo_gwflows.length-1,
			endpos.join(','), startpos.join(','), 'gw'
		);
	}
	
	function putSpheres(start, end, color, size) {
		var arrow_movelen = {x: 0.0, y: 0.0, z: 0.0};
		for (var i=0; i<2; i++) {
		g.arrow_default_pos[i]+=g.arrow_delta/8.0;
		arrow_movelen.x = (g.arrow_default_pos[i] % 100) / 100 * (end[0]-start[0]);
		arrow_movelen.y = (g.arrow_default_pos[i] % 100) / 100 * (end[1]-start[1]);
		arrow_movelen.z = (g.arrow_default_pos[i] % 100) / 100 * (end[2]-start[2]);

		mvPushMatrix();
		if (color == 'green') {
		m.translate(mMatrix, [0.0, 0.0, 0.4], mMatrix);
		} else if (color == 'blue') {
		m.translate(mMatrix, [0.0, 0.0, -0.4], mMatrix);
		}
    	m.translate(mMatrix, [start[0]+arrow_movelen.x, start[1]+arrow_movelen.y, 
			start[2]+arrow_movelen.z], mMatrix);
		m.scale(mMatrix, [0.20*size, 0.20*size, 0.20*size], mMatrix);
		setMatrixUniforms();
		glNetViz.putSphere(
			prg.spheres[color]["v"], prg.spheres[color]["n"], 
			prg.spheres[color]["c"], prg.spheres[color]["i"], attLocation, [ 3, 3, 4 ]
		);
		mvPopMatrix();
		} // for
	}

	function putArrows(start, end, color, dirs, size, value) {
		if (dirs == undefined || dirs.length == 0) return; // 必須
	
		var arrow_movelen = {x: 0.0, y: 0.0, z: 0.0};
		for (var i=0; i<2; i++) {
			g.arrow_default_pos[i]+=g.arrow_delta/8.0;
			arrow_movelen.x = (g.arrow_default_pos[i] % 100) / 100 * (end[0]-start[0]);
			arrow_movelen.y = (g.arrow_default_pos[i] % 100) / 100 * (end[1]-start[1]);
			arrow_movelen.z = (g.arrow_default_pos[i] % 100) / 100 * (end[2]-start[2]);
	
			mvPushMatrix();
			if (color == 'green') {
			m.translate(mMatrix, [0.3, 0.3, 0.3], mMatrix);
			} else if (color == 'blue') {
			m.translate(mMatrix, [-0.3, -0.3, -0.3], mMatrix);
			}
	    	m.translate(mMatrix, [end[0]-arrow_movelen.x, end[1]-arrow_movelen.y, 
				end[2]-arrow_movelen.z], mMatrix);
			for (var i = 0; i < dirs.length; i++) {
			   	m.rotate(mMatrix, glNetViz.degToRad(dirs[i][0]), [dirs[i][1], 
					dirs[i][2], dirs[i][3]], mMatrix);
			}

			// 流量出力
			gl.useProgram(texprg);
			mvPushMatrix();
			m.translate(mMatrix, [Math.abs(end[0]-start[0])*-0.12, 0.0, 0.0], mMatrix);
//	    	m.rotate(mMatrix, glNetViz.degToRad(-90.0), [0, 1, 0], mMatrix);
			if (g.drawFlowLabelsFlag)
				putStr($.sprintf("%d", value), 0.15, [ 0.0, 0.35, 0.0 ], 0.52, color);
			mvPopMatrix();
			gl.useProgram(prg);

	    	m.rotate(mMatrix, glNetViz.degToRad(90.0), [0, 0, 1], mMatrix);
			m.scale(mMatrix, [0.01*size, 0.01*size, 0.01*size], mMatrix);
			m.translate(mMatrix, [0.0, 1.75/2.0, 0.0], mMatrix);
			drawArrow(
				arrows[color]["v"], arrows[color]["n"], arrows[color]["c"], 
				attLocation, [ 3, 3, 4 ]
			);
			mvPopMatrix();
		} // for
	
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
						start: startpos,
						end: endpos,
						color: "red",
						size: (flowinfo[0] > 10) ? 0.8 : 0.4,
						//dirs: getArrowDirections(startpos, endpos),
						value: flowinfo[0]
					});
					getRotationArray(g.drawinfo_flows.length-1,
						startpos.join(','), endpos.join(','), 'nogw'
					);
				}
				if (flowinfo[2] > 0) {
					g.drawinfo_flows.push({
						start: startpos,
						end: endpos,
						color: "blue",
						size: (flowinfo[2] > 10) ? 0.8 : 0.4,
						//dirs: getArrowDirections(startpos, endpos),
						value: flowinfo[2]
					});
					getRotationArray(g.drawinfo_flows.length-1,
						startpos.join(','), endpos.join(','), 'nogw'
					);
				}
				if (flowinfo[4] > 0) {
					g.drawinfo_flows.push({
						start: startpos,
						end: endpos,
						color: "green",
						size: (flowinfo[4] > 10) ? 0.8 : 0.4,
						//dirs: getArrowDirections(startpos, endpos),
						value: flowinfo[4]
					});
					getRotationArray(g.drawinfo_flows.length-1,
						startpos.join(','), endpos.join(','), 'nogw'
					);
				}
			} // for k
		} // for j
	}

};
// __END__

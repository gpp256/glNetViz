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
		// Draw Objects
		putCones(g.intersect_pos, "yellow");
		drawObjects();
		gl.flush();
		// Update framerate
		updateFramerates();
		if (g.framerate_counter++%g.display_framerate_interval == 0) displayFramerate();
		/// update xRot/yRot
		handleKeys(); animate()
		// ループのために再帰呼び出し
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
					//if (g.drawObjLabelsFlag) 
					//	putStr(val['name'], 0.15, [0.0, 0.48, 0.0], 0.32, "green");
					m.scale(mMatrix, [1.0, 1.1, 1.0], mMatrix);
	    			//m.rotate(mMatrix, glNetViz.degToRad(g.switch_rotate_param*10), 
					//	[0, 1, 0], mMatrix);
					drawCube(1, 0.0);
				// Controller
				} else if (val['texture']==0) {
	    		    m.translate(mMatrix, val['pos'], mMatrix);
					//if (g.drawObjLabelsFlag) 
					//	putStr(val['name'], 0.15, [0.0, 0.52, 0.0], 0.32, "green");
					m.scale(mMatrix, [1.2, 1.6, 1.2], mMatrix);
	    			//m.rotate(mMatrix, 
					//	glNetViz.degToRad(g.controller_rotate_param*10), [0, 1, 0], mMatrix);
					drawCube(0, 0.0);
				// Host
				} else if (val['texture']==2) {
	    		    m.translate(mMatrix, val['origin'], mMatrix);
	    		    m.translate(mMatrix, val['pos'], mMatrix);
					//if (g.drawObjLabelsFlag) 
					//	putStr(val['name'], 0.15, [0.0, 0.72, 0.0], 0.32, "green");
					m.scale(mMatrix, [0.6, 0.6, 0.6], mMatrix);
	    			//m.rotate(mMatrix, glNetViz.degToRad(g.host_rotate_param*10), 
					//	[0, 1, 0], mMatrix);
					drawCube(2, 90.0);
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
			//mat4.rotate(mvMatrix, degToRad(g.switch_rotate_param*10), [0, 1, 0]);
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

		gl.useProgram(prg);
	}

	// draw cube
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
		length1 *= 0.31;
		
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

		// set the default shader program
		gl.useProgram(prg);
		var lightDirection = [-0.5, 0.5, 0.5]; 
		var eyeDirection = [0.0, 0.0, 25.0]; 
		var ambientColor = [0.2, 0.2, 0.2, 1.0]; 
		gl.uniform3fv(uniLocation[2], lightDirection);
		gl.uniform3fv(uniLocation[3], eyeDirection);
		gl.uniform4fv(uniLocation[4], ambientColor);

	}

	function putStr(outchar, size, pos, c_spacing, color) {
		gl.enable(gl.BLEND);
		gl.disable(gl.DEPTH_TEST);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
	
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

	// initialize a canvas
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

};
// __END__

/*!
 * primitive_common.js
 *
 * Copyright (c) 2013 Yoshi 
 * This software is distributed under the MIT License.(../../MIT-LICENSE.txt)
 */

/* merge functions into glNetViz namespace. */
$.extend(glNetViz, {

	// Version
	version: 0.91,
	// Texture List
	textureList: new Array(),
	// ModelView Matrix Stack
	_mvMatrixStack: [],
	// matIV Object
	_m: new matIV(),
	// ModelView Matrix
	mMatrix: undefined,
	// View Projection Matrix
	vpMatrix: undefined,

	// set Matirx Uniforms
	setMatrixUniforms: function (s_prg, type) {
		if (this.vpMatrix == undefined || this.mMatrix == undefined) return;
		switch (type) {
			case 'use_texture': // texture objects
				gl.uniformMatrix4fv(s_prg.pMatrixUniform, false, this.vpMatrix);
				gl.uniformMatrix4fv(s_prg.mvMatrixUniform, false, this.mMatrix);
				var normalMatrix = new Float32Array(9);
				gl.uniformMatrix3fv(s_prg.nMatrixUniform, false, normalMatrix);
				break;
			default : // color objects
				var mvp = this._m.identity(this._m.create()); 
				var minv = this._m.identity(this._m.create());
				this._m.multiply(this.vpMatrix, this.mMatrix, mvp);
				this._m.inverse(this.mMatrix, minv);
				gl.uniformMatrix4fv(s_prg.uniLocation[0], false, mvp);
				gl.uniformMatrix4fv(s_prg.uniLocation[1], false, minv);
		}
	},

	// push model view matrix
	mvPushMatrix: function () {
	    var copy = this._m.create();
	    this._m.set(this.mMatrix, copy);
	    this._mvMatrixStack.push(copy);
	},

	// pop model view matrix
	mvPopMatrix: function () {
	    if (this._mvMatrixStack.length == 0) throw "Invalid popMatrix!";
	    this.mMatrix = this._mvMatrixStack.pop();
	},

	// initialize textures
	initTextures: function (path) {
		this.createTexture(this.textureList, path+'/pfc_texture01.png', 0, 256, 128);
		this.createTexture(this.textureList, path+'/sw_texture01.png', 1, 256, 128);
		this.createTexture(this.textureList, path+'/pc_texture01.png', 2, 256, 128);
		this.createTexture(this.textureList, path+'/fw_texture01.png', 3, 256, 128);
		this.createTexture(this.textureList, path+'/earthmap.png', 4, 256, 128);
		this.createTexture(this.textureList, path+'/font_red.png', 5, 256, 256);
		this.createTexture(this.textureList, path+'/font_green.png', 6, 256, 256);
		this.createTexture(this.textureList, path+'/font_blue.png', 7, 256, 256);
	},

	// add a texture 
	addTexture: function (imgpath, width, height) {
		if (this.textureList.length >= gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS) 
			throw "Error: failed to add a specified texture.";
		// e.g. gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS = 35661
		this.createTexture(this.textureList, 
			imgpath, this.textureList.length, width, height);
	},

	// VBOを生成する関数
	createVbo: function (data){
		// バッファオブジェクトの生成
		var vbo = gl.createBuffer();
		// バッファをバインドする
		gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
		// バッファにデータをセット
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
		// バッファのバインドを無効化
		gl.bindBuffer(gl.ARRAY_BUFFER, null);
		// 生成した VBO を返して終了
		return vbo;
	},

	// IBOを生成する関数
	createIbo: function (data){
		// バッファオブジェクトの生成
		var ibo = gl.createBuffer();
		// バッファをバインドする
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
		// バッファにデータをセット
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(data), gl.STATIC_DRAW);
		// バッファのバインドを無効化
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
		// 生成したIBOを返して終了
		return ibo;
	},

	// draw text characters
	putStr: function (s_prg, outchar, size, pos, c_spacing, color) {
		gl.enable(gl.BLEND);
		gl.disable(gl.DEPTH_TEST);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
		gl.blendFuncSeparate(
		  gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA,
		  gl.ZERO, gl.ONE_MINUS_SRC_ALPHA);
	
		this.mvPushMatrix();
    	this._m.translate(this.mMatrix, pos, this.mMatrix);
		this._m.scale(this.mMatrix, [size*c_spacing, size*0.9, size], this.mMatrix);
		var dx = 1.4;
		var start_pos = (outchar.length/2.0-0.5)*-dx;
		for (var i=0; i<outchar.length; i++) {
			this.mvPushMatrix();
    		this._m.translate(this.mMatrix, [start_pos+i*dx, 0.0, 0.0], this.mMatrix);
			this.setMatrixUniforms(s_prg, 'use_texture');
			this.putChar(s_prg, outchar[i], color);
			this.mvPopMatrix();
		}
		this.mvPopMatrix();

		gl.disable(gl.BLEND);
		gl.enable(gl.DEPTH_TEST);
	},

	// Create TruncatedCone
	createTruncatedCone: function  (
	    bottomRadius,
	    topRadius,
	    height,
	    radialSubdivisions,
	    verticalSubdivisions,
	    opt_topCap,
	    opt_bottomCap, 
		translate_y) 
	{
	  var topCap = (opt_topCap === undefined) ? true : opt_topCap;
	  var bottomCap = (opt_bottomCap === undefined) ? true : opt_bottomCap;
	  var extra = (topCap ? 2 : 0) + (bottomCap ? 2 : 0);
	  var ty = translate_y ? translate_y : 0.0;
	  var numVertices = [];
	  var positions = [];
	  var normals = [];
	  var texCoords = [];
	  var indices = [];
	  var vertsAroundEdge = radialSubdivisions + 1;
	
	  // The slant of the cone is constant across its surface
	  var slant = Math.atan2(bottomRadius - topRadius, height);
	  var cosSlant = Math.cos(slant);
	  var sinSlant = Math.sin(slant);
	
	  var start = topCap ? -2 : 0;
	  var end = verticalSubdivisions + (bottomCap ? 2 : 0);
	
	  for (var yy = start; yy <= end; ++yy) {
	    var v = yy / verticalSubdivisions
	    var y = height * v;
	    var ringRadius;
	    if (yy < 0) {
	      y = 0;
	      v = 1;
	      ringRadius = bottomRadius;
	    } else if (yy > verticalSubdivisions) {
	      y = height;
	      v = 1;
	      ringRadius = topRadius;
	    } else {
	      ringRadius = bottomRadius +
	        (topRadius - bottomRadius) * (yy / verticalSubdivisions);
	    }
	    if (yy == -2 || yy == verticalSubdivisions + 2) {
	      ringRadius = 0;
	      v = 0;
	    }
	    y -= height / 2;
	    for (var ii = 0; ii < vertsAroundEdge; ++ii) {
	      var sin = Math.sin(ii * Math.PI * 2 / radialSubdivisions);
	      var cos = Math.cos(ii * Math.PI * 2 / radialSubdivisions);
	      positions = positions.concat([sin * ringRadius, y+ty, cos * ringRadius]);
	      normals = normals.concat([
	          (yy < 0 || yy > verticalSubdivisions) ? 0 : (sin * cosSlant),
	          (yy < 0) ? -1 : (yy > verticalSubdivisions ? 1 : sinSlant),
	          (yy < 0 || yy > verticalSubdivisions) ? 0 : (cos * cosSlant)]);
	      texCoords = texCoords.concat([(ii / radialSubdivisions), 1 - v]);
	    }
	  }
	
	  for (var yy = 0; yy < verticalSubdivisions + extra; ++yy) {
	    for (var ii = 0; ii < radialSubdivisions; ++ii) {
	      indices = indices.concat([vertsAroundEdge * (yy + 0) + 0 + ii,
	                   vertsAroundEdge * (yy + 0) + 1 + ii,
	                   vertsAroundEdge * (yy + 1) + 1 + ii],
	      			   [vertsAroundEdge * (yy + 0) + 0 + ii,
	                   vertsAroundEdge * (yy + 1) + 1 + ii,
	                   vertsAroundEdge * (yy + 1) + 0 + ii]);
	    }
	  }
	
	  return {
	    vp : positions,
	    vn : normals,
	    tc : texCoords,
	    vi : indices};
	}, 

	// Create Cylinder
	createCylinder : function  (
	    radius,
	    height,
	    radialSubdivisions,
	    verticalSubdivisions,
	    opt_topCap,
	    opt_bottomCap) 
	{
	  return this.createTruncatedCone(
	      radius,
	      radius,
	      height,
	      radialSubdivisions,
	      verticalSubdivisions,
	      opt_topCap,
	      opt_bottomCap);
	},

	// Create Arrow
	createArrow: function (color, pos_vbo, nor_vbo, col_vbo, ibo) {
		var objinfo = this.createCylinder(10.0, 40.0, 14, 8);
		pos_vbo['cylinder'] = this.createVbo(objinfo["vp"]);
		nor_vbo['cylinder'] = this.createVbo(objinfo["vn"]);
		g.polygon_num += objinfo["vi"].length;
		var color_array = [];
		for (var i = 0; i < objinfo["vi"].length; i++) 
			 color_array = color_array.concat([color.r, color.g, color.b, color.a]);
		col_vbo['cylinder'] = this.createVbo(color_array);
		ibo['cylinder'] = this.createIbo(objinfo["vi"]);
		ibo['cylinder'].numItems = objinfo["vi"].length;
		ibo['cylinder'].drawMethod = gl.TRIANGLES;
		
		objinfo = this.createTruncatedCone(18.0, 0.0, 35.0, 14, 8, true, true, 0.0);
		pos_vbo['cone'] = this.createVbo(objinfo["vp"]);
		nor_vbo['cone'] = this.createVbo(objinfo["vn"]);
		g.polygon_num += objinfo["vi"].length;
		color_array = [];
		for (var i = 0; i < objinfo["vi"].length; i++) 
			 color_array = color_array.concat([color.r, color.g, color.b, color.a]);
		col_vbo['cone'] = this.createVbo(color_array);
		ibo['cone'] = this.createIbo(objinfo["vi"]);
		ibo['cone'].numItems = objinfo["vi"].length;
		ibo['cone'].drawMethod = gl.TRIANGLES;
	},

	// convert degrees to radians
	degToRad: function (degrees) { return degrees * Math.PI / 180; },

	// convert a IPv4 address to an integer.
	ipv4ToInt: function (ipstr) {
		var num = 0;
		if (!ipstr.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/)) return num;
		num =  parseInt(RegExp.$1) << 24;
		num += parseInt(RegExp.$2) << 16;
		num += parseInt(RegExp.$3) << 8;
		num += parseInt(RegExp.$4);
		return num;
	},

	// Change color of arrow objects 
	changeArrowColor: function (color, col_vbo, ibo) {
		var keys = ['cylinder', 'cone'];
		for (var k in keys) {
			var color_array = [];
			for (var i = 0; i < ibo[keys[k]].numItems; i++) 
				color_array = color_array.concat([color.r, color.g, color.b, color.a]);
			col_vbo[keys[k]] = this.createVbo(color_array);
		}
	},

	// VBOをバインドし登録する関数
	setAttribute: function (vbo, attL, attS){
		// 引数として受け取った配列を処理する
		for(var i in vbo){
			// バッファをバインドする
			gl.bindBuffer(gl.ARRAY_BUFFER, vbo[i]);
			// attributeLocationを有効にする
			gl.enableVertexAttribArray(attL[i]);
			// attributeLocationを通知し登録する
			gl.vertexAttribPointer(attL[i], attS[i], gl.FLOAT, false, 0, 0);
		}
	},

	// Init sphere
	initSphere: function (_iDiv) {
	    var vpSphere = [];
	    var tcSphere = [];
	    var viSphere = [];
	    var vnSphere = [];
	
	    var x,y,z,u,v;
	    var theta,phi;
	    var sinTheta,sinPhi
	    var cosTheta,cosPhi;
	
	    var latNumber, longNumber;
	
	    for (latNumber = 0; latNumber <= _iDiv; ++latNumber) {
	      for (longNumber = 0; longNumber <= _iDiv; ++longNumber) {
	        theta = latNumber * Math.PI / _iDiv;
	        phi = longNumber * 2 * Math.PI / _iDiv;
	        sinTheta = Math.sin(theta);
	        sinPhi = Math.sin(phi);
	        cosTheta = Math.cos(theta);
	        cosPhi = Math.cos(phi);
	
	        x = cosPhi * sinTheta;
	        y = cosTheta;
	        z = sinPhi * sinTheta;
	        u = 1-(longNumber/_iDiv);
	        v = latNumber/_iDiv;
	
	        vpSphere.push(x); vpSphere.push(y); vpSphere.push(z);
	        tcSphere.push(u); tcSphere.push(v);
	        vnSphere.push(x); vnSphere.push(y); vnSphere.push(z);
	      }
	    }
	
	    var first, second;
	    for (latNumber = 0; latNumber < _iDiv; ++latNumber) {
	      for (longNumber = 0; longNumber < _iDiv; ++longNumber) {
	        first = (latNumber * (_iDiv+1)) + longNumber;
	        second = first + _iDiv + 1;
	        viSphere.push(first);
	        viSphere.push(first+1);
	        viSphere.push(second);
	
	        viSphere.push(second);
	        viSphere.push(first+1);
	        viSphere.push(second+1);
	      }
	    }
		return {
			vp : vpSphere,
			tc : tcSphere,
			vn : vnSphere,
			vi : viSphere
		};
	}, 

	// change objects color
	changeObjectsColor: function (vbolist, color, keys) {
		for (var k in keys) {
			var color_array = [];
			for (var i = 0; i < vbolist["i"][keys[k]].numItems; i++) 
				color_array = color_array.concat([color.r, color.g, color.b, color.a]);
			vbolist["c"][keys[k]] = this.createVbo(color_array);
		}
	}, 

	// generate a sphere object
	generateSphereObject: function (color, vnum) {
		var pos_vbo = {}; var nor_vbo = {}; var col_vbo = {}; var ibo = {}; var tex_vbo = {};
		var objinfo = this.initSphere(vnum);
		pos_vbo['sphere'] = this.createVbo(objinfo["vp"]);
		nor_vbo['sphere'] = this.createVbo(objinfo["vn"]);
		tex_vbo['sphere'] = this.createVbo(objinfo["tc"]);
		var color_array = [];
		for (var i = 0; i < objinfo["vi"].length; i++) 
			 color_array = color_array.concat([color.r, color.g, color.b, color.a]);
		col_vbo['sphere'] = this.createVbo(color_array);
		ibo['sphere'] = this.createIbo(objinfo["vi"]);
		ibo['sphere'].numItems = objinfo["vi"].length;
		ibo['sphere'].drawMethod = gl.TRIANGLES;
		g.polygon_num += objinfo["vi"].length;
		return { p : pos_vbo, n : nor_vbo, c : col_vbo, t : tex_vbo, i : ibo };
	}, 

	// generate sphere objects
	generateSphereObjects: function (program) {
		program.spheres = {};
		var vbolist = this.generateSphereObject({r: 1.0, g: 0.0, b: 0.0, a: 1.0}, 12);
		program.spheres["red"] = {v: vbolist.p, n: vbolist.n, t: vbolist.t, 
			c: $.extend({}, vbolist.c), i: vbolist.i};
		this.changeObjectsColor(vbolist, {r: 0.0, g: 1.0, b: 0.0, a: 1.0}, ['sphere']);
		program.spheres["green"] = {v: vbolist.p, n: vbolist.n, 
			c: $.extend({}, vbolist.c), i: vbolist.i};
		this.changeObjectsColor(vbolist, {r: 0.0, g: 0.0, b: 1.0, a: 1.0}, ['sphere']);
		program.spheres["blue"] = {v: vbolist.p, n: vbolist.n, 
			c: $.extend({}, vbolist.c), i: vbolist.i};
	},

	generateSpheres: function (prg, clist) {
		var div = (arguments[2] != undefined ) ? arguments[2] : 12;
		var c = clist.shift();
		var vbolist = this.generateSphereObject({r: c.r, g: c.g, b: c.b, a: c.a}, div);
		prg.spheres = {};
		prg.spheres[c.id] = {v: vbolist.p, n: vbolist.n, t: vbolist.t, c: $.extend({}, vbolist.c), i: vbolist.i};
		if (clist.length < 1) return;
		for (var i=0; i< clist.length; i++) {
		this.changeObjectsColor(vbolist, 
			{r: clist[i].r, g: clist[i].g, b: clist[i].b, a: clist[i].a}, ['sphere']);
		prg.spheres[clist[i].id] = {v: vbolist.p, n: vbolist.n, c: $.extend({}, vbolist.c), i: vbolist.i};
		}
	},

	// draw sphere objects
	putSphere: function (pos_vbo, nor_vbo, col_vbo, ibo, attLocation, attStride) {
		var objs = ['sphere'];
		for (var i = 0; i<objs.length; i++) {
			this.setAttribute([pos_vbo[objs[i]], nor_vbo[objs[i]], col_vbo[objs[i]]], 
				attLocation, attStride);
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo[objs[i]]);
			gl.drawElements(ibo[objs[i]].drawMethod, ibo[objs[i]].numItems, gl.UNSIGNED_SHORT, 0);
		}
	}, 

	putCylinder: function (pos_vbo, nor_vbo, col_vbo, ibo, attLocation, attStride) {
		var objs = ['cylinder'];
		for (var i = 0; i<objs.length; i++) {
			this.setAttribute([pos_vbo[objs[i]], nor_vbo[objs[i]], col_vbo[objs[i]]], 
				attLocation, attStride);
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo[objs[i]]);
			gl.drawElements(ibo[objs[i]].drawMethod, ibo[objs[i]].numItems, gl.UNSIGNED_SHORT, 0);
		}
	},

	cubeVertexData: function () {
	    return [// Vertices
	      // Front face
	      -1.0, -1.0,  1.0,
	       1.0, -1.0,  1.0,
	       1.0,  1.0,  1.0,
	      -1.0,  1.0,  1.0,
	
	      // Back face
	      -1.0, -1.0, -1.0,
	      -1.0,  1.0, -1.0,
	       1.0,  1.0, -1.0,
	       1.0, -1.0, -1.0,
	
	      // Top face
	      -1.0,  1.0, -1.0,
	      -1.0,  1.0,  1.0,
	       1.0,  1.0,  1.0,
	       1.0,  1.0, -1.0,
	
	      // Bottom face
	      -1.0, -1.0, -1.0,
	       1.0, -1.0, -1.0,
	       1.0, -1.0,  1.0,
	      -1.0, -1.0,  1.0,
	
	      // Right face
	       1.0, -1.0, -1.0,
	       1.0,  1.0, -1.0,
	       1.0,  1.0,  1.0,
	       1.0, -1.0,  1.0,
	
	      // Left face
	      -1.0, -1.0, -1.0,
	      -1.0, -1.0,  1.0,
	      -1.0,  1.0,  1.0,
	      -1.0,  1.0, -1.0,
	    ];
	}, 

	cubeTexCoordData: function () {
		var dx = 0.0833333;
	    return [
	      // Front face
	      0.0*dx, 0.0,
	      0.0*dx, 1.0,
	      1.0*dx, 1.0,
	      1.0*dx, 0.0,
	
	      // Back face
	      1.0*dx, 0.0,
	      2.0*dx, 0.0,
	      2.0*dx, 1.0,
	      1.0*dx, 1.0,
	
	      // Top face
	      8.0*dx, 1.0,
	      8.0*dx, 0.0,
	      4.0*dx, 0.0,
	      4.0*dx, 1.0,
	
	      // Bottom face
	      1.0,    1.0,
	      8.0*dx, 1.0,
	      8.0*dx, 0.0,
	      1.0,    0.0,
	
	      // Right face
	      2.0*dx, 1.0,
	      3.0*dx, 1.0,
	      3.0*dx, 0.0,
	      2.0*dx, 0.0,
	
	      // Left face
	      3.0*dx, 1.0,
	      3.0*dx, 0.0,
	      4.0*dx, 0.0,
	      4.0*dx, 1.0
		/*
	      // Front face
	      0.0, 0.0,
	      1.0, 0.0,
	      1.0, 1.0,
	      0.0, 1.0,
	
	      // Back face
	      1.0, 0.0,
	      1.0, 1.0,
	      0.0, 1.0,
	      0.0, 0.0,
	
	      // Top face
	      0.0, 1.0,
	      0.0, 0.0,
	      1.0, 0.0,
	      1.0, 1.0,
	
	      // Bottom face
	      1.0, 1.0,
	      0.0, 1.0,
	      0.0, 0.0,
	      1.0, 0.0,
	
	      // Right face
	      1.0, 0.0,
	      1.0, 1.0,
	      0.0, 1.0,
	      0.0, 0.0,
	
	      // Left face
	      0.0, 0.0,
	      1.0, 0.0,
	      1.0, 1.0,
	      0.0, 1.0,
		*/
	    ];
	}, 

	cubeNormalData: function () {
	    return [
	      // Front
	      0.0, 0.0, 1.0,
	      0.0, 0.0, 1.0,
	      0.0, 0.0, 1.0,
	      0.0, 0.0, 1.0,
	      // Back
	      0.0, 0.0, -1.0,
	      0.0, 0.0, -1.0,
	      0.0, 0.0, -1.0,
	      0.0, 0.0, -1.0,
	      // Top
	      0.0, 1.0, 0.0,
	      0.0, 1.0, 0.0,
	      0.0, 1.0, 0.0,
	      0.0, 1.0, 0.0,
	      // Bottom
	      0.0, -1.0, 0.0,
	      0.0, -1.0, 0.0,
	      0.0, -1.0, 0.0,
	      0.0, -1.0, 0.0,
	      // Right
	      1.0, 0.0, 0.0,
	      1.0, 0.0, 0.0,
	      1.0, 0.0, 0.0,
	      1.0, 0.0, 0.0,
	      // Left
	      -1.0, 0.0, 0.0,
	      -1.0, 0.0, 0.0,
	      -1.0, 0.0, 0.0,
	      -1.0, 0.0, 0.0
	    ];
	}, 

	cubeIndexData: function  () {
	    return [ // VertexIndices
	       0,  1,  2,    0,  2,  3, // Front face
	       4,  5,  6,    4,  6,  7, // Back face
	       8,  9, 10,    8, 10, 11, // Top face
	      12, 13, 14,   12, 14, 15, // Bottom face
	      16, 17, 18,   16, 18, 19, // Right face
	      20, 21, 22,   20, 22, 23  // Left face
	    ];
	}, 

	initCube: function () {
		return {
			vp : this.cubeVertexData(),
			tc : this.cubeTexCoordData(),
			vn : this.cubeNormalData(),
			vi : this.cubeIndexData()
		};
	},

	// generate a cube object
	generateCubeObject: function (color) {
		var pos_vbo = {}; var nor_vbo = {}; var tex_vbo = {};
		var col_vbo = {}; var ibo = {};
		var objinfo = this.initCube();
		pos_vbo['cube'] = this.createVbo(objinfo["vp"]);
		nor_vbo['cube'] = this.createVbo(objinfo["vn"]);
		tex_vbo['cube'] = this.createVbo(objinfo["tc"]);
		var color_array = [];
		for (var i = 0; i < objinfo["vi"].length; i++) 
			 color_array = color_array.concat([color.r, color.g, color.b, color.a]);
		col_vbo['cube'] = this.createVbo(color_array);
		ibo['cube'] = this.createIbo(objinfo["vi"]);
		ibo['cube'].numItems = objinfo["vi"].length;
		ibo['cube'].drawMethod = gl.TRIANGLES;
		g.polygon_num += objinfo["vi"].length;
		return { p : pos_vbo, n : nor_vbo, c : col_vbo, t : tex_vbo, i : ibo };
	}, 

	// generate cube objects
	generateCubeObjects: function (program) {
		program.cubes = {};
		var vbolist = this.generateCubeObject({r: 1.0, g: 0.0, b: 0.0, a: 1.0});
		program.cubes["red"] = {v: vbolist.p, n: vbolist.n, t: vbolist.t, 
			c: $.extend({}, vbolist.c), i: vbolist.i};
		this.changeObjectsColor(vbolist, {r: 0.0, g: 1.0, b: 0.0, a: 1.0}, ['cube']);
		program.cubes["green"] = {v: vbolist.p, n: vbolist.n, 
			c: $.extend({}, vbolist.c), i: vbolist.i};
		this.changeObjectsColor(vbolist, {r: 0.0, g: 0.0, b: 1.0, a: 1.0}, ['cube']);
		program.cubes["blue"] = {v: vbolist.p, n: vbolist.n, 
			c: $.extend({}, vbolist.c), i: vbolist.i};
	},

	generateCubes: function (prg, clist) {
		var c = clist.shift();
		var vbolist = this.generateCubeObject({r: c.r, g: c.g, b: c.b, a: c.a});
		prg.cubes = {};
		prg.cubes[c.id] = {v: vbolist.p, n: vbolist.n, t: vbolist.t, c: $.extend({}, vbolist.c), i: vbolist.i};
		if (clist.length < 1) return;
		for (var i=0; i< clist.length; i++) {
		this.changeObjectsColor(vbolist, 
			{r: clist[i].r, g: clist[i].g, b: clist[i].b, a: clist[i].a}, ['cube']);
		prg.cubes[clist[i].id] = 
			{v: vbolist.p, n: vbolist.n, c: $.extend({}, vbolist.c), i: vbolist.i};
		}
	},

	// draw color cube objects
	putCube: function (pos_vbo, nor_vbo, col_vbo, ibo, attLocation, attStride) {
		var objs = ['cube'];
		for (var i = 0; i<objs.length; i++) {
			this.setAttribute([pos_vbo[objs[i]], nor_vbo[objs[i]], col_vbo[objs[i]]], 
				attLocation, attStride);
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo[objs[i]]);
			gl.drawElements(ibo[objs[i]].drawMethod, ibo[objs[i]].numItems, gl.UNSIGNED_SHORT, 0);
		}
	}, 

	rectangleVertexData: function (width) {
//		var width = 0.7;
		return [// Vertices
			// Front face
			-width, -1.0,  0.0,
			 width, -1.0,  0.0,
			 width,  1.0,  0.0,
			-width,  1.0,  0.0
		];
	}, 

	rectangleNormalData: function () {
		return [// Vertices
			// Front
			0.0, 0.0, 1.0,
			0.0, 0.0, 1.0,
			0.0, 0.0, 1.0,
			0.0, 0.0, 1.0
		];
	},

	rectangleTexCoordData: function (uvinfo) {
		var dx = 1.0;
		return [
			// Front face
			uvinfo.umin*dx, uvinfo.vmax,
			uvinfo.umax*dx, uvinfo.vmax,
			uvinfo.umax*dx, uvinfo.vmin,
			uvinfo.umin*dx, uvinfo.vmin,
		];
	},

	rectangleIndexData: function  () {
		return [ // VertexIndices
			0,  1,  2,    0,  2,  3 // Front face
		];
	},

	drawRectangle: function (p, outchar, rot, uvinfo, color) {
		var color_map = { "red" : 5, "green" : 6, "blue" : 7 };

		gl.uniform1i(p.useLightingUniform, 0);
		gl.uniform1i(p.samplerUniform, color_map[color]);

		if (p.rectangle.TextureCoordBuffer == undefined)
			p.rectangle.TextureCoordBuffer = {};
		if (p.rectangle.TextureCoordBuffer[outchar] == undefined) {
		p.rectangle.TextureCoordBuffer[outchar] = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, p.rectangle.TextureCoordBuffer[outchar]);
		var rectangle_texturecoords = this.rectangleTexCoordData(uvinfo);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(rectangle_texturecoords), gl.STATIC_DRAW);
		p.rectangle.TextureCoordBuffer[outchar].itemSize = 2;
		p.rectangle.TextureCoordBuffer[outchar].numItems = rectangle_texturecoords/2;
		}

		gl.bindBuffer(gl.ARRAY_BUFFER, p.rectangle.PositionBuffer);
		gl.vertexAttribPointer(p.vertexPositionAttribute, p.rectangle.PositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

		gl.bindBuffer(gl.ARRAY_BUFFER, p.rectangle.NormalBuffer);
		gl.vertexAttribPointer(p.vertexNormalAttribute, p.rectangle.NormalBuffer.itemSize, gl.FLOAT, false, 0, 0);

		gl.bindBuffer(gl.ARRAY_BUFFER, p.rectangle.TextureCoordBuffer[outchar]);
		gl.vertexAttribPointer(p.textureCoordAttribute, p.rectangle.TextureCoordBuffer[outchar].itemSize, gl.FLOAT, false, 0, 0);

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, p.rectangle.IndexBuffer);
		gl.drawElements(gl.TRIANGLES, p.rectangle.IndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);

		gl.uniform1i(p.useLightingUniform, 0);
	},

	generateRectangles: function (p) {
		p.rectangle = {};
		p.rectangle.PositionBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, p.rectangle.PositionBuffer);
		var rectangle_vertices = this.rectangleVertexData(0.7);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(rectangle_vertices), gl.STATIC_DRAW);
		p.rectangle.PositionBuffer.itemSize = 3;
		p.rectangle.PositionBuffer.numItems = rectangle_vertices/3;
		
		p.rectangle.NormalBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, p.rectangle.NormalBuffer);
		var rectangle_normals = this.rectangleNormalData();
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(rectangle_normals), gl.STATIC_DRAW);
		p.rectangle.NormalBuffer.itemSize = 3;
		p.rectangle.NormalBuffer.numItems = rectangle_normals/3;

		p.rectangle.IndexBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, p.rectangle.IndexBuffer);
		var rectangle_indeces = this.rectangleIndexData();
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(rectangle_indeces), gl.STATIC_DRAW);
		p.rectangle.IndexBuffer.itemSize = 1;
		p.rectangle.IndexBuffer.numItems = rectangle_indeces.length;
		g.polygon_num += 2;
	},

	initRectangle: function () {
		return {
			vp : this.rectangleVertexData(1.0),
//			tc : this.rectangleTexCoordData(),
			vn : this.rectangleNormalData(),
			vi : this.rectangleIndexData()
		};
	},

	generateRectangleFromCL: function (color) {
		var pos_vbo = {}; var nor_vbo = {}; var tex_vbo = {};
		var col_vbo = {}; var ibo = {};
		var objinfo = this.initRectangle();
		pos_vbo['rectangle'] = this.createVbo(objinfo["vp"]);
		nor_vbo['rectangle'] = this.createVbo(objinfo["vn"]);
		//tex_vbo['rectangle'] = this.createVbo(objinfo["tc"]);
		var color_array = [];
		for (var i = 0; i < objinfo["vi"].length; i++) 
			 color_array = color_array.concat(color);
		col_vbo['rectangle'] = this.createVbo(color_array);
		ibo['rectangle'] = this.createIbo(objinfo["vi"]);
		ibo['rectangle'].numItems = objinfo["vi"].length;
		ibo['rectangle'].drawMethod = gl.TRIANGLES;
		g.polygon_num += objinfo["vi"].length;
		return { p : pos_vbo, n : nor_vbo, c : col_vbo, t : tex_vbo, i : ibo };
	},

	// generate rectangles from the specified color list 
	generateRectanglesFromCL: function (p, clist) {
		p.rectangles = {};
		for (var k in clist) {
			var vbolist = this.generateRectangleFromCL(clist[k]);
			p.rectangles[k] = {v: vbolist.p, n: vbolist.n, c: $.extend({}, vbolist.c), i: vbolist.i};
		}
	},

	// generate arrows from the specified color list 
	generateArrows: function (p, clist) {
		// 配列かどうかのチェック
		p.arrows = {};
		var pos_vbo = {}; var nor_vbo = {}; var col_vbo = {}; var ibo = {};
		var c = clist.shift();
		this.createArrow(c, pos_vbo, nor_vbo, col_vbo, ibo);
		p.arrows[c.id] = {v: pos_vbo, n: nor_vbo, c: $.extend({}, col_vbo), i: ibo};
		if (clist.length < 1) return;
		for (var i = 0; i < clist.length; i++) {
			this.changeArrowColor(clist[i], col_vbo, ibo);
			p.arrows[clist[i].id] = {v: pos_vbo, n: nor_vbo, c: $.extend({}, col_vbo), i: ibo};
		}
	},

	// draw Arrow Objects
	putArrow: function (p, pos_vbo, nor_vbo, col_vbo, ibo, attLocation, attStride) {
		this._m.translate(this.mMatrix, [0.0, 35.0/2.0, 0.0], this.mMatrix);
		this.setMatrixUniforms(p, 'default');
		// VBO を登録する
		var objs = ['cylinder', 'cone'];
		for (var i = 0; i<objs.length; i++) {
			if (objs[i] == 'cone') {
				this._m.translate(this.mMatrix, [0.0, 35.0, 0.0], this.mMatrix);
				this.setMatrixUniforms(p, 'default');
			}
			this.setAttribute(
				[pos_vbo[objs[i]], nor_vbo[objs[i]], col_vbo[objs[i]]], attLocation, attStride);
			// IBOをバインドして登録する
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo[objs[i]]);
			// モデルの描画
			gl.drawElements(ibo[objs[i]].drawMethod, ibo[objs[i]].numItems, gl.UNSIGNED_SHORT, 0);
		}
	},

	_putSpheres: function (p, start, end, color, size, poslist, delta) {
		var arrow_movelen = {x: 0.0, y: 0.0, z: 0.0};
		for (var i=0; i<poslist.length; i++) {
			poslist[i]+=delta/8.0;
			arrow_movelen.x = (poslist[i] % 100) / 100 * (end[0]-start[0]);
			arrow_movelen.y = (poslist[i] % 100) / 100 * (end[1]-start[1]);
			arrow_movelen.z = (poslist[i] % 100) / 100 * (end[2]-start[2]);

			this.mvPushMatrix();
    		this._m.translate(this.mMatrix, [start[0]+arrow_movelen.x, start[1]+arrow_movelen.y, 
				start[2]+arrow_movelen.z], this.mMatrix);
			this._m.scale(this.mMatrix, [0.20*size, 0.20*size, 0.20*size], this.mMatrix);
			this.setMatrixUniforms(p, 'default');
			this.putSphere(
				p.spheres[color]["v"], p.spheres[color]["n"], 
				p.spheres[color]["c"], p.spheres[color]["i"], p.attLocation, [ 3, 3, 4 ]
			);
			this.mvPopMatrix();
		} // for
	},

	_putArrows: function (p, tp, start, end, color, dirs, size, value, poslist, delta, param) {
		if (dirs == undefined || dirs.length == 0) return; // 必須
	
		var arrow_movelen = {x: 0.0, y: 0.0, z: 0.0};
		for (var i=0; i<poslist.length; i++) {
			poslist[i]+=delta/8.0;
			arrow_movelen.x = (poslist[i] % 100) / 100 * (end[0]-start[0]);
			arrow_movelen.y = (poslist[i] % 100) / 100 * (end[1]-start[1]);
			arrow_movelen.z = (poslist[i] % 100) / 100 * (end[2]-start[2]);
	
			this.mvPushMatrix();
			if (param != undefined && param.translate != undefined) 
				this._m.translate(this.mMatrix, param.translate, this.mMatrix);

	    	this._m.translate(this.mMatrix, [start[0]+arrow_movelen.x, start[1]+arrow_movelen.y, 
				start[2]+arrow_movelen.z], this.mMatrix);
			for (var j = 0; j < dirs.length; j++) {
			   	this._m.rotate(this.mMatrix, this.degToRad(dirs[j][0]), [dirs[j][1], 
					dirs[j][2], dirs[j][3]], this.mMatrix);
			}

			if (value != undefined && tp != undefined) {
			gl.useProgram(tp);
			this.mvPushMatrix();
			this._m.translate(this.mMatrix, [Math.abs(end[0]-start[0])*-0.12, 0.0, 0.0], this.mMatrix);
			var fontsize = (param != undefined && param.labelinfo != undefined) ? 
				param.labelinfo.size : 0.05;
			var ypos = (param != undefined && param.labelinfo != undefined) ? 
				param.labelinfo.ypos : 0.10 ;
			this.putStr(tp, $.sprintf("%d", value), fontsize, [ 0.0, ypos, 0.0 ], 0.52, color);
			this.mvPopMatrix();
			gl.useProgram(p);
			}

	    	this._m.rotate(this.mMatrix, this.degToRad(90.0), [0, 0, 1], this.mMatrix);
			this._m.scale(this.mMatrix, [0.01*size, 0.01*size, 0.01*size], this.mMatrix);
			this._m.translate(this.mMatrix, [0.0, 1.75/2.0, 0.0], this.mMatrix);
			this.putArrow(p, 
				p.arrows[color]["v"], p.arrows[color]["n"], 
				p.arrows[color]["c"], p.arrows[color]["i"], p.attLocation, [ 3, 3, 4 ]
			);
			this.mvPopMatrix();
		} // for
	},

	drawFlows: function (p, tp, flowinfo, poslist, delta) {
		for (var i = 0; i < flowinfo.length; i++) {
			if (flowinfo[i]['rot'] == undefined) {
				this._putSpheres(p,
					flowinfo[i]['start'], flowinfo[i]['end'], 
					flowinfo[i]['color'], flowinfo[i]['size'], poslist, delta
				);
			} else {
				if (flowinfo[i]['translate'] == undefined && 
					flowinfo[i]['labelinfo'] == undefined) {
				this._putArrows(p, tp, 
					flowinfo[i]['start'], flowinfo[i]['end'], 
					flowinfo[i]['color'], flowinfo[i]['rot'],
					flowinfo[i]['size'], flowinfo[i]['value'], 
					poslist, delta, undefined
				);
				} else {
				this._putArrows(p, tp, 
					flowinfo[i]['start'], flowinfo[i]['end'], 
					flowinfo[i]['color'], flowinfo[i]['rot'],
					flowinfo[i]['size'], flowinfo[i]['value'], poslist, delta, 
					{ translate : (flowinfo[i]['translate'] == undefined) ? 
							undefined : flowinfo[i]['translate'],
					  labelinfo : (flowinfo[i]['labelinfo'] == undefined) ? 
							undefined : flowinfo[i]['labelinfo']
					}
				);
				}
			}
		} // for
	},

	// draw rectangles
	putRectangle: function (pos_vbo, nor_vbo, col_vbo, ibo, attLocation, attStride) {
		this.setAttribute([pos_vbo['rectangle'], nor_vbo['rectangle'], 
			col_vbo['rectangle']], attLocation, attStride);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo['rectangle']);
		gl.drawElements(ibo['rectangle'].drawMethod, ibo['rectangle'].numItems, gl.UNSIGNED_SHORT, 0);
	},

	putChar: function (texprg, outchar, color) {
	
		// 以下を用いてUV座標を生成し
		// テクスチャから文字を切り出して出力する
		var width = 256;
		var height = 256;
		var dx= width/13.0;
		//var dy= 38.5;
		var dy= 37.5;
		var offsety = [2, 44, 84, 126, 164, 209];
		
		var l_pos_map = {
		 "a" : [0.5+dx*0,  offsety[0]],
		 "b" : [0.5+dx*1,  offsety[0]],
		 "c" : [0.5+dx*2,  offsety[0]],
		 "d" : [0.5+dx*3,  offsety[0]],
		 "e" : [0.5+dx*4,  offsety[0]],
		 "f" : [0.5+dx*5,  offsety[0]],
		 "g" : [0.5+dx*6,  offsety[0]],
		 "h" : [0.5+dx*7,  offsety[0]],
		 "i" : [0.5+dx*8,  offsety[0]],
		 "j" : [0.5+dx*9,  offsety[0]],
		 "k" : [0.5+dx*10, offsety[0]],
		 "l" : [0.5+dx*11, offsety[0]],
		 "m" : [0.5+dx*12, offsety[0]],
		 "n" : [0.5+dx*0,  offsety[1]],
		 "o" : [0.5+dx*1,  offsety[1]],
		 "p" : [0.5+dx*2,  offsety[1]],
		 "q" : [0.5+dx*3,  offsety[1]],
		 "r" : [0.5+dx*4,  offsety[1]],
		 "s" : [0.5+dx*5,  offsety[1]],
		 "t" : [0.5+dx*6,  offsety[1]],
		 "u" : [0.5+dx*7,  offsety[1]],
		 "v" : [0.5+dx*8,  offsety[1]],
		 "w" : [0.5+dx*9,  offsety[1]],
		 "x" : [0.5+dx*10, offsety[1]],
		 "y" : [0.5+dx*11, offsety[1]],
		 "z" : [0.5+dx*12, offsety[1]],
		 "A" : [-0.1+dx*0,  offsety[2]],
		 "B" : [-0.1+dx*1,  offsety[2]],
		 "C" : [-0.1+dx*2,  offsety[2]],
		 "D" : [-0.1+dx*3,  offsety[2]],
		 "E" : [-0.1+dx*4,  offsety[2]],
		 "F" : [-0.1+dx*5,  offsety[2]],
		 "G" : [-0.1+dx*6,  offsety[2]],
		 "H" : [-0.1+dx*7,  offsety[2]],
		 "I" : [-0.1+dx*8,  offsety[2]],
		 "J" : [-0.1+dx*9,  offsety[2]],
		 "K" : [-0.1+dx*10, offsety[2]],
		 "L" : [-0.1+dx*11, offsety[2]],
		 "M" : [-0.1+dx*12, offsety[2]],
		 "N" : [-0.0+dx*0,  offsety[3]],
		 "O" : [-0.0+dx*1,  offsety[3]],
		 "P" : [-0.0+dx*2,  offsety[3]],
		 "Q" : [-0.0+dx*3,  offsety[3]],
		 "R" : [-0.0+dx*4,  offsety[3]],
		 "S" : [-0.0+dx*5,  offsety[3]],
		 "T" : [-0.0+dx*6,  offsety[3]],
		 "U" : [-0.0+dx*7,  offsety[3]],
		 "V" : [-0.0+dx*8,  offsety[3]],
		 "W" : [-0.0+dx*9,  offsety[3]],
		 "X" : [-0.0+dx*10, offsety[3]],
		 "Y" : [-0.0+dx*11, offsety[3]],
		 "Z" : [-0.0+dx*12, offsety[3]],
		 ":" : [0.1+dx*0,  offsety[4]],
		 "/" : [0.1+dx*1,  offsety[4]],
		 "\\": [0.1+dx*2,  offsety[4]],
		 "<" : [0.1+dx*3,  offsety[4]],
		 ">" : [0.1+dx*4,  offsety[4]],
		 "." : [0.1+dx*5,  offsety[4]],
		 "," : [0.1+dx*6,  offsety[4]],
		 "?" : [0.1+dx*7,  offsety[4]],
		 "[" : [0.1+dx*8,  offsety[4]],
		 "]" : [0.1+dx*9,  offsety[4]],
		 "!" : [0.1+dx*10, offsety[4]],
		 "-" : [0.1+dx*11, offsety[4]],
		 "=" : [0.1+dx*12, offsety[4]],
		 "0" : [dx*0,  offsety[5]],
		 "1" : [dx*1,  offsety[5]],
		 "2" : [dx*2,  offsety[5]],
		 "3" : [dx*3,  offsety[5]],
		 "4" : [dx*4,  offsety[5]],
		 "5" : [dx*5,  offsety[5]],
		 "6" : [dx*6,  offsety[5]],
		 "7" : [dx*7,  offsety[5]],
		 "8" : [dx*8,  offsety[5]],
		 "9" : [dx*9,  offsety[5]]
		};
	
		// スペース出力を考慮
		if (l_pos_map[outchar] == undefined) {
			l_pos_map[outchar] = [dx*10, offsety[5]];
		}
	
		this.drawRectangle(texprg, outchar, [0.0, 0.0, 0.0], {
			umin : (l_pos_map[outchar][0]+1.0)/width,
			umax : (l_pos_map[outchar][0]+dx-1.0)/width,
			vmin : l_pos_map[outchar][1]/height,
			vmax : (l_pos_map[outchar][1]+dy)/height,
		}, color);
	}, 

	// create cylinder object
	generateCylinderObject: function (color) {
		var pos_vbo = {}; var nor_vbo = {}; var col_vbo = {}; var ibo = {};
		var objinfo = this.createCylinder(0.04, 3.0, 14, 8);
		pos_vbo['cylinder'] = this.createVbo(objinfo["vp"]);
		nor_vbo['cylinder'] = this.createVbo(objinfo["vn"]);
		var color_array = [];
		for (var i = 0; i < objinfo["vi"].length; i++) 
			 color_array = color_array.concat([color.r, color.g, color.b, color.a]);
		col_vbo['cylinder'] = this.createVbo(color_array);
		ibo['cylinder'] = this.createIbo(objinfo["vi"]);
		ibo['cylinder'].numItems = objinfo["vi"].length;
		ibo['cylinder'].drawMethod = gl.TRIANGLES;
		return { p : pos_vbo, n : nor_vbo, c : col_vbo, i : ibo };
	},

	// create cylinder objects
	generateCylinderObjects: function (program) {
		program.cylinders = {};
		var vbolist = this.generateCylinderObject(
			{r: 1.0, g: 1.0, b: 0.0, a: 1.0});
		program.cylinders["yellow"] = {v: vbolist.p, n: vbolist.n, 
			c: $.extend({}, vbolist.c), i: vbolist.i};
		this.changeObjectsColor(vbolist, {r: 0.1, g: 0.1, b: 0.1, a: 1.0}, ['cylinder']);
		program.cylinders["gray"] = {v: vbolist.p, n: vbolist.n, c: $.extend({}, vbolist.c), i: vbolist.i};
	},

	generateCylinders: function (prg, clist) {
		var c = clist.shift();
		var vbolist = this.generateCylinderObject({r: c.r, g: c.g, b: c.b, a: c.a});
		prg.cylinders = {};
		prg.cylinders[c.id] = {v: vbolist.p, n: vbolist.n, c: $.extend({}, vbolist.c), i: vbolist.i};
		if (clist.length < 1) return;
		for (var i=0; i< clist.length; i++) {
		this.changeObjectsColor(vbolist, 
			{r: clist[i].r, g: clist[i].g, b: clist[i].b, a: clist[i].a}, ['cylinder']);
		prg.cylinders[clist[i].id] = 
			{v: vbolist.p, n: vbolist.n, c: $.extend({}, vbolist.c), i: vbolist.i};
		}
	},

	generateConeObject: function (color) {
		var pos_vbo = {}; var nor_vbo = {}; var col_vbo = {}; var ibo = {};
		var objinfo = this.createTruncatedCone(0.4, 0.0, 1.2, 4, 4, true, true, 1.5);
		pos_vbo['cone'] = this.createVbo(objinfo["vp"]);
		nor_vbo['cone'] = this.createVbo(objinfo["vn"]);
		var color_array = [];
		for (var i = 0; i < objinfo["vi"].length; i++) 
			 color_array = color_array.concat([color.r, color.g, color.b, color.a]);
		col_vbo['cone'] = this.createVbo(color_array);
		ibo['cone'] = this.createIbo(objinfo["vi"]);
		ibo['cone'].numItems = objinfo["vi"].length;
		ibo['cone'].drawMethod = gl.TRIANGLES;
		return { p : pos_vbo, n : nor_vbo, c : col_vbo, i : ibo };
	},

	generateConeObjects: function (program) {
		program.cones = {};
		// yellow cone
		var vbolist = this.generateConeObject({r: 1.0, g: 1.0, b: 0.0, a: 1.0});
		program.cones["yellow"] = {v: vbolist.p, n: vbolist.n, 
			c: $.extend({}, vbolist.c), i: vbolist.i};
	},

	generateCones: function (prg, clist) {
		var c = clist.shift();
		var vbolist = this.generateConeObject({r: c.r, g: c.g, b: c.b, a: c.a});
		prg.cones = {};
		prg.cones[c.id] = {v: vbolist.p, n: vbolist.n, c: $.extend({}, vbolist.c), i: vbolist.i};
		if (clist.length < 1) return;
		for (var i=0; i< clist.length; i++) {
		this.changeObjectsColor(vbolist, 
			{r: clist[i].r, g: clist[i].g, b: clist[i].b, a: clist[i].a}, ['cone']);
		prg.cones[clist[i].id] = 
			{v: vbolist.p, n: vbolist.n, c: $.extend({}, vbolist.c), i: vbolist.i};
		}
	},

	putCone: function (pos_vbo, nor_vbo, col_vbo, ibo, attLocation, attStride) {
		var objs = ['cone'];
		for (var i = 0; i<objs.length; i++) {
			this.setAttribute([pos_vbo[objs[i]], nor_vbo[objs[i]], 
				col_vbo[objs[i]]], attLocation, attStride);
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo[objs[i]]);
			gl.drawElements(ibo[objs[i]].drawMethod, ibo[objs[i]].numItems, gl.UNSIGNED_SHORT, 0);
		}
	},

	// initialize Uniform Location 
	initUniformLocation: function (s_prg, type) {
		gl.useProgram(s_prg);
		switch (type) {
			case 'use_texture': // texture objects
				// get parameter locations
        		s_prg.vertexPositionAttribute = gl.getAttribLocation(s_prg, "aVertexPosition");
        		gl.enableVertexAttribArray(s_prg.vertexPositionAttribute);
        		s_prg.vertexNormalAttribute = gl.getAttribLocation(s_prg, "aVertexNormal");
        		gl.enableVertexAttribArray(s_prg.vertexNormalAttribute);
        		s_prg.textureCoordAttribute = gl.getAttribLocation(s_prg, "aTextureCoord");
        		gl.enableVertexAttribArray(s_prg.textureCoordAttribute);

        		s_prg.mvMatrixUniform = gl.getUniformLocation(s_prg, "uMVMatrix");
        		s_prg.pMatrixUniform = gl.getUniformLocation(s_prg, "uPMatrix");
        		s_prg.nMatrixUniform = gl.getUniformLocation(s_prg, "uNMatrix");
        		s_prg.ambientColorUniform = gl.getUniformLocation(s_prg, "uAmbientColor");
        		s_prg.lightingDirectionUniform = gl.getUniformLocation(s_prg, "uLightingDirection");
        		s_prg.directionalColorUniform = gl.getUniformLocation(s_prg, "uDirectionalColor");
        		s_prg.useLightingUniform = gl.getUniformLocation(s_prg, "uUseLighting");

        		s_prg.alphaUniform = gl.getUniformLocation(s_prg, "uAlpha");
        		s_prg.samplerUniform = gl.getUniformLocation(s_prg, "uSampler");
        		s_prg.useTextureUniform = gl.getUniformLocation(s_prg, "uUseTexture");
        		s_prg.useArrowUniform = gl.getUniformLocation(s_prg, "uUseArrow");

				// initialize parameters
				gl.uniform3f(s_prg.ambientColorUniform, 0.8, 0.8, 0.8);
    			var adjustedLD = new Float32Array(3);
				adjustedLD[0] = 0.0; adjustedLD[0] = 0.0; adjustedLD[0] = -1.0;
    			gl.uniform3fv(s_prg.lightingDirectionUniform, adjustedLD);
				gl.uniform3f(s_prg.directionalColorUniform, 0.6, 0.6, 0.6);
    			gl.uniform1i(s_prg.useLightingUniform, 1);

    			gl.uniform1f(s_prg.alphaUniform, 1.0);
    			gl.uniform1i(s_prg.samplerUniform, 0);
    			gl.uniform1i(s_prg.useTextureUniform, 1);
    			gl.uniform1i(s_prg.useArrowUniform, 0);
				break;
			default : // color objects
				s_prg.uniLocation = new Array(); 
				s_prg.attLocation = new Array();
				s_prg.attStride = new Array();

				// get parameter locations for prg
				s_prg.uniLocation[0] = gl.getUniformLocation(s_prg, 'mvpMatrix');
				s_prg.uniLocation[1] = gl.getUniformLocation(s_prg, 'invMatrix');
				s_prg.uniLocation[2] = gl.getUniformLocation(s_prg, 'lightDirection');
				s_prg.uniLocation[3] = gl.getUniformLocation(s_prg, 'eyeDirection');
				s_prg.uniLocation[4] = gl.getUniformLocation(s_prg, 'ambientColor');
				s_prg.attLocation[0] = gl.getAttribLocation(s_prg, 'position');
				s_prg.attLocation[1] = gl.getAttribLocation(s_prg, 'normal');
				s_prg.attLocation[2] = gl.getAttribLocation(s_prg, 'color');
				s_prg.attStride[0] = 3; s_prg.attStride[1] = 3; s_prg.attStride[2] = 4;

				// set the default shader program
				var lightDirection = [-0.5, 0.5, 0.5]; 
				var eyeDirection = [0.0, 0.0, 25.0]; 
				var ambientColor = [0.2, 0.2, 0.2, 1.0]; 
				gl.uniform3fv(s_prg.uniLocation[2], lightDirection);
				gl.uniform3fv(s_prg.uniLocation[3], eyeDirection);
				gl.uniform4fv(s_prg.uniLocation[4], ambientColor);
		}
	},

	// create a texture
	createTexture: function (texture_list, source, num, width, height){
		// イメージオブジェクトの生成
		var img = new Image();
		
		// データのオンロードをトリガーにする
		img.onload = function(){
			// テクスチャオブジェクトの生成
			var tex = gl.createTexture();
			// テクスチャをバインドする
			gl.bindTexture(gl.TEXTURE_2D, tex);
			// テクスチャへイメージを適用
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
			// パラメータ設定
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
//			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR_MIPMAP_LINEAR);
//			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
			// ミップマップを生成
			gl.generateMipmap(gl.TEXTURE_2D);
			// テクスチャのバインドを無効化
			gl.bindTexture(gl.TEXTURE_2D, null);
			// pushでは駄目。読み込み完了の順番がreloadの度に異なる!
			// createTextures.push(tex);
			texture_list[num] = tex;
		}
		// イメージオブジェクトのソースを指定
		img.src = source;
		img.width = width;
		img.height = height;
	}, 

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
	_multiplyVec3: function (a,b,c){
		var d=b[0],e=b[1];b=b[2];
		c[0]=a[0]*d+a[4]*e+a[8]*b+a[12];
		c[1]=a[1]*d+a[5]*e+a[9]*b+a[13];
		c[2]=a[2]*d+a[6]*e+a[10]*b+a[14];
	}, 

	intersect: function (objid, result) { 
		var tol = 1.0e-7;
		var obj_size = g.scale / 30.0;
		var rr = obj_size*obj_size * 0.1;
		//define vecDot(A, B) ((A.x)*(B.x)+(A.y)*(B.y)+(A.z)*(B.z))
		//function vecComb(A, a, B, C) {
		//	(A.x)=((C.x)+(a)*(B.x)); //	(A.y)=((C.y)+(a)*(B.y)); //	(A.z)=((C.z)+(a)*(B.z));
		//}
		pos = [0, 0, 0];
		this._multiplyVec3(this.mMatrix, [0, 0, 0], pos); 
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

});

// __END__

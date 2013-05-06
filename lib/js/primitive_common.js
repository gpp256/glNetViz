/*!
 * primitive_common.js
 *
 * Copyright (c) 2013 Yoshi 
 * This software is distributed under the MIT License.(../../MIT-LICENSE.txt)
 */

/* merge functions into glNetViz namespace. */
$.extend(glNetViz, {

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

	// Change degrees to radians
	degToRad: function (degrees) { return degrees * Math.PI / 180; },

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

	rectangleVertexData: function () {
		var width = 0.7;
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
		var rectangle_vertices = this.rectangleVertexData();
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

	putCone: function (pos_vbo, nor_vbo, col_vbo, ibo, attLocation, attStride) {
		var objs = ['cone'];
		for (var i = 0; i<objs.length; i++) {
			this.setAttribute([pos_vbo[objs[i]], nor_vbo[objs[i]], 
				col_vbo[objs[i]]], attLocation, attStride);
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo[objs[i]]);
			gl.drawElements(ibo[objs[i]].drawMethod, ibo[objs[i]].numItems, gl.UNSIGNED_SHORT, 0);
		}
	},

	// create a texture
	createTexture: function (texture_list, source, number, width, height){
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
			texture_list[number] = tex;
		}
		// イメージオブジェクトのソースを指定
		img.src = source;
		img.width = width;
		img.height = height;
	}

});

// __END__

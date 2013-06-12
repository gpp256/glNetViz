/*!
 * shader_common.js
 *
 * Copyright (c) 2013 Yoshi 
 * This software is distributed under the MIT License.(../../MIT-LICENSE.txt)
 */

// Obsolete Functions:
// This file will be removed in the future.

// シェーダを生成する関数
glNetViz.createShader = function (format, type, src){
	// シェーダを格納する変数
	var shader;
	var shaderStr = '';
	
	switch(format){
		case 'script':
			// HTMLからscriptタグへの参照を取得
			var scriptElement = document.getElementById(src);
			// scriptタグが存在しない場合は抜ける
			if(!scriptElement){return;}
			shaderStr = scriptElement.text;
			break;
		case 'raw':
			shaderStr = src;
			break;
		default :
		    return;
	}
	
	switch(type){
		// 頂点シェーダの場合
		case 'x-shader/x-vertex':
			shader = gl.createShader(gl.VERTEX_SHADER);
			break;
		// フラグメントシェーダの場合
		case 'x-shader/x-fragment':
			shader = gl.createShader(gl.FRAGMENT_SHADER);
			break;
		default :
		    return;
	}
	
	// 生成されたシェーダにソースを割り当てる
	gl.shaderSource(shader, shaderStr);
	// シェーダをコンパイルする
	gl.compileShader(shader);
	// シェーダが正しくコンパイルされたかチェック
	if(gl.getShaderParameter(shader, gl.COMPILE_STATUS)){
		// 成功していたらシェーダを返して終了
		return shader;
	}else{
		// 失敗していたらエラーログをアラートする
		alert(gl.getShaderInfoLog(shader));
	}
};

// プログラムオブジェクトを生成しシェーダをリンクする関数
glNetViz.createProgram = function (vs, fs){
	// プログラムオブジェクトの生成
	var program = gl.createProgram();
	// プログラムオブジェクトにシェーダを割り当てる
	gl.attachShader(program, vs);
	gl.attachShader(program, fs);
	// シェーダをリンク
	gl.linkProgram(program);
	// シェーダのリンクが正しく行なわれたかチェック
	if(gl.getProgramParameter(program, gl.LINK_STATUS)){
		// 成功していたらプログラムオブジェクトを有効にする
		gl.useProgram(program);
		// プログラムオブジェクトを返して終了
		return program;
	}else{
		// 失敗していたらエラーログをアラートする
		alert(gl.getProgramInfoLog(program));
	}
};


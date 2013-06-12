/*!
 * shader.js
 *
 * Copyright (c) 2013 Yoshi 
 * This software is distributed under the MIT License.(../../MIT-LICENSE.txt)
 */

// Obsolete Functions:
// This file will be removed in the future.

/* merge functions into glNetViz namespace. */
$.extend(glNetViz, {

	// Get Vertex Shader
	getVertexShader: function (key) {
		if (key == undefined) key = 'default';
		var vs_list = {
			default : ""
		+"attribute vec3 position;\n"
		+"attribute vec3 normal;\n"
		+"attribute vec4 color;\n"
		+"uniform   mat4 mvpMatrix;\n"
		+"uniform   mat4 invMatrix;\n"
		+"uniform   vec3 lightDirection;\n"
		+"uniform   vec3 eyeDirection;\n"
		+"uniform   vec4 ambientColor;\n"
		+"varying   vec4 vColor;\n"
		+"varying   vec3 vNormal;\n"
		+"void main(void){\n"
		+"  vec3  invLight = normalize(invMatrix * vec4(lightDirection, 0.0)).xyz;\n"
		+"  vec3  invEye   = normalize(invMatrix * vec4(eyeDirection, 0.0)).xyz;\n"
		+"  vec3  halfLE   = normalize(invLight + invEye);\n"
		+"  float diffuse  = clamp(dot(normal, invLight), 0.1, 1.0);\n"
		+"	float specular = pow(clamp(dot(normal, halfLE), 0.0, 1.0), 50.0);\n"
		+"	vec4  light    = color * vec4(vec3(diffuse), 1.0) + vec4(vec3(specular), 1.0);\n"
		+"	vColor         = light + ambientColor;\n"
		+"  vNormal        = normal;\n"
		+"  gl_Position    = mvpMatrix * vec4(position, 1.0);\n"
		+"}", 
			use_texture : ""
		+"attribute vec3 aVertexPosition;\n"
		+"attribute vec3 aVertexNormal;\n"
		+"attribute vec2 aTextureCoord;\n"
		+"uniform mat4 uMVMatrix;\n"
		+"uniform mat4 uPMatrix;\n"
		+"uniform mat3 uNMatrix;\n"
		+"uniform vec3 uAmbientColor;\n"
		+"uniform vec3 uLightingDirection;\n"
		+"uniform vec3 uDirectionalColor;\n"
		+"uniform bool uUseLighting;\n"
		+"varying vec2 vTextureCoord;\n"
		+"varying vec3 vLightWeighting;\n"
		+"void main(void) {\n"
		+"  gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);\n"
		+"  vTextureCoord = aTextureCoord;\n"
		+"  if (!uUseLighting) {\n"
		+"    vLightWeighting = vec3(1.0, 1.0, 1.0);\n"
		+"  } else {\n"
		+"    vec3 transformedNormal = uNMatrix * aVertexNormal;\n"
		+"    float directionalLightWeighting = max(dot(transformedNormal, uLightingDirection), 0.0);\n"
		+"    vLightWeighting = uAmbientColor + uDirectionalColor * directionalLightWeighting;\n"
		+"  }\n"
		+"}"
		};
		return (vs_list[key] == undefined) ? vs_list['default'] : vs_list[key];
	},

	// Get Fragment Shader
	getFragmentShader: function  (key) {
		if (key == undefined) key = 'default';
		var fs_list = {
			default : ""
		+"precision mediump float;\n"
		+"uniform mat4 invMatrix;\n"
		+"uniform vec3 lightDirection;\n"
		+"uniform vec3 eyeDirection;\n"
		+"uniform vec4 ambientColor;\n"
		+"varying vec3 vNormal;\n"
		+"varying vec4 vColor;\n"
		+"void main(void){\n"
		+"    vec3  invLight  = normalize(invMatrix * vec4(lightDirection, 0.0)).xyz;\n"
		+"    vec3  invEye    = normalize(invMatrix * vec4(eyeDirection, 0.0)).xyz;\n"
		+"    vec3  halfLE    = normalize(invLight + invEye);\n"
		+"    float diffuse   = clamp(dot(vNormal, invLight), 0.0, 1.0);\n"
		+"    float specular  = pow(clamp(dot(vNormal, halfLE), 0.0, 1.0), 50.0);\n"
		+"    vec4  destColor = vColor * vec4(vec3(diffuse), 1.0) + vec4(vec3(specular), 1.0) + ambientColor;\n"
		+"    gl_FragColor = destColor;\n"
		+"}", 
			use_texture : ""
		+"#ifdef GL_ES\n"
		+"precision mediump float;\n"
		+"#endif\n"
		+"varying vec2 vTextureCoord;\n"
		+"varying vec3 vLightWeighting;\n"
		+"uniform float uAlpha;\n"
		+"uniform sampler2D uSampler;\n"
		+"uniform bool uUseTexture;\n"
		+"uniform bool uUseArrow;\n"
		+"void main(void) {\n"
		+"if (!uUseTexture) {\n"
		+"    if (uUseArrow) {\n"
		+"        gl_FragColor = vec4(0.1, 0.1, 0.1, 0.6);\n"
		+"	} else {   \n"
		+"        gl_FragColor = vec4(1.0, 1.0, 0.0, 0.6);\n"
		+"	}\n"
		+"} else {\n"
		+"    vec4 textureColor = texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t));\n"
		+"    gl_FragColor = vec4(textureColor.rgb * vLightWeighting, textureColor.a * uAlpha);\n"
		+"}\n"
		+"}"
		}; 
		return (fs_list[key] == undefined) ? fs_list['default'] : fs_list[key];
	}

});

// __END__

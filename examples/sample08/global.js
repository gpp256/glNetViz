/*!
 * global.js
 *
 * Copyright (c) 2013 Yoshi 
 * This software is distributed under the MIT License.(../../MIT-LICENSE.txt)
 */

// webgl context
var gl = undefined;

// slider ui parameters
var g_ui = [
  { obj: 'globals', name: 'Scale', value: 25, min: 1, max: 100, step: 1},
  { obj: 'globals', name: 'Rotation around the x-axis', value: 0, min: 0, max: 100, step: 1}
];

// global variables
var g = {
	// -- for mouse events --
	eye: { x: 0.0, y: 0.0, z: 18},
	cache_eyepos: { x: 0, y: 0 },
	lastMousePosition: {x: 0, y: 0},
	down: false,
	startX: 0, startY: 0,
	moveVelocityX: 0, moveVelocityY: 0,
	moveHistory: [],
	numMovesToTrack: 10,
	scrollX: 0, scrollY: 0,
	scrollXStart: 0, scrollYStart: 0,
	// -- for framerate --
	framerates: [0],
	rendertime: new Date().getTime(),
	framerate_counter: 0,
	display_framerate_interval: 30,
	// -- for selectable view modes --
	view_mode: 1,
	old_view_mode: 1,
	// number of polygons
	polygon_num: 0,
	// infomation of objects
	sdn_objs: {},
	other_objs: {},
	// for 3d selection/picking
	check_intersect: 0,
	selected_obj: -1,
	intersect_pos: [0.0, 0.0, 0.0],
	intersect_rot: 0.0,
	intersect_index: -1,
	mRatio: 0.0,
	viewportWidth: 0,
	viewportHeight: 0,
	// parameters to draw flows
	flowinfo: {},
	drawinfo_flows: [],
	gwflowstat: undefined,
	drawinfo_gwflows: [],
	flowdata_id: 8,
//	arrow_default_pos: [0, 48, 100],
	arrow_default_pos: [0],
	arrow_delta: 0.4,
	getflow_updateflag: 1,
	getstat_interval: 500, // 1800: 65fps: 27s, 60fps: 30s
	getstat_counter: 400
	// rotation arrays
	//rinfo: {}
};

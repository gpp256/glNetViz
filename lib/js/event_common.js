/*!
 * event_common.js
 *
 * Copyright (c) 2013 Yoshi 
 * This software is distributed under the MIT License.(../../MIT-LICENSE.txt)
 */

glNetViz.touchHandler = function (event) {
	var touches = event.changedTouches, first = touches[0], type = "";
	switch(event.type) {
	case "touchstart": type = "mousedown"; break;
	case "touchmove":  type="mousemove"; break;
	case "touchend":   type="mouseup"; break;
	default: return;
	}
	var simulatedEvent = document.createEvent("MouseEvent");
	simulatedEvent.initMouseEvent(type, true, true, window, 1,
		first.screenX, first.screenY,
		first.clientX, first.clientY, false,
		false, false, false, 0/*left*/, null);
	first.target.dispatchEvent(simulatedEvent);
	event.preventDefault();
};

glNetViz.initEvent = function() {
	document.addEventListener("touchstart", glNetViz.touchHandler, true);
	document.addEventListener("touchmove", glNetViz.touchHandler, true);
	document.addEventListener("touchend", glNetViz.touchHandler, true);
	document.addEventListener("touchcancel", glNetViz.touchHandler, true);
};

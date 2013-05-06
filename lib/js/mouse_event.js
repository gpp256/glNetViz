/*
 * Copyright 2009, Google Inc.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *     * Neither the name of Google Inc. nor the names of its
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

var getAbsolutePosition = function(element) {
  var r = { x: element.offsetLeft, y: element.offsetTop };
  if (element.offsetParent) {
    var tmp = getAbsolutePosition(element.offsetParent);
    r.x += tmp.x;
    r.y += tmp.y;
  }
  return r;
};

var getRelativeCoordinates = function(eventInfo, opt_reference) {
  var x, y;
  var event = eventInfo.event;
  var element = eventInfo.element;
  var reference = opt_reference || eventInfo.element;
  if (!window.opera && typeof event.offsetX != 'undefined') {
    var pos = { x: event.offsetX, y: event.offsetY };
    var e = element;
    while (e) {
      e.mouseX = pos.x;
      e.mouseY = pos.y;
      pos.x += e.offsetLeft;
      pos.y += e.offsetTop;
      e = e.offsetParent;
    }
    var e = reference;
    var offset = { x: 0, y: 0 }
    while (e) {
      if (typeof e.mouseX != 'undefined') {
        x = e.mouseX - offset.x;
        y = e.mouseY - offset.y;
        break;
      }
      offset.x += e.offsetLeft;
      offset.y += e.offsetTop;
      e = e.offsetParent;
    }
    e = element;
    while (e) {
      e.mouseX = undefined;
      e.mouseY = undefined;
      e = e.offsetParent;
    }
  } else {
    var pos = getAbsolutePosition(reference);
    x = event.pageX - pos.x;
    y = event.pageY - pos.y;
  }
  return { x: x, y: y };
};


function addMoveHistory(pos) {
  if (g.moveHistory.length == g.numMovesToTrack) {
    g.moveHistory.shift();
  }
  var now = (new Date()).getTime() * 0.001;
  g.moveHistory.push({ position: pos, time: now});
}

var getEventInfo = function(event) {
  event = event ? event : window.event;
  var element = event.target ? event.target : event.srcElement;
  return {
    event: event,
    element: element,
    name: (element.id ? element.id : ('->' + element.toString())),
    wheel: (event.detail ? event.detail : -event.wheelDelta),
    shift: (event.modifiers ? (event.modifiers & Event.SHIFT_MASK) : event.shiftKey)
  };
};

function getMovePosition(e) {
  var info = getEventInfo(e);
  var m = getRelativeCoordinates(info);
  g.lastMousePosition = m;
	return {x: m.x, y: m.y};
}

function handleMouseDown(e) {
  var pos = getMovePosition(e);
  g.down = true;
  g.startX = pos.x;
  g.startY = pos.y;
  g.scrollXStart = g.scrollX;
  g.scrollYStart = g.scrollY;
  g.moveVelocityX = 0;
  g.moveVelocityY = 0;
  g.moveHistory = [];
  addMoveHistory(pos);

//  $("#debug").append("pos.x="+pos.x+", pos.y="+pos.y);
  var vsize =5.0/g.mRatio;
  g.eye.x = pos.x/gl.viewportWidth*10.0-5.0;
  g.eye.y = pos.y/gl.viewportHeight*(-vsize)*2.0+vsize;

  if (g.cache_eyepos.x != pos.x && g.cache_eyepos.y != pos.y) {
    g.check_intersect = 1;
  }
//  $("#debug").append("check_intersect="+g.check_intersect+"<br>");
  g.cache_eyepos.x = pos.x; 
  g.cache_eyepos.y = pos.y; 

  return false;
}

function handleMouseMove(e) {
  var pos = getMovePosition(e);
  if (g.down) {
    addMoveHistory(pos);
    g.scrollX = g.scrollXStart + (pos.x - g.startX);
    g.scrollY = g.scrollYStart - (pos.y - g.startY);
  }
  return false;
}

function handleMouseUp(e) {
  if (g.down) {
    g.down = false;
    var pos = getMovePosition(e);
    addMoveHistory(pos);
    var oldest = g.moveHistory[0];
    var newest = g.moveHistory[g.moveHistory.length - 1];
    var elapsedTime = newest.time - oldest.time;
    if (elapsedTime < 0.4) {
      g.moveVelocityX =  (newest.position.x - oldest.position.x) / elapsedTime;
      g.moveVelocityY = -(newest.position.y - oldest.position.y) / elapsedTime;
    }
  }
  return false;
}


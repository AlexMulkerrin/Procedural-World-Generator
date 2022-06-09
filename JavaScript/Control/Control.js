const zoomScales = [
/* in meters 1m to 100,000 km */
1,2,5, 10,20,50, 100,200,500, 1000,2000,5000, 10000,20000,50000, 100000,200000,500000, 1000000,2000000,5000000, 10000000,20000000,50000000, 100000000];

function Control(inSimulation) {
	this.c = document.getElementById("canvas");
	this.targetSimulation = inSimulation;

	var planet = this.targetSimulation.planet;
	this.zoomLevel = zoomScales.length-1;
	this.cameraX = -1*Math.floor((zoomScales[this.zoomLevel]-planet.circumference)/2);
	this.cameraY = -1*Math.floor((zoomScales[this.zoomLevel]*this.c.height/this.c.width-planet.poleSpan)/2);

	this.allowMousePanning = true;
	this.panningRegion = 16;
	this.panningRate = 0.02;

	this.mouse = new Mouse();

	var t = this;
	this.c.onmousemove = function(e){t.handleMouseMove(e)};

	// dummy functions to avoid rightclicking bringing up edit menu
	this.c.oncontextmenu = function(event) {return false;};
	this.c.onselectstart = function(event) {return false;};

	this.c.onmousewheel = function (e) {t.handleMouseWheel(e.wheelDelta); return false; };
    // special case for Mozilla...
    this.c.onwheel = function (e) {t.handleMouseWheel(e); return false; };

	this.keyCodes = [];
	document.onkeydown = function(e){t.handleKeyDown(e)};
	document.onkeyup = function(e){t.handleKeyUp(e)};
}

Control.prototype.handleMouseMove = function(event) {
	this.mouse.x = event.layerX;
	this.mouse.y = event.layerY;

	this.updateMouse();
}
Control.prototype.updateMouse = function() {
	var p = this.targetSimulation.planet;
	var m = this.mouse;
	var scale = zoomScales[this.zoomLevel];

	m.mapX = (m.x * scale / this.c.width) + this.cameraX;
	m.mapY = (m.y * scale / this.c.width) + this.cameraY;

	m.isOverMap = true;
	if (m.mapX<0 || m.mapX>p.circumference || m.mapY>p.poleSpan || m.mapY<0) {
		m.isOverMap = false;
	}
}
Control.prototype.handleMouseWheel = function(event) {
	var change = -event.deltaY || event.wheelDelta;
	if (change < 0) {
		this.zoomLevel++;
		if (this.zoomLevel >= zoomScales.length) {
			this.zoomLevel = zoomScales.length-1;
		} else {
			var offsetX = this.mouse.mapX - this.cameraX;
			this.cameraX += offsetX - zoomScales[this.zoomLevel] / zoomScales[this.zoomLevel-1] * offsetX ;

			var offsetY = this.mouse.mapY - this.cameraY;
			this.cameraY += offsetY - zoomScales[this.zoomLevel] / zoomScales[this.zoomLevel-1] * offsetY ;
		}
	} else if (change > 0) {
		this.zoomLevel--;
		if (this.zoomLevel < 0) {
			this.zoomLevel = 0;
		} else {
			var offsetX = this.mouse.mapX - this.cameraX;
			this.cameraX += offsetX - zoomScales[this.zoomLevel] / zoomScales[this.zoomLevel+1] * offsetX ;

			var offsetY = this.mouse.mapY - this.cameraY;
			this.cameraY += offsetY - zoomScales[this.zoomLevel] / zoomScales[this.zoomLevel+1] * offsetY ;

		}
	}
	//this.updateMouse();
}
Control.prototype.handleKeyDown = function(event) {
	var keyCode;
	if (event == null) {
		keyCode = window.event.keyCode;
	} else {
		keyCode = event.keyCode;
	}

	var key = String.fromCharCode(keyCode).toLowerCase();
	this.keyCodes[key] = true;
	this.keyCodes[keyCode] = true;

	// prevent movement of page when program has focus
	switch (keyCode) {
		case 37: // left arrow
		case 39: // right arrow
		case 38: // up arrow
		case 40: // down arrow
		case 32: // spacebar
			event.preventDefault();
			break;
	}
}
Control.prototype.handleKeyUp = function(event) {
	var keyCode;
	if (event == null) {
		keyCode = window.event.keyCode;
	} else {
		keyCode = event.keyCode;
	}

	var key = String.fromCharCode(keyCode).toLowerCase();
	this.keyCodes[key] = false;
	this.keyCodes[keyCode] = false;
}

Control.prototype.update = function() {
	this.handlePanning();
}
Control.prototype.handlePanning = function() {
	var m = this.mouse;
	var panDist = zoomScales[this.zoomLevel] *this.panningRate;

	if (this.keyCodes['a'] || this.keyCodes[37]) {
		this.cameraX -= panDist;
	}
	if (this.keyCodes['d'] || this.keyCodes[39]) {
		this.cameraX += panDist;
	}
	if (this.keyCodes['w'] || this.keyCodes[38]) {
		this.cameraY -= panDist;
	}
	if (this.keyCodes['s'] || this.keyCodes[40]) {
		this.cameraY += panDist;
	}

	if (this.mouse.isOverMap == true && this.allowMousePanning == true) {
		if (m.x < this.panningRegion) {
			this.cameraX -= panDist;
		} else if (m.x > this.c.width - this.panningRegion) {
			this.cameraX += panDist;
		}
		if (m.y < this.panningRegion) {
			this.cameraY -= panDist;
		} else if (m.y > this.c.height - this.panningRegion) {
			this.cameraY += panDist;
		}
	}
	this.updateMouse();
}

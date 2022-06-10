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

	this.button = [];
	this.buttonGrid = new ButtonGrid(30, 8, this.c);
	this.createButtons();
	this.selected = NONE;

	var t = this;
	this.c.onmousemove = function(e){t.handleMouseMove(e)};
	this.c.onmousedown = function(e){t.handleMouseDown(e)};
	this.c.onmouseup = function(e){t.handleMouseUp(e)};

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

function ButtonGrid(inSize, inGap, inC) {
	this.size = inSize;
	this.gap = inGap;
	this.c = inC;
	this.x = this.gap;
	this.y = this.gap;
	this.width = Math.floor((this.c.width-this.gap)/(this.size+this.gap));
	this.height = Math.floor((this.c.height-this.gap)/(this.size+this.gap));
}
ButtonGrid.prototype.shift = function(dx,dy) {
	this.x += dx * (this.size + this.gap);
	if (this.x < 0) {
		this.x = this.width * (this.size + this.gap);
		this.y -= (this.size + this.gap);
	}
	if (this.x > this.width * (this.size + this.gap)) {
		this.x = this.gap;
		this.y += (this.size + this.gap);
	}
	this.y += dy * (this.size + this.gap);
	if (this.y < 0) {
		this.y = this.height * (this.size + this.gap);
		this.x -= (this.size + this.gap);
	}
	if (this.y > this.height * (this.size + this.gap)) {
		this.y = this.gap;
		this.x += (this.size + this.gap);
	}
}
Control.prototype.createButtons = function() {
	this.button = [];

	switch(this.targetSimulation.gameState) {
		case gameStateID.start:
			// TODO:
			break;
		case gameStateID.menu:
			// TODO:
			break;
		case gameStateID.ingame:
			this.makeInterface();
			break;
	}
}
Control.prototype.makeInterface = function() {
	var g = this.buttonGrid;
	// top left
	this.button.push(new Button(g.x,g.y,g.size,g.size,"⏸️", "toggle pause","togglePause"));
	g.shift(0,1);
	g.shift(-1,0);
	// top right
	this.button.push(new Button(g.x,g.y,g.size,g.size,"⏹️", "open menu","openMenu"));
	g.x = g.gap;
	g.y = g.gap;
	g.shift(-1,0);
	g.shift(1,0);
	// bottom right
	this.button.push(new Button(g.x,g.y,g.size,g.size,"", "toggleFullscreen","toggleFullscreen"));

}

function Button( inX, inY, inWidth, inHeight, inText, inTooltip, inFunction, inFuncArgs) {
	this.x = inX;
	this.y = inY;
	this.width = inWidth;
	this.height = inHeight;

	this.text = inText;
	this.tooltip = inTooltip;
	this.function = inFunction;
	this.funcArgs = inFuncArgs;
}
Button.prototype.mouseIsInBounds = function(x, y) {
	if (x >= this.x && x <= this.x+this.width &&
		y >= this.y && y <= this.y+this.height) {
			return true;
		} else {
			return false;
		}
}

Control.prototype.handleMouseMove = function(event) {
	this.mouse.x = event.layerX;
	this.mouse.y = event.layerY;

	this.mouse.hoveredButton = -1;
	for (var i=0; i<this.button.length; i++) {
		var b = this.button[i];
		if (b.mouseIsInBounds(this.mouse.x, this.mouse.y)) {
			this.mouse.hoveredButton = i;
		}
	}

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
Control.prototype.handleMouseDown = function(event) {
	this.mouse.whichClick = event.which;
	this.mouse.isDown = true;

	switch (this.mouse.whichClick) {
		case mouseClickID.leftClick:
			if (this.mouse.hoveredButton>=0) {
				var b = this.button[this.mouse.hoveredButton];
				this[b.function](b.functionArguments);
			} else {

			}
			break;
		case mouseClickID.middleClick:
			this.togglePause();
			break;
		case mouseClickID.rightClick:
			if (this.selected>=0) {
				var b = this.button[this.selected];
				this[b.function](b.functionArguments);
			} else {

			}
			break;
	}
}
Control.prototype.handleMouseUp = function(event) {
	this.mouse.whichClick = NONE;
	this.mouse.isDown = false;
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

Control.prototype.togglePause = function() {
	var sim = this.targetSimulation;
	sim.isPaused = !(sim.isPaused);
}
Control.prototype.openMenu = function() {
	// todo
	console.log("not implemented yet!");
}
Control.prototype.toggleFullscreen = function() {
	// todo
	console.log("not implemented yet!");
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

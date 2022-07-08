const zoomScales = [
/* in meters 1m to 100,000 km */
1,2,5, 10,20,50, 100,200,500, 1000,2000,5000, 10000,20000,50000, 100000,200000,500000, 1000000,2000000,5000000, 10000000,20000000,50000000, 100000000];

const detailsID = {planet:0, terrain:1, factions:2, cities:3, agents:4};
const visibilityID = {territory:0, improvements:1, cities:2, agents:3, labels:4, interface:5, minimapTerritory:6, minimapCities:7, minimapAgents:8};

function Control(inSimulation) {
	this.c = document.getElementById("canvas");
	this.targetSimulation = inSimulation;

	this.needNewSpritesheet = false;

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

	this.selectedFaction = 0;
	this.selectedAgentList = [];

	this.detailsTab = detailsID.planet;
	this.visibilityFlags = [];
	this.visibilityFlags[visibilityID.territory] = true;
	this.visibilityFlags[visibilityID.improvements] = true;
	this.visibilityFlags[visibilityID.cities] = true;
	this.visibilityFlags[visibilityID.agents] = true;
	this.visibilityFlags[visibilityID.labels] = true;
	this.visibilityFlags[visibilityID.interface] = true;

	this.visibilityFlags[visibilityID.minimapTerritory] = true;
	this.visibilityFlags[visibilityID.minimapCities] = true;
	this.visibilityFlags[visibilityID.minimapAgents] = true;


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

	document.documentElement.onmouseenter = function(e){t.handleMouseEnter(e)};
	document.documentElement.onmouseleave = function(e){t.handleMouseLeave(e)};
	window.onresize = function(){t.resizeCanvas(); };
}
Control.prototype.resizeCanvas = function() {
	this.c.width = window.innerWidth;
	this.c.height = window.innerHeight;
	this.createButtons();
}

function ButtonGrid(inSize, inGap, inC) {
	this.size = inSize;
	this.gap = inGap;
	this.c = inC;
	this.x = this.gap;
	this.y = this.gap;
	this.width = Math.ceil((this.c.width-this.gap)/(this.size+this.gap));
	this.height = Math.ceil((this.c.height-this.gap)/(this.size+this.gap));
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
	this.buttonGrid = new ButtonGrid(30, 8, this.c);

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

	this.updateMouse();
}
Control.prototype.makeInterface = function() {
	var g = this.buttonGrid;
	// top left
	this.button.push(new Button(g.x,g.y,g.size,g.size,"⏸️", "toggle pause",' ',"togglePause"));
	g.shift(0,1);

	this.button.push(new Button(g.x,g.y,g.size,g.size,"🌍", "view planet details",'q',"setDetailsTab",0));
	g.shift(1,0);
	this.button.push(new Button(g.x,g.y,g.size,g.size,"🏞️", "view terrain details",'q',"setDetailsTab",1));
	g.shift(1,0);
	this.button.push(new Button(g.x,g.y,g.size,g.size,"🚩", "view faction details",'q',"setDetailsTab",2));
	g.shift(1,0);
	this.button.push(new Button(g.x,g.y,g.size,g.size,"🏢", "view city details",'q',"setDetailsTab",3));
	g.shift(1,0);
	this.button.push(new Button(g.x,g.y,g.size,g.size,"⛵️", "view agent details",'q',"setDetailsTab",4));

	// top right
	g.x = this.c.width - (g.size + g.gap);
	g.y = g.gap;
	this.button.push(new Button(g.x,g.y,g.size,g.size,"⏹️", "open menu",'m',"openMenu"));
	g.shift(-1,0);
	this.button.push(new Button(g.x,g.y,g.size,g.size,"🎵", "open music in new tab",'n',"openMusicTab"));
	g.shift(-1,0);
	this.button.push(new Button(g.x,g.y,g.size,g.size,"🔇", "toggle mute",'b',"toggleMute"));
	g.shift(-1,0);
	this.button.push(new Button(g.x,g.y,g.size,g.size,"⭐️", "generate new world",'r',"generateWorld"));
	g.shift(-1,0);
	this.button.push(new Button(g.x,g.y,g.size,g.size,"📈", "open stats",'v',"openStats"));

	g.shift(0,1);
	this.button.push(new Button(g.x,g.y,g.size,g.size,"🔁", "cycle through cities",'tab',"cycleCities"));
	g.shift(1,0);
	this.button.push(new Button(g.x,g.y,g.size,g.size,"🏃", "select land units",'z',"selectLand"));
	g.shift(1,0);
	this.button.push(new Button(g.x,g.y,g.size,g.size,"🚢", "select sea units",'x',"selectSea"));
	g.shift(1,0);
	this.button.push(new Button(g.x,g.y,g.size,g.size,"✈️", "select air units",'c',"selectAir"));
	g.shift(1,0);
	this.button.push(new Button(g.x,g.y,g.size,g.size,"🚨", "select everything",'e',"selectEverything"));

	// bottom left
	g.x = 248;
	g.y = this.c.height - (g.size + g.gap);
	g.shift(0,-2);
	this.button.push(new Button(g.x,g.y,g.size,g.size,"🟠", "toggle minimap territory visibility",'j',"toggleVisibilityFlag", visibilityID.minimapTerritory));
	g.shift(1,0);
	this.button.push(new Button(g.x,g.y,g.size,g.size,"🟧", "toggle minimap cities visibility",'k',"toggleVisibilityFlag", visibilityID.minimapCities));
	g.shift(1,0);
	this.button.push(new Button(g.x,g.y,g.size,g.size,"🔶", "toggle minimap cities visibility",'l',"toggleVisibilityFlag", visibilityID.minimapAgents));
	g.shift(-2,1);

	this.button.push(new Button(g.x,g.y,g.size,g.size,"🔵", "toggle territory visibility",'t',"toggleVisibilityFlag",visibilityID.territory));
	g.shift(1,0);
	this.button.push(new Button(g.x,g.y,g.size,g.size,"🟦", "toggle cities visibility",'y',"toggleVisibilityFlag",visibilityID.cities));
	g.shift(1,0);
	this.button.push(new Button(g.x,g.y,g.size,g.size,"🔷", "toggle agents visibility",'u',"toggleVisibilityFlag",visibilityID.agents));
	g.shift(-2,1);

	this.button.push(new Button(g.x,g.y,g.size,g.size,"🟤", "toggle improvements visibility",'i',"toggleVisibilityFlag", visibilityID.improvements));
	g.shift(1,0);
	this.button.push(new Button(g.x,g.y,g.size,g.size,"🟢", "toggle labels visibility",'o',"toggleVisibilityFlag",visibilityID.labels));
	g.shift(1,0);
	this.button.push(new Button(g.x,g.y,g.size,g.size,"🎦", "toggle interface visibility",'p',"toggleVisibilityFlag",visibilityID.interface));
	g.shift(1,0);

	// bottom right
	g.x = this.c.width - (g.size + g.gap);
	g.y = this.c.height - (g.size + g.gap);
	this.button.push(new Button(g.x,g.y,g.size,g.size,"🟦", "toggleFullscreen",'f',"toggleFullscreen"));
	g.shift(0,-1);
	if (this.zoomLevel < (zoomScales.length - 1) ) {
		this.button.push(new Button(g.x,g.y,g.size,g.size,"⬇️", "zoom out","-","zoomOut",false));
	}
	g.shift(0,-1);
	if (this.zoomLevel > 0 ) {
		this.button.push(new Button(g.x,g.y,g.size,g.size,"⬆️", "zoom in","+","zoomIn",false));
	}

}

function Button( inX, inY, inWidth, inHeight, inText, inTooltip, inHotkey, inFunction, inFuncArgs) {
	this.x = inX;
	this.y = inY;
	this.width = inWidth;
	this.height = inHeight;

	this.text = inText;
	this.tooltip = inTooltip;
	this.hotkey = inHotkey;

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
	var m = this.mouse;

	m.x = event.layerX;
	m.y = event.layerY;

	this.updateMouse();
}
Control.prototype.updateMouse = function() {
	var p = this.targetSimulation.planet;
	var m = this.mouse;
	var scale = zoomScales[this.zoomLevel];

	m.mapX = (m.x * scale / this.c.width) + this.cameraX;
	m.mapY = (m.y * scale / this.c.width) + this.cameraY;

	m.hoveredButton = NONE;
	for (var i=0; i<this.button.length; i++) {
		var b = this.button[i];
		if (b.mouseIsInBounds(m.x, m.y)) {
			m.hoveredButton = i;
		}
	}

	m.isOverMap = true;
	if (m.mapX<0 || m.mapX>p.gridCircumference || m.mapY>p.gridPoleSpan || m.mapY<0) {
		m.isOverMap = false;
	}

	m.hoveredCity = NONE;
	if (m.isOverMap == true) {
		m.tileX = Math.floor(m.mapX/p.gridSize);
		m.tileY = Math.floor(m.mapY/p.gridSize);

		for (var i=0; i<p.structure.length; i++) {
			var s = p.structure[i];
			if (m.tileX == s.tileX && m.tileY == s.tileY) {
				m.hoveredCity = i;
				break;
			}
		}
	}


	var sqSize = 3;
	m.isOverMinimap = false;
	if (m.hoveredButton == NONE) {
		if (m.x < p.terrain.width * sqSize && m.y > this.c.height - (p.terrain.height*sqSize) ) {
			m.isOverMinimap = true;
			m.isOverMap = false;

			// handle minimap drag
			if (m.isDown == true && m.whichClick == mouseClickID.leftClick
				&& m.isDragSelecting == false) {
				var p = this.targetSimulation.planet;
				var sqSize = 3;
				var x = m.x/sqSize * p.gridSize;
				var y = (m.y - (this.c.height - (p.terrain.height*sqSize))) /sqSize * p.gridSize;
				this.centerCamera(x,y);
			}
		}
	}

	m.hoveredAgentList = [];
	var l,r,t,b = 0;
	if (m.isDragSelecting == true) {
		l = m.lastMapX;
		r = m.mapX;
		if (l>r) {
			l = m.mapX;
			r = m.lastMapX;
		}
		t = m.lastMapY;
		b = m.mapY;
		if (t>b) {
			t = m.mapY;
			b = m.lastMapY;
		}
	} else {
		l = m.mapX;
		r = m.mapX;
		t = m.mapY;
		b = m.mapY;
	}

	for (var i=0; i<p.agent.length; i++) {
		var a = p.agent[i];

		var screenSpan = zoomScales[this.zoomLevel];
		var pixel = 3*screenSpan/this.c.width;
		var size = agentTypes[a.type].size;

		if ( (a.x-size)<(r+pixel) && (a.x+size)>(l-pixel)
		&& (a.y-size)<(b+pixel) && (a.y+size)>(t-pixel)) {
			m.hoveredAgentList.push(i);
		}
	}
}
Control.prototype.handleMouseDown = function(event) {
	var m = this.mouse;
	m.whichClick = event.which;
	m.isDown = true;

	switch (m.whichClick) {
		case mouseClickID.leftClick:
			if (m.hoveredButton>=0) {
				var b = this.button[m.hoveredButton];
				this[b.function](b.funcArgs);
			} else if (m.isOverMinimap == true) {
				var p = this.targetSimulation.planet;
				var sqSize = 3;
				var x = m.x/sqSize * p.gridSize;
				var y = (m.y - (this.c.height - (p.terrain.height*sqSize))) /sqSize * p.gridSize;
				this.centerCamera(x,y);
			} else {
				m.lastMapX = m.mapX;
				m.lastMapY = m.mapY;
				m.isDragSelecting = true;
			}
			break;
		case mouseClickID.middleClick:
			this.togglePause();
			break;
		case mouseClickID.rightClick: // give command to selected agents
			if (m.isOverMinimap == true) {
				var p = this.targetSimulation.planet;
				var sqSize = 3;
				var x = m.x/sqSize * p.gridSize;
				var y = (m.y - (this.c.height - (p.terrain.height*sqSize))) /sqSize * p.gridSize;
				this.handleMovementOrder(x,y);
			} else if (m.isOverMap == true) {
				this.handleMovementOrder(m.mapX,m.mapY);
			}
			break;
	}
}
Control.prototype.handleMouseUp = function(event) {
	var m = this.mouse;

	if (m.isDragSelecting == true) {
		this.selectedAgentList = []
		for (var i=0; i<m.hoveredAgentList.length; i++) {
			var index = m.hoveredAgentList[i];
			var a = this.targetSimulation.planet.agent[index];
			if (a.factionID == this.selectedFaction && a.isAlive == true) {
				this.selectedAgentList.push(index);
			}
		}
		m.isDragSelecting = false;
	}
	m.whichClick = NONE;
	m.isDown = false;

}
Control.prototype.handleMouseWheel = function(event) {
	var change = -event.deltaY || event.wheelDelta;
	if (change < 0) {
		this.zoomOut(true);
	} else if (change > 0) {
		this.zoomIn(true);
	}
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
Control.prototype.handleMouseEnter = function(event) {
	this.mouse.isOverWindow = true;
}
Control.prototype.handleMouseLeave= function(event) {
	this.mouse.isOverWindow = false;
}

Control.prototype.handleMovementOrder = function(nx,ny) {
	var sim = this.targetSimulation;

	var selectedNum = this.selectedAgentList.length;
	var formationDepth = Math.ceil(Math.sqrt(selectedNum));
	var depth = 0;
	var unitGap = 200;

	var tx = nx;
	var ty = ny;
	for (var i=0; i<selectedNum; i++) {
		var a = sim.planet.agent[this.selectedAgentList[i]];
		sim.setCourse(a,tx,ty);
		a.state = stateID.moving;
		a.isRoaming = false;

		tx += unitGap;
		depth++;
		if (depth >= formationDepth) {
			ty += unitGap;
			tx -= depth*unitGap;
			depth = 0;
		}
	}
}

Control.prototype.togglePause = function() {
	var sim = this.targetSimulation;
	sim.isPaused = !(sim.isPaused);
}
Control.prototype.setDetailsTab = function(value) {
	if (value == this.detailsTab) {
		this.detailsTab = NONE;
	} else {
		this.detailsTab = value;
	}
}
Control.prototype.cycleDetailsTab = function() {
	this.detailsTab++;
	if (this.detailsTab > 4) { // hardcoded for now
		this.detailsTab = NONE;
	}
}

Control.prototype.generateWorld = function() {
	var sim = this.targetSimulation;
	sim.generateNewPlanet();
	this.needNewSpritesheet = true;
	this.selectedAgentList = [];
}
Control.prototype.openMenu = function() {
	// todo
	console.log("not implemented yet!");
}
Control.prototype.openMusicTab = function() {
	// opens tab to suitable music, Supreme Commander game opening
	var url = "https://www.youtube.com/watch?v=nywHJUe5MJg"
	window.open(url);
}
Control.prototype.toggleMute = function() {
	// todo
	console.log("not implemented yet!");
}
Control.prototype.openStats = function() {
	// todo
	console.log("not implemented yet!");
}

Control.prototype.cycleCities = function() {
	// todo
	console.log("not implemented yet!");
}
Control.prototype.selectLand = function() {
	var p = this.targetSimulation.planet;

	this.selectedAgentList = []
	for (var i=0; i<p.agent.length; i++) {
		var a = p.agent[i];
		var locomotion = agentTypes[a.type].locomotion;
		if (a.factionID == this.selectedFaction
			&& (locomotion == locomotionID.walker
				|| locomotion == locomotionID.wheeled
				|| locomotion == locomotionID.tracked
				|| locomotion == locomotionID.hover
				|| locomotion == locomotionID.amphibious
				|| locomotion == locomotionID.climber
				|| locomotion == locomotionID.mounted )) {
			this.selectedAgentList.push(i);
		}
	}
}
Control.prototype.selectSea = function() {
	var p = this.targetSimulation.planet;

	this.selectedAgentList = []
	for (var i=0; i<p.agent.length; i++) {
		var a = p.agent[i];
		var locomotion = agentTypes[a.type].locomotion;
		if (a.factionID == this.selectedFaction
			&& (locomotion == locomotionID.boat
				|| locomotion == locomotionID.ship
				|| locomotion == locomotionID.submersible )) {
			this.selectedAgentList.push(i);
		}
	}
}
Control.prototype.selectAir = function() {
	var p = this.targetSimulation.planet;

	this.selectedAgentList = []
	for (var i=0; i<p.agent.length; i++) {
		var a = p.agent[i];
		var locomotion = agentTypes[a.type].locomotion;
		if (a.factionID == this.selectedFaction
			&& (locomotion == locomotionID.copter
				|| locomotion == locomotionID.plane
				|| locomotion == locomotionID.rocket )) {
			this.selectedAgentList.push(i);
		}
	}
}
Control.prototype.selectEverything = function() {
	var p = this.targetSimulation.planet;

	this.selectedAgentList = []
	for (var i=0; i<p.agent.length; i++) {
		var a = p.agent[i];
		if (a.factionID == this.selectedFaction) {
			this.selectedAgentList.push(i);
		}
	}
}

Control.prototype.toggleVisibilityFlag = function(value) {
	this.visibilityFlags[value] = !this.visibilityFlags[value];
}
Control.prototype.toggleFullscreen = function() {
	if (!document.fullscreenElement) {
		document.documentElement.requestFullscreen();
	} else {
		if (document.exitFullscreen) {
			document.exitFullscreen();
		}
	}
}
Control.prototype.centerCamera = function(x,y) {
	var span = zoomScales[this.zoomLevel];
	var offsetX = span/2;
	var offsetY = offsetX * this.c.height/this.c.width;
	this.cameraX = x - offsetX;
	this.cameraY = y - offsetY;
}
Control.prototype.zoomIn = function(focusOnMouse) {
	this.zoomLevel--;
	if (this.zoomLevel < 0) {
		this.zoomLevel = 0;
	} else {
		if (focusOnMouse == true) {
			var offsetX = this.mouse.mapX - this.cameraX;
			this.cameraX += offsetX - zoomScales[this.zoomLevel] / zoomScales[this.zoomLevel+1] * offsetX ;

			var offsetY = this.mouse.mapY - this.cameraY;
			this.cameraY += offsetY - zoomScales[this.zoomLevel] / zoomScales[this.zoomLevel+1] * offsetY ;
		} else {
			var offsetX = (zoomScales[this.zoomLevel+1] - zoomScales[this.zoomLevel])/2;
			this.cameraX += offsetX;

			var offsetY = offsetX * this.c.height/this.c.width;
			this.cameraY += offsetY;
		}
		this.createButtons();
	}
}
Control.prototype.zoomOut = function(focusOnMouse) {
	this.zoomLevel++;
	if (this.zoomLevel >= zoomScales.length) {
		this.zoomLevel = zoomScales.length-1;
	} else {
		if (focusOnMouse == true) {
			var offsetX = this.mouse.mapX - this.cameraX;
			this.cameraX += offsetX - zoomScales[this.zoomLevel] / zoomScales[this.zoomLevel-1] * offsetX ;

			var offsetY = this.mouse.mapY - this.cameraY;
			this.cameraY += offsetY - zoomScales[this.zoomLevel] / zoomScales[this.zoomLevel-1] * offsetY ;
		} else {
			var offsetX = (zoomScales[this.zoomLevel-1] - zoomScales[this.zoomLevel])/2;
			this.cameraX += offsetX;

			var offsetY = offsetX * this.c.height/this.c.width;
			this.cameraY += offsetY;
		}
		this.createButtons();
	}
}

Control.prototype.update = function() {
	var p = this.targetSimulation.planet;
	var nextList = [];
	for (var i=0; i<this.selectedAgentList.length; i++) {
		var a = p.agent[this.selectedAgentList[i]];
		if (a.isAlive == true) {
			nextList.push(this.selectedAgentList[i]);
		}
	}
	this.selectedAgentList = nextList;

	this.handlePanning();
	this.handleHotkeys();
}
Control.prototype.handlePanning = function() {
	var m = this.mouse;
	var panDist = zoomScales[this.zoomLevel] * this.panningRate;

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

	if (m.hoveredButton == NONE && m.isOverWindow == true && this.allowMousePanning == true) {
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
Control.prototype.handleHotkeys = function() {
	for (var i=0; i<this.button.length; i++) {
		var b = this.button[i];
		if (this.keyCodes[b.hotkey] == true) {
			if (b.hotkey == 'q') { // special case for q
				this.cycleDetailsTab();
			} else {
				this[b.function](b.funcArgs);
			}
			this.keyCodes[b.hotkey] = false;
		}
	}
	if (this.keyCodes[173] == true) {
		// kludge for + in firefox
	   this.zoomOut();
	   this.keyCodes[173] = false;
	} else if (this.keyCodes[61] == true) {
	   // kludge for - in firefox
	   this.zoomIn();
	   this.keyCodes[61] = false;
	}
}

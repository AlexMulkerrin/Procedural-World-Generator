const colour = {
/* Interface elements */
background:"#eeeeff", textWhite:"#ffffff", textBlack:"#000000", textDarkBlue:"#103D7C", textDarkGreen:"#0F5123", textCyan:"#0CE3EB", point:"#FF6A00", cursor:"#9FC7ff", error:"#ff00ff",
highlight:"#bbccff", button:"#cccccc", select:"#aaaaaa",
minimap:"#ffffff",
/* Terrain tile colours */
water:"#478CC1", deepWater:"#475EC1", grassland:"#B6D53C", desert:"#FFE97F", plains:"#DAFF7F", tundra:"#ABAF69", arctic:"#EAEAEA", hills:"#707244", mountain:"#C0C0C0", forest:"#006329", jungle:"#16BC00", swamp:"#ABAFDA",
unseen:"#000000",
/* Terrain objects */
city:"#FF6A00", road:"#8E5928", field:"#FFBB00", agent:"#ffffff", moveOrder:"#00ff00"};

function Display(inSimulation) {
	this.targetSimulation = inSimulation;
	this.targetControl = {};

	this.c = document.getElementById("canvas");
	this.ctx = this.c.getContext("2d");
	this.c.width = window.innerWidth; // 770
	this.c.height = window.innerHeight; // 640

	this.textCursorX = 0;
	this.textCursorY = 0;
	this.textHeight = 20;

	var t = this;
	window.onresize = function(){t.resizeCanvas(); };
}
Display.prototype.resizeCanvas = function() {
	this.c.width = window.innerWidth;
	this.c.height = window.innerHeight;
}

Display.prototype.update = function() {
	this.clearCanvas();
	this.refresh();
}
Display.prototype.clearCanvas = function() {
	this.ctx.fillStyle = colour.background;
	this.ctx.fillRect(0, 0, this.c.width, this.c.height);
}
Display.prototype.refresh = function() {
	this.drawTerrain();
	this.drawBorders();

	this.drawRoads();
	this.drawCities();
	this.drawAgents();

	this.drawLabels();
	this.drawMinimap();

	this.drawButtons();
	this.drawCursor();
	this.drawStats();
	this.drawTooltip();
}
Display.prototype.drawTerrain = function() {
	var planet = this.targetSimulation.planet;
	var terrain = this.targetSimulation.planet.terrain;
	var control = this.targetControl;

	var screenSpan = zoomScales[control.zoomLevel];
	var incX = this.c.width/screenSpan;
	var incY = incX;

	var cx = Math.floor(control.cameraX * incX);
	var cy = Math.floor(control.cameraY * incY);
	var size = (planet.gridSize*incX);

	for (var i=0; i<terrain.width; i++) {
		for (var j=0; j<terrain.height; j++) {
			this.ctx.fillStyle = this.selectTileColour(terrain.tile[i][j]);

			var x = (i*size) - cx;
			var y = (j*size) - cy;
			this.ctx.fillRect(x,y,size,size);

			var cityID = terrain.tile[i][j].cityTerritory;
			if (cityID != NONE && terrain.tile[i][j].isFarm) {
				this.ctx.fillStyle = colour.field;
				this.drawOutline(x+2,y+2,size-4,size-4,2);
			}

			this.ctx.fillStyle = colour.textBlack;
			if (terrain.tile[i][j].desirability > 0) {
				this.ctx.fillText(terrain.tile[i][j].desirability-21,x+10,y+20);
			}

		}
	}
}
Display.prototype.drawBorders = function() {
	var adj = [ [-1,0], [0,-1],  [1,0], [0,1]];

	var planet = this.targetSimulation.planet;
	var terrain = this.targetSimulation.planet.terrain;
	var control = this.targetControl;

	var screenSpan = zoomScales[control.zoomLevel];
	var incX = this.c.width/screenSpan;
	var incY = incX;

	var cx = Math.floor(control.cameraX * incX);
	var cy = Math.floor(control.cameraY * incY);
	var size = (planet.gridSize*incX);

	for (var i=0; i<terrain.width; i++) {
		for (var j=0; j<terrain.height; j++) {

			var factionID = terrain.tile[i][j].factionInfluence;
			if (factionID != NONE) {
				var x = (i*size) - cx;
				var y = (j*size) - cy;

				this.ctx.fillStyle = planet.faction[factionID].colour;

				for (var e=0; e<adj.length; e++) {
					var nx = i + adj[e][0];
					var ny = j + adj[e][1];
					if (terrain.isInBounds(nx,ny)
					&& terrain.tile[nx][ny].factionInfluence != factionID) {
						switch(e) {
							case 0:
								this.ctx.fillRect(x,y,2,size);
								break;
							case 1:
								this.ctx.fillRect(x,y,size,2);
								break;
							case 2:
								this.ctx.fillRect(x+size-2,y,2,size);
								break;
							case 3:
								this.ctx.fillRect(x,y+size-2,size,2);
								break;
						}
						//this.drawOutline(x,y,size,size,2);
					}
				}

			}
		}
	}
}
Display.prototype.drawCities = function() {
	var planet = this.targetSimulation.planet;
	var control = this.targetControl;

	this.ctx.font = "bold 12px Verdana";

	var screenSpan = zoomScales[control.zoomLevel];
	var incX = this.c.width/screenSpan;
	var incY = incX;

	var size = 8;//Math.floor(planet.gridSize*incX);

	for (var i=0; i<planet.structure.length; i++) {
		var c = planet.structure[i];
		var x = Math.floor((c.x - control.cameraX) * incX);
		var y = Math.floor((c.y - control.cameraY) * incY);
		var r = Math.floor(c.extent * incX);
		if (r<size) r=size;

		var factionID = planet.structure[c.id].factionID;
		this.ctx.fillStyle = planet.faction[factionID].colour;
		this.ctx.fillRect(x-r/2,y-r/2,r,r);

		this.ctx.fillStyle = colour.textBlack;
		this.ctx.fillText(c.name+" "+c.population,x+1,y+2);
		this.ctx.fillStyle = colour.textCyan;
		this.ctx.fillText(c.name+" "+c.population,x,y);

	}
}
Display.prototype.drawRoads = function() {
	var adj = [ [0,-1], [0,1], [-1,0], [1,0], [-1,-1], [-1,1], [1,-1], [1,1] ];
	var mask = [];
	for (var i=0; i<adj.length; i++) {
		mask.push(Math.pow(2,i));
	}

	var planet = this.targetSimulation.planet;
	var terrain = this.targetSimulation.planet.terrain;
	var control = this.targetControl;

	var screenSpan = zoomScales[control.zoomLevel];
	var incX = this.c.width/screenSpan;
	var incY = incX;

	var cx = Math.floor(control.cameraX * incX);
	var cy = Math.floor(control.cameraY * incY);
	var size = (planet.gridSize*incX);
	var width = Math.floor(10 * incX);
	if (width < 1) width = 1;

	for (var i=0; i<terrain.width; i++) {
		for (var j=0; j<terrain.height; j++) {

			var t = terrain.tile[i][j];
			if (t.roadConnections != NONE) {
				var x = (i*size) - cx;
				var y = (j*size) - cy;

				this.ctx.fillStyle = colour.road;
				this.ctx.strokeStyle = colour.road;
				this.ctx.fillRect(x+size/2,y+size/2,width,width);

				if ((t.roadConnections & mask[0]) == mask[0]) {
					this.ctx.fillRect(x+size/2,y,width,size/2);
				}
				if ((t.roadConnections & mask[1]) == mask[1]) {
					this.ctx.fillRect(x+size/2,y+size/2,width,size/2);
				}
				if ((t.roadConnections & mask[2]) == mask[2]) {
					this.ctx.fillRect(x,y+size/2,size/2,width);
				}
				if ((t.roadConnections & mask[3]) == mask[3]) {
					this.ctx.fillRect(x+size/2,y+size/2,size/2,width);
				}
				if ((t.roadConnections & mask[4]) == mask[4]) {
					this.drawLine(x,y,x+size/2,y+size/2,width);
				}
				if ((t.roadConnections & mask[5]) == mask[5]) {
					this.drawLine(x+size/2,y+size/2,x,y+size,width);
				}
				if ((t.roadConnections & mask[6]) == mask[6]) {
					this.drawLine(x+size,y,x+size/2,y+size/2,width);
				}
				if ((t.roadConnections & mask[7]) == mask[7]) {
					this.drawLine(x+size/2,y+size/2,x+size,y+size,width);
				}
			}
		}
	}
}
Display.prototype.drawAgents = function() {
	var planet = this.targetSimulation.planet;
	var control = this.targetControl;

	this.ctx.font = "bold 8px Verdana";
	this.ctx.fillStyle = colour.city;

	var screenSpan = zoomScales[control.zoomLevel];
	var incX = this.c.width/screenSpan;
	var incY = incX;

	var size = 4;

	for (var i=0; i<planet.agent.length; i++) {
		var a = planet.agent[i];
		var x = Math.floor((a.x - control.cameraX) * incX);
		var y = Math.floor((a.y - control.cameraY) * incY);
		var r = Math.floor(a.size * incX);
		if (r<size) r=size;

		this.ctx.fillStyle = colour.agent;
		this.ctx.fillRect(x-r/2,y-r/2,r,r);

		if (a.state == stateID.moving) {
			this.ctx.fillStyle = colour.moveOrder;
			this.ctx.strokeStyle = colour.moveOrder;
			var tx = Math.floor((a.targX - control.cameraX) * incX);
			var ty = Math.floor((a.targY - control.cameraY) * incY);
			this.ctx.fillRect(tx-r/2,ty-r/2,r,r);
			this.drawLine(x,y,tx,ty,1);
		}
	}
}

Display.prototype.drawLabels = function() {
	var planet = this.targetSimulation.planet;
	var control = this.targetControl;

	this.ctx.font = "bold 16px Verdana";
	//this.ctx.shadowBlur = 2;
	//this.ctx.shadowColor= colour.textWhite;

	var screenSpan = zoomScales[control.zoomLevel];
	var incX = this.c.width/screenSpan;
	var incY = incX;

	var size = 8;//Math.floor(planet.gridSize*incX);

	for (var i=0; i<planet.terrain.regionDetails.length; i++) {
		var r = planet.terrain.regionDetails[i];
		var x = Math.floor((r.centerX*planet.gridSize - control.cameraX) * incX);
		x = x - r.name.length*5;
		var y = Math.floor((r.centerY*planet.gridSize - control.cameraY) * incY);

		switch (r.type) {
			case regionID.island:
				this.ctx.fillStyle = colour.textDarkGreen;
				break;
			case regionID.water:
				this.ctx.fillStyle = colour.textDarkBlue;
				break;
			case regionID.terrain:
				this.ctx.fillStyle = colour.textWhite;
				break;
		}

		if (r.size > screenSpan/5000000) {
			this.ctx.fillText(r.name,x,y);//+" ("+r.size+")",x,y);
			//this.ctx.strokeStyle = colour.textWhite;
			//this.ctx.strokeText(r.name+" ("+r.size+")",x,y);
		}
	}

	//this.ctx.shadowBlur = 0;
}
Display.prototype.drawMinimap = function() {
	var planet = this.targetSimulation.planet;
	var terrain = this.targetSimulation.planet.terrain;
	var control = this.targetControl;

	var sqSize = 3;
	var offsetX = 0;
	var offsetY = this.c.height - (terrain.height*sqSize);

	var minimapWidth = terrain.width * sqSize;
	var minimapHeight = terrain.height * sqSize;

	this.ctx.fillStyle = colour.unseen;
	this.ctx.fillRect(offsetX, offsetY, terrain.width*sqSize, terrain.height*sqSize);

	for (var i=0; i<terrain.width; i++) {
		for (var j=0; j<terrain.height; j++) {
			this.ctx.fillStyle = this.selectTileColour(terrain.tile[i][j]);
			var x = i*sqSize + offsetX;
			var y = j*sqSize + offsetY;
			this.ctx.fillRect(x,y,sqSize,sqSize);
		}
	}

	var screenSpan = zoomScales[control.zoomLevel];
	var screenHeight = screenSpan * this.c.height / this.c.width;

	var cw = minimapWidth * screenSpan/(terrain.width*planet.gridSize);
	var ch = minimapHeight * screenHeight/(terrain.height*planet.gridSize);

	var cx = (control.cameraX * cw/screenSpan);
	var cy = (control.cameraY * ch/screenHeight);

	if (cx<0) cx = 0;
	if (cy<0) cy =0;

	if (cx + cw > minimapWidth) cw = minimapWidth - cx;
	if (cy + ch > minimapHeight) ch = minimapHeight - cy;

	this.ctx.fillStyle = colour.minimap;
	this.drawOutline(offsetX + cx -1, offsetY + cy -1, cw+2, ch+2, 1);
}

Display.prototype.drawButtons = function() {
	var ctrl = this.targetControl;
	for (var i=0; i<ctrl.button.length; i++){
		var b = ctrl.button[i];
		if (ctrl.mouse.hoveredButton == i) {
			this.ctx.fillStyle = colour.highlight
		} else if (ctrl.selected == i){
			this.ctx.fillStyle = colour.select;
		} else {
			this.ctx.fillStyle = colour.button;
		}
		this.ctx.fillRect(b.x, b.y, b.width, b.height);

		if (b.text !== "") {
			var textSize = 16;//Math.floor(b.width/b.text.length);
			var textHeight = Math.floor((b.height-textSize)/2);
			this.ctx.font = "bold "+textSize+"px Verdana";
			this.ctx.fillStyle = colour.textBlack;
			this.ctx.fillText(b.text, b.x+4,b.y+textHeight+14);
		}
	}
}
Display.prototype.drawCursor = function() {
	var sim = this.targetSimulation;
	var control = this.targetControl;

	this.ctx.fillStyle = colour.cursor;

	var screenSpan = zoomScales[control.zoomLevel];
	var incX = this.c.width/screenSpan;
	var incY = incX;//this.c.height/sim.poleSpan;

	var m = control.mouse;
	var x = Math.floor((m.mapX - control.cameraX) * incX);
	var y = Math.floor((m.mapY - control.cameraY) * incY);

	this.ctx.fillRect(x-2,y-2,4,4);
}
Display.prototype.drawStats = function() {
	var sim = this.targetSimulation;
	var control = this.targetControl;

	this.ctx.font = "bold 16px Verdana";
	this.ctx.fillStyle = colour.textBlack;

	this.textCursorX = 10;
	this.textCursorY = 60;

	this.drawText(printFixedWidthNumber(sim.day)+"/"+printFixedWidthNumber(sim.month)+"/"+printFixedWidthNumber(sim.year)+" "+Math.floor(sim.timer/60)+"s");

	var zoom = zoomScales[control.zoomLevel];
	this.drawText("zoom level: "+control.zoomLevel+" screen span: "+printUnitsMeters(zoom));

	var m = control.mouse;
	if (m.isOverMap) {
		this.drawText("mouse map pos: "+printUnitsMeters(m.mapX)+", "+printUnitsMeters(m.mapY));
	} else {
		this.drawText("mouse map pos: -, -");
	}

	this.drawText("Camera: "+printUnitsMeters(control.cameraX)+", "+printUnitsMeters(control.cameraY));

	this.drawText("Radius: "+printUnitsMeters(sim.planet.radius));
	this.drawText("Grid size: "+sim.planet.terrain.width+","+sim.planet.terrain.height);

	var planet = this.targetSimulation.planet;
	var terrain = this.targetSimulation.planet.terrain;
	var control = this.targetControl;
	var screenSpan = zoomScales[control.zoomLevel];
	var incX = this.c.width/screenSpan;
	var size = Math.floor(planet.gridSize*incX);
	this.drawText("Tile size: "+size);

	this.drawText("Tile counts: "+sim.planet.terrain.count);
	this.drawText("Land: "+sim.planet.terrain.totalLand);

	this.drawText("Factions: "+sim.planet.faction.length);

	this.drawText("Cities: "+sim.planet.structure.length);

	this.drawText("Population: "+sim.planet.totalPop+"M");
}
Display.prototype.drawTooltip = function() {
	this.ctx.font = "bold 16px Verdana";
	var ctrl = this.targetControl;
	if (ctrl.mouse.hoveredButton>=0) {
		var b = ctrl.button[ctrl.mouse.hoveredButton];

		var textLength = this.ctx.measureText(b.tooltip).width;
		var x = ctrl.mouse.x;
		if (x > this.c.width/2) x -= (textLength+32);
		var y = ctrl.mouse.y;
		if (y > this.c.height/2) y -= 36;

		this.ctx.fillStyle = colour.textBlack;
		this.ctx.fillRect(x,y, 30+textLength, 35);

		this.ctx.fillStyle = colour.textWhite;
		this.ctx.fillText(b.tooltip, x+12,y+22);


	}
}

Display.prototype.drawOutline = function(x,y,width,height,thickness) {
	this.ctx.fillRect(x,y,width,thickness);
	this.ctx.fillRect(x,y+height-thickness,width,thickness);
	this.ctx.fillRect(x,y,thickness,height);
	this.ctx.fillRect(x+width-thickness,y,thickness,height);
}
Display.prototype.drawLine = function(x,y,x2,y2,thickness) {
	this.ctx.lineWidth = thickness;
	this.ctx.beginPath();
	this.ctx.moveTo(x, y);
	this.ctx.lineTo(x2, y2);
	this.ctx.stroke();
}
Display.prototype.drawText = function(text) {
	this.ctx.fillText(text, this.textCursorX, this.textCursorY);
	this.textCursorY += this.textHeight;
}

Display.prototype.selectTileColour = function(tile) {
	var result = colour.error;
	switch (tile.type) {
		case tileID.water:
			if (tile.elevation < 0) {
				result = colour.deepWater;
			} else {
				result = colour.water;
			}
			break;
		case tileID.grassland:
			result= colour.grassland;
			break;
		case tileID.desert:
			result = colour.desert;
			break;
		case tileID.plains:
			result = colour.plains;
			break;
		case tileID.tundra:
			result = colour.tundra;
			break;
		case tileID.arctic:
			result = colour.arctic;
			break;
		case tileID.hills:
			result = colour.hills;
			break;
		case tileID.mountain:
			result = colour.mountain;
			break;
		case tileID.forest:
			result = colour.forest;
			break;
		case tileID.jungle:
			result = colour.jungle;
			break;
		case tileID.swamp:
			result = colour.swamp;
			break;
	}
	return result;
}

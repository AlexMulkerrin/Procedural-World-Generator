const colour = {
/* Interface elements */
background:"#eeeeff", textWhite:"#ffffff", textBlack:"#000000", textDarkBlue:"#103D7C", textDarkGreen:"#0F5123", textCyan:"#0CE3EB", textRed:"#ff0000",
 point:"#FF6A00", cursor:"#9FC7ff", error:"#ff00ff",
agentHover:"#B6FF00", agentSelect:"#00ff00", agentRange:"#ff0000", agentRadar:"#00ffff", agentWreck:"#cccccc", moveOrder:"#A1CDE9", attackOrder:"#ffff00", captureOrder:"#ff0000", transportOrder:"#ff00ff",
highlight:"#bbccff", button:"#cccccc", select:"#aaaaaa",
minimap:"#ffffff", tabBackground:"#ffffff",
/* Terrain tile colours */
water:"#478CC1", deepWater:"#475EC1", grassland:"#B6D53C", desert:"#FFE97F", plains:"#DAFF7F", tundra:"#ABAF69", arctic:"#EAEAEA", hills:"#707244", mountain:"#C0C0C0", forest:"#006329", jungle:"#16BC00", swamp:"#ABAFDA",
unseen:"#000000",
/* Terrain objects */
city:"#FF6A00", road:"#8E5928", field:"#FFBB00", agent:"#ffffff"};

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

	this.spriteSheet = {};
	this.generateSpriteSheet();

}
Display.prototype.generateSpriteSheet = function() {
	this.spriteSheet = new SpriteSheet(this.targetSimulation.planet.faction);
}

Display.prototype.update = function() {
	var ctrl = this.targetControl
	if (ctrl.needNewSpritesheet == true) {
		this.generateSpriteSheet();
		ctrl.needNewSpritesheet = false;
	}
	this.clearCanvas();
	this.refresh();
	//this.ctx.drawImage(this.spriteSheet.output, 200, 0);
}
Display.prototype.clearCanvas = function() {
	this.ctx.fillStyle = colour.background;
	this.ctx.fillRect(0, 0, this.c.width, this.c.height);
}
Display.prototype.refresh = function() {
	var ctrl = this.targetControl;
	this.drawTerrain();
	if (ctrl.visibilityFlags[visibilityID.territory] == true) {
		this.drawBorders();
	}
	if (ctrl.visibilityFlags[visibilityID.improvements] == true) {
		this.drawRoads();
	}

	if (ctrl.visibilityFlags[visibilityID.labels] == true) {
		this.drawLabels();
	}

	if (ctrl.visibilityFlags[visibilityID.cities] == true) {
		this.drawCities();
	}
	if (ctrl.visibilityFlags[visibilityID.agents] == true) {
		this.drawAgents();
	}

	if (ctrl.visibilityFlags[visibilityID.interface] == true) {
		this.drawMinimap();
		this.drawEventLog();

		this.drawStats();
		this.drawButtons();
		this.drawCursor();
		this.drawTooltip();
	}
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
			var t = terrain.tile[i][j];
			this.ctx.fillStyle = this.selectTileColour(t.type, t.elevation);

			var x = (i*size) - cx;
			var y = (j*size) - cy;
			this.ctx.fillRect(x,y,size,size);

			/*
			if (terrain.tile[i][j].isShore == true) {
				this.ctx.fillStyle = colour.error;
				this.ctx.fillRect(x,y,size,size);
			}
			*/

			var cityID = terrain.tile[i][j].cityTerritory;
			var flag = this.targetControl.visibilityFlags[visibilityID.improvements];
			if (flag == true && cityID != NONE && terrain.tile[i][j].isFarm) {
				this.ctx.fillStyle = colour.field;
				this.drawOutline(x+2,y+2,size-4,size-4,2);
			}

			/*
			this.ctx.fillStyle = colour.textBlack;
			if (terrain.tile[i][j].desirability > 0) {
				console.log("good site here!");
				this.ctx.fillText(terrain.tile[i][j].desirability-21,x+10,y+20);
			}
			*/
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

		// draw city icon
		var sx = factionID*15;
		var sy = (iconShape.length-1)*(iconSymbol.length+1)*15;
		this.ctx.drawImage(this.spriteSheet.output, sx,sy,15,15, x-8, y-8, 15, 15);

		this.ctx.fillStyle = colour.textBlack;
		var text1 = c.name+" "+c.population;
		var text2 = "";
		if (c.factionID == 0 && c.currentConstruction != NONE) {
			text2 = agentTypes[c.currentConstruction].name+" "+Math.floor(c.constructionProgress*100/c.constructionTarget)+"%";
		}

		this.ctx.fillText(text1,x-30,y+22);
		this.ctx.fillText(text2,x-30,y+34);
		this.ctx.fillStyle = planet.faction[factionID].colour; //colour.textCyan;
		this.ctx.fillText(text1,x-30,y+20);
		this.ctx.fillText(text2,x-30,y+32);

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

	var screenSpan = zoomScales[control.zoomLevel];
	var incX = this.c.width/screenSpan;
	var incY = incX;

	var size = 4;

	for (var i=0; i<planet.agent.length; i++) {
		var a = planet.agent[i];
		var x = Math.floor((a.x - control.cameraX) * incX);
		var y = Math.floor((a.y - control.cameraY) * incY);
		var r = Math.floor(agentTypes[a.type].size * incX);
		if (r<size) r=size;

		var range = Math.ceil(agentTypes[a.type].range * incX);
		if (range*2 > r && a.isAlive == true) {
			this.ctx.strokeStyle = colour.agentRange;
			this.drawCircle(x,y,range);
		}
		/*
		var radar = Math.ceil(agentTypes[a.type].radar * incX);
		if (radar*2 > r && a.isAlive == true) {
			this.ctx.strokeStyle = colour.agentRadar;
			this.drawCircle(x,y,radar);
		}
		*/

		if (a.factionID == 0) {
			if (a.state == stateID.moving) {
				this.ctx.fillStyle = colour.moveOrder;
				this.ctx.strokeStyle = colour.moveOrder;
				var tx = Math.floor((a.targX - control.cameraX) * incX);
				var ty = Math.floor((a.targY - control.cameraY) * incY);
				this.ctx.fillRect(tx-r/2,ty-r/2,r,r);
				this.drawLine(x,y,tx,ty,1);
			} else if (a.state == stateID.hunting) {
				this.ctx.strokeStyle = colour.attackOrder;
				var tx = Math.floor((a.targX - control.cameraX) * incX);
				var ty = Math.floor((a.targY - control.cameraY) * incY);
				this.drawLine(x,y,tx,ty,1);
			} else if (a.state == stateID.capturing) {
				this.ctx.strokeStyle = colour.captureOrder;
				var tx = Math.floor((a.targX - control.cameraX) * incX);
				var ty = Math.floor((a.targY - control.cameraY) * incY);
				this.drawLine(x,y,tx,ty,1);
			}
		}

		// tranport related things
		if (a.state == stateID.pickingUp || a.state == stateID.transporting
			|| a.state == stateID.boarding) {
			this.ctx.strokeStyle = colour.transportOrder;
			var tx = Math.floor((a.targX - control.cameraX) * incX);
			var ty = Math.floor((a.targY - control.cameraY) * incY);
			this.drawLine(x,y,tx,ty,1);
		}


		if (a.isAlive == true) {
			this.ctx.fillStyle = planet.faction[a.factionID].colour;
		} else if (a.decay>0) {
			this.ctx.fillStyle = colour.agentWreck;
		}
		this.ctx.fillRect(x-r/2,y-r/2,r,r);

		// draw agent icon
		var sx = a.factionID*15;
		if (a.isAlive == false) {
			sx = planet.faction.length*15;
		}
		var sy = 0;
		switch (agentTypes[a.type].locomotion) {
			case locomotionID.walker:
				sy = (shapeID.walker)*(iconSymbol.length+1)*15;
				break;
			case locomotionID.mounted:
				sy = (shapeID.mounted)*(iconSymbol.length+1)*15;
				break;
			case locomotionID.wheeled:
				sy = (shapeID.wheeled)*(iconSymbol.length+1)*15;
				break;
			case locomotionID.boat:
			case locomotionID.ship:
				sy = (shapeID.ship)*(iconSymbol.length+1)*15;
				break;
			default:
				sy = 0;
				break;
		}
		if (agentTypes[a.type].transportCapacity > 0) {
			sy += 75;
		} else if (agentTypes[a.type].isIndirect == true) {
			sy += 30;
		} else if (agentTypes[a.type].range > 0) {
			sy += 15;
		}

		this.ctx.drawImage(this.spriteSheet.output, sx,sy,15,15, x-8, y-8, 15, 15);


		for (var j=0; j<control.selectedAgentList.length; j++) {
			if ( i == control.selectedAgentList[j]) {
				sx = (planet.faction.length+1)*15;
				this.ctx.drawImage(this.spriteSheet.output, sx,sy,15,15, x-8, y-8, 15, 15);
				//this.ctx.fillStyle = colour.agentSelect;
				//this.drawOutline(x-(r/2+2),y-(r/2+2),r+4,r+4,1);
			}
		}
		for (var j=0; j<control.mouse.hoveredAgentList.length; j++) {
			if ( i == control.mouse.hoveredAgentList[j]) {
				sx = (planet.faction.length+1)*15;
				this.ctx.drawImage(this.spriteSheet.output, sx,sy,15,15, x-8, y-8, 15, 15);
				//this.ctx.fillStyle = colour.agentHover;
				//this.drawOutline(x-(r/2+2),y-(r/2+2),r+4,r+4,1);
			}
		}

		// note carried agents
		if (a.cargo.length > 0) {
			this.ctx.font = "12px Verdana";
			this.ctx.fillStyle = colour.textWhite;
			this.ctx.fillText(a.cargo.length,x,y);
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
			var t = terrain.tile[i][j];
			this.ctx.fillStyle = this.selectTileColour(t.type, t.elevation);
			var x = i*sqSize + offsetX;
			var y = j*sqSize + offsetY;
			this.ctx.fillRect(x,y,sqSize,sqSize);
		}
	}

	if (control.visibilityFlags[visibilityID.minimapTerritory] == true) {
		for (var i=0; i<terrain.width; i++) {
			for (var j=0; j<terrain.height; j++) {

				var factionID = terrain.tile[i][j].factionInfluence;
				if (factionID != NONE) {
					this.ctx.fillStyle = planet.faction[factionID].colour;
					var x = i*sqSize + offsetX;
					var y = j*sqSize + offsetY;
					this.ctx.fillRect(x,y,sqSize,sqSize);
				}
			}
		}
	}

	if (control.visibilityFlags[visibilityID.minimapAgents] == true) {
		for (var i=0; i<planet.agent.length; i++) {
			var a = planet.agent[i];
			if (a.isAlive == true) {
				var x = Math.floor(a.x/planet.gridSize)*sqSize + offsetX;
				var y = Math.floor(a.y/planet.gridSize)*sqSize + offsetY;
				this.ctx.fillStyle = planet.faction[a.factionID].colour;
				// todo check contrast on faction colour
				this.ctx.fillRect(x,y,sqSize,sqSize);
			}
		}
	}

	if (control.visibilityFlags[visibilityID.minimapCities] == true) {
		for (var i=0; i<planet.structure.length; i++) {
			var c = planet.structure[i];
			var x = Math.floor(c.x/planet.gridSize)*sqSize + offsetX;
			var y = Math.floor(c.y/planet.gridSize)*sqSize + offsetY;
			this.ctx.fillStyle = colour.textWhite;
			// todo check contrast on faction colour
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
Display.prototype.drawEventLog = function() {
	var p = this.targetSimulation.planet;
	var control = this.targetControl;

	this.ctx.font = "bold 16px Verdana";
	this.ctx.fillStyle = colour.textBlack;

	// display simulation date
	this.textCursorX = 250;
	this.textCursorY = 30;

	if (p.faction[0].isAlive == false) {
		this.ctx.fillStyle = colour.textRed;
		this.drawText("You have been defeated! press 'R' to restart");
	} else {
		var leader = p.summary.factionTotals[0][0];
		var percent = Math.floor(100 * p.summary.factionTotals[0][1]/p.totalPop);
		var output = "";
		var name = p.faction[leader].name;
		if (leader == 0) {
			name += " (you)";
		}
		if (percent == 100) {
			output = "World domination by "+name+"! press 'R' to restart";
		} else if (percent > 66) {
			output = name+" faction is dominating at "+percent+"% press 'R' to restart";
		} else {
			output = name+" faction is in the lead at "+percent+"%";
		}
		this.drawText(output);
	}
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

	if (m.isDragSelecting == true) {
		var lx = Math.floor((m.lastMapX - control.cameraX) * incX);
		var ly = Math.floor((m.lastMapY - control.cameraY) * incY);

		var l,r,t,b = 0;
		l = lx;
		r = x;
		if (l>r) {
			l = x;
			r = lx;
		}
		t = ly;
		b = y;
		if (t>b) {
			t = y;
			b = ly;
		}
		this.drawOutline(l,t,r-l,b-t,2);
	}
}
Display.prototype.drawStats = function() {
	var sim = this.targetSimulation;
	var control = this.targetControl;

	this.ctx.font = "bold 16px Verdana";
	this.ctx.fillStyle = colour.textBlack;

	// display simulation date
	this.textCursorX = 50;
	this.textCursorY = 30;
	this.drawText(printFixedWidthNumber(sim.day)+"/"+printFixedWidthNumber(sim.month)+"/"+printFixedWidthNumber(sim.year)+" "+Math.floor(sim.timer/60)+"s");

	if (this.targetControl.detailsTab >= 0) {
		this.drawDetailsTab();
	}

	this.drawSelectionTab();

	this.textCursorX = this.c.width - 300;
	this.textCursorY = this.c.height - 15;
	var zoom = zoomScales[control.zoomLevel];
	this.drawText("zoom level: "+control.zoomLevel+" ("+printUnitsMeters(zoom)+")");
}
Display.prototype.drawDetailsTab = function() {
	var control = this.targetControl;

	this.ctx.fillStyle = colour.tabBackground;
	this.ctx.fillRect(4+control.detailsTab*38,42,38,38);
	this.ctx.fillRect(0,80,200,285);

	this.ctx.font = "bold 16px Verdana";
	this.ctx.fillStyle = colour.textBlack;

	this.textCursorX = 10;
	this.textCursorY = 98;

	switch (control.detailsTab) {
		case detailsID.planet:
			this.drawPlanetDetails();
			break;
		case detailsID.terrain:
			this.drawTerrainDetails();
			break;
		case detailsID.factions:
			this.drawFactionDetails();
			break;
		case detailsID.cities:
			this.drawCityDetails();
			break;
		case detailsID.agents:
			this.drawAgentDetails();
			break;
	}
}
Display.prototype.drawPlanetDetails = function() {
	var p = this.targetSimulation.planet;

	this.drawText("Planet: "+p.name);
	//this.drawText("Radius: "+printUnitsMeters(p.radius));

	var landArea = p.terrain.totalLand*(p.gridSize/1000)*(p.gridSize/1000);
	this.drawText("Land: "+Math.floor(landArea/1000000)+" Mkm^2");
	this.drawText("Factions: "+p.summary.factionTotals.length);
	this.drawText("Cities: "+p.structure.length);
	this.drawText("Population: "+p.totalPop+" M");

	//world domination bar
	var dx = 180 / p.totalPop;

	var sx = this.textCursorX;
	for (var i=0; i<p.faction.length; i++) {
		var f = p.faction[i];
		var sw = dx * f.totalPop;
		this.ctx.fillStyle = f.colour;
		this.ctx.fillRect(sx, this.textCursorY+4-this.textHeight,sw,this.textHeight);
		sx += sw;
	}
	this.ctx.fillStyle = colour.textBlack;
	this.drawOutline(this.textCursorX, this.textCursorY+4-this.textHeight,180,this.textHeight,1);
	for (var i=0; i<10; i++) {
		this.ctx.fillRect(this.textCursorX+i*18, this.textCursorY+4-this.textHeight,1,this.textHeight);
	}
	this.drawText("");

	this.drawText("Total islands: "+p.terrain.numIslands);
	for (var i=0; i<p.summary.islandTotals.length && i<6; i++) {
		var t = p.summary.islandTotals[i];
		var r = p.terrain.regionDetails[t[0]];
		switch (t[2]) {
			case NONE:
				this.drawText(r.nameShort+": "+r.size+" empty");
				break;
			case CONTESTED:
				this.drawText(r.nameShort+": "+r.size);
				break;
			case 0:
				this.ctx.fillStyle = p.faction[t[2]].colour;
				this.ctx.fillRect(this.textCursorX, this.textCursorY+4-this.textHeight,180,this.textHeight);
				this.ctx.fillStyle = colour.textBlack;
				this.drawText(r.nameShort+": "+r.size+" (you)");
				break;
			default:
				var f = p.faction[t[2]];
				this.ctx.fillStyle = f.colour;
				this.ctx.fillRect(this.textCursorX, this.textCursorY+4-this.textHeight,180,this.textHeight);
				this.ctx.fillStyle = colour.textBlack;
				this.drawText(r.nameShort+": "+r.size+" "+f.name);
				break;
		}


	}
	var other = 0;
	var otherSize = 0;
	for (var i=6; i<p.summary.islandTotals.length; i++) {
		var t = p.summary.islandTotals[i];
		other++;
		otherSize += t[1];
	}
	if (other>0) {
		this.drawText("other: ("+other+") "+otherSize);
	}
}
Display.prototype.drawTerrainDetails = function() {
	var p = this.targetSimulation.planet;
	var t = p.terrain;

	this.drawText("Grid size: ("+t.width+","+t.height+")");
	this.drawText("Tile size: "+printUnitsMeters(p.gridSize));
	this.drawText("---------");

	var tileNames = Object.keys(tileID);
	for (var i=0; i<t.count.length; i++) {
		this.ctx.fillStyle = this.selectTileColour(i, 0);
		this.ctx.fillRect(this.textCursorX, this.textCursorY+4-this.textHeight,180,this.textHeight);
		this.ctx.fillStyle = colour.textBlack;
		this.drawText(tileNames[i]+": "+t.count[i]);
	}
}
Display.prototype.drawFactionDetails = function() {
	var p = this.targetSimulation.planet;
	var selectedFaction = this.targetControl.selectedFaction;
	this.drawText("Total factions: "+p.summary.factionSum);

	for (var i=0; i<p.summary.factionTotals.length && i<11; i++) {
		var t = p.summary.factionTotals[i];
		var f = p.faction[t[0]];
		this.ctx.fillStyle = f.colour;
		this.ctx.fillRect(this.textCursorX, this.textCursorY+4-this.textHeight,180,this.textHeight);
		this.ctx.fillStyle = colour.textBlack;
		if (t[0] == selectedFaction) {
			this.drawText(f.name+" (you): C:"+f.totalStructures+" A:"+f.totalAgents);
		} else {
			this.drawText(f.name+": C:"+f.totalStructures+" A:"+f.totalAgents);
		}
	}
	var other = 0;
	for (var i=11; i<p.summary.factionTotals.length; i++) {
		other++;
	}
	if (other>0) {
		this.drawText("other: "+other);
	}
	this.drawText("defeated: "+(p.faction.length-p.summary.factionSum));

}
Display.prototype.drawCityDetails = function() {
	var p = this.targetSimulation.planet;
	var selectedFaction = this.targetControl.selectedFaction;
	this.drawText("Total cities: "+p.summary.structureSum);


	for (var i=0; i<p.summary.structureTotals.length && i<12; i++) {
		var t = p.summary.structureTotals[i];
		var s = p.structure[t[0]];
		this.ctx.fillStyle = p.faction[s.factionID].colour;
		this.ctx.fillRect(this.textCursorX, this.textCursorY+4-this.textHeight,180,this.textHeight);
		this.ctx.fillStyle = colour.textBlack;

		if (t[1]>0) {
			if (s.factionID == selectedFaction) {
				this.drawText(s.name+" (you) "+s.population+"M");
			} else {
				this.drawText(s.name+" "+s.population+"M");
			}
		}
	}
	var other = 0;
	var otherPop = 0;
	for (var i=12; i<p.summary.structureTotals.length; i++) {
		var t = p.summary.structureTotals[i][1];
		otherPop += t;
		other ++;
	}
	if (other>0) {
	this.drawText("other: "+other+" "+otherPop+"M");
	}
}
Display.prototype.drawAgentDetails = function() {
	var p = this.targetSimulation.planet;
	var selectedFaction = this.targetControl.selectedFaction;
	this.drawText("Total agents: "+p.summary.agentSum);


	for (var i=0; i<p.summary.agentTotals.length && i<12; i++) {
		var t = p.summary.agentTotals[i];
		if (t[1]>0) {
			this.ctx.fillStyle = p.faction[t[0]].colour;
			this.ctx.fillRect(this.textCursorX, this.textCursorY+4-this.textHeight,180,this.textHeight);
			this.ctx.fillStyle = colour.textBlack;
			if (t[0] == selectedFaction) {
				this.drawText(p.faction[t[0]].name+" (you) "+t[1]);
			} else {
				this.drawText(p.faction[t[0]].name+" "+t[1]);
			}
		}
	}
	var other = 0;
	for (var i=12; i<p.summary.agentTotals.length; i++) {
		var t = p.summary.agentTotals[i];
		if (t[1]>0) {
			other += t[1];

		}
	}
	if (other>0) {
	this.drawText("other: "+other);
	}
}

Display.prototype.drawSelectionTab = function() {
	var control = this.targetControl;
	var p = this.targetSimulation.planet;
	var m = control.mouse;

	this.ctx.fillStyle = colour.tabBackground;
	var x = this.c.width - 200;
	this.ctx.fillRect(x,80,200,285);

	this.ctx.font = "bold 16px Verdana";
	this.ctx.fillStyle = colour.textBlack;

	this.textCursorX = x + 10;
	this.textCursorY = 98;

	this.drawText("tile details:");
	if (m.isOverMap == true) {
		var t = p.terrain.tile[m.tileX][m.tileY];
		var typeName = Object.keys(tileID)[t.type];
		//this.drawText(typeName);

		var r = p.terrain.regionDetails;
		this.drawText(r[t.islandID].name);

		this.ctx.fillStyle = this.selectTileColour(t.type, t.elevation);
		this.ctx.fillRect(this.textCursorX, this.textCursorY+4-this.textHeight,180,this.textHeight);
		this.ctx.fillStyle = colour.textBlack;

		if (t.regionID != NONE) {
			this.drawText(r[t.regionID].name);
		} else {
			if (t.isCoastalWater == true) {
				this.drawText("coastal water");
			} else {
				this.drawText("deep water");
			}
		}

		if (t.cityTerritory != NONE) {
			this.drawText(p.structure[t.cityTerritory].name+" city region");
		} else {
			this.drawText("no nearby city");
		}

		if (t.factionInfluence != NONE) {
			var f = p.faction[t.factionInfluence];
			this.ctx.fillStyle = f.colour;
			this.ctx.fillRect(this.textCursorX, this.textCursorY+4-this.textHeight,180,this.textHeight);
			this.ctx.fillStyle = colour.textBlack;
			this.drawText(p.faction[t.factionInfluence].name+" territory");
		} else {
			this.drawText("unowned");
		}

	} else {
		this.drawText("none");
	}

	var hovered = control.mouse.hoveredAgentList;
	if (hovered.length > 1) {
		this.drawText("hovered agents: " + hovered.length);
		for (var i=0; i<hovered.length; i++) {
			var a = p.agent[hovered[i]];
			this.drawText(p.faction[a.factionID].name + " "+ agentTypes[a.type].name+" "+a.state);
		}
	} else if (hovered.length == 1) {
		this.drawText("hovered agent:");
		var a = p.agent[hovered[0]];
		this.drawText(p.faction[a.factionID].name + " "+ agentTypes[a.type].name+" "+a.state);
	} else {
		this.drawText("hovered agent:");
		this.drawText("none");
	}

	var f = p.faction[control.selectedFaction]
	this.ctx.fillStyle = f.colour;
	this.ctx.fillRect(this.textCursorX, this.textCursorY+4-this.textHeight,180,this.textHeight);
	this.ctx.fillStyle = colour.textBlack;
	this.drawText("faction "+f.name+":");

	var selected = control.selectedAgentList;
	if (selected.length > 1) {
		this.drawText("selected agents: " + selected.length);
		for (var i=0; i<selected.length; i++) {
			var a = p.agent[selected[i]];
			this.drawText(agentTypes[a.type].name);
		}
	} else if (selected.length == 1) {
		this.drawText("selected agent:");
		var a = p.agent[selected[0]];
		this.drawText(agentTypes[a.type].name);
	} else {
		this.drawText("selected agent:");
		this.drawText("none");
	}

	this.drawText("hovered city:");
	var hoveredCity = control.mouse.hoveredCity;
	if (hoveredCity == NONE) {
		this.drawText("none")
	} else {
		var s = p.structure[hoveredCity];
		this.drawText(p.faction[s.factionID].name+" "+s.name+" "+s.population+"M")
	}
}

Display.prototype.drawTooltip = function() {
	this.ctx.font = "bold 16px Verdana";
	var ctrl = this.targetControl;
	if (ctrl.mouse.hoveredButton>=0) {
		var b = ctrl.button[ctrl.mouse.hoveredButton];
		var text = b.tooltip+" ("+b.hotkey.toUpperCase()+")";

		var textLength = this.ctx.measureText(text).width;
		var x = ctrl.mouse.x;
		if (x > this.c.width/2) x -= (textLength+32);
		var y = ctrl.mouse.y;
		if (y > this.c.height/2) y -= 36;

		this.ctx.fillStyle = colour.textBlack;
		this.ctx.fillRect(x,y, 30+textLength, 35);

		this.ctx.fillStyle = colour.textWhite;
		this.ctx.fillText(text, x+12,y+22);


	}
}

Display.prototype.drawCircle = function(x,y,radius) {
	this.ctx.beginPath();
	this.ctx.arc(x, y, radius, 0, 2 * Math.PI);
	this.ctx.stroke();
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

Display.prototype.selectTileColour = function(type, elevation) {
	var result = colour.error;
	switch (type) {
		case tileID.water:
			if (elevation < 0) {
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

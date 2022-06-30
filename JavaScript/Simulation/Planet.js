

function Planet(inRadius, inRadiusVariation) {
	this.name = randomName();
	this.radius = Math.floor(inRadius * (1 + Math.random()*inRadiusVariation*2 - inRadiusVariation));
	this.circumference = Math.floor(2*Math.PI*this.radius);
	this.poleSpan = Math.floor(this.circumference/2);

	this.gridSize = 500000;
	var width = Math.floor(this.circumference/this.gridSize);
	var height = Math.floor(this.poleSpan/this.gridSize);
	this.terrain = new Terrain(width,height);
	this.gridCircumference = width*this.gridSize;

	this.structure = [];
	this.faction = [];
	this.totalPop = 0;
	this.generateCities();

	this.agent = [];
	this.generateAgents(100);

	this.summary = new Summary();
	this.generateSummary();

}
Planet.prototype.generateCities = function() {
	var sites = [];
	for (var i=0; i<this.terrain.width; i++) {
		for (var j=0; j<this.terrain.height; j++) {
			var t = this.terrain.tile[i][j];
			if (t.desirability>0) {
				sites.push([i, j]);
			}
		}
	}

	while (sites.length > 0) {
		var bestValue = 0;
		var index = 0;
		for (var i=0; i<sites.length; i++) {
			var d = this.terrain.tile[sites[i][0]][sites[i][1]].desirability;
			if (d > bestValue) {
				bestValue = d;
				index = i;
			}
		}
		this.generateCity(sites[index][0], sites[index][1], bestValue);

		var nextSites = [];
		for (var i=0; i<sites.length; i++) {
			this.terrain.setDesirability(sites[i][0],sites[i][1]);

			var t = this.terrain.tile[sites[i][0]][sites[i][1]];
			if (t.desirability > 0) {
				nextSites.push(sites[i]);
			}
		}
		sites = nextSites;
	}
	this.terrain.setRoadConnections();
}
Planet.prototype.generateCity = function(tileX, tileY, value) {
	var id = this.structure.length;
	var pop = Math.floor(value/2);
	var x, y = 0;

	// clunky code to place coastal cities on the coast
	var isHarbour = false;
	var connections = this.terrain.tile[tileX][tileY].ShoreConnections;
	if ( connections != NONE) {
		isHarbour = true;
		var extent = Math.floor(Math.sqrt(100 * pop * 1000000)/2);

		if ((connections & 1) == 1) { // upwards coast
			x = tileX * this.gridSize + Math.floor(this.gridSize/2);
			y = tileY * this.gridSize + extent;
		} else if ((connections & 2) == 2) { // rightwards coast
			x = tileX * this.gridSize + this.gridSize - extent;
			y = tileY * this.gridSize + Math.floor(this.gridSize/2);
		} else if ((connections & 4) == 4) {  // downwards coast
			x = tileX * this.gridSize + Math.floor(this.gridSize/2);
			y = tileY * this.gridSize + this.gridSize - extent;
		} else if ((connections & 8) == 8) { // leftwards coast
			x = tileX * this.gridSize + extent;
			y = tileY * this.gridSize + Math.floor(this.gridSize/2);
		}

	} else {
		x = tileX * this.gridSize + Math.floor(this.gridSize/2);
		y = tileY * this.gridSize + Math.floor(this.gridSize/2);
	}


	var currentFactionID = this.terrain.tile[tileX][tileY].factionInfluence;
	if (currentFactionID == NONE) {
		currentFactionID = this.faction.length;

		this.faction.push(new Faction(currentFactionID));
	}
	this.structure.push(new Structure(id, x, y, tileX, tileY, pop, currentFactionID, isHarbour));
	this.terrain.setCityTerritory(id, tileX, tileY);
	this.terrain.setFactionInfluence(currentFactionID, tileX, tileY);
	this.totalPop += pop;
}
Planet.prototype.generateAgents = function(num) {
	// make some ships for naval battles
	/*
	for (var i=0; i<num; i++) {
		var pos = this.terrain.getValidPosition(locomotionID.ship);
		var x = pos.x*this.gridSize + randomInteger(this.gridSize);
		var y = pos.y*this.gridSize + randomInteger(this.gridSize);
		var factionID = randomInteger(this.faction.length);

		this.agent.push(new Agent(x, y, agentTypeID.battleship, factionID));
	}
	*/
	/*
	// make some land combat units
	for (var i=0; i<num; i++) {
		var pos = this.terrain.getValidPosition(locomotionID.walker);
		var x = pos.x*this.gridSize + randomInteger(this.gridSize);
		var y = pos.y*this.gridSize + randomInteger(this.gridSize);
		var size = 100;
		var factionID = randomInteger(this.faction.length);

		this.agent.push(new Agent(x, y, agentTypeID.warrior, factionID));
	}
	*/
	// make city defenders
	for (var i=0; i<this.structure.length; i++) {
		var s = this.structure[i];

		if (s.isHarbour == true) {
			this.agent.push(new Agent(s.x, s.y, agentTypeID.galley, s.factionID));
		} 
		this.agent.push(new Agent(s.x, s.y, agentTypeID.warrior, s.factionID));
	}


}

function Summary() {
	this.agentSum = 0;
	this.agentTotals = [];

	this.factionSum = 0;
	this.factionTotals = [];
}

Planet.prototype.generateSummary = function() {
	this.summary.agentSum = 0;
	this.summary.agentTotals = [];
	for (var i=0; i<this.faction.length; i++) {
		var f = this.faction[i];
		this.summary.agentSum += f.totalAgents;
		this.summary.agentTotals.push([i,f.totalAgents]);
	}
	this.summary.agentTotals.sort(function(a, b){return b[1] - a[1]});
/*
	this.summary.factionSum = 0;
	this.summary.factionTotals = [];
	for (var i=0; i<this.faction.length; i++) {

		this.summary.agentTotals.push([i,0]);
	}
	for (var i=0; i<this.agent.length; i++) {
		var a = this.agent[i];
		if (a.isAlive == true) {
			var f = this.agent[i].factionID;
			this.summary.agentTotals[f][1]++;
			this.summary.agentSum++;
		}
	}
	this.summary.agentTotals.sort(function(a, b){return b[1] - a[1]});
	*/
}

Planet.prototype.checkAgentMove = function(a,nx,ny) {
	var tx = Math.floor(nx/this.gridSize);
	var ty = Math.floor(ny/this.gridSize);
	if (this.terrain.isInBounds(tx,ty) == true) {
		var t = this.terrain.tile[tx][ty];
		switch (agentTypes[a.type].locomotion) {
			case locomotionID.ship:
			case locomotionID.boat:
				if (t.type == tileID.water) {
					return true;
				} else if (this.checkWithinCityBounds(nx,ny) == true) {
					return true;
				}
				break;
			default:
				if (t.type != tileID.water) {
					return true;
				}
				break;
		}
	}
	return false;
}
Planet.prototype.checkWithinCityBounds = function(nx,ny) {
	for (var i=0; i<this.structure.length; i++) {
		var s = this.structure[i];
		if (nx>(s.x-s.extent/2) && nx<(s.x+s.extent/2)
		&& ny>(s.y-s.extent/2) && ny<(s.y+s.extent/2) ) {
			return true;
		}
	}
	return false;
}

Planet.prototype.checkSameIsland = function(a,nx,ny) {
	var x = Math.floor(a.x/this.gridSize);
	var y = Math.floor(a.y/this.gridSize);
	var tx = Math.floor(nx/this.gridSize);
	var ty = Math.floor(ny/this.gridSize);
	if (this.terrain.isInBounds(x,y) == true
	&& this.terrain.isInBounds(tx,ty) == true) {
		var t1 = this.terrain.tile[x][y];
		var t2 = this.terrain.tile[tx][ty];
		if (t1.islandID == t2.islandID) {
			return true;
		}
	}
	return false;
}

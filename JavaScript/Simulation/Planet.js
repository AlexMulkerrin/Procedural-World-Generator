

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
	this.totalPop =0;
	this.generateCities();

	this.agent = [];
	this.generateAgents(100);

	this.summary = [];
	this.generateSummaries();
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

		var id = this.structure.length;
		var x = sites[index][0] * this.gridSize + Math.floor(this.gridSize/2);
		var y = sites[index][1] * this.gridSize + Math.floor(this.gridSize/2);
		var pop = Math.floor(bestValue/2);

		var currentFactionID = this.terrain.tile[sites[index][0]][ sites[index][1]].factionInfluence;
		if (currentFactionID == NONE) {
			currentFactionID = this.faction.length;

			this.faction.push(new Faction(currentFactionID));
		}
		this.structure.push(new Structure(id, x, y, pop, currentFactionID));
		this.terrain.setCityTerritory(id, sites[index][0], sites[index][1]);
		this.terrain.setFactionInfluence(currentFactionID, sites[index][0], sites[index][1]);
		this.totalPop += pop;


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
Planet.prototype.generateAgents = function(num) {
	for (var i=0; i<num; i++) {
		var pos = this.terrain.getValidPosition(locomotionID.ship);
		var x = pos.x*this.gridSize + randomInteger(this.gridSize);
		var y = pos.y*this.gridSize + randomInteger(this.gridSize);
		var size = 100;
		var factionID = randomInteger(this.faction.length);

		this.agent.push(new Agent(x, y, agentTypeID.battleship, factionID));
	}
}
Planet.prototype.generateSummaries = function() {

}

Planet.prototype.checkAgentMove = function(a,nx,ny) {
	var tx = Math.floor(nx/this.gridSize);
	var ty = Math.floor(ny/this.gridSize);
	if (this.terrain.isInBounds(tx,ty) == true) {
		var t = this.terrain.tile[tx][ty];
		switch (agentTypes[a.type].locomotion) {
			case locomotionID.ship:
				if (t.type == tileID.water) {
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

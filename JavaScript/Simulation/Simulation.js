const tileID = {water:0, grassland:1, desert:2, plains:3, tundra:4, arctic:5, hills:6, mountain:7, forest:8, jungle:9, swamp:10};
const tileValue = [1,2,1,1,1,0,1,0,1,1,1];

const regionID = {island:0, water:1, terrain:2};

const fatCross = [
	[0,0],[-1,0],[0,-1],[1,0],[0,1],[-2,0],[0,-2],[2,0],[0,2],
	[-1,-1],[1,-1],[1,1],[-1,1],[-2,1],[1,-2],[2,1],[1,2],
	[-2,-1],[-1,-2],[2,-1],[-1,2]
];

const islandClasses = [ ["pangea", 500], ["continent", 250], ["sub continent", 100], ["island", 25], ["islet", 6], ["atoll", 0] ];

const waterClasses = [ ["world ocean", 1000], ["ocean", 100], ["sea", 4], ["lake", 0] ];

const stateID = {idle:0, moving:1};

const locomotionID = {ship:0};

function Simulation() {
	this.timer = 0;
	this.year = 0;
	this.month = 0;
	this.day = 0;

	this.planet = new Planet(6371000,0);
}

function Planet(inRadius, inRadiusVariation) {
	this.radius = Math.floor(inRadius * (1 + Math.random()*inRadiusVariation*2 - inRadiusVariation));
	this.circumference = Math.floor(2*Math.PI*this.radius);
	this.poleSpan = Math.floor(this.circumference/2);

	this.gridSize = 500000;
	var width = Math.floor(this.circumference/this.gridSize);
	var height = Math.floor(this.poleSpan/this.gridSize);
	this.terrain = new Terrain(width,height);
	this.gridCircumference = width*this.gridSize;

	this.city = [];
	this.faction = [];
	this.totalPop =0;
	this.generateCities();

	this.agent = [];
	this.generateAgents(100);
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

		var id = this.city.length;
		var x = sites[index][0] * this.gridSize + Math.floor(this.gridSize/2);
		var y = sites[index][1] * this.gridSize + Math.floor(this.gridSize/2);
		var pop = Math.floor(bestValue/2);

		var currentFactionID = this.terrain.tile[sites[index][0]][ sites[index][1]].factionInfluence;
		if (currentFactionID == NONE) {
			currentFactionID = this.faction.length;

			this.faction.push(new Faction(currentFactionID));
		}
		this.city.push(new City(id, x, y, pop, currentFactionID));
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
function City(inID, inX, inY, inPop, inFactionID) {
	this.id = inID;
	this.name = randomName();
	this.x = inX;
	this.y = inY;
	this.population = inPop;
	this.extent = Math.sqrt(100 * this.population * 1000000);
	this.factionID = inFactionID;
}

function Faction(inID) {
	this.id = inID;
	this.name = randomName();
	this.colour = randomColour();

	this.totalCities = 0;
	this.totalPop = 0;
}

Planet.prototype.generateAgents = function(num) {
	for (var i=0; i<num; i++) {
		var pos = this.terrain.getValidPosition(locomotionID.ship);
		var x = pos.x*this.gridSize + randomInteger(this.gridSize);
		var y = pos.y*this.gridSize + randomInteger(this.gridSize);
		var size = 100;
		var factionID = randomInteger(this.faction.length);

		this.agent.push(new Agent(x, y, size, locomotionID.ship, factionID));
	}
}
function Agent(inX, inY, inSize, inLocomotion, inFactionID) {
	this.x = inX;
	this.y = inY;
	this.size = inSize;
	this.locomotion = inLocomotion;
	this.faction = inFactionID;

	this.state = stateID.idle;
	this.vx = 0;
	this.vy = 0;
	this.targX = 0;
	this.targY = 0;
}
Planet.prototype.checkAgentMove = function(a,nx,ny) {
	var tx = Math.floor(nx/this.gridSize);
	var ty = Math.floor(ny/this.gridSize);
	if (this.terrain.isInBounds(tx,ty) == true) {
		var t = this.terrain.tile[tx][ty];
		switch (a.locomotion) {
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

function Terrain(inWidth, inHeight) {
	this.width = inWidth;
	this.height = inHeight;

	this.border = 2;
	this.totalLand = 0;
	this.landRatio = 0.3;

	this.temperatureParameter = 1;
	this.climateParameter = 1;
	this.ageParameter = 1;

	this.tile = [];
	for (var i=0; i<this.width; i++) {
		this.tile[i] = [];
		for (var j=0; j<this.height; j++) {
			this.tile[i][j] = new Tile();
		}
	}
	this.generateLandmass();
	this.generateTemperature();
	this.generateRainfall();
	this.generateErosion();
	this.generateRivers();

	this.identifyCoast();

	this.regionDetails = [];
	this.identifyIslands();
	this.identifyWaters();
	this.identifyRegions();

	this.count = [];
	this.countTiles();
	this.resetGlobalDesirability();
}
Terrain.prototype.generateLandmass = function() {
	var stencil = [], sx, sy, direc;
	var stamp = [[0,0], [1,0], [0,1], [-1,0], [0,-1]];
	var adj = [[1,0], [0,1], [-1,0], [0,-1]];
	var desiredLand = (this.width-2*this.border)*(this.height-2*this.border)*this.landRatio;
	while (this.totalLand < desiredLand) {
		stencil = create2DArray(this.width, this.height, 0);
		sx = randomInteger(this.width - 2*this.border) + this.border;
		sy = randomInteger(this.height - 2*this.border) + this.border;
		for (var i = randomInteger(63)+1; i>0 && this.isWithinBorders(sx,sy); i--) {
			for (var e=0; e<stamp.length; e++) {
				stencil[sx+stamp[e][0]][sy+stamp[e][1]] = 1;
			}
			direc = randomChoice(adj);
			sx += direc[0];
			sy += direc[1];
		}
		for (var i=0; i<this.width; i++) {
			for (var j=0; j<this.height; j++) {
				if (stencil[i][j]>0) {
					this.tile[i][j].elevation++;
					if (this.tile[i][j].type == tileID.water) {
						this.tile[i][j].type = tileID.grassland;
						this.totalLand++;
					}
				}
			}
		}
	}
	for (var i=0; i<this.width; i++) {
		for (var j=0; j<this.height; j++) {
			if (this.tile[i][j].elevation>2) {
				this.tile[i][j].type = tileID.mountain;
			} else if (this.tile[i][j].elevation>1) {
				this.tile[i][j].type = tileID.hills;
			}
		}
	}
}
Terrain.prototype.generateTemperature = function() {
	var equator = Math.floor(this.height/2);
	var scale = Math.floor(equator/4);
	for (var i=0; i<this.width; i++) {
		for (var j=0; j<this.height; j++) {
			var t = this.tile[i][j]

			var lat = Math.abs(j-equator); // j-29;
			var temp = equator - lat;
			temp += randomInteger(8)-4;
			temp -= 4*(1 - this.temperatureParameter);
			temp = Math.floor(temp/(scale+1));
			if (temp > 3) temp = 3;
			if (temp < 0) temp = 0;
			t.temperature = temp;

			if (t.elevation == 1) {
				switch (temp) {
					case 0:
						this.tile[i][j].type = tileID.arctic;
						break;
					case 1:
						this.tile[i][j].type = tileID.tundra;
						break;
					case 2:
						this.tile[i][j].type = tileID.plains;
						break;
					case 3:
						this.tile[i][j].type = tileID.desert;
						break;
				}
			}
		}
	}
}
Terrain.prototype.generateRainfall = function() {
	var equator = Math.floor(this.height/2);
	var midLat = Math.floor(equator/2);
	for (var j=0; j<this.height; j++) {
		var wet = 0;
		var lat = equator - j;
		for (var i=0; i<this.width; i++) {
			var t = this.tile[i][j];
			if (t.elevation == 0) {
				var yield = Math.abs(lat-midLat)+this.climateParameter*4;
				if (yield>wet) wet++;
			} else if (wet > 0) {
				wet -= randomInteger(8-this.climateParameter*2);
				t.rainfall++;
				switch (t.type) {
					case tileID.tundra:
					 	//t.type = tileID.swamp;
						break;
					case tileID.plains:
					 	t.type = tileID.grassland;
						break;
					case tileID.desert:
					 	t.type = tileID.plains;
						break;
					case tileID.hills:
					 	t.type = tileID.forest;
						break;
					case tileID.mountain:
					 	wet -=3;
						break;
				}
			}
		}

		wet = 0;
		for (var i=this.width-1; i>=0; i--) {
			var t = this.tile[i][j];
			if (t.elevation == 0) {
				var yield = Math.abs(lat-midLat)+this.climateParameter*4;
				if (yield>wet) wet++;
			} else if (wet > 0) {
				wet -= randomInteger(8-this.climateParameter*2);
				t.rainfall++;
				switch (t.type) {
					case tileID.tundra:
					 	if (t.rainfall>1) t.type = tileID.swamp;
						break;
					case tileID.plains:
					 	t.type = tileID.grassland;
						break;
					case tileID.desert:
					 	t.type = tileID.plains;
						break;
					case tileID.hills:
					 	t.type = tileID.forest;
						break;
					case tileID.mountain:
					 	wet -=3;
						break;
					case tileID.grassland:
						if (lat<midLat) {
							t.type = tileID.jungle;
						} else {
					 		t.type = tileID.swamp;
						}
						break;

				}
			}
		}

	}
}
Terrain.prototype.generateErosion = function() {
	var iterations = 800 * (1 + this.ageParameter);
	var sx, sy;
	var adj = [[1,0], [0,1], [-1,0], [0,-1], [1,1], [-1,1], [1,-1], [-1,-1]];
	for (var i=0; i<iterations; i++) {
		if (i % 2 == 0) {
			sx = randomInteger(this.width);
			sy = randomInteger(this.height);
		} else {
			var temp = randomChoice(adj);
			sx += temp[0];
			sy += temp[1];
			if (sx<0) sx=0;
			if (sx>this.width-1) sx=this.width-1;
			if (sy<0) sy=0;
			if (sy>this.height-1) sy=this.height-1;
		}

		var t = this.tile[sx][sy];
		switch (t.type) {
			case tileID.forest:
				t.type = tileID.jungle;
				break;
			case tileID.swamp:
				t.type = tileID.grassland;
				break;
			case tileID.plains:
				t.elevation = 2;
				t.type = tileID.hills;
				break;
			case tileID.tundra:
				t.elevation = 2;
				t.type = tileID.hills;
				break;
			case tileID.grassland:
				t.type = tileID.forest;
				break;
			case tileID.jungle:
				t.type = tileID.swamp;
				break;
			case tileID.hills:
				t.elevation = 3;
				t.type = tileID.mountain;
				break;
			case tileID.mountain:
				t.elevation = 0;
				t.type = tileID.water;
				break;
			case tileID.desert:
				t.type = tileID.plains;
				break;
			case tileID.arctic:
				t.elevation = 3;
				t.type = tileID.mountain;
				break;

		}
	}
}
Terrain.prototype.generateRivers = function() { // TODO

}

Terrain.prototype.identifyCoast = function() {
	var adj = [ [0,-1], [1,-1], [1,0], [1,1], [0,1], [-1,1], [-1,0], [-1,-1] ];
	for (var i=0; i<this.width; i++) {
		for (var j=0; j<this.height; j++) {
			var t = this.tile[i][j];
			var isWater = false;
			if (t.type == tileID.water) isWater = true;

			for (var e=0; e<adj.length; e++) {
				var nx = i + adj[e][0];
				var ny = j + adj[e][1];
				if (this.isInBounds(nx,ny)) {
					if (isWater) {
						if (this.tile[nx][ny].type != tileID.water) {
							t.isCoastalWater = true;
						}
					} else {
						if (this.tile[nx][ny].type == tileID.water) {
							t.isShore = true;
						}
					}
				}

			}
		}
	}

	for (var i=0; i<this.width; i++) {
		for (var j=0; j<this.height; j++) {
			var t = this.tile[i][j];
			var isWater = false;
			if (t.type == tileID.water && t.isCoastalWater == false) {
				t.elevation = -1;
			}
		}
	}
}
Terrain.prototype.identifyIslands = function() {
	var adj = [ [-1,0], [0,-1], [1,0], [0,1] ];
	var islandStats = [];
	var currentIslandID = 0;
	var foundAll = false;
	var checklist = [], nextCheck = [];
	var found = false;
	var i = 0, j = 0;

	while (foundAll == false) {
		checklist = [];
		nextCheck = [];
		found = false;
		i = 0;
		j = 0;
		// find unassigned island tile
		while (found == false && j<this.height) {
			if (this.tile[i][j].type != tileID.water && this.tile[i][j].islandID == NONE) {
				found = true;
				checklist = [[i,j]];
				this.tile[i][j].islandID = currentIslandID;
				islandStats = {num:1, x:i+0.5, y:j+0.5};
			}
			i++;
			if (i >= this.width) {
				j++;
				i = 0;
			}
		}
		if (found == false) {
			foundAll = true;
		}
		// floodfill island id
		while (checklist.length > 0) {
			for (var k=0; k<checklist.length; k++) {
				for (var e=0; e<adj.length; e++) {
					var nx = checklist[k][0] + adj[e][0];
					var ny = checklist[k][1] + adj[e][1];
					if (this.isInBounds(nx,ny)
					&& this.tile[nx][ny].type != tileID.water
					&& this.tile[nx][ny].islandID == NONE) {
						this.tile[nx][ny].islandID = currentIslandID;
						islandStats.num++;
						islandStats.x += nx+0.5;
						islandStats.y += ny+0.5;
						nextCheck.push ( [nx, ny] );
					}
				}
			}
			checklist = nextCheck;
			nextCheck = [];
		}

		if (foundAll == false) {
			this.regionDetails.push(new RegionDetails(regionID.island, islandStats, NONE));
		}
		currentIslandID++;
	}
}
Terrain.prototype.identifyWaters = function() {
	var adj = [ [-1,0], [0,-1], [1,0], [0,1] ];
	var waterStats = [];
	var currentWaterID = this.regionDetails.length;
	var foundAll = false;
	var checklist = [], nextCheck = [];
	var found = false;
	var i = 0, j = 0;

	while (foundAll == false) {
		checklist = [];
		nextCheck = [];
		found = false;
		i = 0;
		j = 0;
		// find unassigned water tile
		while (found == false && j<this.height) {
			if (this.tile[i][j].type == tileID.water && this.tile[i][j].islandID == NONE) {
				found = true;
				checklist = [[i,j]];
				this.tile[i][j].islandID = currentWaterID;
				waterStats = {num:1, x:i+0.5, y:j+0.5};
			}
			i++;
			if (i >= this.width) {
				j++;
				i = 0;
			}
		}
		if (found == false) {
			foundAll = true;
		}
		// floodfill water id
		while (checklist.length > 0) {
			for (var k=0; k<checklist.length; k++) {
				for (var e=0; e<adj.length; e++) {
					var nx = checklist[k][0] + adj[e][0];
					var ny = checklist[k][1] + adj[e][1];
					if (this.isInBounds(nx,ny)
					&& this.tile[nx][ny].type == tileID.water
					&& this.tile[nx][ny].islandID == NONE) {
						this.tile[nx][ny].islandID = currentWaterID;
						waterStats.num++;
						waterStats.x += nx+0.5;
						waterStats.y += ny+0.5;
						nextCheck.push ( [nx, ny] );
					}
				}
			}
			checklist = nextCheck;
			nextCheck = [];
		}

		if (foundAll == false) {
			this.regionDetails.push(new RegionDetails(regionID.water, waterStats, tileID.water));
		}
		currentWaterID++;
	}
}
Terrain.prototype.identifyRegions = function() {
	var adj = [ [-1,0], [0,-1], [1,0], [0,1] ];
	var regionStats = [];
	var currentRegionID = this.regionDetails.length;
	var foundAll = false;
	var checklist = [], nextCheck = [];
	var found = false;
	var i = 0, j = 0;

	while (foundAll == false) {
		checklist = [];
		nextCheck = [];
		found = false;
		i = 0;
		j = 0;
		// find unassigned land tile
		while (found == false && j<this.height) {
			if (this.tile[i][j].type != tileID.water && this.tile[i][j].regionID == NONE) {
				found = true;
				checklist = [[i,j]];
				this.tile[i][j].regionID = currentRegionID;
				regionStats = {num:1, x:i+0.5, y:j+0.5, type:this.tile[i][j].type};
			}
			i++;
			if (i >= this.width) {
				j++;
				i = 0;
			}
		}
		if (found == false) {
			foundAll = true;
		}
		// floodfill terrain type id
		while (checklist.length > 0) {
			for (var k=0; k<checklist.length; k++) {
				for (var e=0; e<adj.length; e++) {
					var nx = checklist[k][0] + adj[e][0];
					var ny = checklist[k][1] + adj[e][1];
					if (this.isInBounds(nx,ny)
					&& this.tile[nx][ny].type == regionStats.type
					&& this.tile[nx][ny].regionID == NONE) {
						this.tile[nx][ny].regionID = currentRegionID;
						regionStats.num++;
						regionStats.x += nx+0.5;
						regionStats.y += ny+0.5;
						nextCheck.push ( [nx, ny] );
					}
				}
			}
			checklist = nextCheck;
			nextCheck = [];
		}

		if (foundAll == false) {
			this.regionDetails.push(new RegionDetails(regionID.terrain, regionStats, regionStats.type));
		}
		currentRegionID++;
	}
}

function RegionDetails(inType, inStats, inTileType) {
	this.type = inType;
	this.size = inStats.num;
	this.tileType = inTileType;
	this.sizeClass = "NONE";
	if (this.type == regionID.island) {
		var i=0;
		while (this.sizeClass == "NONE") {
			if (this.size >= islandClasses[i][1]) {
				this.sizeClass = islandClasses[i][0];
			}
			i++;
		}
		this.name = this.sizeClass+ " of "+randomName();

	} else if (this.type == regionID.water) {
		var i=0;
		while (this.sizeClass == "NONE") {
			if (this.size >= waterClasses[i][1]) {
				this.sizeClass = waterClasses[i][0];
			}
			i++;
		}
		this.name = randomName() +" "+this.sizeClass;

	} else if (this.type == regionID.terrain) {
		var typeName = Object.keys(tileID)[this.tileType];
		this.name = randomName() +" "+typeName;
	}
	this.centerX = inStats.x / this.size;
	this.centerY = inStats.y / this.size;
}

Terrain.prototype.countTiles = function() {
	this.totalLand = 0;

	var typeNum = Object.keys(tileID).length;
	for (var i=0; i<typeNum; i++) {
		this.count[i] = 0;
	}

	for (var i=0; i<this.width; i++) {
		for (var j=0; j<this.height; j++) {
			var t = this.tile[i][j]
			this.count[t.type]++;
			if (t.type != tileID.water) this.totalLand++;
		}
	}
}
Terrain.prototype.resetGlobalDesirability = function() {
	for (var i=0; i<this.width; i++) {
		for (var j=0; j<this.height; j++) {
			if (this.tile[i][j].type != tileID.water) {
				this.setDesirability(i,j);
			}
		}
	}
}
Terrain.prototype.setDesirability = function(x,y) {
	var t = this.tile[x][y];
	t.desirability = 0;
	if (t.cityTerritory == NONE) {
		if (t.type == tileID.grassland || t.type == tileID.plains) {
			for (var e=0; e<fatCross.length; e++) {
				var nx = x + fatCross[e][0];
				var ny = y + fatCross[e][1];
				if (this.isInBounds(nx,ny)
				&& this.tile[nx][ny].cityTerritory == NONE) {
					var val = tileValue[this.tile[nx][ny].type];
					t.desirability += val;
				}
			}
		}
	}
}

Terrain.prototype.setCityTerritory = function(id, x, y) {
	for (var e=0; e<fatCross.length; e++) {
		var nx = x + fatCross[e][0];
		var ny = y + fatCross[e][1];
		if (this.isInBounds(nx,ny)
		&& this.tile[nx][ny].cityTerritory == NONE) {
			this.tile[nx][ny].desirability = 0;
			this.tile[nx][ny].cityTerritory = id;

			var val = tileValue[this.tile[nx][ny].type];
			if (val>0 && this.tile[nx][ny].type != tileID.water) {
				this.tile[nx][ny].isFarm = true;
				this.tile[nx][ny].roadConnections = 0;
			}

		}
	}
}
Terrain.prototype.setFactionInfluence = function(id, x, y) {
	var radius = 5;
	var cutoff = radius*radius+1;
	for (var i= -radius; i<=radius; i++) {
		for (var j= -radius; j<=radius; j++) {
			if (i*i+j*j <= cutoff) {
				var nx = x + i;
				var ny = y + j;
				if (this.isInBounds(nx,ny)
				&& this.tile[nx][ny].type != tileID.water
				&& this.tile[nx][ny].factionInfluence == NONE) {
					this.tile[nx][ny].factionInfluence = id;
				}
			}
		}
	}
}
Terrain.prototype.setRoadConnections = function() {
	var adj = [ [0,-1], [0,1], [-1,0], [1,0]];//, [-1,-1], [-1,1], [1,-1], [1,1] ];
	for (var i=0; i<this.width; i++) {
		for (var j=0; j<this.height; j++) {
			var t = this.tile[i][j];
			if (t.roadConnections != NONE) {
				for (var e=0; e<adj.length; e++) {
					var nx = i + adj[e][0];
					var ny = j + adj[e][1];
					if (this.isInBounds(nx,ny)
					&& this.tile[nx][ny].roadConnections != NONE) {
						var bitFlag = Math.pow(2, e);
						this.tile[i][j].roadConnections += bitFlag;
					}
				}
			}

		}
	}
}

Terrain.prototype.isInBounds = function(x, y) {
	if (x>=0 && x<this.width && y>=0 && y<this.height) {
		return true;
	}
	return false;
}
Terrain.prototype.isWithinBorders = function(x, y) {
	if (x>this.border && x<(this.width-this.border)-1 && y>this.border && y<(this.height-this.border)-1 ) {
		return true;
	}
	return false;
}
Terrain.prototype.getValidPosition = function(locomotion) {
	var nx=0, ny=0, found=false, tile;
	while (found==false) {
			nx = randomInteger(this.width);
			ny = randomInteger(this.height);
			tile = this.tile[nx][ny];
			switch (locomotion) {
				case locomotionID.ship:
					if (tile.type == tileID.water) {
						found = true;
					}
					break;
				default:
					if (tile.type != tileID.water) {
						found = true;
					}
			}

		}
	return {x:nx, y:ny};
}

function Tile() {
	this.elevation = 0;
	this.temperature = 0;
	this.rainfall = 0;
	this.isIceSheet = false;
	this.isRiver = false;
	this.flora = NONE;

	this.type = tileID.water; //random(2);
	this.desirability = 0;

	this.isCoastalWater = false;
	this.isShore = false;
	this.islandID = NONE;
	this.regionID = NONE;

	this.cityTerritory = NONE;
	this.factionInfluence = NONE;

	this.isFarm = false;
	this.roadConnections = NONE;
}

Simulation.prototype.update = function() {
	this.timer++;

	this.updateAgents();

	this.day++;
	if (this.day>=30) {
		this.day = 0;
		this.month++;
		if (this.month>=12) {
			this.year++;
			this.month = 0;
		}
	}
}
Simulation.prototype.updateAgents = function() {
	for (var i=0; i<this.planet.agent.length; i++) {
		var a = this.planet.agent[i];
		if (a.state == stateID.idle) {
			this.handleIdleAgent(a);
		} else {
			this.handleMovingAgent(a);
		}
	}
}
Simulation.prototype.handleIdleAgent = function(a) {
	var vectors = [[1,0], [0,1], [-1,0], [0,-1], [0.7,0.7], [-0.7,0.7], [0.7,-0.7], [-0.7,-0.7]];

	if (randomInteger(20) == 0) {
		var vec = randomChoice(vectors);
		a.vx = vec[0]*20000;
		a.vy = vec[1]*20000;
		var targDist = (Math.random()*60+1)*20000;
		a.targX = a.x + targDist * vec[0];
		a.targY = a.y + targDist * vec[1];

		// let agents travel round the world
		if (a.targX<0) a.targX += this.planet.gridCircumference;
		if (a.targX>=this.planet.gridCircumference) a.targX -= this.planet.gridCircumference;

		a.state = stateID.moving;
	}
}
Simulation.prototype.handleMovingAgent = function(a) {
	var dx = Math.abs(a.targX - a.x);
	var dy = Math.abs(a.targY - a.y);
	if (dx<=Math.abs(a.vx) && dy<=Math.abs(a.vy)) {
		a.x = a.targX;
		a.y = a.targY;
		a.state = stateID.idle;
	} else {
		var nx = a.x + a.vx;
		var ny = a.y + a.vy;

		if (nx<0) nx += this.planet.gridCircumference;
		if (nx>=this.planet.gridCircumference) nx -= this.planet.gridCircumference;

		if (this.planet.checkAgentMove(a,nx,ny) == true) {
			a.x += a.vx;
			a.y += a.vy;

			if (a.x<0) a.x += this.planet.gridCircumference;
			if (a.x>=this.planet.gridCircumference) a.x -= this.planet.gridCircumference;

		} else {
			a.state = stateID.idle;
		}
	}
}

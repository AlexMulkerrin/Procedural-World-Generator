const fatCross = [
	[0,0],[-1,0],[0,-1],[1,0],[0,1],[-2,0],[0,-2],[2,0],[0,2],
	[-1,-1],[1,-1],[1,1],[-1,1],[-2,1],[1,-2],[2,1],[1,2],
	[-2,-1],[-1,-2],[2,-1],[-1,2]
];

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
	var adj = [ [0,-1], [1,0], [0,1], [-1,0], [1,1], [-1,1], [1,-1], [-1,-1] ];
	for (var i=0; i<this.width; i++) {
		for (var j=0; j<this.height; j++) {
			var t = this.tile[i][j];
			var isWater = false;
			if (t.type == tileID.water) isWater = true;

			for (var e=0; e<adj.length; e++) {
				var nx = i + adj[e][0];
				var ny = j + adj[e][1];
				if (this.isInBounds(nx,ny)) {
					if (isWater == true) {
						if (this.tile[nx][ny].type != tileID.water) {
							t.isCoastalWater = true;
						}
					} else if (e<4) { // only count shores on complete edges
						if (this.tile[nx][ny].type == tileID.water) {
							if (t.ShoreConnections == NONE) {
								t.ShoreConnections = Math.pow(2, e);
							} else {
								t.ShoreConnections += Math.pow(2, e);
							}
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
Terrain.prototype.wipeFactionInfluence = function(id, x, y) {
	var radius = 5;
	var cutoff = radius*radius+1;
	for (var i= -radius; i<=radius; i++) {
		for (var j= -radius; j<=radius; j++) {
			if (i*i+j*j <= cutoff) {
				var nx = x + i;
				var ny = y + j;
				if (this.isInBounds(nx,ny)
				&& this.tile[nx][ny].type != tileID.water
				&& this.tile[nx][ny].factionInfluence == id) {
					this.tile[nx][ny].factionInfluence = NONE;
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

const tileID = { water:0, grassland:1, desert:2, plains:3, tundra:4, arctic:5, hills:6, mountain:7, forest:8, jungle:9, swamp:10 };

const tileValue = [1,2,1,1,1,0,1,0,1,1,1];

function Tile() {
	this.elevation = 0;
	this.temperature = 0;
	this.rainfall = 0;
	this.isIceSheet = false;
	this.isRiver = false;
	this.flora = NONE;

	this.type = tileID.water;
	this.desirability = 0;

	this.isCoastalWater = false;
	this.ShoreConnections = NONE;
	this.islandID = NONE;
	this.regionID = NONE;

	this.cityTerritory = NONE;
	this.factionInfluence = NONE;

	this.isFarm = false;
	this.roadConnections = NONE;
}

const regionID = {island:0, water:1, terrain:2};

const islandClasses = [ ["pangea", 500], ["continent", 250], ["sub continent", 100], ["island", 25], ["islet", 6], ["atoll", 0] ];

const waterClasses = [ ["world ocean", 1000], ["ocean", 100], ["sea", 4], ["lake", 0] ];

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

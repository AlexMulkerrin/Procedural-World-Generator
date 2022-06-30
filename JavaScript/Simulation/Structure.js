
function Structure(inID, inX, inY, inTileX, inTileY, inPop, inFactionID, inIsHarbour) {
	this.id = inID;
	this.name = randomName();
	this.x = inX;
	this.y = inY;
	this.tileX = inTileX;
	this.tileY = inTileY;

	this.population = inPop;
	this.extent = Math.sqrt(100 * this.population * 1000000);
	this.factionID = inFactionID;

	this.isAlive = true;

	this.isHarbour = inIsHarbour;
	this.currentConstruction = NONE;
	this.constructionProgress = 0;
	this.constructionTarget = 0;
}

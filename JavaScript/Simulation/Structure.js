
function Structure(inID, inX, inY, inPop, inFactionID) {
	this.id = inID;
	this.name = randomName();
	this.x = inX;
	this.y = inY;
	this.population = inPop;
	this.extent = Math.sqrt(100 * this.population * 1000000);
	this.factionID = inFactionID;
}

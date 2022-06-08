
function Faction(inID) {
	this.id = inID;
	this.name = randomName();
	this.colour = randomColour();

	this.totalCities = 0;
	this.totalPop = 0;
}

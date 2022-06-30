
function Faction(inID) {
	this.id = inID;
	this.name = randomName();
	this.colour = randomColour();

	this.totalStructures = 0;
	this.totalPop = 0;
	this.totalAgents = 0;
	this.totalArea = 0;

	this.isAlive = true;
}

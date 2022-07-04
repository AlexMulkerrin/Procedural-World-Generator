const defaultFactionColours = ["#798EFF", "#4CFF00", "#FFD800", "#FF0000", "#B200FF", "#FF6A00", "#FFFFFF", "#606060", "#22B14C", "#880015", "#99D9EA", "#FFC1FF", "#3F48CC", "#7F6A00", "#FF00FF", "#FFF5AF"];

const factionColourNames = ["blue", "lime", "yellow", "red", "purple", "orange", "white", "black", "green", "dark red", "light blue", "light pink", "dark blue", "brown", "magenta", "light yellow"];

function Faction(inID) {
	this.id = inID;
	this.name = randomName();
	this.colour = randomColour();
	if (this.id < defaultFactionColours.length) {
		this.colour = defaultFactionColours[this.id];
	}

	this.totalStructures = 0;
	this.totalPop = 0;
	this.totalAgents = 0;
	this.totalArea = 0;

	this.isAlive = true;
}

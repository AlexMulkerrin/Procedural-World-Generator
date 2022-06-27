const stateID = { idle:0, moving:1 };


function Agent(inX, inY, inType, inFactionID) {
	this.x = inX;
	this.y = inY;
	//this.size = inSize;
	//this.locomotion = inLocomotion;
	this.type = inType;
	this.health = agentTypes[this.type].maxHealth;
	this.factionID = inFactionID;

	this.state = stateID.idle;
	this.isRoaming = true;
	this.vx = 0;
	this.vy = 0;
	this.targX = 0;
	this.targY = 0;
}

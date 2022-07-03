const stateID = { idle:0, moving:1, hunting:2, capturing:3, alert:4, dead:5 };
const stanceID = { aggressive:0, defensive:1 };

function Agent(inX, inY, inType, inFactionID) {
	this.x = inX;
	this.y = inY;
	//this.size = inSize;
	//this.locomotion = inLocomotion;
	this.type = inType;
	this.health = agentTypes[this.type].maxHealth;
	this.isAlive = true;
	this.cooldown = 0;

	this.factionID = inFactionID;

	this.state = stateID.alert;
	this.stance = stanceID.aggressive;
	this.isRoaming = true;
	this.vx = 0;
	this.vy = 0;
	this.targX = 0;
	this.targY = 0;
	this.targAgentID = NONE;
}

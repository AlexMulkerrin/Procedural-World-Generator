const stateID = { idle:0, moving:1 };
const locomotionID = { ship:0 };

function Agent(inX, inY, inSize, inLocomotion, inFactionID) {
	this.x = inX;
	this.y = inY;
	this.size = inSize;
	this.locomotion = inLocomotion;
	this.factionID = inFactionID;

	this.state = stateID.idle;
	this.isRoaming = true;
	this.vx = 0;
	this.vy = 0;
	this.targX = 0;
	this.targY = 0;
}

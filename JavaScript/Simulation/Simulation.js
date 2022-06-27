const gameStateID = {start:0, menu:1, ingame:2};

function Simulation() {
	this.timer = 0;
	this.year = 0;
	this.month = 0;
	this.day = 0;

	this.isPaused = false;
	this.gameState = gameStateID.ingame;

	this.planet = new Planet(6371000,0);
}
Simulation.prototype.generateNewPlanet = function() {
	this.year = 0;
	this.month = 0;
	this.day = 0;

	this.planet = new Planet(6371000,0);
}

Simulation.prototype.update = function() {
	this.timer++;

	if (this.isPaused == false) {
		this.updateAgents();

		this.day++;
		if (this.day>=30) {
			this.day = 0;
			this.month++;
			if (this.month>=12) {
				this.year++;
				this.month = 0;
			}
		}
	}
}
Simulation.prototype.updateAgents = function() {
	for (var i=0; i<this.planet.agent.length; i++) {
		var a = this.planet.agent[i];
		if (a.state == stateID.idle) {
			this.handleIdleAgent(a);
		} else {
			this.handleMovingAgent(a);
		}
	}
}
Simulation.prototype.handleIdleAgent = function(a) {
	var vectors = [[1,0], [0,1], [-1,0], [0,-1], [0.7,0.7], [-0.7,0.7], [0.7,-0.7], [-0.7,-0.7]];

	if (randomInteger(20) == 0) {
		//this.setCourse(a,0,0);

		//var vec = randomChoice(vectors);
		//a.vx = vec[0]*20000;
		//a.vy = vec[1]*20000;
		//var targDist = (Math.random()*60+1)*20000;

		/*
		a.targX = a.x + (Math.random()*120-60)*20000; //targDist * vec[0];
		a.targY = a.y + (Math.random()*120-60)*20000; //targDist * vec[1];
		this.setCourse(a,a.targX,a.targY);

		// let agents travel round the world
		if (a.targX<0) a.targX += this.planet.gridCircumference;
		if (a.targX>=this.planet.gridCircumference) a.targX -= this.planet.gridCircumference;
		*/
		//a.state = stateID.moving;

	}
}
Simulation.prototype.handleMovingAgent = function(a) {
	var dx = Math.abs(a.targX - a.x);
	var dy = Math.abs(a.targY - a.y);
	if (dx<=Math.abs(a.vx) && dy<=Math.abs(a.vy)) {
		// TODO find closest valid point along course
		if (this.planet.checkAgentMove(a,a.targX,a.targY) == true) {
			a.x = a.targX;
			a.y = a.targY;
		}
		a.state = stateID.idle;
	} else {
		var nx = a.x + a.vx;
		var ny = a.y + a.vy;

		if (nx<0) nx += this.planet.gridCircumference;
		if (nx>=this.planet.gridCircumference) nx -= this.planet.gridCircumference;

		if (this.planet.checkAgentMove(a,nx,ny) == true) {
			a.x += a.vx;
			a.y += a.vy;

			if (a.x<0) a.x += this.planet.gridCircumference;
			if (a.x>=this.planet.gridCircumference) a.x -= this.planet.gridCircumference;

		} else {
			a.state = stateID.idle;
		}
	}
}
Simulation.prototype.setCourse = function(a,targX,targY) {
	a.targX = targX;
	a.targY = targY;
	// TODO option to have pathfinding here

	// TODO have variable speeds
	var speed = 20000;

	var dx = a.targX - a.x;
	if (dx == 0) dx = 0.0001;
	var dy = a.targY - a.y;
	var ratio = dy/dx;
	var xComponent = Math.sqrt(Math.pow(speed,2)/(1+Math.pow(ratio,2)));
	if (dx<0) xComponent *= -1;

	a.vx = xComponent;
	a.vy = ratio * xComponent;

	a.state = stateID.moving;

}

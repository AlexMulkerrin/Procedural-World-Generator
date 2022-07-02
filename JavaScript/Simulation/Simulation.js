const gameStateID = {start:0, menu:1, ingame:2};

function Simulation() {
	this.targetSoundSystem = {};

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
		this.updateStructures();
		this.updateFactions();
		this.planet.generateSummary();

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
		if (a.isAlive == true) {
			switch (a.state) {
				case stateID.idle:
					this.handleIdleAgent(a);
					break;
				case stateID.moving:
					this.handleMovingAgent(a);
					break;
				case stateID.hunting:
					this.handleHuntingAgent(a);
					break;
				case stateID.capturing:
					this.handleCapturingAgent(a);
					break;
				case stateID.alert:
					this.findTarget(i,a);
					break;
			}

			if (a.cooldown == 0) {
				this.handleWeaponFiring(i,a);
			} else {
				a.cooldown--;
			}
		}


	}
}
Simulation.prototype.handleIdleAgent = function(a) {

	if (a.isRoaming == true && randomInteger(100) == 0) {
		this.giveRandomCourse(a);
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

		if (a.state == stateID.capturing) {
			this.handleCapture(a);
		}
		a.state = stateID.alert;

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

		} else { // collides
			this.giveRandomCourse(a);
			//a.state = stateID.idle;
		}
	}
}
Simulation.prototype.handleHuntingAgent = function(a) {
	var p = this.planet;
	var targ = p.agent[a.targAgentID];
	if (targ.isAlive == true) {
		this.setCourse(a,targ.x, targ.y);
		this.handleMovingAgent(a);
	} else {
		a.state = stateID.alert;
	}
}
Simulation.prototype.handleCapturingAgent = function(a) {
	var p = this.planet;
	var targ = p.structure[a.targAgentID];
	if (targ.isAlive == true) {
		this.handleMovingAgent(a);
	} else {
		a.state = stateID.alert;
	}
}

Simulation.prototype.handleCapture = function(a) {
	var p = this.planet;
	var targ = p.structure[a.targAgentID];

	p.terrain.wipeFactionInfluence(targ.factionID, targ.tileX, targ.tileY);
	p.terrain.setFactionInfluence(a.factionID, targ.tileX, targ.tileY);
	targ.factionID = a.factionID;
	console.log("City "+a.targAgentID+" has been captured!");
}

Simulation.prototype.handleWeaponFiring = function(i,a) {
	var hasFired = false;
	for (var j=0; j<this.planet.agent.length && hasFired == false; j++) {
		if (j != i) {
			var ta = this.planet.agent[j];
			if (ta.factionID != a.factionID && ta.isAlive == true) {
				var dx = ta.x - a.x;
				var dy = ta.y - a.y;
				var dist = dx*dx + dy*dy;
				var range = agentTypes[a.type].range + agentTypes[a.type].size;
				if (dist < (range*range)) {
					// cancel orders for both agents
					a.state = stateID.alert;
					ta.state = stateID.alert;

					var dam = agentTypes[a.type].damage
					ta.health -= dam;
					//console.log("Agent "+i+" has shot agent "+j+" for "+dam+" damage!");
					a.cooldown = agentTypes[a.type].cooldown;
					hasFired = true;
					if (ta.health <= 0) {
						this.destroyAgent(ta);
						if (a.factionID == 0) {
							this.targetSoundSystem.createTone(noteNameID.F4,0);
						}
					}
				}
			}
		}
	}
}
Simulation.prototype.destroyAgent = function(a) {
	var f = this.planet.faction[a.factionID];
	a.isAlive = false;
	a.state = stateID.dead;
	console.log(f.name+" "+agentTypes[a.type].name+" has been destroyed!");
	if (a.factionID == 0) {
		this.targetSoundSystem.createTone(noteNameID.C4,0);
	}
}
Simulation.prototype.giveRandomCourse = function(a) {
	a.targX = a.x + (Math.random()*120-60)*20000;
	a.targY = a.y + (Math.random()*120-60)*20000;
	this.setCourse(a,a.targX,a.targY);
	a.state = stateID.moving;

	// let agents travel round the world
	if (a.targX<0) a.targX += this.planet.gridCircumference;
	if (a.targX>=this.planet.gridCircumference) a.targX -= this.planet.gridCircumference;
}
Simulation.prototype.findTarget = function(i,a) {
	var closestDist = NONE;
	var closestID = NONE;
	var dx, dy = 0;
	var tx, ty = 0;

	for (var j=0; j<this.planet.agent.length; j++) {
		if (j != i) {
			var ta = this.planet.agent[j];
			if (ta.factionID != a.factionID && ta.isAlive == true
				&& this.planet.checkSameIsland(a,ta.x,ta.y)) {
				if (closestID == NONE) {
					dx = a.x - ta.x;
					dy = a.y - ta.y;
					closestDist = dx*dx + dy*dy;
					closestID = j;
					tx = ta.x;
					ty = ta.y;
				} else {
					dx = a.x - ta.x;
					dy = a.y - ta.y;
					if ((dx*dx+dy*dy)<closestDist) {
						closestDist = dx*dx + dy*dy;
						closestID = j;
						tx = ta.x;
						ty = ta.y;
					}
				}
			}
		}
	}


	var isTargettingStructure = false;
	for (var j=0; j<this.planet.structure.length; j++) {
		var sa = this.planet.structure[j];

		var isValidTarget = false;
		if (sa.factionID != a.factionID && sa.isAlive == true) {
			switch (agentTypes[a.type].locomotion) {
				case locomotionID.ship:
				case locomotionID.boat:
					if (sa.isHarbour) {
						isValidTarget = true;
					}
					break;
				default:
					if (this.planet.checkSameIsland(a,sa.x,sa.y)) {
						isValidTarget = true;
					}
					break;
			}
		}

		if (isValidTarget == true) {
			if (closestID == NONE) {
				dx = a.x - sa.x;
				dy = a.y - sa.y;
				isTargettingStructure = true;
				closestDist = dx*dx + dy*dy;
				closestID = j;
				tx = sa.x;
				ty = sa.y;
			} else {
				dx = a.x - sa.x;
				dy = a.y - sa.y;
				if ((dx*dx+dy*dy)<closestDist) {
					isTargettingStructure = true;
					closestDist = dx*dx + dy*dy;
					closestID = j;
					tx = sa.x;
					ty = sa.y;
				}
			}
		}
	}

	if (closestID == NONE) {
		a.state = stateID.idle;
		this.handleIdleAgent(a);
	} else {
		this.setCourse(a, tx, ty);
		a.targAgentID = closestID;

		if (isTargettingStructure == true) {
			a.state = stateID.capturing;
		} else {
			a.state = stateID.hunting;
		}
	}
}
Simulation.prototype.setCourse = function(a,targX,targY) {
	a.targX = targX;
	a.targY = targY;
	// TODO option to have pathfinding here

	// TODO have variable speeds
	var speed = agentTypes[a.type].speed;

	var dx = a.targX - a.x;
	if (dx == 0) dx = 0.0001;
	var dy = a.targY - a.y;
	var ratio = dy/dx;
	var xComponent = Math.sqrt(Math.pow(speed,2)/(1+Math.pow(ratio,2)));
	if (dx<0) xComponent *= -1;

	a.vx = xComponent;
	a.vy = ratio * xComponent;
}

Simulation.prototype.updateStructures = function() {
	var p = this.planet;
	var ancientCombatLandUnits = [agentTypeID.warrior, agentTypeID.spearman, agentTypeID.archer, agentTypeID.swordsman, agentTypeID.horseman, agentTypeID.chariot, agentTypeID.catapult];

	for (var i=0; i<p.structure.length; i++) {
		var s = p.structure[i];

		if (s.currentConstruction == NONE) {
			if (s.isHarbour == true) {
				if (randomInteger(2) == 0) {
					s.currentConstruction = agentTypeID.galley;
				} else {
					s.currentConstruction = randomChoice(ancientCombatLandUnits);
				}

			} else {
				s.currentConstruction = randomChoice(ancientCombatLandUnits);
			}


			s.constructionTarget = agentTypes[s.currentConstruction].cost*300;
		} else {
			s.constructionProgress += s.population;
			if (s.constructionProgress >= s.constructionTarget) {
				s.constructionProgress = 0;
				p.agent.push(new Agent(s.x, s.y, s.currentConstruction, s.factionID));
				s.currentConstruction = NONE;
			}
		}
	}
}

Simulation.prototype.updateFactions = function() {
	var p = this.planet;
	for (var i=0; i<p.faction.length; i++) {
		var f = p.faction[i];
		if (f.isAlive == true) {
			f.totalStructures = 0;
			f.totalPop = 0;
			for (var j=0; j<p.structure.length; j++) {
				var s = p.structure[j];
				if (s.factionID == i) {
					f.totalStructures++;
					f.totalPop += s.population;
				}
			}
			f.totalAgents = 0;
			for (var j=0; j<p.agent.length; j++) {
				var a = p.agent[j];
				if (a.factionID == i && a.isAlive == true) {
					f.totalAgents++;
				}
			}
			if (f.totalAgents<1 && f.totalStructures<1) {
				f.isAlive = false;
			}

		}
	}
}

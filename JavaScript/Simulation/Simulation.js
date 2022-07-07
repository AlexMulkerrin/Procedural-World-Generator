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
					this.handleIdleAgent(i,a);
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
					this.findTarget(i,a, false);
					break;

				// transport related states
				case stateID.pickingUp:
					this.handlePickingUpAgent(a);
					break;
				case stateID.transporting:
					this.handleTransportingAgent(a);
					break;
				case stateID.boarding:
					this.handleBoardingAgent(i,a);
					break;
				case stateID.inTransit:
					this.handleInTransitAgent(a);
					break;

			}

			if (a.cooldown == 0) {
				this.handleWeaponFiring(i,a);
			} else {
				a.cooldown--;
			}
		} else {
			a.decay--;
			if (a.decay<1) {
				a.isReplaceable = true;
			}
		}


	}
}
Simulation.prototype.handleIdleAgent = function(i,a) {

	// look for transport
	if (agentTypes[a.type].transportCapacity) {
		// is transport itself so can't be transported...
		// todo maybe look for passengers?
	} else {
		this.findTransport(i,a);
	}

	if (a.isRoaming == true && randomInteger(100) == 0) {
		this.giveRandomCourse(a);
	}
}
Simulation.prototype.handleMovingAgent = function(a) {
	var dx = Math.abs(a.targX - a.x);
	var dy = Math.abs(a.targY - a.y);
	if (dx<=Math.abs(a.vx) && dy<=Math.abs(a.vy)) { // is close enough to reach

		if (this.planet.checkAgentMove(a,a.targX,a.targY) == true) {
			a.x = a.targX;
			a.y = a.targY;
		} else {
			// TODO find closest valid point along course
		}

		// next state depends on current state
		switch (a.state) {
			case stateID.capturing:
			this.handleCapture(a);
			break;
			case stateID.idle:
			case stateID.moving:
			case stateID.hunting:
				a.state = stateID.alert;
				// todo check to see if any agents in cargo and transport them
				break;
			case stateID.pickingUp:
				// wait as reached rendezvous first
				a.isWaiting = true;
				break;
			case stateID.transporting:
				// todo handle dropoff
				this.handleDropoff(a,a.x, a.y);
				a.state = stateID.alert;
				break;
			case stateID.boarding:
				// wait as reached rendezvous first
				a.isWaiting = true;
				break;
		}

	} else { // move towards target
		var nx = a.x + a.vx;
		var ny = a.y + a.vy;

		if (nx<0) nx += this.planet.gridCircumference;
		if (nx>=this.planet.gridCircumference) nx -= this.planet.gridCircumference;

		if (this.planet.checkAgentMove(a,nx,ny) == true) {
			a.x += a.vx;
			a.y += a.vy;

			if (a.x<0) a.x += this.planet.gridCircumference;
			if (a.x>=this.planet.gridCircumference) a.x -= this.planet.gridCircumference;

		} else { // collides with terrain

			switch (a.state) {
				case stateID.idle:
				case stateID.moving:
				case stateID.hunting:
				case stateID.capturing:
					// bumble around a bit to hopefully reposition
					this.giveRandomCourse(a);
					break;
				case stateID.pickingUp:
					// wait as reached rendezvous first
					a.isWaiting = true;
					break;
				case stateID.transporting:
					// hopefully hit landfall...
					this.handleDropoff(a,nx,ny);
					a.state = stateID.alert;

					// bumble about but don't forget state!
					//this.giveRandomCourse(a);
					//a.state = stateID.transporting;
					break;
				case stateID.boarding:
					// wait as reached rendezvous first
					a.isWaiting = true;
					break;
			}


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
Simulation.prototype.handlePickingUpAgent = function(a) {
	var p = this.planet;
	var targ = p.agent[a.targAgentID];
	if (targ.isAlive == true) {
		this.handleMovingAgent(a);
	} else {
		a.state = stateID.idle;
		a.isWaiting = false;
	}
}
Simulation.prototype.handleTransportingAgent = function(a) {
	this.handleMovingAgent(a);
	if (a.state == stateID.transporting) { // keep cargo position updated
		for (var i=0; i<a.cargo.length; i++) {
			var ca = this.planet.agent[a.cargo[i]];
			ca.x = a.x;
			ca.y = a.y;
		}
	}
}
Simulation.prototype.handleBoardingAgent = function(i,a) {
	var p = this.planet;
	var ta = p.agent[a.targAgentID];
	if (ta.isAlive == true) {

		var dx = ta.x - a.x;
		var dy = ta.y - a.y;
		var dist = dx*dx + dy*dy;
		// kludge: just add both agents speeds together for range
		var range = agentTypes[a.type].speed + agentTypes[ta.type].speed;
		if (dist < (range*range)) {
			//is within movement range so get on
			a.state = stateID.inTransit;
			a.isWaiting = false;

			this.findTarget(a.targAgentID, ta, true);
			ta.state = stateID.transporting;
			ta.isWaiting = false;
			ta.cargo.push(i);

		} else {
			// still too far, check if both agents are waiting ie. stuck
			if (a.isWaiting == true && ta.isWaiting == true) {
				// if both stuck waiting cancel transport states and wander
				this.giveRandomCourse(a);
				a.state = stateID.moving;
				a.isWaiting = false;

				this.giveRandomCourse(ta);
				ta.state = stateID.moving;
				ta.isWaiting = false;
			}
			this.handleMovingAgent(a);
		}
	} else {
		a.state = stateID.alert;
		a.isWaiting = false;
	}
}
Simulation.prototype.handleInTransitAgent = function(a) {
	// just sits tight until transport reaches destination
}

Simulation.prototype.handleCapture = function(a) {
	var p = this.planet;
	var targ = p.structure[a.targAgentID];

	if (targ.factionID != a.factionID) {
		p.terrain.wipeFactionInfluence(a.targAgentID, targ.factionID, targ.tileX, targ.tileY);
		p.terrain.setFactionInfluence(a.targAgentID, a.factionID, targ.tileX, targ.tileY);
		if (targ.factionID == 0) {
			console.log("City "+a.targAgentID+" has been lost...");
			this.targetSoundSystem.createTone(noteNameID.B3,2);
		}
		if (a.factionID == 0) {
			console.log("City "+a.targAgentID+" has been captured!");
			this.targetSoundSystem.createTone(noteNameID.G4,2);
		}
		targ.factionID = a.factionID;
		a.state = stateID.idle;
		//console.log("City "+a.targAgentID+" has been captured!");
	} else {
		a.state = stateID.alert;
	}
}
Simulation.prototype.handleDropoff = function(a, x, y) {
	for (var i=0; i<a.cargo.length; i++) {
		var ca = this.planet.agent[a.cargo[i]];
		ca.x = x;
		ca.y = y;
		ca.state = stateID.alert;
	}
	a.cargo = [];
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
					// cancel orders for attacker
					a.state = stateID.alert;
					if (ta.state == stateID.pickingUp
						|| ta.state == stateID.transporting
						|| ta.state == stateID.boarding
						|| ta.state == stateID.inTransit) {
						// defender is busy ignore
					} else {
						ta.state = stateID.alert;
					}


					var dam = agentTypes[a.type].damage
					ta.health -= dam;
					//console.log("Agent "+i+" has shot agent "+j+" for "+dam+" damage!");
					a.cooldown = agentTypes[a.type].cooldown;
					hasFired = true;
					if (ta.health <= 0) {
						this.destroyAgent(ta);
						if (a.factionID == 0) {
							var f = this.planet.faction[ta.factionID];
							console.log(f.name+" "+agentTypes[ta.type].name+" has been destroyed!");
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
	a.decay = 120;
	//a.state = stateID.dead;
	if (a.cargo.length > 0) {
		// kill carried agents too
		for (var i=0; i<a.cargo.length; i++) {
			var ca = this.planet.agent[a.cargo[i]];
			this.destroyAgent(ca);
		}
	}
	//console.log(f.name+" "+agentTypes[a.type].name+" has been destroyed!");
	if (a.factionID == 0) {
		console.log("Our "+agentTypes[a.type].name+" has been defeated...");
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
Simulation.prototype.findTarget = function(i,a, isTransporting) {
	var closestDist = NONE;
	var closestID = NONE;
	var dx, dy = 0;
	var tx, ty = 0;

	if (isTransporting == false) {
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
	} else {
		// is transporting units so is looking for an enemy city
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
		//this.handleIdleAgent(a);
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
Simulation.prototype.findTransport = function(i,a) {
	var closestDist = NONE;
	var closestID = NONE;
	var dx, dy = 0;
	var tx, ty = 0;

	for (var j=0; j<this.planet.agent.length; j++) {
		if (j != i) {
			var ta = this.planet.agent[j];
			if (ta.factionID == a.factionID && ta.isAlive == true
				&& agentTypes[ta.type].transportCapacity > 0
				&& (ta.state == stateID.idle
					|| ta.state == stateID.moving
					|| ta.state == stateID.hunting
					|| ta.state == stateID.capturing
					|| ta.state == stateID.alert)) {
					// go interrupt what the transport is doing
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

	if (closestID == NONE) {
		a.state = stateID.idle;
		//this.handleIdleAgent(i,a);
	} else {
		this.setCourse(a, tx, ty);
		a.targAgentID = closestID;
		a.state = stateID.boarding;
		// target transport is also set to rendezvous
		var ta = this.planet.agent[closestID];
		this.setCourse(ta, a.x, a.y);
		ta.targAgentID = i;
		ta.state = stateID.pickingUp;

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
				p.createAgent(s.x, s.y, s.currentConstruction, s.factionID)
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

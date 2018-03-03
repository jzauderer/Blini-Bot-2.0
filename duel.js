const Discord = require("discord.js");

module.exports ={
	beginDuel: async function (duelist1, duelist2, arena){
		let hp1 = 4;
		let hp2 = 4;
		let move1 = "";
		let move2 = "";
		let dm1 = await duelist1.createDM();
		let dm2 = await duelist2.createDM();
		let hpUpdate = [];
		let tutorial = "Your duel begins!\nYou have 4 health and 3 options each turn: slash, lunge, and counter.\nSlash: Does 1 damage. If both slash, no damage is dealt to either duelist.\nLunge: Does 2 damage, can be countered.\nCounter: If the opponent lunges, does 3 damage. If they slash, you take 2 damage instead of the normal 1. If they counter, nothing happens.\nTo input a command, type either \"slash\", \"lunge\", or \"counter\". You have 30 seconds to input a command, and will lose if you do not input in time. Good luck!";
		await duelist1.send(tutorial);
		await duelist2.send(tutorial);
		while(hp1 > 0 && hp2 > 0){
			await duelist1.send("Input your move against " +duelist2.displayName+" now");
			await duelist2.send("You must wait for your opponent to lock in a move, then you may lock in yours.");
			//Get input from both players
			let move1 = await getInput1(duelist1);
			await duelist2.send("You may now input your move against " +duelist1.displayName+" now");
			let move2 = await getInput2(duelist2);
			//Deal out the damage from their moves
			hpUpdate = await tradeBlows(move1,move2,duelist1.displayName,duelist2.displayName,hp1,hp2,arena,duelist1,duelist2);
			hp1 = hpUpdate[0];
			hp2 = hpUpdate[1];
		}
		let victoryMessage = "";
		if(hp1 <= 0 && hp2 <= 0){
			victoryMessage = "Both combatants have slain each other at the same time! The duel between " + duelist1.displayName + " and "+duelist2.displayName+" ends in a draw!";
		}
		else if(hp1<=0){
			victoryMessage = duelist1.displayName + "has been struck down by "+duelist2.displayName+"! "+duelist2.displayName+" is victorious!";
		}
		else{;
			victoryMessage = duelist2.displayName + "has been struck down by "+duelist1.displayName+"! "+duelist1.displayName+" is victorious!";
		}
		await duelist1.send(victoryMessage);
		await duelist2.send(victoryMessage);
		arena.send(victoryMessage);
	}
}

async function getInput1(duelist1){
	const filter = m => (m.content.toLowerCase().trim() === "slash" || m.content.toLowerCase().trim() === "counter" || m.content.toLowerCase().trim() === "lunge");
	await duelist1.user.dmChannel.awaitMessages(filter, {max:1, time:30000})
		.then(collected => {
			if(collected.size === 1){
				move1 = collected.array().toString();
				console.log("player1");
			}
			else{
				move1 = "none";
			}
		})
		return move1;
}

async function getInput2(duelist2){
	const filter = m => (m.content.toLowerCase().trim() === "slash" || m.content.toLowerCase().trim() === "counter" || m.content.toLowerCase().trim() === "lunge");
	await duelist2.user.dmChannel.awaitMessages(filter, {max:1, time:30000})
	.then(collected => {
			if(collected.size === 1){
				move2 = collected.array().toString();
				console.log("player2");
			}
			else{
				move2 = "none";
			}
		})
		return move2;
}

async function tradeBlows(att1, att2, duelist1, duelist2, hp1, hp2, arena,duelistTag1,duelistTag2){
	//Takes the duelists display names, not the duelists themselves
	let report = "";
	//Both players slash
	if(att1 === "slash" && att2 === "slash"){
		report = duelist1 + " and " + duelist2 + " clash blades, but neither land a hit.\n";
	}
	//One slashes, the other lunges
	else if(att1 === "lunge" && att2 === "slash"){
		hp1 -= 2;
		hp2 -= 1;
		report = duelist1 + " slashes at " + duelist2+ ", who returns with a violent lunge.\n";
	}
	else if(att1 === "slash" && att2 === "lunge"){
		hp1 -= 1;
		hp2 -= 2;
		report = duelist2 + " slashes at " + duelist1+ ", who returns with a violent lunge.\n";
	}
	//Both lunge
	else if(att1 === "lunge" && att2 === "lunge"){
		hp1 -= 2;
		hp2 -= 2;
		report = duelist1 + " and " + duelist2 + " both lunge at each other, landing gruesome stabs. The crowd goes wild!\n"
	}
	//Both counter
	else if(att1 === "counter" && att2 === "counter"){
		report = duelist1 + " and " +duelist2 + " sit behind their shields, anticipating a lunge. The crowd boos at the boring display of patience.";
	}
	//One lunges, one counters
	else if(att1 === "lunge" && att2 === "counter"){
		hp1 -= 3;
		report = duelist1 + " goes for a lunge, but "+ duelist2+ ", anticipating this, swiftly bats the sword aside and stabs "+duelist1;
	}
	else if(att1 === "counter" && att2 === "lunge"){
		hp2 -= 3;
		report = duelist2 + " goes for a lunge, but "+ duelist1+ ", anticipating this, swiftly bats the sword aside and stabs "+duelist2;
	}
	//One slashes, one counters
	else if(att1 === "slash" && att2 === "counter"){
		hp2 -= 2;
		report = duelist2 +" prepares to counter a lunge, but is caught off guard by a powerful overhead slash from " + duelist1;
	}
	else if(att1 === "counter" && att2 === "slash"){
		hp1 -= 2;
		report = duelist1 +" prepares to counter a lunge, but is caught off guard by a powerful overhead slash from " + duelist2;
	}
	//One doesn't input a command
	else if(att1 === "none" && att2 !== "none"){
		hp1 = 0;
		report = duelist1 +" stares off into space. "+duelist2+" takes advantage of his inaction by decapitating him with a powerful blow to the neck!";
	}
	else if(att1 !== "none" && att2 === "none"){
		hp2 = 0;
		report = duelist2 +" stares off into space. "+duelist1+" takes advantage of his inaction by decapitating him with a powerful blow to the neck!";
	}
	//Neither input a command
	else{
		hp1 = 0;
		hp2 = 0;
		report = "Both "+duelist1+ " and "+duelist2+" suddenly lose focus and just stand around idly. The crowd boos and throws rocks, killing both duelists!";
	}
	report += "\n" + duelist1 + " health: " + hp1 + ", " + duelist2 + " health: " + hp2;
	//Return new health values
	await duelistTag1.send(report);
	await duelistTag2.send(report);
	arena.send(report);
	return [hp1,hp2];
}
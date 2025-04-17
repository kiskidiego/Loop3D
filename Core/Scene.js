import Actor from "./Actor.js";

export default class Scene {
	constructor(scene) {
		this.id = Utils.id();
		this.actorList = [];
		Object.assign(this, scene);
		this.actorList.forEach((actor, i) => this.actorList[i] = new Actor(actor));
	}

	get jsonObject () {
		var obj = {
			name: this.name || "Untitled Scene",
			actorList: this.actorList.map((actor) => actor.jsonObject),
		};
		return obj;
	}

	addActor(actor, pos) {
		this.actorList.splice(pos, 0, actor);
	}

	removeActor(actorID) {
		this.actorList.splice(this.actorList.findIndex(i => i.id == actorID), 1);
	}
}
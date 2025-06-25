import Scene from "./Scene.js";

export default class Game {
	constructor(game) {

		this.sceneList = [];

		if (!game.sceneList) {
			this.name = "Untitled Game";
			Object.assign(this, this.properties);
			this.sceneList.push(new Scene({ name: "Scene_1", agents: [] }));
		}
		else {
			Object.assign(this, game);
			Object.assign(this, this.properties);
			this.sceneList = this.sceneList.map((scene) => new Scene(scene));
		}
	}

	get properties() {
		var obj = {
			// Settings
			name: this.name || "Untitled Game",

			// Camera
			camPositionX: this.camPositionX || 0, camPositionY: this.camPositionY || 0, camPositionZ: this.camPositionZ || 0,
			camForwardX: this.camForwardX == undefined ? 0 : this.camForwardX, camForwardY: this.camForwardY == undefined ? 0 : this.camForwardY, camForwardZ: this.camForwardZ == undefined ? -1 : this.camForwardZ,
			camTilt: this.camTilt || 0,
			camFov: this.camFov == undefined ? 45 : this.camFov,
			viewPortWidth: this.viewPortWidth || 800, viewPortHeight: this.viewPortHeight || 600,
			perspectiveType: this.perspectiveType == undefined ? "perspective" : this.perspectiveType, // Default to perspective if not specified

			// Lighting
			dirLightDirectionX: this.dirLightDirectionX || 0, dirLightDirectionY: this.dirLightDirectionY == undefined ? -1 : this.dirLightDirectionY, dirLightDirectionZ: this.dirLightDirectionZ || 0,
			dirLightColor: this.dirLightColor == undefined ? 0xffffff : this.dirLightColor, // Default to white if not specified
			dirLightIntensity: this.dirLightIntensity == undefined ? 10 : this.dirLightIntensity, // Default to 10 if not specified
			shadows: this.shadows === undefined ? true : this.shadows, // Default to true if not specified

			// SkyBox
			skyTopColor: this.skyTopColor == undefined ? 0x0099ff : this.skyTopColor,
			skyHorizonColor: this.skyHorizonColor == undefined ? 0x8f8f8f : this.skyHorizonColor,
			skyBottomColor: this.skyBottomColor == undefined ? 0x404040 : this.skyBottomColor,

			// Physics
			physicsOn: this.physicsOn === undefined ? true : this.physicsOn, // Default to true if not specified
			gravityX: this.gravityX || 0, gravityY: this.gravityY == undefined ? -9.81 : this.gravityY, gravityZ: this.gravityZ || 0,
		}
		return obj;
	}
	
	get jsonObject() {
		var obj = {};
		var data = {
			sceneList: this.sceneList.map(scene => scene.jsonObject),
		}
		Object.assign(obj, this.properties);
		Object.assign(obj, data);
		return obj;
	}
}
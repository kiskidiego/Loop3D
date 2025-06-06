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
			perspectiveType: this.perspectiveType || PerspectiveTypes.Perspective,

			// Lighting
			dirLightDirectionX: this.dirLightDirectionX || 0, dirLightDirectionY: this.dirLightDirectionY || 0, dirLightDirectionZ: this.dirLightDirectionZ || 0,
			dirLightColor: this.dirLightColor || 0xffffff,
			dirLightIntensity: this.dirLightIntensity || 1,
			shadows: this.shadows === undefined ? true : this.shadows, // Default to true if not specified

			// SkyBox
			skyTopColor: this.skyTopColor == undefined ? 0x0099ff : this.skyTopColor,
			skyHorizonColor: this.skyHorizonColor == undefined ? 0x8f8f8f : this.skyHorizonColor,
			skyBottomColor: this.skyBottomColor == undefined ? 0x404040 : this.skyBottomColor,

			// Physics
			physicsOn: this.physicsOn || true,
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
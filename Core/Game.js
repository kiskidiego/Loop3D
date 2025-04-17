import Scene from "./Scene.js";

export default class Game {
	constructor(game) {
		// Assets
		this.meshList = [];
		this.materialList = [];
		this.animationList = [];
		this.soundList = [];

		// Data
		this.tagList = [];
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
		if (this.tagList) {
			this.tagList = this.tagList.map((tag) => new Tag(tag));
		}
		if (this.meshList) {
			this.meshList = this.meshList.map((mesh) => new Mesh(mesh));
		}
		if (this.materialList) {
			this.materialList = this.materialList.map((material) => new Material(material));
		}
		if (this.animationList) {
			this.animationList = this.animationList.map((animation) => new Animation(animation));
		}
		if (this.soundList) {
			this.soundList = this.soundList.map((sound) => new Sound(sound));
		}
	}

	get properties() {
		var obj = {
			// Settings
			name: this.name || "Untitled Game",

			// Camera
			camPositionX: this.camPositionX || 0, camPositionY: this.camPositionY || 0, camPositionZ: this.camPositionZ || 0,
			camForwardX: this.camForwardX || 0, camForwardY: this.camForwardY || 0, camForwardZ: this.camForwardZ || 1,
			camTilt: this.camTilt || 0,
			camFov: this.camFov || 45,
			viewPortWidth: this.viewPortWidth || 800, viewPortHeight: this.viewPortHeight || 600,
			perspectiveType: this.perspectiveType || PerspectiveTypes.Perspective,

			// Directional Light
			dirLightDirectionX: this.dirLightDirectionX || 0, dirLightDirectionY: this.dirLightDirectionY || 0, dirLightDirectionZ: this.dirLightDirectionZ || 0,
			dirLightColor: this.dirLightColor || 0xffffff,
			dirLightIntensity: this.dirLightIntensity || 1,

			// Shadow Mapping
			shadowMap: this.shadowMap || null,

			// SkyBox
			skyTopColor: this.skyTopColor || 0x0099ff,
			skyHorizonColor: this.skyHorizonColor || 0x8f8f8f,
			skyBottomColor: this.skyBottomColor || 0x404040,

			// Physics
			physicsOn: this.physicsOn || true,
			gravityX: this.gravityX || 0, gravityY: this.gravityY || -9.81, gravityZ: this.gravityZ || 0,
		}
		return obj;
	}
	
	get jsonObject() {
		var obj = {};
		var data = {
			meshList: this.meshList,
			materialList: this.materialList,
			animationList: this.animationList,
			soundList: this.soundList,
			tagList: this.tagList,
			sceneList: this.sceneList.map(scene => scene.jsonObject),
		}
		Object.assign(obj, this.properties);
		Object.assign(obj, data);
		return obj;
	}
}
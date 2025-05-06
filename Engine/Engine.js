import Renderer from "./Renderer.js";
import Physics from "./Physics.js";
import GameObject from "./GameObject.js";
import Scene from "../Core/Scene.js";

export default class Engine {
    constructor(gameModel) {
        Ammo().then((Ammo) => {
            this.gameModel = gameModel;
            this.debug();
            this.activeScene = new Scene(gameModel.sceneList[0]);
            this.activeGameObjects = [];
            this.initRenderer();
            this.initPhysics(Ammo);
            this.setGameObjects(this.activeScene.actorList);
            this.initGameLoop();
        });
    }
    initGameLoop() {
        if(this.activeScene.actorList.length == 0) {
            console.log("No actors in scene. Exiting game loop.");
            return;
        }
        this.ffps = 100;
        this.deltaTime = 1 / this.ffps;
        this.currentTime = this.accumulator = this.frameTime = this.time = 0.0;
        window.requestAnimationFrame(this.gameLoop.bind(this));
    }
    initPhysics(Ammo) {
        this.physics = new Physics(Ammo);
        this.physics.engine = this;
        this.physics.setGravity(this.gameModel.gravityX, this.gameModel.gravityY, this.gameModel.gravityZ);
        this.physics.setPhysicsOn(this.gameModel.physicsOn);
    }
    initRenderer() {
        this.render = new Renderer(this.gameModel);
        this.render.engine = this;

        this.render.setWindowSize(this.gameModel.viewPortWidth, this.gameModel.viewPortHeight);
        this.render.setCamera(this.gameModel.perspectiveType, this.gameModel.camPositionX, this.gameModel.camPositionY, this.gameModel.camPositionZ, this.gameModel.camForwardX, this.gameModel.camForwardY, this.gameModel.camForwardZ, this.gameModel.camTilt, this.gameModel.camFov);
        this.render.setSkybox(this.gameModel.skyTopColor, this.gameModel.skyHorizonColor, this.gameModel.skyBottomColor);
        this.render.setDirectionalLight(this.gameModel.dirLightDirectionX, this.gameModel.dirLightDirectionY, this.gameModel.dirLightDirectionZ, this.gameModel.dirLightColor, this.gameModel.dirLightIntensity);
    }
    setGameObjects() {
        this.activeScene.actorList.forEach(actor => {
            this.loadGameObject(actor);
        });
        console.log("Number of actors loaded: " + this.activeScene.actorList.length);
    }
    loadGameObject(actor) {
        this.activeGameObjects.push(new GameObject(actor, this));
    }
    gameLoop(newTime) {
        window.requestAnimationFrame(this.gameLoop.bind(this));
        this.frameTime = (newTime - this.currentTime) / 1000;
        if (this.frameTime > 0.1) this.frameTime = 0.1;
        this.accumulator += this.frameTime;
        while (this.accumulator >= this.deltaTime) {
            this.physics.update(this.deltaTime)
            this.activeGameObjects.forEach((gameObject) => {
                gameObject.fixedUpdate();
            });
            this.time += this.deltaTime;
            this.accumulator -= this.deltaTime;
        }
        this.render.update();
        this.currentTime = newTime;
    }
    debug(){
        console.log("Game loaded" + ":\n" + JSON.stringify(this.gameModel.jsonObject, null, 2));
    }
}
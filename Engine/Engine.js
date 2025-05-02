import Renderer from "./Renderer.js";
import Physics from "./Physics.js";
import Actor from "../Core/Actor.js";

export default class Engine {
    constructor(gameModel) {
        Ammo().then((Ammo) => {
            this.gameModel = gameModel;
            this.debug();
            this.activeScene = gameModel.sceneList[0];
            this.initRenderer();
            this.initPhysics(Ammo);
            this.setGameObjects(this.activeScene.actorList);
            this.i = 2;
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
        this.render.setDirectionalLight(this.gameModel.dirLightDirectionX, this.gameModel.dirLightDirectionY, this.gameModel.dirLightDirectionZ, this.gameModel.dirLightColor, this.gameModel.dirLightIntensity);
        this.render.setWindowSize(this.gameModel.viewPortWidth, this.gameModel.viewPortHeight);
        this.render.setSkybox(this.gameModel.skyTopColor, this.gameModel.skyHorizonColor, this.gameModel.skyBottomColor);
        this.render.setCamera(this.gameModel.perspectiveType, this.gameModel.camPositionX, this.gameModel.camPositionY, this.gameModel.camPositionZ, this.gameModel.camForwardX, this.gameModel.camForwardY, this.gameModel.camForwardZ, this.gameModel.camTilt, this.gameModel.camFov);
    }
    setGameObjects() {
        
        this.activeScene.actorList.forEach(actor => {
            this.loadGameObject(actor);
        });
        console.log("Number of actors loaded: " + this.activeScene.actorList.length);
    }
    loadGameObject(actor, amount = 1) {
        this.render.loadRenderObject(actor, () => {
            if (amount > 1)
            {
                this.loadGameObject(new Actor(actor), amount - 1);
            }
            this.physics.addPhysicsObject(actor);
        });
    }
    makePhysicsObject(actor) {
        this.physics.addPhysicsObject(actor);
    }
    gameLoop(newTime) {
        window.requestAnimationFrame(this.gameLoop.bind(this));
        if(this.i++ == 100)
        {
            let actor = new Actor(this.activeScene.actorList[0]);
            actor.positionX = 0;
            actor.positionY = 1000;
            actor.positionZ = 0;
            this.loadGameObject(actor, 1);
            this.i = 0;
        }
        this.frameTime = (newTime - this.currentTime) / 1000;
        if (this.frameTime > 0.1) this.frameTime = 0.1;
        this.accumulator += this.frameTime;
        while (this.accumulator >= this.deltaTime) {
            this.physics.update(this.deltaTime);
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
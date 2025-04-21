import Renderer from "./Renderer.js";
import Physics from "./Physics.js";

export default class Engine {
    constructor(gameModel) {
        Ammo().then((Ammo) => {
            this.gameModel = gameModel;
            this.debug();
            this.activeScene = gameModel.sceneList[0];
            this.initRenderer();
            this.initPhysics(Ammo);
            this.gameLoop(1);
        });
    }
    initPhysics(Ammo) {
        this.physics = new Physics(Ammo);
        this.physics.setGravity(this.gameModel.gravityX, this.gameModel.gravityY, this.gameModel.gravityZ);
        this.physics.setPhysicsOn(this.gameModel.physicsOn);
        this.physics.setPhysicsObjects(this.activeScene.actorList);
    }
    initRenderer() {
        this.render = new Renderer(this.gameModel);
        this.render.setDirectionalLight(this.gameModel.dirLightDirectionX, this.gameModel.dirLightDirectionY, this.gameModel.dirLightDirectionZ, this.gameModel.dirLightColor, this.gameModel.dirLightIntensity);
        this.render.setWindowSize(this.gameModel.viewPortWidth, this.gameModel.viewPortHeight);
        this.render.setSkybox(this.gameModel.skyTopColor, this.gameModel.skyHorizonColor, this.gameModel.skyBottomColor);
        this.render.setGameObjects(this.activeScene.actorList);
        this.render.setCamera(this.gameModel.perspectiveType, this.gameModel.camPositionX, this.gameModel.camPositionY, this.gameModel.camPositionZ, this.gameModel.camForwardX, this.gameModel.camForwardY, this.gameModel.camForwardZ, this.gameModel.camTilt, this.gameModel.camFov);
        
    }
    gameLoop(newTime) {
        requestAnimationFrame(this.gameLoop.bind(this));
        this.frameTime = (newTime - this.currentTime) / 1000;
        if (this.frameTime > 0.1) this.frameTime = 0.1;
        this.accumulator += this.frameTime;
        /*while (this.accumulator >= this.deltaTime) {
            this.physics.fixedStep(this.deltaTime);
            this.logic.fixedUpdate(this.deltaTime, this.scope);
            this.time += this.deltaTime;
            this.accumulator -= this.deltaTime;
        }*/
        this.render.update();
        this.physics.update(this.frameTime);
        this.currentTime = newTime;
    }
    debug(){
        console.log("Game loaded" + ":\n" + JSON.stringify(this.gameModel.jsonObject, null, 2));
    }
}
import Renderer from "./Renderer.js";

export default class Engine {
    constructor(gameModel) {
        this.gameModel = gameModel;
        this.debug();
        this.activeScene = gameModel.sceneList[0];
        this.render = new Renderer(gameModel.gameObjects);
        this.render.setDirectionalLight(gameModel.dirLightDirectionX, gameModel.dirLightDirectionY, gameModel.dirLightDirectionZ, gameModel.dirLightColor, gameModel.dirLightIntensity);
        this.render.setWindowSize(gameModel.viewPortWidth, gameModel.viewPortHeight);
        this.render.setSkybox(gameModel.skyTopColor, gameModel.skyHorizonColor, gameModel.skyBottomColor);
        this.render.setCamera(gameModel.camPositionX, gameModel.camPositionY, gameModel.camPositionZ, gameModel.camForwardX, gameModel.camForwardY, gameModel.camForwardZ, gameModel.camTilt, gameModel.camFov);
        this.render.setGameObjects(this.activeScene.actorList);
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
        this.currentTime = newTime;
    }
    debug(){
        console.log("Game loaded" + ":\n" + JSON.stringify(this.gameModel.jsonObject, null, 2));
    }
}
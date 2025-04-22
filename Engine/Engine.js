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
            this.setGameObjects(this.activeScene.actorList);
            this.currentTime = Date.now();
            this.gameLoop();
        });
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
    }
    loadGameObject(actor) {
        this.render.addRenderObject(actor, () => {
            this.physics.addPhysicsObject(actor);
        });
    }
    makePhysicsObject(actor) {
        this.physics.addPhysicsObject(actor);
    }
    gameLoop() {
        requestAnimationFrame(this.gameLoop.bind(this));
        
        let newTime = Date.now();
        let deltaTime = newTime - this.currentTime;
        this.currentTime = newTime;

        this.physics.update(deltaTime);
        this.render.update();
    }
    debug(){
        console.log("Game loaded" + ":\n" + JSON.stringify(this.gameModel.jsonObject, null, 2));
    }
}
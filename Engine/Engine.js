import Renderer from "./Renderer.js";
import Physics from "./Physics.js";
import GameObject from "./GameObject.js";
import Scene from "../Core/Scene.js";
import Rigidbody from "./Rigidbody.js";
import Input from "./Input.js";
import Actor from "../Core/Actor.js";
import Timer from "./Timer.js";
import { objectDirection } from "three/tsl";

export default class Engine {
    constructor(gameModel) {
        Ammo().then((Ammo) => {
            this.gameModel = gameModel;
            this.debug();
            this.activeScene = new Scene(gameModel.sceneList[0]);
            this.activeGameObjects = [];
            this.initRenderer();
            this.initPhysics(Ammo);
            this.input = new Input();
            this.setGameObjects(this.activeScene.actorList);
            this.i = 0;
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
            this.physics.update(this.deltaTime);
            this.activeGameObjects.forEach((gameObject) => {
                gameObject.fixedUpdate();
            });
            if(this.i++ == 50){
                this.spawn(this.activeGameObjects[0]);
                this.i = 0;
            }
            Input.restartInput();
            this.time += this.deltaTime;
            this.accumulator -= this.deltaTime;
        }
        this.render.update();
        this.currentTime = newTime;
    }
    debug(){
        console.log("Game loaded" + ":\n" + JSON.stringify(this.gameModel.jsonObject, null, 2));
    }
    //#region Commands
    //#region Actions
    spawn(gameObject) {
        this.loadGameObject(new Actor(gameObject.actor));
    }
    delete(gameObject) {
        gameObject.dead = true;
    }
    //TODO animate, play
    move(gameObject, direction, speed) {
        gameObject.positionX += direction.x * speed;
        gameObject.positionY += direction.y * speed;
        gameObject.positionZ += direction.z * speed;
    }
    moveTo(gameObject, speed, x, y, z) {
        let direction = {
            x: x - gameObject.positionX,
            y: y - gameObject.positionY,
            z: z - gameObject.positionZ
        };
        let length = Math.sqrt(direction.x * direction.x + direction.y * direction.y + direction.z * direction.z);
        if (length > 0) {
            direction.x /= length;
            direction.y /= length;
            direction.z /= length;
        }
        this.move(gameObject, direction, speed);
    }

    rotate(gameObject, axis, angle) {
        angle = Utils.Deg2Rad(angle);
        gameObject.quaternion = Utils.rotateQuaternionAroundAxis(gameObject._quaternion, axis, angle);
    }
    rotateTo(gameObject, speed, x, y, z) {
        speed = Utils.Deg2Rad(speed);
        let direction = {
            x: x - gameObject.positionX,
            y: y - gameObject.positionY,
            z: z - gameObject.positionZ
        };
        let length = Math.sqrt(direction.x * direction.x + direction.y * direction.y + direction.z * direction.z);
        if (length > 0) {
            direction.x /= length;
            direction.y /= length;
            direction.z /= length;
        }
        this.rotate(gameObject, direction, speed);
    }
    rotateAround(gameObject, point, axis, angle) {
        angle = Utils.Deg2Rad(angle);
        
        const offset = {
            x: gameObject.positionX - point.x,
            y: gameObject.positionY - point.y,
            z: gameObject.positionZ - point.z
        };

        const rotationQuat = Utils.eulerToQuaternion({
            x: axis.x * angle,
            y: axis.y * angle,
            z: axis.z * angle
        });

        const rotatedOffset = Utils.rotateVectorByQuaternion(offset, rotationQuat);

        gameObject.positionX = point.x + rotatedOffset.x;
        gameObject.positionY = point.y + rotatedOffset.y;
        gameObject.positionZ = point.z + rotatedOffset.z;

        if (gameObject.quaternion) {
            gameObject.quaternion = Utils.rotateQuaternionAroundAxis(
                gameObject.quaternion,
                axis,
                angle
            );
        }
    }

    push(gameObject, direction, force) {
        Rigidbody.push(gameObject, direction, force);
    }
    pushTo(gameObject, speed, x, y, z) {
        let direction = {
            x: x - gameObject.positionX,
            y: y - gameObject.positionY,
            z: z - gameObject.positionZ
        };
        let length = Math.sqrt(direction.x * direction.x + direction.y * direction.y + direction.z * direction.z);
        if (length > 0) {
            direction.x /= length;
            direction.y /= length;
            direction.z /= length;
        }
        this.push(gameObject, direction, speed);
    }
    impulse(gameObject, direction, force) {
        Rigidbody.impulse(gameObject, direction, force);
    }
    impulseTo(gameObject, speed, x, y, z) {
        let direction = {
            x: x - gameObject.positionX,
            y: y - gameObject.positionY,
            z: z - gameObject.positionZ
        };
        let length = Math.sqrt(direction.x * direction.x + direction.y * direction.y + direction.z * direction.z);
        if (length > 0) {
            direction.x /= length;
            direction.y /= length;
            direction.z /= length;
        }
        this.impulse(gameObject, direction, speed);
    }

    torque(gameObject, axis, force) {
        Rigidbody.torque(gameObject, axis, force);
    }
    torqueImpulse(gameObject, axis, force) {
        Rigidbody.torqueImpulse(gameObject, axis, force);
    }

    setTimer(gameObject, timer, seconds, loop, isRunning = true)  {
        gameObject.timers[timer] = new Timer(seconds, loop, isRunning);
    }
    //#endregion
    //#region Conditions
    timer(gameObject, timer) {
        if(!gameObject.timers[timer]) {
            return false;
        }

        return gameObject.timers[timer].update(this.deltaTime);
    }
    collision(gameObject, tags, mode) {
        tags = tags.split(",");
        for(let tag of tags) {
            if(!gameObject.collisionInfo[tag]) {
                continue;
            }
            for(let id in gameObject.collisionInfo[tag]) {
                if(!gameObject.collisionInfo[tag][id]) {
                    continue;
                }
                if(gameObject.collisionInfo[tag][id][mode]) {
                    return true;
                }
            }
        }
        return false;
    }
    keyboard(key, mode) {
        if(!Input.keyList[key]) {
            Input.keyList[key] = { down: false, up: false, pressed: false };
        }
        return Input.keyList[key][mode];
    }
    //#endregion
    //#endregion
}
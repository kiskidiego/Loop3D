import Renderer from "./Renderer.js";
import Physics from "./Physics.js";
import GameObject from "./GameObject.js";
import Scene from "../Core/Scene.js";
import Rigidbody from "./Rigidbody.js";
import Input from "./Input.js";
import Actor from "../Core/Actor.js";
import Timer from "./Timer.js";
export default class Engine {
    constructor(gameModel) {
        Ammo().then((Ammo) => {
            this.scope = {"Engine": this};
            this.gameModel = gameModel;
            this.debug();
            this.activeScene = new Scene(gameModel.sceneList[0]);
            this.activeGameObjects = [];
            this.initRenderer();
            this.initPhysics(Ammo);
            this.input = new Input();
            this.i = 0;
            this.setGameObjects(this.activeScene.actorList);
            //math.eval("console.log('Hello World')");
        });
    }
    initGameLoop() {
        if(this.activeScene.actorList.length == 0) {
            console.log("No actors in scene. Exiting game loop.");
            return;
        }
        if(this.loadedObjects < this.activeScene.actorList.length) {
            console.log("Loading game objects: " + this.loadedObjects + "/" + this.activeScene.actorList.length);
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
        this.loadedObjects = 0;
        this.activeScene.actorList.forEach(actor => {
            this.loadGameObject(actor);
            this.loadedObjects++;
            this.initGameLoop();
        });
        console.log("Number of actors loaded: " + this.activeScene.actorList.length);
    }
    loadGameObject(actor, spawned = false) {
        const gameObject = new GameObject(actor, this, spawned);
        this.activeGameObjects.push(gameObject);
        console.log(this.scope);
        return gameObject;
    }
    removeGameObject(gameObject) {
        this.physics.removeGameObject(gameObject);
        this.render.removeGameObject(gameObject);
        this.activeGameObjects.splice(this.activeGameObjects.findIndex(i => i.id == gameObject.id), 1);
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
    spawn(gameObject, x, y, z, rotationX, rotationY, rotationZ) {
        const newGameObject = this.loadGameObject(new Actor(gameObject.actor), true);
        if(x !== undefined && y !== undefined && z !== undefined) {
            newGameObject.positionX = x;
            newGameObject.positionY = y;
            newGameObject.positionZ = z;
        }
        if(rotationX !== undefined && rotationY !== undefined && rotationZ !== undefined) {
            newGameObject.rotationX = rotationX;
            newGameObject.rotationY = rotationY;
            newGameObject.rotationZ = rotationZ;
        }
    }
    delete(gameObject) {
        gameObject.dead = true;
    }
    //TODO animate, play
    move(gameObject, x, y, z, speed, keepForces = true) {
        gameObject.positionX += x * speed;
        gameObject.positionY += y * speed;
        gameObject.positionZ += z * speed;
        if(!keepForces) {
            Rigidbody.resetBodyMotion(gameObject);
        }
    }
    moveTo(gameObject, x, y, z, speed, keepForces = true) {
        const direction = {
            x: x - gameObject.positionX,
            y: y - gameObject.positionY,
            z: z - gameObject.positionZ
        };
        const length = Math.sqrt(direction.x * direction.x + direction.y * direction.y + direction.z * direction.z);
        if (length > 0) {
            direction.x /= length;
            direction.y /= length;
            direction.z /= length;
        }
        const target = {
            x: direction.x * speed,
            y: direction.y * speed,
            z: direction.z * speed
        }
        const intendedTarget = {
            x: x - gameObject.positionX,
            y: y - gameObject.positionY,
            z: z - gameObject.positionZ
        }
        gameObject.positionX += Math.min(Math.abs(target.x), Math.abs(intendedTarget.x)) * Math.sign(intendedTarget.x);
        gameObject.positionY += Math.min(Math.abs(target.y), Math.abs(intendedTarget.y)) * Math.sign(intendedTarget.y);
        gameObject.positionZ += Math.min(Math.abs(target.z), Math.abs(intendedTarget.z)) * Math.sign(intendedTarget.z);
        if(!keepForces) {
            Rigidbody.resetBodyMotion(gameObject);
        }
    }

    rotate(gameObject, axis, angle) {
        angle = Utils.Deg2Rad(angle);
        gameObject.quaternion = Utils.rotateQuaternionAroundAxis(gameObject._quaternion, axis, angle);
    }
    rotateTo(gameObject, x, y, z, speed) {
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
    pushTo(gameObject, x, y, z, force) {
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
        this.push(gameObject, direction, force);
    }
    impulse(gameObject, direction, force) {
        Rigidbody.impulse(gameObject, direction, force);
    }
    impulseTo(gameObject, x, y, z, force) {
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
        this.impulse(gameObject, direction, force);
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
    startTimer(gameObject, timer) {
        if(!gameObject.timers[timer]) {
            return false;
        }
        gameObject.timers[timer].start();
    }
    stopTimer(gameObject, timer) {
        if(!gameObject.timers[timer]) {
            return false;
        }
        gameObject.timers[timer].stop();
    }
    resetTimer(gameObject, timer) {
        if(!gameObject.timers[timer]) {
            return false;
        }
        gameObject.timers[timer].reset();
    }
    deleteTimer(gameObject, timer) {
        if(!gameObject.timers[timer]) {
            return false;
        }
        delete gameObject.timers[timer];
    }
    //#endregion
    //#region Conditions
    checkTimer(gameObject, timer) {
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
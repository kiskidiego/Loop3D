import Renderer from "./Renderer.js";
import Physics from "./Physics.js";
import GameObject from "./GameObject.js";
import Scene from "../Core/Scene.js";
import Rigidbody from "./Rigidbody.js";
import Input from "./Input.js";
import Actor from "../Core/Actor.js";
import Timer from "./Timer.js";
import * as THREE from 'three';
var engine = null;

export default class Engine {
    constructor(gameModel) {
console.log("yeah");
        this.gameModel = gameModel;
        engine = this;
        this.unlockAudioContext(Howler.ctx);
    }
    unlockAudioContext(audioCtx) {
        const b = document.body;
        const events = ['touchstart','touchend', 'mousedown','keydown'];
        events.forEach(e => b.addEventListener(e, unlock, false));
        function unlock() { 
            document.getElementById("start").remove();
            clean();
            engine.loadPhysics();
        }
        function clean() { events.forEach(e => b.removeEventListener(e, unlock)); }
    }
    loadPhysics() {
        Ammo().then((Ammo) => {
            engine.startGame(Ammo);
        });
    }
    startGame(Ammo) {
        this.scope = {"Engine": this};
            this.scope["Random"] = Math.random;
            this.scope["Sqrt"] = Math.sqrt;
            this.scope["Abs"] = Math.abs;
            this.scope["Sin"] = Math.sin;
            this.scope["Cos"] = Math.cos;
            this.scope["Tan"] = Math.tan;
            this.scope["Min"] = Math.min;
            this.scope["Max"] = Math.max;
            this.scope["Clamp"] = (value, min, max) => Math.min(Math.max(value, min), max);
            this.sceneList = [];
            this.gameModel.sceneList.forEach((scene) => {
                const newScene = new Scene(scene);
                this.sceneList.push(newScene);
                this.scope[newScene.name] = newScene;
            });
            this.activeGameObjects = [];
            this.initRenderer();
            this.initPhysics(Ammo);
            new Input(this);
            this.volume = Howler.volume;
            this.threeVector2 = new THREE.Vector2();
            this.threeVector3 = new THREE.Vector3();
            this.activeScene = this.sceneList[0];
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
        this.loopRunning = true;
        this.animationRequest = window.requestAnimationFrame(this.gameLoop.bind(this));
    }
    initPhysics(Ammo) {
        this.physics = new Physics(Ammo);
        this.physics.engine = this;
        this.physics.setGravity(this.gameModel.gravityX, this.gameModel.gravityY, this.gameModel.gravityZ);
        this.physics.setPhysicsOn(this.gameModel.physicsOn);
    }
    initRenderer() {
        this.render = new Renderer(this.gameModel.shadows);
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
    }
    loadGameObject(actor, spawned = false) {
        const gameObject = new GameObject(actor, this, spawned);
        this.activeGameObjects.push(gameObject);
        return gameObject;
    }
    removeGameObject(gameObject) {
        this.physics.removeGameObject(gameObject);
        this.render.removeGameObject(gameObject);
        this.activeGameObjects.splice(this.activeGameObjects.findIndex(i => i.id == gameObject.id), 1);
    }
    gameLoop(newTime) {
        this.animationRequest = window.requestAnimationFrame(this.gameLoop.bind(this));
        this.frameTime = (newTime - this.currentTime) / 1000;
        if (this.frameTime > 0.1) this.frameTime = 0.1;
        this.accumulator += this.frameTime;
        while (this.accumulator >= this.deltaTime && this.loopRunning) {
            this.physics.update(this.deltaTime);
            this.activeGameObjects.forEach((gameObject) => {
                gameObject.fixedUpdate();
            });
            Input.restartInput();
            this.time += this.deltaTime;
            this.accumulator -= this.deltaTime;
        }
        this.render.update(this.frameTime);
        this.currentTime = newTime;
    }
    stopGameLoop() {
        this.loopRunning = false;
        window.cancelAnimationFrame(this.animationRequest);
    }
    debug(name, message, values = []) {
        let valueString = "";
        for(let i = 0; i < values._data.length; i++) {
            if(i > 0) {
                valueString += ", ";
            }
            valueString += values._data[i];
        }
        message = message || "";
        console.log(name, ": ", message, valueString);
    }
    get camPositionX() {
        return this.render.camera.position.x;
    }
    get camPositionY() {
        return this.render.camera.position.y;
    }
    get camPositionZ() {
        return this.render.camera.position.z;
    }
    set camPositionX(value) {
        this.render.camera.position.x = value;
    }
    set camPositionY(value) {
        this.render.camera.position.y = value;
    }
    set camPositionZ(value) {
        this.render.camera.position.z = value;
    }

    get camForwardX() {
        return this.render.camForward.x;
    }
    get camForwardY() {
        return this.render.camForward.y;
    }
    get camForwardZ() {
        return this.render.camForward.z;
    }

    set camForwardX(value) {
        this.render.setCameraForward(value, undefined, undefined);
    }
    set camForwardY(value) {
        this.render.setCameraForward(undefined, value, undefined);
    }
    set camForwardZ(value) {
        this.render.setCameraForward(undefined, undefined, value);
    }

    get camTilt() {
        return this.render.camTilt;
    }
    set camTilt(value) {
        this.render.setCameraTilt(value);
    }

    get camFov() {
        return this.render.camera.fov;
    }
    set camFov(value) {
        this.render.setCameraFov(value);
    }

    get viewPortHeight() {
        this.render.renderer.getSize(this.threeVector2);
        return this.threeVector2.y;
    }
    get viewPortWidth() {
        this.render.renderer.getSize(this.threeVector2);
        return this.threeVector2.x;
    }
    
    /*
    set viewPortHeight(value) {
        this.render.setWindowSize(this.viewPortWidth, value);
        this.render.camera.aspect = this.viewPortWidth / this.viewPortHeight;
    }
    set viewPortWidth(value) {
        this.render.setWindowSize(value, this.viewPortHeight);
        this.render.camera.aspect = this.viewPortWidth / this.viewPortHeight;
    }
    */
    
    get skyTopColor() {
        return this.render.skyTopColor;
    }
    set skyTopColor(value) {
        this.render.setSkybox(value, this.skyHorizonColor, this.skyBottomColor);
    }
    get skyHorizonColor() {
        return this.render.skyHorizonColor;
    }
    set skyHorizonColor(value) {
        this.render.setSkybox(this.skyTopColor, value, this.skyBottomColor);
    }
    get skyBottomColor() {
        return this.render.skyBottomColor;
    }
    set skyBottomColor(value) {
        this.render.setSkybox(this.skyTopColor, this.skyHorizonColor, value);
    }

    get dirLightDirectionX() {
        return this.render.directionalLightDirection.x;
    }
    get dirLightDirectionY() {
        return this.render.directionalLightDirection.y;
    }
    get dirLightDirectionZ() {
        return this.render.directionalLightDirection.z;
    }
    set dirLightDirectionX(value) {
        this.render.setDirectionalLight(value, this.dirLightDirectionY, this.dirLightDirectionZ, this.dirLightColor, this.dirLightIntensity);
    }
    set dirLightDirectionY(value) {
        this.render.setDirectionalLight(this.dirLightDirectionX, value, this.dirLightDirectionZ, this.dirLightColor, this.dirLightIntensity);
    }
    set dirLightDirectionZ(value) {
        this.render.setDirectionalLight(this.dirLightDirectionX, this.dirLightDirectionY, value, this.dirLightColor, this.dirLightIntensity);
    }

    get dirLightColor() {
        return this.render.directionalLightColor;
    }
    set dirLightColor(value) {
        this.render.setDirectionalLight(this.dirLightDirectionX, this.dirLightDirectionY, this.dirLightDirectionZ, value, this.dirLightIntensity);
    }

    get dirLightIntensity() {
        return this.render.directionalLightIntensity;
    }
    set dirLightIntensity(value) {
        this.render.setDirectionalLight(this.dirLightDirectionX, this.dirLightDirectionY, this.dirLightDirectionZ, this.dirLightColor, value);
    }

    get shadows() {
        return this.render.renderer.shadowMap.enabled;
    }
    set shadows(value) {
        this.render.renderer.shadowMap.enabled = value;
    }

    get physicsOn() {
        return this.physics.physicsOn;
    }
    set physicsOn(value) {
        this.physics.setPhysicsOn(value);
    }

    get gravityX() {
        return this.physics.getGravity().x;
    }
    get gravityY() {
        return this.physics.getGravity().y;
    }
    get gravityZ() {
        return this.physics.getGravity().z;
    }

    set gravityX(value) {
        this.physics.setGravity(value, this.gravityY, this.gravityZ);
    }
    set gravityY(value) {
        this.physics.setGravity(this.gravityX, value, this.gravityZ);
    }
    set gravityZ(value) {
        this.physics.setGravity(this.gravityX, this.gravityY, value);
    }

    get activeScene() {
        return this._activeScene;
    }
    set activeScene(value) {
        if(this.animationRequest) {
            this.stopGameLoop();
        }
        while(this.activeGameObjects.length > 0) {
            this.removeGameObject(this.activeGameObjects[0]);
        }
        this._activeScene = value;
        Input.restartInput();
        this.setGameObjects(this._activeScene.actorList);
    }
    get volume() {
        return Howler.volume();
    }
    set volume(value) {
        Howler.volume(value);
    }

    get normalizedMouseX() {
        return Input.mouse.x;
    }
    get normalizedMouseY() {
        return Input.mouse.y;
    }

    get mouseX() {
        return (Input.mouse.x + 1) / 2 * this.viewPortWidth;
    }
    get mouseY() {
        return (Input.mouse.y + 1) / 2 * this.viewPortHeight;
    }

    //#region Commands
    //#region Actions
    spawn(actor, attributes) {
        const actorToSpawn = this._activeScene.actorList.find((a) => a.name == actor);
        if(!actorToSpawn) {
            console.warn("Actor not found: " + actor);
            return;
        }
        const newActor = new Actor(actorToSpawn);
        const keys = Object.keys(attributes || {});
        keys.forEach((key) => {
            if(newActor[key] !== undefined) {
                newActor[key] = attributes[key];
            } else {
                console.warn(`Attribute ${key} not found in actor ${actor}`);
            }
        });
        this.loadGameObject(newActor, true);
    }
    delete(gameObject) {
        gameObject.dead = true;
    }
    animate(gameObject, animation, loop = false, transition) {
        if(!gameObject.mixer) {
            console.warn("No mixer found for gameObject: " + gameObject.name);
            return;
        }

        let animName;
        if(isNaN(animation)) {
            animName = animation;
            animation = gameObject.actions.findIndex(i => i._clip.name == animation);
        }
        if(animation == -1) {
            console.warn("Animation not found: " + animName);
            return;
        }

        for(let i = 0; i < gameObject.actions.length; i++) {
            if(gameObject.actions[i] == gameObject.actions[animation]) {
                continue;
            }
            gameObject.actions[i].fadeOut(transition);
            setTimeout(() => {
                gameObject.actions[i].stop();
            }, transition * 1000);
        }

        if(!gameObject.actions[animation]) {
            console.warn("No animation found for gameObject: " + gameObject.name);
            return;
        }
        console.log(gameObject.actions[animation]);
        gameObject.actions[animation].setLoop(loop ? THREE.LoopRepeat : THREE.LoopOnce);
        gameObject.actions[animation].reset().fadeIn(transition).play();
    }
    stopAnimation(gameObject, animation, transition) {
        if(!gameObject.mixer) {
            console.warn("No mixer found for gameObject: " + gameObject.name);
            return;
        }
        if(isNaN(animation)) {
            animation = gameObject.actions.findIndex(i => i._clip.name == animation);
        }
        if(animation == -1) {
            console.warn("Animation not found: " + animation);
            return;
        }
        if(!gameObject.actions[animation]) {
            console.warn("No animation found for gameObject: " + gameObject.name);
            return;
        }
        gameObject.actions[animation].fadeOut(transition);
        setTimeout(() => {
            gameObject.actions[animation].stop();
        }, transition * 1000);
    }
    playSound(gameObject, sound) {
        if(gameObject.sounds[sound]) {
            gameObject.sounds[sound].play();
        }
    }
    stopSound(gameObject, sound) {
        if(gameObject.sounds[sound]) {
            gameObject.sounds[sound].stop();
        }
    }
    setVolume(gameObject, sound, volume) {
        if(gameObject.sounds[sound]) {
            gameObject.sounds[sound].volume(volume);
        }
    }
    setGlobalVolume(volume) {
        Howler.volume(volume);
    }
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

    rotate(gameObject, x, y, z, angle) {
        const angleX = x * angle;
        const angleY = y * angle;
        const angleZ = z * angle;

        gameObject.rotationX += angleX;
        gameObject.rotationY += angleY;
        gameObject.rotationZ += angleZ;

    }
    rotateTo(gameObject, x, y, z, speed) {
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
        this.rotate(gameObject, direction.x, direction.y, direction.z, speed);
    }
    
    push(gameObject, x, y, z, force) {
        Rigidbody.push(gameObject, {x: x, y: y, z: z}, force);
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
    impulse(gameObject, x, y, z, force) {
        Rigidbody.impulse(gameObject, {x: x, y: y, z: z}, force);
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

    torque(gameObject, x, y, z, force) {
        Rigidbody.torque(gameObject, {x: x, y: y, z: z}, force);
    }
    torqueImpulse(gameObject, x, y, z, force) {
        Rigidbody.torqueImpulse(gameObject, {x: x, y: y, z: z}, force);
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
    input(key, mode) {
        if(!Input.keyList[key]) {
            Input.keyList[key] = { down: false, up: false, pressed: false };
        }
        return Input.keyList[key][mode];
    }
    hover(gameObject) {
        if(!gameObject) return false;
        if(!gameObject.meshInstance) return false;
        return Input.isHovering(gameObject);
    }
    //#endregion
    //#endregion
}
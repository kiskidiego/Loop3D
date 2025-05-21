import * as THREE from 'three';

export default class Input {
    static keyList = new Object();
    static firstTime = true;
    static rayCaster = new THREE.Raycaster();
    static mouse = new THREE.Vector2();
    static engine = null;

    constructor(engine) {
        if (Input.firstTime) { // Key events are only added once
            Input.firstTime = false;
            Input.engine = engine;
            document.addEventListener("keydown", Input.keyDownHandler.bind(this));
            document.addEventListener("keyup", Input.keyUpHandler.bind(this));
            document.addEventListener("mousemove", Input.mouseMoveHandler.bind(this));
            document.addEventListener("mousedown", Input.mouseDownHandler.bind(this));
            document.addEventListener("mouseup", Input.mouseUpHandler.bind(this));
        }
    }

    static restartInput() {
        for (let key in Input.keyList) {
            Input.keyList[key].down = false;
            Input.keyList[key].up = false;
        }
    }

    static addKey(key) {
        if (!Input.keyList.hasOwnProperty(key)) Input.keyList[key] = { down: false, up: true, pressed: false };
    }
    
    // Handlers
    static keyDownHandler(event) {
        event.preventDefault();
        if(!Input.keyList[event.code])
            Input.keyList[event.code] = { down: false, up: true, pressed: false };
        Input.keyList[event.code] = { down: !Input.keyList[event.code].pressed, up: false, pressed: true };
    }

    static keyUpHandler(event) {
        event.preventDefault();
        if(!Input.keyList[event.code])
            Input.keyList[event.code] = { down: false, up: true, pressed: false };
        Input.keyList[event.code] = { down: false, up: true, pressed: false };
    }

    static mouseMoveHandler(event) {
        event.preventDefault();
        Input.mouse.x = (event.clientX / Input.engine.viewPortWidth) * 2 - 1;
        Input.mouse.y = -(event.clientY / Input.engine.viewPortHeight) * 2 + 1;
    }

    static mouseDownHandler(event) {
        event.preventDefault();
        let eventName = "";
        switch(event.button) {
            case 0:
                eventName = "MouseLeft";
                break;
            case 1:
                eventName = "MouseMiddle";
                break;
            case 2:
                eventName = "MouseRight";
                break;
            default:
                eventName = "Mouse" + event.button;
        }
        if(!Input.keyList[eventName])
            Input.keyList[eventName] = { down: false, up: true, pressed: false };
        Input.keyList[eventName] = { down: !Input.keyList[eventName].pressed, up: false, pressed: true };
    }

    static mouseUpHandler(event) {
        event.preventDefault();
        let eventName = "";
        switch(event.button) {
            case 0:
                eventName = "MouseLeft";
                break;
            case 1:
                eventName = "MouseMiddle";
                break;
            case 2:
                eventName = "MouseRight";
                break;
            default:
                eventName = "Mouse" + event.button;
        }
        if(!Input.keyList[eventName])
            Input.keyList[eventName] = { down: false, up: true, pressed: false };
        Input.keyList[eventName] = { down: false, up: true, pressed: false };
    }

    static isHovering(gameObject) {
        if(!gameObject) return false;
        if(!gameObject.meshInstance) return false;
        Input.rayCaster.setFromCamera(Input.mouse, gameObject.screen ? gameObject.engine.render.hudCamera : gameObject.engine.render.camera);
        const intersects = Input.rayCaster.intersectObjects([gameObject.meshInstance], true);
        if(intersects.length > 0) {
            return true;
        }
        return false;
    }
}
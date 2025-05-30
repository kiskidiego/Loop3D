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
            Input.keyList[key].pressed = false;
            Input.keyList[key].released = false;
        }
    }

    static addKey(key) {
        if (!Input.keyList.hasOwnProperty(key)) Input.keyList[key] = { pressed: false, released: true, down: false };
    }
    
    // Handlers
    static keyDownHandler(event) {
        event.preventDefault();
        if(!Input.keyList[event.code])
            Input.keyList[event.code] = { pressed: false, released: true, down: false };
        Input.keyList[event.code] = { pressed: !Input.keyList[event.code].down, released: false, down: true };
    }

    static keyUpHandler(event) {
        event.preventDefault();
        if(!Input.keyList[event.code])
            Input.keyList[event.code] = { pressed: false, released: true, down: false };
        Input.keyList[event.code] = { pressed: false, released: true, down: false };
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
            Input.keyList[eventName] = { pressed: false, released: true, down: false };
        Input.keyList[eventName] = { pressed: !Input.keyList[eventName].down, released: false, down: true };
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
            Input.keyList[eventName] = { pressed: false, released: true, down: false };
        Input.keyList[eventName] = { pressed: false, released: true, down: false };
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
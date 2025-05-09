export default class Input {
    static keyList = new Object();
    static firstTime = true;

    constructor() {
        if (Input.firstTime) { // Key events are only added once
            document.addEventListener("keydown", Input.keyDownHandler.bind(this));
            document.addEventListener("keyup", Input.keyUpHandler.bind(this));
            Input.firstTime = false;
        }
    }

    static restartInput() {
        for (let key in Input.keyList) {
            Input.keyList[key].down = false;
            Input.keyList[key].up = false;
        }
    }

    static addKey(key) {
        if (!this.keyList.hasOwnProperty(key)) this.keyList[key] = { down: false, up: true, pressed: false };
    }
    
    // Handlers
    static keyDownHandler(event) {
        event.preventDefault();
        Input.keyList[event.code] = { down: !Input.keyList[event.code].pressed, up: false, pressed: true };
    }

    static keyUpHandler(event) {
        event.preventDefault();
        Input.keyList[event.code] = { down: false, up: true, pressed: false };
    }
}
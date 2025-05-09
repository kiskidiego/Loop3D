export default class Timer {
    constructor(startTime, loop, isRunning) {
        this.startTime = startTime;
        this.loop = loop;
        this.currentTime = startTime;
        this.isRunning = isRunning;
    }
    start() {
        this.isRunning = true;
    }
    stop() {
        this.isRunning = false;
    }
    reset() {
        this.currentTime = this.startTime;
    }
    update(deltaTime) {
        if (this.isRunning) {
            this.currentTime -= deltaTime;
            if (this.currentTime <= 0) {
                if (this.loop) {
                    this.currentTime = this.startTime;
                } else {
                    this.isRunning = false;
                }
                return true; // Timer finished
            }
        }
        return false; // Timer still running
    }
}
class Utils {

    static id() {
        return "_" + new Date().valueOf() + Math.random().toFixed(16).substring(2);
    }
}
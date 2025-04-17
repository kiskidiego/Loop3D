class Utils {
    static id() {
        return "_" + new Date().valueOf() + Math.random().toFixed(16).substring(2);
    }
    static hexToRgb(hex) {
        console.log(hex.toString(16));
        console.log({
            r: (hex >> 16) & 0xff,
            g: (hex >> 8) & 0xff,
            b: hex & 0xff
        });
        return {
            r: ((hex >> 16) & 0xff)/255.0,
            g: ((hex >> 8) & 0xff)/255.0,
            b: (hex & 0xff)/255.0
        }
      }
}
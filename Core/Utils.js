class Utils {
    static id() {
        return "_" + new Date().valueOf() + Math.random().toFixed(16).substring(2);
    }
    static hexToRgb(hex) {
        return {
            r: ((hex >> 16) & 0xff)/255.0,
            g: ((hex >> 8) & 0xff)/255.0,
            b: (hex & 0xff)/255.0
        }
    }
    static quaternionToEuler(q) {
        const x = q.x, y = q.y, z = q.z, w = q.w;
        
        const sinr_cosp = 2 * (w * x + y * z);
        const cosr_cosp = 1 - 2 * (x * x + y * y);
        const X = Math.atan2(sinr_cosp, cosr_cosp);
    
        const sinp = 2 * (w * y - z * x);
        const Y = Math.abs(sinp) >= 1 ? 
            Utils.copySign(Math.PI / 2, sinp) : 
            Math.asin(sinp);
    
        const siny_cosp = 2 * (w * z + x * y);
        const cosy_cosp = 1 - 2 * (y * y + z * z);
        const Z = Math.atan2(siny_cosp, cosy_cosp);
    
        return {x: X, y: Y, z: Z};
    }

    static copySign(magnitude, sign) {
        return Math.sign(sign) === -1 ? -Math.abs(magnitude) : Math.abs(magnitude);
    }
    
    static eulerToQuaternion(e) {
        const cy = Math.cos(e.z * 0.5);
        const sy = Math.sin(e.z * 0.5);
        const cp = Math.cos(e.y * 0.5);
        const sp = Math.sin(e.y * 0.5);
        const cr = Math.cos(e.x * 0.5);
        const sr = Math.sin(e.x * 0.5);
        
        const quaternion = {
            w: cr * cp * cy + sr * sp * sy,
            x: sr * cp * cy - cr * sp * sy,
            y: cr * sp * cy + sr * cp * sy,
            z: cr * cp * sy - sr * sp * cy
        };

        return Utils.normalizeQuaternion(quaternion);
    }

    static normalizeQuaternion(q) {
        const length = Math.sqrt(q.w * q.w + q.x * q.x + q.y * q.y + q.z * q.z);
        if (length === 0) {
            return { w: 0, x: 0, y: 0, z: 0 };
        }
        return {
            w: q.w / length,
            x: q.x / length,
            y: q.y / length,
            z: q.z / length
        };
    }
    
    static Deg2Rad(deg) {
        return deg * Math.PI / 180.0;
    }
    static Rad2Deg(rad) {
        return rad * 180.0 / Math.PI;
    }
}
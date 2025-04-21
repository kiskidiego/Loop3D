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
        const t0 = +2.0 * (w * x + y * z);
        const t1 = +1.0 - 2.0 * (x * x + y * y);
        const X = Math.atan2(t0, t1);
        const t2 = Math.max(-1.0, Math.min(1.0, +2.0 * (w * y - z * x)));
        const Y = Math.asin(t2);
        const t3 = +2.0 * (w * z + x * y);
        const t4 = +1.0 - 2.0 * (y * y + z * z);
        const Z = Math.atan2(t3, t4);
        return {x: X, y: Y, z: Z};
    }
    static eulerToQuaternion(e) {
        const x = e.x, y = e.y, z = e.z;
        const c1 = Math.cos(x / 2);
        const c2 = Math.cos(y / 2);
        const c3 = Math.cos(z / 2);
        const s1 = Math.sin(x / 2);
        const s2 = Math.sin(y / 2);
        const s3 = Math.sin(z / 2);
        return {
            w: c1 * c2 * c3 - s1 * s2 * s3,
            x: s1 * c2 * c3 + c1 * s2 * s3,
            y: c1 * s2 * c3 - s1 * c2 * s3,
            z: c1 * c2 * s3 + s1 * s2 * c3
        };
    }
}
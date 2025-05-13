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
    
        return {
            w: cr * cp * cy + sr * sp * sy,
            x: sr * cp * cy - cr * sp * sy,
            y: cr * sp * cy + sr * cp * sy,
            z: cr * cp * sy - sr * sp * cy
        };
    }
    static Deg2Rad(deg) {
        return deg * Math.PI / 180.0;
    }
    static Rad2Deg(rad) {
        return rad * 180.0 / Math.PI;
    }
    static rotateQuaternionAroundAxis(q, axis, angle) {
        // Normalize the axis
        const length = Math.sqrt(axis.x * axis.x + axis.y * axis.y + axis.z * axis.z);
        const normalizedAxis = {
            x: axis.x / length,
            y: axis.y / length,
            z: axis.z / length
        };

        // Create rotation quaternion for the given axis and angle
        const halfAngle = angle * 0.5;
        const sinHalfAngle = Math.sin(halfAngle);
        
        const rotationQuaternion = {
            w: Math.cos(halfAngle),
            x: normalizedAxis.x * sinHalfAngle,
            y: normalizedAxis.y * sinHalfAngle,
            z: normalizedAxis.z * sinHalfAngle
        };

        // Multiply the rotation quaternion with the original quaternion
        return Utils.multiplyQuaternions(rotationQuaternion, q);
    }

    static multiplyQuaternions(q1, q2) {
        // Quaternion multiplication: q1 * q2
        return {
            w: q1.w * q2.w - q1.x * q2.x - q1.y * q2.y - q1.z * q2.z,
            x: q1.w * q2.x + q1.x * q2.w + q1.y * q2.z - q1.z * q2.y,
            y: q1.w * q2.y - q1.x * q2.z + q1.y * q2.w + q1.z * q2.x,
            z: q1.w * q2.z + q1.x * q2.y - q1.y * q2.x + q1.z * q2.w
        };
    }
    static rotateVectorByQuaternion(vector, quaternion) {
        // Extract the vector part of the quaternion
        const u = { x: quaternion.x, y: quaternion.y, z: quaternion.z };
        const s = quaternion.w;

        // Do the math: v' = v + 2.0 * cross(u, cross(u, v) + s * v)
        const crossUV = Utils.cross(u, vector);
        const crossUVPlusSV = {
            x: crossUV.x + s * vector.x,
            y: crossUV.y + s * vector.y,
            z: crossUV.z + s * vector.z
        };
        const crossUCross = Utils.cross(u, crossUVPlusSV);

        return {
            x: vector.x + 2.0 * crossUCross.x,
            y: vector.y + 2.0 * crossUCross.y,
            z: vector.z + 2.0 * crossUCross.z
        };
    }

    // Helper function for cross product
    static cross(a, b) {
        return {
            x: a.y * b.z - a.z * b.y,
            y: a.z * b.x - a.x * b.z,
            z: a.x * b.y - a.y * b.x
        };
    }
}
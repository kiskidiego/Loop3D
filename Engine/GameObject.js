import MeshRenderer from "./MeshRenderer.js";
import Rigidbody from "./Rigidbody.js";
import Rule from "./Rule.js";
import * as THREE from "three";

export default class GameObject {
    constructor(actor, engine, spawned = false) {
        this.actor = actor;
		this.engine = engine;
		this.ammoVector = new engine.physics.ammo.btVector3(0,0,0);
		this.ammoTransform = new engine.physics.ammo.btTransform();
		this.ammoQuaternion = new engine.physics.ammo.btQuaternion();
		this._quaternion = {
			x: 0,
			y: 0,
			z: 0,
			w: 1
		};
		this._euler = {
			x: 0,
			y: 0,
			z: 0
		};
		this.timers = {};
		this.collisionInfo = {};
		this.id = Utils.id();
		this.spawned = spawned;
		this.scripts = [];
		this.materials = [];
        Object.assign(this, actor.properties);
		this.customProperties = Object.assign({}, actor.customProperties || {});
		this.sounds = {};
		engine.scope[this.name] = this;
		
		for(let i = 0; i < this.materials.length; i++)
		{
			if(typeof this.materials[i] == "string") {
				let mat = {};
				Object.assign(mat, MeshRenderer.Materials.get(this.materials[i]));
				this.customProperties = Object.assign({}, actor.customProperties || {});
				this.materials[i] = mat;
			}
		}
		MeshRenderer.loadMesh(this, () => {
			this.createRigidBody();
			Object.assign(this, actor.properties);
			engine.physics.addGameObject(this);
			engine.render.addGameObject(this);
			Object.assign(this, actor.properties);
			this._rule = new Rule(this, actor.scripts);
			if(actor.sounds) {
			for(let i = 0; i < actor.sounds.length; i++)
			{
				this.sounds[actor.sounds[i].name] = new Howl(
					{
						src: actor.sounds[i].source,
						loop: actor.sounds[i].loop == undefined ? false : actor.sounds[i].loop,
						preload: true
					}
				);
			}
		}
		});
		if(!this.spawnOnStart && !this.spawned) this.dead = true;
		console.log("GameObject created: ", this.name);
    }

	createRigidBody() {
		this.rigidBody = new Rigidbody(this.engine.physics, this);
	}

    addScript(script, pos = this.scripts.length) {
		this.scripts.splice(pos, 0, script);
	}

	removeScript(id) {
		this.scripts.splice(this.scripts.findIndex(script => script.id == id), 1);
	}

	delete() {
		this.engine.removeGameObject(this);
	}

	fixedUpdate() {
		if(this.sleeping) return;
		if(this.dead) {
			this.visible = false;
			this.sleeping = true;
			this.physicsMode = PhysicsModes.None;
			return;
		}
        if(this._rule) try { this._rule.eval(this.engine.scope) } catch (error) { console.error(this.name, error); this.sleeping = true; }   // update logic
	}
//#region General Properties
	get name() {
		return this._name;
	}
	set name(value) {
		this._name = value;
		if(this.name == "") {
			this._name = "GameObject" + this.id;
		}
		if(this.spawned && this.name != "GameObject" + this.id) {
			this._name = this.name + this.id;
		}
	}
	get positionX() {
		return this._positionX;
	}
	set positionX(value) {
		this._positionX = value;
		if(this.meshInstance) this.meshInstance.position.x = value;
		if(this.rigidBody) {
			this.ammoQuaternion.setValue(this._quaternion.x, this._quaternion.y, this._quaternion.z, this._quaternion.w);
			this.ammoVector.setValue(value, this.positionY, this.positionZ);
			this.rigidBody.getMotionState().getWorldTransform(this.ammoTransform);
			this.ammoTransform.setOrigin(this.ammoVector);
			this.ammoTransform.setRotation(this.ammoQuaternion);
			this.rigidBody.getMotionState().setWorldTransform(this.ammoTransform);
			this.rigidBody.setWorldTransform(this.ammoTransform);
		}
	}
	get positionY() {
		return this._positionY;
	}
	set positionY(value) {
		this._positionY = value;
		if(this.meshInstance) this.meshInstance.position.y = value;
		if(this.rigidBody) {
			this.ammoQuaternion.setValue(this._quaternion.x, this._quaternion.y, this._quaternion.z, this._quaternion.w);
			this.ammoVector.setValue(this.positionX, value, this.positionZ);
			this.rigidBody.getMotionState().getWorldTransform(this.ammoTransform);
			this.ammoTransform.setOrigin(this.ammoVector);
			this.ammoTransform.setRotation(this.ammoQuaternion);
			this.rigidBody.getMotionState().setWorldTransform(this.ammoTransform);
			this.rigidBody.setWorldTransform(this.ammoTransform);
		}
	}
	get positionZ() {
		return this._positionZ;
	}
	set positionZ(value) {
		this._positionZ = value;
		if(this.meshInstance) this.meshInstance.position.z = value;
		if(this.rigidBody) {
			this.ammoQuaternion.setValue(this._quaternion.x, this._quaternion.y, this._quaternion.z, this._quaternion.w);
			this.ammoVector.setValue(this.positionX, this.positionY, value);
			this.rigidBody.getMotionState().getWorldTransform(this.ammoTransform);
			this.ammoTransform.setOrigin(this.ammoVector);
			this.ammoTransform.setRotation(this.ammoQuaternion);
			this.rigidBody.getMotionState().setWorldTransform(this.ammoTransform);
			this.rigidBody.setWorldTransform(this.ammoTransform);
		}
	}
	get forwardX() {
		const q = this._quaternion;
		return 2 * (q.x * q.z + q.w * q.y);
	}
	get forwardY() {
		const q = this._quaternion;
		return 2 * (q.y * q.z - q.w * q.x);
	}
	get forwardZ() {
		const q = this._quaternion;
		return 1 - 2 * (q.x * q.x + q.y * q.y);
	}
	get rightX() {
		const q = this._quaternion;
		return 1 - 2 * (q.y * q.y + q.z * q.z);
	}
	get rightY() {
		const q = this._quaternion;
		return 2 * (q.x * q.y + q.w * q.z);
	}
	get rightZ() {
		const q = this._quaternion;
		return 2 * (q.x * q.z - q.w * q.y);
	}
	get upX() {
		const q = this._quaternion;
		return 2 * (q.x * q.y - q.w * q.z);
	}
	get upY() {
		const q = this._quaternion;
		return 1 - 2 * (q.x * q.x + q.z * q.z);
	}
	get upZ() {
		const q = this._quaternion;
		return 2 * (q.y * q.z + q.w * q.x);
	}
	get quaternion() {
		return this._quaternion;
	}
	set quaternion(value) {
		this._quaternion = value;
		this._updateEulerFromQuaternion();
		this.updateRotation();
	}
	get rotationX() { return this._euler.x; }
    set rotationX(value) { this._rotateAxis('x', value); }

    get rotationY() { return this._euler.y; }
    set rotationY(value) { this._rotateAxis('y', value); }

    get rotationZ() { return this._euler.z; }
    set rotationZ(value) { this._rotateAxis('z', value); }

    // --- Internal Methods ---
	_updateEulerFromQuaternion() {
        const { x, y, z, w } = this._quaternion;
        
        // Roll (X-axis rotation)
        const sinr_cosp = 2 * (w * x + y * z);
        const cosr_cosp = 1 - 2 * (x * x + y * y);
        const rollX = Math.atan2(sinr_cosp, cosr_cosp);

        // Pitch (Y-axis rotation)
        const sinp = 2 * (w * y - z * x);
        let pitchY;
        if (Math.abs(sinp) >= 1) {
            pitchY = Utils.copySign(Math.PI / 2, sinp); // Gimbal lock
        } else {
            pitchY = Math.asin(sinp);
        }

        // Yaw (Z-axis rotation)
        const siny_cosp = 2 * (w * z + x * y);
        const cosy_cosp = 1 - 2 * (y * y + z * z);
        const yawZ = Math.atan2(siny_cosp, cosy_cosp);

        // Convert to degrees and update stored Euler angles
        this._euler = {
            x: Utils.Rad2Deg(rollX),
            y: Utils.Rad2Deg(pitchY),
            z: Utils.Rad2Deg(yawZ)
        };
    }

    _rotateAxis(axis, degrees) {
        // Calculate delta rotation
        const delta = degrees - this._euler[axis];
        this._euler[axis] = degrees;

        // Convert delta to quaternion
        const rad = Utils.Deg2Rad(delta);
        const axisQuat = this._axisAngleToQuaternion(axis, rad);

        // Apply delta to current quaternion
        this._quaternion = this._multiplyQuaternions(axisQuat, this._quaternion);
        this._normalizeQuaternion();
		this.updateRotation();
    }

    _axisAngleToQuaternion(axis, rad) {
        const halfAngle = rad * 0.5;
        const s = Math.sin(halfAngle);
        const c = Math.cos(halfAngle);

        switch (axis) {
            case 'x': return { x: s, y: 0, z: 0, w: c };
            case 'y': return { x: 0, y: s, z: 0, w: c };
            case 'z': return { x: 0, y: 0, z: s, w: c };
            default: throw new Error("Invalid axis");
        }
    }

    _multiplyQuaternions(a, b) {
        return {
            x: a.w * b.x + a.x * b.w + a.y * b.z - a.z * b.y,
            y: a.w * b.y - a.x * b.z + a.y * b.w + a.z * b.x,
            z: a.w * b.z + a.x * b.y - a.y * b.x + a.z * b.w,
            w: a.w * b.w - a.x * b.x - a.y * b.y - a.z * b.z
        };
    }

    _normalizeQuaternion() {
        const { x, y, z, w } = this._quaternion;
        const len = Math.sqrt(x * x + y * y + z * z + w * w);
        if (len > 0) {
            this._quaternion.x /= len;
            this._quaternion.y /= len;
            this._quaternion.z /= len;
            this._quaternion.w /= len;
        }
    }

	updateRotation() {
		if(this.meshInstance) {
			this.meshInstance.quaternion.set(this._quaternion.x, this._quaternion.y, this._quaternion.z, this._quaternion.w);
		}
		if(this.rigidBody) {
			this.ammoQuaternion.setValue(this._quaternion.x, this._quaternion.y, this._quaternion.z, this._quaternion.w);
			this.rigidBody.getMotionState().getWorldTransform(this.ammoTransform);
			this.ammoTransform.setRotation(this.ammoQuaternion);
			this.ammoVector.setValue(this.positionX, this.positionY, this.positionZ);
			this.ammoTransform.setOrigin(this.ammoVector);
			this.rigidBody.getMotionState().setWorldTransform(this.ammoTransform);
			this.rigidBody.setWorldTransform(this.ammoTransform);
		}
	}

	get scaleX() {
		return this._scaleX;
	}
	set scaleX(value) {
		this._scaleX = value;
		if(this.meshInstance) this.meshInstance.scale.x = value;
		if(this.rigidBody) {
			this.ammoVector.setValue(value, this.scaleY, this.scaleZ);
			this.rigidBody.getCollisionShape().setLocalScaling(this.ammoVector);
		}
	}
	get scaleY() {
		return this._scaleY;
	}
	set scaleY(value) {
		this._scaleY = value;
		if(this.meshInstance) this.meshInstance.scale.y = value;
		if(this.rigidBody) {
			this.ammoVector.setValue(this.scaleX, value, this.scaleZ);
			this.rigidBody.getCollisionShape().setLocalScaling(this.ammoVector);
		}
	}
	get scaleZ() {
		return this._scaleZ;
	}
	set scaleZ(value) {
		this._scaleZ = value;
		if(this.meshInstance) this.meshInstance.scale.z = value;
		if(this.rigidBody) {
			this.ammoVector.setValue(this.scaleX, this.scaleY, value);
			this.rigidBody.getCollisionShape().setLocalScaling(this.ammoVector);
		}
	}
	get screen() {
		return this._screen;
	}
	set screen(value) {
		this._screen = value;
		if(!this.meshInstance) return;
		if(!this.rigidBody) return;
		if(this._screen)
		{
			this.physicsMode = PhysicsModes.None;
			MeshRenderer.sendToHUD(this);
		}
		else {
			this.physicsMode = this.actor.physicsMode;
			MeshRenderer.sendToGame(this);
		}
	}
	get visible() {
		return this.meshInstance ? this.meshInstance.visible : true;
	}
	set visible(value) {
		if(!this.meshInstance) return;
		this.meshInstance.visible = value;
	}
	set animationLoop(value) {
		this._animationLoop = value;
		if(this._animation != undefined && this.mixer) {
			this.actions[this._animation].setLoop(value ? THREE.LoopRepeat : THREE.LoopOnce);
		}
	}
	get animationLoop() {
		return this._animationLoop;
	}
	set transitionTime(value) {
		this._transitionTime = value;
	}
	get transitionTime() {
		return this._transitionTime;
	}
	set animation(value) {
		this._animation = value;
		if(!this.mixer) {
			console.warn("No mixer found for this: " + this.name);
			return;
		}
		for(let i = 0; i < this.actions.length; i++) {
			if(this.actions[i] == this.actions[this._animation]) {
				continue;
			}
			this.actions[i].fadeOut(this._transitionTime);
			setTimeout(() => {
				this.actions[i].stop();
			}, this._transitionTime * 1000);
		}
		let animName;
		if(this._animation === null || this._animation === undefined) {
			return;
		}

		if(isNaN(this._animation)) {
			animName = this._animation;
			animation = this.actions.findIndex(i => i._clip.name == this._animation);
		}
		
		if(this._animation == -1) {
			console.warn("Animation not found: " + this._animation);
			return;
		}

		if(!this.actions[this._animation]) {
			console.warn("No animation found for this: " + this.name);
			return;
		}
		console.log(this.actions[this._animation]);
		this.actions[this._animation].setLoop(this._animationLoop ? THREE.LoopRepeat : THREE.LoopOnce);
		this.actions[this._animation].reset().fadeIn(this._transitionTime).play();
	}
	get animation() {
		return this._animation;
	}
	set sound(value) {
		this._sound = value;
		if(value === null || value === undefined) {
			for(let sound in this.sounds) {
				Howler.stop(this.sounds[sound].id);
			}
			return;
		}
		if(!this.sounds[value]) {
			console.warn("Sound not found: " + value);
			return;
		}
		this.sounds[value].play();
	}
	get sound() {
		return this._sound;
	}
	get volume() {
		return this._volume;
	}
	set volume(value) {
		this._volume = value;
		if(this._sound && this.sounds[this._sound]) {
			this.sounds[this._sound].volume(value);
		}
		else {
			for(let sound in this.sounds) {
				this.sounds[sound].volume(value);
			}
		}
	}
//#endregion
	
//#region Physics Properties
	get physicsMode() {
		return this._physicsMode;
	}
	set physicsMode(value) {
		if(value != PhysicsModes.Dynamic && value != PhysicsModes.Kinematic &&
			value != PhysicsModes.Static && value != PhysicsModes.None)
		{
			console.error("Invalid physics mode: " + value);
			return;
		}
		this._physicsMode = value;
		if(this.rigidBody) Rigidbody.setPhysicsMode(this);
	}
	get movementRestrictionX() {
		return this._movementRestrictionX;
	}
	set movementRestrictionX(value) {
		this._movementRestrictionX = value;
		Rigidbody.setMovementConstraints(this);
	}
	get movementRestrictionY() {
		return this._movementRestrictionY;
	}
	set movementRestrictionY(value) {
		this._movementRestrictionY = value;
		Rigidbody.setMovementConstraints(this);
	}
	get movementRestrictionZ() {
		return this._movementRestrictionZ;
	}
	set movementRestrictionZ(value) {
		this._movementRestrictionZ = value;
		Rigidbody.setMovementConstraints(this);
	}
	get rotationRestrictionX() {
		return this._rotationRestrictionX;
	}
	set rotationRestrictionX(value) {
		this._rotationRestrictionX = value;
		Rigidbody.setRotationConstraints(this);
	}
	get rotationRestrictionY() {
		return this._rotationRestrictionY;
	}
	set rotationRestrictionY(value) {
		this._rotationRestrictionY = value;
		Rigidbody.setRotationConstraints(this);
	}
	get rotationRestrictionZ() {
		return this._rotationRestrictionZ;
	}
	set rotationRestrictionZ(value) {
		this._rotationRestrictionZ = value;
		Rigidbody.setRotationConstraints(this);
	}
	get velocityX() {
		return this._velocityX;
	}
	set velocityX(value) {
		this._velocityX = value;
		Rigidbody.setVelocity(this, true, false, false);
	}
	get velocityY() {
		return this._velocityY;
	}
	set velocityY(value) {
		this._velocityY = value;
		Rigidbody.setVelocity(this, false, true, false);
	}
	get velocityZ() {
		return this._velocityZ;
	}
	set velocityZ(value) {
		this._velocityZ = value;
		Rigidbody.setVelocity(this, false, false, true);
	}
	get angularVelocityX() {
		return this._angularVelocityX;
	}
	set angularVelocityX(value) {
		this._angularVelocityX = value;
		Rigidbody.setAngularVelocity(this, true, false, false);
	}
	get angularVelocityY() {
		return this._angularVelocityY;
	}
	set angularVelocityY(value) {
		this._angularVelocityY = value;
		Rigidbody.setAngularVelocity(this, false, true, false);
	}
	get angularVelocityZ() {
		return this._angularVelocityZ;
	}
	set angularVelocityZ(value) {
		this._angularVelocityZ = value;
		Rigidbody.setAngularVelocity(this, false, false, true);
	}
	get mass() {
		return this._mass;
	}
	set mass(value) {
		this._mass = value;
		Rigidbody.setMass(this);
	}
	get friction() {
		return this._friction;
	}
	set friction(value) {
		this._friction = value;
		Rigidbody.setFriction(this);
	}
	get rollingFriction() {
		return this._rollingFriction;
	}
	set rollingFriction(value) {
		this._rollingFriction = value;
		Rigidbody.setRollingFriction(this);
	}
	get bounciness() {
		return this._bounciness;
	}
	set bounciness(value) {
		this._bounciness = value;
		Rigidbody.setBounciness(this);
	}
	get drag() {
		return this._drag;
	}
	set drag(value) {
		this._drag = value;
		Rigidbody.setDrag(this);
	}
	get angularDrag() {
		return this._angularDrag;
	}
	set angularDrag(value) {
		this._angularDrag = value;
		Rigidbody.setAngularDrag(this);
	}
	get trigger() {
		return this._trigger;
	}
	set trigger(value) {
		this._trigger = value;
		Rigidbody.setTrigger(this);
	}
	get ignoreGravity() {
		return this._ignoreGravity;
	}
	set ignoreGravity(value) {
		this._ignoreGravity = value;
		Rigidbody.setGravity(this);
	}
//#endregion
	
//TODO: Finish adding getters and setters
	debug() {
		console.log("position", this.positionX, this.positionY, this.positionZ, 
			"\nrotation", this.rotationX, this.rotationY, this.rotationZ, 
			"\ncollider position", this.colliderCenterX, this.colliderCenterY, this.colliderCenterZ, 
			"\ncollider size", this.colliderSizeX, this.colliderSizeY, this.colliderSizeZ,
			"\nphysics object position", this.rigidBody.getWorldTransform().getOrigin().x(), this.rigidBody.getWorldTransform().getOrigin().y(), this.rigidBody.getWorldTransform().getOrigin().z());

	}
}
import MeshRenderer from "./MeshRenderer";
import Rigidbody from "./Rigidbody";

export default class GameObject {
    constructor(actor, engine) {
        this.actor = actor;
		this.engine = engine;
		this.ammoVector = new engine.physics.ammo.btVector3(0,0,0);
		this.ammoTransform = new engine.physics.ammo.btTransform();
		this.ammoQuaternion = new engine.physics.ammo.btQuaternion();
		this._quaternion = Utils.eulerToQuaternion({x: actor.rotationX, y: actor.rotationY, z: actor.rotationZ});
		this.timers = {};
		this.collisionInfo = {};
		this.id = Utils.id();
		console.log("GameObject created: " + this.id);
        Object.assign(this, actor.properties);
		for(let i = 0; i < this.materials.length; i++)
		{
			if(typeof this.materials[i] == "string") {
				let mat = {};
				Object.assign(mat, MeshRenderer.Materials.get(this.materials[i]));
				this.materials[i] = mat;
			}
		}
			
        this.scripts = [];
		MeshRenderer.loadMesh(this, () => {
			this.createRigidBody();
			Object.assign(this, actor.properties);
			engine.physics.addGameObject(this);
			engine.render.addGameObject(this);
		});
        actor.scripts.forEach(script => {
            this.scripts.push(script);
        });
		
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

	fixedUpdate() {

	}
//#region General Properties
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
	get quaternion() {
		return this._quaternion;
	}
	set quaternion(value) {
		this._quaternion = value;
		if(this.meshInstance) this.meshInstance.quaternion.set(this._quaternion.x, this._quaternion.y, this._quaternion.z, this._quaternion.w);
		if(this.rigidBody) {
			this.rigidBody.getMotionState().getWorldTransform(this.ammoTransform);
			let quat = this.ammoTransform.getRotation();
			quat.setValue(this._quaternion.x, this._quaternion.y, this._quaternion.z, this._quaternion.w);
			this.ammoTransform.setRotation(quat);
			this.ammoVector.setValue(this.positionX, this.positionY, this.positionZ);
			this.ammoTransform.setOrigin(this.ammoVector);
			this.rigidBody.getMotionState().setWorldTransform(this.ammoTransform);
		}
	}
	get rotationX() {
		return Utils.quaternionToEuler(this._quaternion).x;
	}
	set rotationX(value) {
		let euler = Utils.quaternionToEuler(this._quaternion);
		euler.x = Utils.Deg2Rad(value);
		this._quaternion = Utils.eulerToQuaternion(euler);
		if(this.meshInstance) this.meshInstance.quaternion.set(this._quaternion.x, this._quaternion.y, this._quaternion.z, this._quaternion.w);
		if(this.rigidBody) {
			this.rigidBody.getMotionState().getWorldTransform(this.ammoTransform);
			let quat = this.ammoTransform.getRotation();
			quat.setValue(this._quaternion.x, this._quaternion.y, this._quaternion.z, this._quaternion.w);
			this.ammoTransform.setRotation(quat);
			this.ammoVector.setValue(this.positionX, this.positionY, this.positionZ);
			this.ammoTransform.setOrigin(this.ammoVector);
			this.rigidBody.getMotionState().setWorldTransform(this.ammoTransform);
		}
	}
	get rotationY() {
		return Utils.quaternionToEuler(this._quaternion).y;
	}
	set rotationY(value) {
		let euler = Utils.quaternionToEuler(this._quaternion);
		euler.y = Utils.Deg2Rad(value);
		this._quaternion = Utils.eulerToQuaternion(euler);
		if(this.meshInstance) this.meshInstance.quaternion.set(this._quaternion.x, this._quaternion.y, this._quaternion.z, this._quaternion.w);
		if(this.rigidBody) {
			this.rigidBody.getMotionState().getWorldTransform(this.ammoTransform);
			let quat = this.ammoTransform.getRotation();
			quat.setValue(this._quaternion.x, this._quaternion.y, this._quaternion.z, this._quaternion.w);
			this.ammoTransform.setRotation(quat);
			this.ammoVector.setValue(this.positionX, this.positionY, this.positionZ);
			this.ammoTransform.setOrigin(this.ammoVector);
			this.rigidBody.getMotionState().setWorldTransform(this.ammoTransform);
		}
	}
	get rotationZ() {
		return Utils.quaternionToEuler(this._quaternion).z;
	}
	set rotationZ(value) {
		let euler = Utils.quaternionToEuler(this._quaternion);
		euler.z = Utils.Deg2Rad(value);
		this._quaternion = Utils.eulerToQuaternion(euler);
		if(this.meshInstance) this.meshInstance.quaternion.set(this._quaternion.x, this._quaternion.y, this._quaternion.z, this._quaternion.w);
		if(this.rigidBody) {
			this.rigidBody.getMotionState().getWorldTransform(this.ammoTransform);
			let quat = this.ammoTransform.getRotation();
			quat.setValue(this._quaternion.x, this._quaternion.y, this._quaternion.z, this._quaternion.w);
			this.ammoTransform.setRotation(quat);
			this.ammoVector.setValue(this.positionX, this.positionY, this.positionZ);
			this.ammoTransform.setOrigin(this.ammoVector);
			this.rigidBody.getMotionState().setWorldTransform(this.ammoTransform);
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
	get gravity() {
		return this._gravity;
	}
	set gravity(value) {
		this._gravity = value;
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
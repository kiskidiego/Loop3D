export default class GameObject {
    constructor(actor) {
        this.actor = actor;
        Object.assign(this, actor.properties);
        this.scripts = [];
        actor.scripts.forEach(script => {
            this.scripts.push(script);
        });
        console.log(this);
    }

    addScript(script, pos = this.scripts.length) {
		this.scripts.splice(pos, 0, script);
	}

	removeScript(id) {
		this.scripts.splice(this.scripts.findIndex(script => script.id == id), 1);
	}

	updateAppearance() {
		if(!this.renderObject) return;

		this.renderObject.position.x = this.positionX;
		this.renderObject.position.y = this.positionY;
		this.renderObject.position.z = this.positionZ;
		this.renderObject.rotation.x = Utils.Deg2Rad(this.rotationX);
		this.renderObject.rotation.y = Utils.Deg2Rad(this.rotationY);
		this.renderObject.rotation.z = Utils.Deg2Rad(this.rotationZ);
		this.renderObject.scale.x = this.scaleX;
		this.renderObject.scale.y = this.scaleY;
		this.renderObject.scale.z = this.scaleZ;
	}

	updatePhysics(transform) {
		if(!this.physicsObject) return;

		this.physicsObject.getMotionState().getWorldTransform(transform);
		this.positionX = transform.getOrigin().x();
		this.positionY = transform.getOrigin().y();
		this.positionZ = transform.getOrigin().z();
		let quat = transform.getRotation();
		quat = {
			x: quat.x(),
			y: quat.y(),
			z: quat.z(),
			w: quat.w()
		};
		let eulerAngles = Utils.quaternionToEuler(quat);
		this.rotationX = Utils.Rad2Deg(eulerAngles.x);
		this.rotationY = Utils.Rad2Deg(eulerAngles.y);
		this.rotationZ = Utils.Rad2Deg(eulerAngles.z);

		this.velocityX = this.physicsObject.getLinearVelocity().x();
		this.velocityY = this.physicsObject.getLinearVelocity().y();
		this.velocityZ = this.physicsObject.getLinearVelocity().z();
		this.angularVelocityX = Utils.Rad2Deg(this.physicsObject.getAngularVelocity().x());
		this.angularVelocityY = Utils.Rad2Deg(this.physicsObject.getAngularVelocity().y());
		this.angularVelocityZ = Utils.Rad2Deg(this.physicsObject.getAngularVelocity().z());

		this.physicsObject.setWorldTransform(transform);
		this.physicsObject.getMotionState().setWorldTransform(transform);

	}

	set scaleX(value) {
		this._scaleX = value;
		if(this.renderObject) this.renderObject.scale.x = value;
		if(this.physicsObject) {
			this.ammoVector.setX(value);
			this.physicsObject.getCollisionShape().setLocalScaling(this.ammoVector);
		}
	;
	}
	get scaleX() {
		return this._scaleX;
	}
	set scaleY(value) {
		this._scaleY = value;
		if(this.renderObject) this.renderObject.scale.y = value;
		if(this.physicsObject) {
			this.ammoVector.setY(value);
			this.physicsObject.getCollisionShape().setLocalScaling(this.ammoVector);
		}
	}
	get scaleY() {
		return this._scaleY;
	}
	set scaleZ(value) {
		this._scaleZ = value;
		if(this.renderObject) this.renderObject.scale.z = value;
		if(this.physicsObject) {
			this.ammoVector.setZ(value);
			this.physicsObject.getCollisionShape().setLocalScaling(this.ammoVector);
		}
	}
	get scaleZ() {
		return this._scaleZ;
	}
	debug() {
		console.log("position", this.positionX, this.positionY, this.positionZ, 
			"\nrotation", this.rotationX, this.rotationY, this.rotationZ, 
			"\ncollider position", this.colliderCenterX, this.colliderCenterY, this.colliderCenterZ, 
			"\ncollider size", this.colliderSizeX, this.colliderSizeY, this.colliderSizeZ,
			"\nphysics object position", this.physicsObject.getWorldTransform().getOrigin().x(), this.physicsObject.getWorldTransform().getOrigin().y(), this.physicsObject.getWorldTransform().getOrigin().z());

	}
}
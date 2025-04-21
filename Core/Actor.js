export default class Actor {
	constructor(actor) {
		this.id = Utils.id();
		this.scripts = [];
		Object.assign(this, this.properties, actor);
	}

	get properties() {
		var obj = {
			// Settings
			name: this.name || "Untitled Actor",
			positionX: this.positionX || 0, positionY: this.positionY || 0, positionZ: this.positionZ || 0,
			rotationX: this.rotationX || 0, rotationY: this.rotationY || 0, rotationZ: this.rotationZ || 0,
			scaleX: this.scaleX || 1, scaleY: this.scaleY || 1, scaleZ: this.scaleZ || 1,
			tag: this.tag || null,
			collider: this.collider || ColliderTypes.Box,
			screen: this.screen || false,
			sleeping: this.sleeping || false,

			// Mesh
			mesh: this.mesh || null,
			material: this.material || null,
			animation: this.animation || null,

			// Sound
			sound: this.sound || null,
			soundParams: this.soundParams || null,

			// Physics
			physicsMode: this.physicsMode || PhysicsModes.Dynamic,
			movementRestrictionX: this.movementRestrictionX || false, movementRestrictionY: this.movementRestrictionY || false, movementRestrictionZ: this.movementRestrictionZ || false,
			rotationRestrictionX: this.rotationRestrictionX || false, rotationRestrictionY: this.rotationRestrictionY || false, rotationRestrictionZ: this.rotationRestrictionZ || false,
			velocityX: this.velocityX || 0, velocityY: this.velocityY || 0, velocityZ: this.velocityZ || 0,
			angularVelocityX: this.angularVelocityX || 0, angularVelocityY: this.angularVelocityY || 0, angularVelocityZ: this.angularVelocityZ || 0,
			mass: this.mass || 1,
			drag: this.drag || 1,
			bounciness: this.bounciness || 0.5,
			linearDamping: this.linearDamping || 0, angularDamping: this.angularDamping || 0,

			// Light
			lightColor: this.lightColor || 0xFFFFFF,
			lightIntensity: this.lightIntensity || 0,
			lightForwardX: this.lightForwardX || 0, lightForwardY: this.lightForwardY || 0, lightForwardZ: this.lightForwardZ || 1,
			lightAmplitude: this.lightAmplitude || 45,
		}
		return obj;
	}

	get jsonObject() {
		var obj = {
			scripts: this.scripts
		};
		Object.assign(obj, this.properties);
		return obj;
	}

	addScript(script, pos) {
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
		this.renderObject.rotation.x = this.rotationX;
		this.renderObject.rotation.y = this.rotationY;
		this.renderObject.rotation.z = this.rotationZ;
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
		this.rotationX = eulerAngles.x;
		this.rotationY = eulerAngles.y;
		this.rotationZ = eulerAngles.z;
	}
}
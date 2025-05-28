export default class Actor {
	constructor(actor) {
		this.scripts = [];
		Object.assign(this, this.properties, actor);
	}

	get properties() {
		var obj = {
			// Settings
			name: this.name || "",
			positionX: this.positionX || 0, positionY: this.positionY || 0, positionZ: this.positionZ || 0,
			rotationX: this.rotationX || 0, rotationY: this.rotationY || 0, rotationZ: this.rotationZ || 0,
			scaleX: this.scaleX || 1, scaleY: this.scaleY || 1, scaleZ: this.scaleZ || 1,
			tag: this.tag || null,
			collider: this.collider || ColliderTypes.Box,
			colliderSizeX: this.colliderSizeX || -1, colliderSizeY: this.colliderSizeY || -1, colliderSizeZ: this.colliderSizeZ || -1,
			colliderCenterX: this.colliderCenterX || 0, colliderCenterY: this.colliderCenterY || 0, colliderCenterZ: this.colliderCenterZ || 0,
			screen: this.screen || false,
			sleeping: this.sleeping || false,
			spawnOnStart: this.spawnOnStart == undefined ? true : this.spawnOnStart, // default to true if not defined

			// Mesh
			mesh: this.mesh || null,
			materials: this.materials || [
				{
				color: 0xaaaaaa,
				metalness: 0.5,
				roughness: 0.5,
				transparent : false,
				opacity: 1,
				}
			],
			textures: this.textures || null,

			// Sound
			sounds: this.sound || [],

			// Physics
			physicsMode: this.physicsMode || PhysicsModes.Dynamic,
			movementRestrictionX: this.movementRestrictionX || false, movementRestrictionY: this.movementRestrictionY || false, movementRestrictionZ: this.movementRestrictionZ || false,
			rotationRestrictionX: this.rotationRestrictionX || false, rotationRestrictionY: this.rotationRestrictionY || false, rotationRestrictionZ: this.rotationRestrictionZ || false,
			velocityX: this.velocityX || 0, velocityY: this.velocityY || 0, velocityZ: this.velocityZ || 0,
			angularVelocityX: this.angularVelocityX || 0, angularVelocityY: this.angularVelocityY || 0, angularVelocityZ: this.angularVelocityZ || 0,
			mass: this.mass || 1,
			friction: this.friction || 0,
			rollingFriction: this.rollingFriction || 0,
			bounciness: this.bounciness || 0,
			drag: this.drag || 0, angularDrag: this.angularDrag || 0,
			trigger: this.trigger || false,
			ignoreGravity: this.ignoreGravity || false,
			collisionGroup: this.collisionGroup || 1,
			collisionMask: this.collisionMask || -1,

			// Light
			lightColor: this.lightColor || 0x000000,
			lightIntensity: this.lightIntensity || 0,
			lightForwardX: this.lightForwardX || 0, lightForwardY: this.lightForwardY || 0, lightForwardZ: this.lightForwardZ || 0,
			lightAmplitude: this.lightAmplitude || 0,

			// Custom Properties
			customProperties: this.customProperties || {},
			
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

	
}
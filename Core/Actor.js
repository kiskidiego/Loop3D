export default class Actor {
	constructor(actor) {
		this.scripts = [];
		Object.assign(this, this.properties, actor);
	}

	get properties() {
		var obj = {
			// Settings
			name: this.name === undefined ? "Unnamed Actor" : this.name,
			positionX: this.positionX === undefined ? 0 : this.positionX,
			positionY: this.positionY === undefined ? 0 : this.positionY,
			positionZ: this.positionZ === undefined ? 0 : this.positionZ,
			rotationX: this.rotationX === undefined ? 0 : this.rotationX,
			rotationY: this.rotationY === undefined ? 0 : this.rotationY,
			rotationZ: this.rotationZ === undefined ? 0 : this.rotationZ,
			scaleX: this.scaleX === undefined ? 1 : this.scaleX,
			scaleY: this.scaleY === undefined ? 1 : this.scaleY,
			scaleZ: this.scaleZ === undefined ? 1 : this.scaleZ,
			tag: this.tag === undefined ? null : this.tag,
			collider: this.collider === undefined ? ColliderTypes.Box : this.collider,
			colliderSizeX: this.colliderSizeX === undefined ? -1 : this.colliderSizeX,
			colliderSizeY: this.colliderSizeY === undefined ? -1 : this.colliderSizeY,
			colliderSizeZ: this.colliderSizeZ === undefined ? -1 : this.colliderSizeZ,
			colliderCenterX: this.colliderCenterX === undefined ? 0 : this.colliderCenterX,
			colliderCenterY: this.colliderCenterY === undefined ? 0 : this.colliderCenterY,
			colliderCenterZ: this.colliderCenterZ === undefined ? 0 : this.colliderCenterZ,
			screen: this.screen === undefined ? false : this.screen,
			sleeping: this.sleeping === undefined ? false : this.sleeping,
			visible: this.visible === undefined ? true : this.visible, // default to true if not defined

			// Mesh
			mesh: this.mesh === undefined ? null : this.mesh,
			materials: this.materials === undefined ? [
				{
					color: 0xaaaaaa,
					metalness: 0.5,
					roughness: 0.5,
					transparent: false,
					opacity: 1,
				}
			] : this.materials,
			textures: this.textures === undefined ? null : this.textures,

			// Sound
			sounds: this.sounds === undefined ? [] : this.sounds,

			// Physics
			physicsMode: this.physicsMode === undefined ? PhysicsModes.Dynamic : this.physicsMode,
			movementRestrictionX: this.movementRestrictionX === undefined ? false : this.movementRestrictionX,
			movementRestrictionY: this.movementRestrictionY === undefined ? false : this.movementRestrictionY,
			movementRestrictionZ: this.movementRestrictionZ === undefined ? false : this.movementRestrictionZ,
			rotationRestrictionX: this.rotationRestrictionX === undefined ? false : this.rotationRestrictionX,
			rotationRestrictionY: this.rotationRestrictionY === undefined ? false : this.rotationRestrictionY,
			rotationRestrictionZ: this.rotationRestrictionZ === undefined ? false : this.rotationRestrictionZ,
			velocityX: this.velocityX === undefined ? 0 : this.velocityX,
			velocityY: this.velocityY === undefined ? 0 : this.velocityY,
			velocityZ: this.velocityZ === undefined ? 0 : this.velocityZ,
			angularVelocityX: this.angularVelocityX === undefined ? 0 : this.angularVelocityX,
			angularVelocityY: this.angularVelocityY === undefined ? 0 : this.angularVelocityY,
			angularVelocityZ: this.angularVelocityZ === undefined ? 0 : this.angularVelocityZ,
			mass: this.mass === undefined ? 1 : this.mass,
			friction: this.friction === undefined ? 0.5 : this.friction,
			rollingFriction: this.rollingFriction === undefined ? 0.5 : this.rollingFriction,
			bounciness: this.bounciness === undefined ? 0.5 : this.bounciness,
			drag: this.drag === undefined ? 0.5 : this.drag,
			angularDrag: this.angularDrag === undefined ? 0.5 : this.angularDrag,
			trigger: this.trigger === undefined ? false : this.trigger,
			ignoreGravity: this.ignoreGravity === undefined ? false : this.ignoreGravity,
			collisionGroup: this.collisionGroup === undefined ? 1 : this.collisionGroup,
			collisionMask: this.collisionMask === undefined ? -1 : this.collisionMask,

			// Custom Properties
			customProperties: this.customProperties === undefined ? {} : this.customProperties,
			spawnOnStart: this.spawnOnStart == undefined ? true : this.spawnOnStart, // default to true if not defined
		}

		obj.customProperties = Object.assign({}, obj.customProperties);
		if (this.customProperties) {
			for (let key in this.customProperties) {
				if (this.customProperties.hasOwnProperty(key)) {
					obj.customProperties[key] = this.customProperties[key];
				}
			}
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
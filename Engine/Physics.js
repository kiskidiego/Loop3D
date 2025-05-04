export default class Physics {
    constructor(Ammo) {
        this.ammo = Ammo;
        var collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
        var dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration);
        var overlappingPairCache = new Ammo.btDbvtBroadphase();
        var solver = new Ammo.btSequentialImpulseConstraintSolver();
        this.physicsWorld = new Ammo.btDiscreteDynamicsWorld(dispatcher, overlappingPairCache, solver, collisionConfiguration);
        this.physicsWorld.setGravity(new Ammo.btVector3(0, -10, 0));
        this.physicsActors = [];
        this.tmpTransform = new Ammo.btTransform();
        this.ACTIVATION_STATE = {
            ACTIVE: 1,
            DISABLE_DEACTIVATION: 4
        };
        this.CF_STATIC_OBJECT = 1;
        this.CF_KINEMATIC_OBJECT = 2;
        this.zeroVector = new Ammo.btVector3(0, 0, 0);
        this.tempVector = new Ammo.btVector3(0, 0, 0);
    }

    update(deltaTime) {
        if(!this.physicsOn) return;
        this.physicsWorld.stepSimulation(deltaTime, 1);
        this.physicsActors.forEach(actor => {
            actor.updatePhysics(this.tmpTransform);
        });
    }
    setGravity(x, y, z) {
        this.physicsWorld.setGravity(new this.ammo.btVector3(x, y, z));
    }
    setPhysicsOn(physicsOn) {
        this.physicsOn = physicsOn;
    }
    setPhysicsObjects(actorList) {
        actorList.forEach(actor => {
            this.addPhysicsObject(actor);
        });
        this.physicsOn = true;
    }
    makeStatic(actor) {
        // Clear any existing flags
        actor.physicsObject.setCollisionFlags(actor.physicsObject.getCollisionFlags() & ~this.CF_KINEMATIC_OBJECT);
        
        // Set static flag
        actor.physicsObject.setCollisionFlags(actor.physicsObject.getCollisionFlags() | actor.physicsObject);
        
        // Set mass to 0
        actor.physicsObject.setMassProps(0, this.zeroVector);
        
        // Clear forces/velocity
        this.resetBodyMotion(actor);

        if(actor.physicsMode == PhysicsModes.None) {
            this.physicsWorld.addRigidBody(actor.physicsObject);
        }

        actor.physicsMode = PhysicsModes.Static;
    }
    makeKinematic(actor) {
        // Clear static flag if set
        actor.physicsObject.setCollisionFlags(actor.physicsObject.getCollisionFlags() & ~actor.physicsObject);
        
        // Set kinematic flag
        actor.physicsObject.setCollisionFlags(actor.physicsObject.getCollisionFlags() | this.CF_KINEMATIC_OBJECT);
        
        // Set mass to 0
        actor.physicsObject.setMassProps(0, this.zeroVector);
        
        // Prevent deactivation
        actor.physicsObject.setActivationState(this.ACTIVATION_STATE.DISABLE_DEACTIVATION);
        
        // Clear forces/velocity
        this.resetBodyMotion(actor);

        if(actor.physicsMode == PhysicsModes.None) {
            this.physicsWorld.addRigidBody(actor.physicsObject);
        }

        actor.physicsMode = PhysicsModes.Kinematic;
    }
    makeDynamic(actor) {
        let mass = actor.mass;
        if (actor.mass <= 0) {
            console.warn("Dynamic bodies require mass > 0. Using mass = 1");
            mass = 1;
        }
    
        // Clear both static and kinematic flags
        actor.physicsObject.setCollisionFlags(
            actor.physicsObject.getCollisionFlags() & ~(actor.physicsObject | this.CF_KINEMATIC_OBJECT)
        );
        
        // Calculate proper inertia
        actor.physicsObject.getCollisionShape().calculateLocalInertia(mass, this.tempVector);
        actor.physicsObject.setMassProps(mass, this.tempVector);
        
        // Reactivate
        actor.physicsObject.setActivationState(this.ACTIVATION_STATE.ACTIVE);
        
        // Clear any residual forces
        this.resetBodyMotion(actor);

        this.setVelocity(actor, actor.velocityX, actor.velocityY, actor.velocityZ);
        this.setAngularVelocity(actor, actor.angularVelocityX, actor.angularVelocityY, actor.angularVelocityZ);

        if(actor.physicsMode == PhysicsModes.None) {
            this.physicsWorld.addRigidBody(actor.physicsObject);
        }

        actor.physicsMode = PhysicsModes.Dynamic;
    }
    makeNoPhysics(actor) {
        this.physicsWorld.removeRigidBody(actor.physicsObject);
        actor.physicsMode = PhysicsModes.None;
    }
    resetBodyMotion(actor) {
        actor.physicsObject.setLinearVelocity(this.zeroVector);
        actor.physicsObject.setAngularVelocity(this.zeroVector);
        actor.physicsObject.clearForces();
        
        // Update interpolation transform
        actor.physicsObject.getMotionState().getWorldTransform(this.tmpTransform);
        actor.physicsObject.setWorldTransform(this.tmpTransform);
    }
    addPhysicsObject(actor) {
        let startTransform = new this.ammo.btTransform();
        startTransform.setIdentity();
        startTransform.setOrigin(new this.ammo.btVector3(actor.positionX, actor.positionY, actor.positionZ));
        let quat = Utils.eulerToQuaternion({
            x: Utils.Deg2Rad(actor.rotationX),
            y: Utils.Deg2Rad(actor.rotationY),
            z: Utils.Deg2Rad(actor.rotationZ)
        });
        startTransform.setRotation(new this.ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));

        let localInertia = new this.ammo.btVector3(0, 0, 0);

        let colliderTransform = new this.ammo.btTransform();
        colliderTransform.setIdentity();
        colliderTransform.setOrigin(new this.ammo.btVector3(0,0,0));
        colliderTransform.setRotation(new this.ammo.btQuaternion(0, 0, 0, 1));
        let collider = null;
        if(actor.collider == ColliderTypes.Box) {
            collider = new this.ammo.btBoxShape(new this.ammo.btVector3(actor.colliderSizeX / 2, actor.colliderSizeY / 2, actor.colliderSizeZ / 2));
            colliderTransform.setOrigin(new this.ammo.btVector3(actor.colliderCenterX, actor.colliderCenterY, actor.colliderCenterZ));
        }
        else if(actor.collider == ColliderTypes.Sphere) {
            collider = new this.ammo.btSphereShape(actor.colliderSizeX / 2);
            colliderTransform.setOrigin(new this.ammo.btVector3(actor.colliderCenterX, actor.colliderCenterY, actor.colliderCenterZ));
        }
        let shape = new this.ammo.btCompoundShape();

        shape.addChildShape(colliderTransform, collider);

        shape.setLocalScaling(new this.ammo.btVector3(actor.scaleX, actor.scaleY, actor.scaleZ));
  
        let motionState = new this.ammo.btDefaultMotionState(startTransform);
        let rbInfo = new this.ammo.btRigidBodyConstructionInfo(0, motionState, shape, localInertia);
        let body = new this.ammo.btRigidBody(rbInfo);

        actor.physicsObject = body;
        actor.ammoVector = new this.ammo.btVector3(actor.scaleX, actor.scaleY, actor.scaleZ);

        this.setPhysicsMode(actor);
        body.setFriction(actor.drag);
        body.setRestitution(actor.bounciness);
        body.setDamping(actor.linearDamping, actor.angularDamping);

        this.setConstraints(actor);

        this.physicsWorld.addRigidBody(body);
        this.physicsActors.push(actor);
    }
    removePhysicsObject(actor) {
        if(!actor.physicsObject) return;
        this.physicsWorld.removeRigidBody(actor.physicsObject);
        this.physicsActors.splice(this.physicsActors.indexOf(actor), 1);
        this.ammo.destroy(actor.physicsObject);
        actor.physicsObject = null;
    }
    setPhysicsMode(actor) {
        if(actor.physicsMode == PhysicsModes.Kinematic) {
            this.makeKinematic(actor);
        }
        else if(actor.physicsMode == PhysicsModes.Static) {
            this.makeStatic(actor);
        }
        else if(actor.physicsMode == PhysicsModes.Dynamic) {
            this.makeDynamic(actor);
        }
        else if(actor.physicsMode == PhysicsModes.None) {
            this.makeNoPhysics(actor);
        }
    }
    setVelocity(actor, x, y, z) {
        if(!actor.physicsObject) return;
        actor.physicsObject.setLinearVelocity(new this.ammo.btVector3(x, y, z));
    }
    setAngularVelocity(actor, x, y, z) {
        if(!actor.physicsObject) return;
        actor.physicsObject.setAngularVelocity(new this.ammo.btVector3(
            Utils.Deg2Rad(x),
            Utils.Deg2Rad(y),
            Utils.Deg2Rad(z)
        ));
    }
    setConstraints(actor) {
        actor.physicsObject.setLinearFactor(new this.ammo.btVector3(
            actor.movementRestrictionX ? 0 : 1,
            actor.movementRestrictionY ? 0 : 1,
            actor.movementRestrictionZ ? 0 : 1
        ));
        actor.physicsObject.setAngularFactor(new this.ammo.btVector3(
            actor.rotationRestrictionX ? 0 : 1,
            actor.rotationRestrictionY ? 0 : 1,
            actor.rotationRestrictionZ ? 0 : 1
        ));
    }
    updateCompoundScale(actor, newScaleX, newScaleY, newScaleZ) {
        const compoundShape = actor.physicsObject.getCollisionShape();
        compoundShape.setLocalScaling(new this.ammo.btVector3(newScaleX, newScaleY, newScaleZ));
    }
}
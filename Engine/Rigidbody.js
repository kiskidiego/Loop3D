export default class Rigidbody {
    static CF_STATIC_OBJECT = 1;
    static CF_KINEMATIC_OBJECT = 2;
    static zeroVector = null;
    static tempVector = null;
    static ACTIVATION_STATE = {
        ACTIVE: 1,
        DISABLE_DEACTIVATION: 4
    };
    constructor(physics, gameObject) {
        let startTransform = new physics.ammo.btTransform();
        if(Rigidbody.zeroVector == null || Rigidbody.tempVector == null)
        {
            Rigidbody.zeroVector = new physics.ammo.btVector3(0, 0, 0);
            Rigidbody.tempVector = new physics.ammo.btVector3(0, 0, 0);
        }
        startTransform.setIdentity();

        let localInertia = new physics.ammo.btVector3(0, 0, 0);

        let colliderTransform = new physics.ammo.btTransform();
        colliderTransform.setIdentity();
        colliderTransform.setOrigin(new physics.ammo.btVector3(0,0,0));
        colliderTransform.setRotation(new physics.ammo.btQuaternion(0, 0, 0, 1));
        let collider = null;
        if(gameObject.collider == ColliderTypes.Box) {
            collider = new physics.ammo.btBoxShape(new physics.ammo.btVector3(gameObject.colliderSizeX / 2, gameObject.colliderSizeY / 2, gameObject.colliderSizeZ / 2));
            colliderTransform.setOrigin(new physics.ammo.btVector3(gameObject.colliderCenterX, gameObject.colliderCenterY, gameObject.colliderCenterZ));
        }
        else if(gameObject.collider == ColliderTypes.Sphere) {
            collider = new physics.ammo.btSphereShape(gameObject.colliderSizeX / 2);
            colliderTransform.setOrigin(new physics.ammo.btVector3(gameObject.colliderCenterX, gameObject.colliderCenterY, gameObject.colliderCenterZ));
        }
        let shape = new physics.ammo.btCompoundShape();

        shape.addChildShape(colliderTransform, collider);
  
        let motionState = new physics.ammo.btDefaultMotionState(startTransform);
        let rbInfo = new physics.ammo.btRigidBodyConstructionInfo(0, motionState, shape, localInertia);
        let body = new physics.ammo.btRigidBody(rbInfo);

        Rigidbody.tempVector.setValue(gameObject.velocityX, gameObject.velocityY, gameObject.velocityZ);
        body.setLinearVelocity(Rigidbody.tempVector);

        return body;
    }

    //#region properties
    static setPhysicsMode(gameObject) {
        if(!gameObject.rigidBody) return;
        if(gameObject.physicsMode == PhysicsModes.Kinematic) {
            Rigidbody.makeKinematic(gameObject);
        }
        else if(gameObject.physicsMode == PhysicsModes.Static) {
            Rigidbody.makeStatic(gameObject);
        }
        else if(gameObject.physicsMode == PhysicsModes.Dynamic) {
            Rigidbody.makeDynamic(gameObject);
        }
        else if(gameObject.physicsMode == PhysicsModes.None) {
            Rigidbody.makeNoPhysics(gameObject);
        }
    }
    static makeStatic(gameObject) {
        // Clear any existing flags
        gameObject.rigidBody.setCollisionFlags(gameObject.rigidBody.getCollisionFlags() & ~Rigidbody.CF_KINEMATIC_OBJECT);
        
        // Set static flag
        gameObject.rigidBody.setCollisionFlags(gameObject.rigidBody.getCollisionFlags() | gameObject.rigidBody);
        
        // Set mass to 0
        gameObject.rigidBody.setMassProps(0, Rigidbody.zeroVector);
        
        // Clear forces/velocity
        Rigidbody.resetBodyMotion(gameObject);

        if(gameObject.physicsMode == PhysicsModes.None) {
            gameObject.engine.physics.physicsWorld.addRigidBody(gameObject.rigidBody);
        }
    }
    static makeKinematic(gameObject) {
        // Clear static flag if set
        gameObject.rigidBody.setCollisionFlags(gameObject.rigidBody.getCollisionFlags() & ~gameObject.rigidBody);
        
        // Set kinematic flag
        gameObject.rigidBody.setCollisionFlags(gameObject.rigidBody.getCollisionFlags() | Rigidbody.CF_KINEMATIC_OBJECT);
        
        // Set mass to 0
        gameObject.rigidBody.setMassProps(0, Rigidbody.zeroVector);
        
        // Prevent deactivation
        gameObject.rigidBody.setActivationState(Rigidbody.ACTIVATION_STATE.DISABLE_DEACTIVATION);
        
        // Clear forces/velocity
        Rigidbody.resetBodyMotion(gameObject);

        if(gameObject.physicsMode == PhysicsModes.None) {
            gameObject.engine.physics.physicsWorld.addRigidBody(gameObject.rigidBody);
        }
    }
    static makeDynamic(gameObject) {
        let mass = gameObject.mass;
        if (gameObject.mass <= 0) {
            console.warn("Dynamic bodies require mass > 0. Using mass = 1");
            mass = 1;
        }
    
        // Clear both static and kinematic flags
        gameObject.rigidBody.setCollisionFlags(
            gameObject.rigidBody.getCollisionFlags() & ~(gameObject.rigidBody | Rigidbody.CF_KINEMATIC_OBJECT)
        );
        
        // Calculate proper inertia
        gameObject.rigidBody.getCollisionShape().calculateLocalInertia(mass, Rigidbody.tempVector);
        gameObject.rigidBody.setMassProps(mass, Rigidbody.tempVector);
        
        // Reactivate
        gameObject.rigidBody.setActivationState(Rigidbody.ACTIVATION_STATE.ACTIVE);
        
        // Clear any residual forces
        Rigidbody.resetBodyMotion(gameObject);

        if(gameObject.physicsMode == PhysicsModes.None) {
            gameObject.engine.physics.physicsWorld.addRigidBody(gameObject.rigidBody);
        }
    }
    static makeNoPhysics(gameObject) {
        gameObject.engine.physics.removeGameObject(gameObject);
    }
    static resetBodyMotion(gameObject) {
        gameObject.rigidBody.setLinearVelocity(Rigidbody.zeroVector);
        gameObject.rigidBody.setAngularVelocity(Rigidbody.zeroVector);
        gameObject.rigidBody.clearForces();
        
        // Update interpolation transform
        gameObject.rigidBody.getMotionState().getWorldTransform(Rigidbody.tmpTransform);
        gameObject.rigidBody.setWorldTransform(Rigidbody.tmpTransform);
    }
    static setMovementConstraints(gameObject) {
        if(!gameObject.rigidBody) return;

        if(Rigidbody.zeroVector == null || Rigidbody.tempVector == null)
        {
            Rigidbody.zeroVector = new gameObject.engine.physics.ammo.btVector3(0, 0, 0);
            Rigidbody.tempVector = new gameObject.engine.physics.ammo.btVector3(0, 0, 0);
        }

        Rigidbody.tempVector.setValue(
            gameObject.movementRestrictionX ? 0 : 1,
            gameObject.movementRestrictionY ? 0 : 1,
            gameObject.movementRestrictionZ ? 0 : 1
        );
        gameObject.rigidBody.setLinearFactor(Rigidbody.tempVector);
    }
    static setRotationConstraints(gameObject) {
        if(!gameObject.rigidBody) return;

        if(Rigidbody.zeroVector == null || Rigidbody.tempVector == null)
        {
            Rigidbody.zeroVector = new gameObject.engine.physics.ammo.btVector3(0, 0, 0);
            Rigidbody.tempVector = new gameObject.engine.physics.ammo.btVector3(0, 0, 0);
        }

        Rigidbody.tempVector.setValue(
            gameObject.rotationRestrictionX ? 0 : 1,
            gameObject.rotationRestrictionY ? 0 : 1,
            gameObject.rotationRestrictionZ ? 0 : 1
        );
        gameObject.rigidBody.setAngularFactor(Rigidbody.tempVector);
    }
    static setVelocity(gameObject, x = true, y = true, z = true) {
        if(!gameObject.rigidBody) return;

        Rigidbody.tempVector.setValue(
            x ? gameObject.velocityX : gameObject.rigidBody.getLinearVelocity().x(), 
            y ? gameObject.velocityY : gameObject.rigidBody.getLinearVelocity().y(),
            z ? gameObject.velocityZ : gameObject.rigidBody.getLinearVelocity().z()
        );
        gameObject.rigidBody.setLinearVelocity(Rigidbody.tempVector);
    }
    static setAngularVelocity(gameObject, x = true, y = true, z = true) {
        if(!gameObject.rigidBody) return;

        Rigidbody.tempVector.setValue(
            x ? Utils.Deg2Rad(gameObject.angularVelocityX) : gameObject.rigidBody.getAngularVelocity().x(), 
            y ? Utils.Deg2Rad(gameObject.angularVelocityY) : gameObject.rigidBody.getAngularVelocity().y(), 
            z ? Utils.Deg2Rad(gameObject.angularVelocityZ) : gameObject.rigidBody.getAngularVelocity().z()
        );
        gameObject.rigidBody.setAngularVelocity(Rigidbody.tempVector);
    }
    static setMass(gameObject) {
        if(!gameObject.rigidBody || gameObject.physicsMode != PhysicsModes.Dynamic) return;

        gameObject.rigidBody.getCollisionShape().calculateLocalInertia(gameObject.mass, Rigidbody.tempVector);
        gameObject.rigidBody.setMassProps(gameObject.mass, Rigidbody.tempVector);
    }
    static setFriction(gameObject) {
        if(!gameObject.rigidBody) return;
        gameObject.rigidBody.setFriction(gameObject.friction);
    }
    static setRollingFriction(gameObject) {
        if(!gameObject.rigidBody) return;
        gameObject.rigidBody.setRollingFriction(gameObject.rollingFriction);
    }
    static setBounciness(gameObject) {
        if(!gameObject.rigidBody) return;
        gameObject.rigidBody.setRestitution(gameObject.bounciness);
    }
    static setDrag(gameObject) {
        if(!gameObject.rigidBody) return;
        gameObject.rigidBody.setDamping(gameObject.drag, gameObject.rigidBody.getAngularDamping());
    }
    static setAngularDrag(gameObject) {
        if(!gameObject.rigidBody) return;
        gameObject.rigidBody.setDamping(gameObject.rigidBody.getLinearDamping(), gameObject.angularDrag);
    }
    //#endregion
    //#region actions
    static push(gameObject, direction, force) {
        if(!gameObject.rigidBody) return;
        Rigidbody.tempVector.setValue(direction.x, direction.y, direction.z);
        gameObject.rigidBody.applyCentralForce(Rigidbody.tempVector * force);
    }
    static torque(gameObject, axis, force) {
        if(!gameObject.rigidBody) return;
        Rigidbody.tempVector.setValue(axis.x, axis.y, axis.z);
        gameObject.rigidBody.applyTorque(Rigidbody.tempVector * force);
    }
    static impulse(gameObject, direction, force) {
        if(!gameObject.rigidBody) return;
        Rigidbody.tempVector.setValue(direction.x, direction.y, direction.z);
        gameObject.rigidBody.applyCentralImpulse(Rigidbody.tempVector * force);
    }
    static torqueImpulse(gameObject, axis, force) {
        if(!gameObject.rigidBody) return;
        Rigidbody.tempVector.setValue(axis.x, axis.y, axis.z);
        gameObject.rigidBody.applyTorqueImpulse(Rigidbody.tempVector * force);
    }
    //#endregion
}
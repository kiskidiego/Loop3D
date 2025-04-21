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
    }

    update(deltaTime) {
        if(!this.physicsOn) return;
        this.physicsWorld.stepSimulation(deltaTime, 10);
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
    addPhysicsObject(actor) {
        if(actor.physicsMode == PhysicsModes.None) return;

        let startTransform = new this.ammo.btTransform();
        startTransform.setIdentity();
        startTransform.setOrigin(new this.ammo.btVector3(actor.positionX, actor.positionY, actor.positionZ));
        let quat = Utils.eulerToQuaternion({
            x: actor.rotationX, 
            y: actor.rotationY, 
            z: actor.rotationZ
        });
        startTransform.setRotation(new this.ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));

        let mass = actor.physicsMode == PhysicsModes.Dynamic ? actor.mass : 0;

        let localInertia = new this.ammo.btVector3(0, 0, 0);
        let shape = null;
        
        if(actor.collider == ColliderTypes.Box) {   //COMO DETERMINAR TAMAÑO DEL COLLIDER??
            shape = new this.ammo.btBoxShape(new this.ammo.btVector3(actor.scaleX / 2, actor.scaleY / 2, actor.scaleZ / 2));
        }
        else if(actor.collider == ColliderTypes.Sphere) {
            shape = new this.ammo.btSphereShape(actor.scaleX / 2);
        }

        shape.calculateLocalInertia(mass, localInertia);
  
        let motionState = new this.ammo.btDefaultMotionState(startTransform);
        let rbInfo = new this.ammo.btRigidBodyConstructionInfo(mass, motionState, shape, localInertia);
        let body = new this.ammo.btRigidBody(rbInfo);

       /* if(actor.physicsMode == PhysicsModes.Kinematic) {
            body.setCollisionFlags(body.getCollisionFlags() | this.ammo.CollisionFlags.CF_KINEMATIC_OBJECT);
            body.setActivationState(this.ammo.btCollisionObject.CollisionFlags.CF_KINEMATIC_OBJECT);
        }
        else if(actor.physicsMode == PhysicsModes.Static) {
            body.setCollisionFlags(body.getCollisionFlags() | this.ammo.CollisionFlags.CF_STATIC_OBJECT);
            body.setActivationState(this.ammo.btCollisionObject.CollisionFlags.CF_STATIC_OBJECT);
        }
        else if(actor.physicsMode == PhysicsModes.Dynamic) {
            body.setCollisionFlags(body.getCollisionFlags() | this.ammo.CollisionFlags.CF_DYNAMIC_OBJECT);
            body.setActivationState(this.ammo.btCollisionObject.CollisionFlags.CF_ACTIVE_TAG);
        }
*/
        body.setFriction(actor.drag);
        body.setRestitution(actor.bounciness);
        body.setDamping(actor.linearDamping, actor.angularDamping);
        body.setLinearVelocity(new this.ammo.btVector3(actor.velocityX, actor.velocityY, actor.velocityZ));
        body.setAngularVelocity(new this.ammo.btVector3(actor.angularVelocityX, actor.angularVelocityY, actor.angularVelocityZ));

        /*let constraint = this.ammo.btGeneric6DofSpring2Constraint(body, new this.ammo.btTransform(), true);
        constraint.setLinearLowerLimit(new this.ammo.btVector3(actor.movementRestrictionX ? 0 : -1, actor.movementRestrictionY ? 0 : -1, actor.movementRestrictionZ ? 0 : -1));
        constraint.setLinearUpperLimit(new this.ammo.btVector3(actor.movementRestrictionX ? 0 : 1, actor.movementRestrictionY ? 0 : 1, actor.movementRestrictionZ ? 0 : 1));
        constraint.setAngularLowerLimit(new this.ammo.btVector3(actor.rotationRestrictionX ? 0 : -1, actor.rotationRestrictionY ? 0 : -1, actor.rotationRestrictionZ ? 0 : -1));
        constraint.setAngularUpperLimit(new this.ammo.btVector3(actor.rotationRestrictionX ? 0 : 1, actor.rotationRestrictionY ? 0 : 1, actor.rotationRestrictionZ ? 0 : 1));
        constraint.setEquilibriumPoint();*/

        
        this.physicsWorld.addRigidBody(body);

        actor.physicsObject = body;

        this.physicsActors.push(actor);
    }
}
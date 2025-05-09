export default class Physics {
    constructor(Ammo) {
        this.ammo = Ammo;
        var collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
        var dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration);
        var overlappingPairCache = new Ammo.btDbvtBroadphase();
        var solver = new Ammo.btSequentialImpulseConstraintSolver();
        this.physicsWorld = new Ammo.btDiscreteDynamicsWorld(dispatcher, overlappingPairCache, solver, collisionConfiguration);
        this.physicsWorld.setGravity(new Ammo.btVector3(0, -10, 0));
        this.tmpTransform = new Ammo.btTransform();
        this.gameObjects = [];
    }

    update(deltaTime) {
        if(!this.physicsOn) return;
        this.physicsWorld.stepSimulation(deltaTime, 1);

        this.gameObjects.forEach((gameObject) => {
            if(!gameObject.rigidBody) return;

            gameObject.rigidBody.getMotionState().getWorldTransform(this.tmpTransform);
            gameObject.positionX = this.tmpTransform.getOrigin().x();
            gameObject.positionY = this.tmpTransform.getOrigin().y();
            gameObject.positionZ = this.tmpTransform.getOrigin().z();
            let quat = this.tmpTransform.getRotation();
            quat = {
                x: quat.x(),
                y: quat.y(),
                z: quat.z(),
                w: quat.w()
            };
            let eulerAngles = Utils.quaternionToEuler(quat);
            gameObject.rotationX = Utils.Rad2Deg(eulerAngles.x);
            gameObject.rotationY = Utils.Rad2Deg(eulerAngles.y);
            gameObject.rotationZ = Utils.Rad2Deg(eulerAngles.z);

            gameObject.velocityX = gameObject.rigidBody.getLinearVelocity().x();
            gameObject.velocityY = gameObject.rigidBody.getLinearVelocity().y();
            gameObject.velocityZ = gameObject.rigidBody.getLinearVelocity().z();

            gameObject.angularVelocityX = Utils.Rad2Deg(gameObject.rigidBody.getAngularVelocity().x());
            gameObject.angularVelocityY = Utils.Rad2Deg(gameObject.rigidBody.getAngularVelocity().y());
            gameObject.angularVelocityZ = Utils.Rad2Deg(gameObject.rigidBody.getAngularVelocity().z());
    
            gameObject.rigidBody.setWorldTransform(this.tmpTransform);
            gameObject.rigidBody.getMotionState().setWorldTransform(this.tmpTransform);
    
        });
    }
    addGameObject(gameObject)
    {
        this.gameObjects.push(gameObject);
        this.physicsWorld.addRigidBody(gameObject.rigidBody);
    }
    removeGameObject(gameObject) {
        let i = this.gameObjects.indexOf(gameObject);
        if(i == -1) return;
        this.gameObjects.splice(i, 1);
        this.physicsWorld.removeRigidBody(gameObject.rigidBody);
    }
    setGravity(x, y, z) {
        this.physicsWorld.setGravity(new this.ammo.btVector3(x, y, z));
    }
    setPhysicsOn(physicsOn) {
        this.physicsOn = physicsOn;
    }
    removePhysicsObject(actor) {
        if(!actor.physicsObject) return;
        this.physicsWorld.removeRigidBody(actor.physicsObject);
        this.ammo.destroy(actor.physicsObject);
        actor.physicsObject = null;
    }
}
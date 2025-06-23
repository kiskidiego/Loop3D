import Rigidbody from "./Rigidbody.js";

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
    detectCollisions() {
        // Reset collision info
        for(let gameObject in this.gameObjects) {
            for(let tag in this.gameObjects[gameObject].collisionInfo) {
                for(let id in this.gameObjects[gameObject].collisionInfo[tag]) {
                    const collisionInfo = this.gameObjects[gameObject].collisionInfo[tag][id];
                    if(collisionInfo.exit) {
                        collisionInfo.exit = false;
                        collisionInfo._stay = false;
                    }
                    if(collisionInfo.stay) {
                        collisionInfo.exit = true;
                    }
                    collisionInfo.enter = false;
                    collisionInfo.stay = false;
                }
            }
        }

        let numManifolds = this.physicsWorld.getDispatcher().getNumManifolds();

        for (let i = 0; i < numManifolds; i++) {
            let contactManifold = this.physicsWorld.getDispatcher().getManifoldByIndexInternal(i);
            let rb1 = this.ammo.castObject(contactManifold.getBody0(), this.ammo.btRigidBody);
            let rb2 = this.ammo.castObject(contactManifold.getBody1(), this.ammo.btRigidBody);
            let gameObject1 = rb1.userData;
            let gameObject2 = rb2.userData;

            if (gameObject1 && gameObject2) {
                if(!gameObject1.collisionInfo[gameObject2.tag]) {
                    gameObject1.collisionInfo[gameObject2.tag] = [];
                }
                if(!gameObject2.collisionInfo[gameObject1.tag]) {
                    gameObject2.collisionInfo[gameObject1.tag] = [];
                }
                if(!gameObject1.collisionInfo[gameObject2.tag][gameObject2.id]) {
                    gameObject1.collisionInfo[gameObject2.tag][gameObject2.id] = {
                        enter: true,
                        exit: false,
                        stay: true,
                        _stay: true
                    };
                }
                else {
                    gameObject1.collisionInfo[gameObject2.tag][gameObject2.id] = {
                        enter: !gameObject1.collisionInfo[gameObject2.tag][gameObject2.id]._stay,
                        exit: false,
                        stay: true,
                        _stay: true
                    };
                }
                if(!gameObject2.collisionInfo[gameObject1.tag][gameObject1.id]) {
                    gameObject2.collisionInfo[gameObject1.tag][gameObject1.id] = {
                        enter: true,
                        exit: false,
                        stay: true,
                        _stay: true
                    };
                }
                else {
                    gameObject2.collisionInfo[gameObject1.tag][gameObject1.id] = {
                        enter: !gameObject2.collisionInfo[gameObject1.tag][gameObject1.id]._stay,
                        exit: false,
                        stay: true,
                        _stay: true
                    };
                }
            }
        }
    }
    update(deltaTime) {
        if(!this.physicsOn) return;
        this.physicsWorld.stepSimulation(deltaTime, 0);
        this.detectCollisions();

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
            gameObject.quaternion = quat;

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
        this.physicsWorld.addRigidBody(gameObject.rigidBody, gameObject.collisionGroup, gameObject.collisionMask);
    }
    removeGameObject(gameObject) {
        let i = this.gameObjects.indexOf(gameObject);
        if(i == -1) return;
        this.gameObjects.splice(i, 1);
        this.physicsWorld.removeRigidBody(gameObject.rigidBody);
        this.ammo.destroy(gameObject.rigidBody.getMotionState());
        this.deleteShape(gameObject.rigidBody.getCollisionShape());
        this.ammo.destroy(gameObject.rigidBody);
        gameObject.rigidBody = null;
    }
    deleteShape(shape) {
        if(shape instanceof this.ammo.btCompoundShape) {
            let numShapes = shape.getNumChildShapes();
            for(let i = 0; i < numShapes; i++) {
                this.deleteShape(shape.getChildShape(i));
            }
        }
        this.ammo.destroy(shape);
    }
    setGravity(x, y, z) {
        this.physicsWorld.setGravity(new this.ammo.btVector3(x, y, z));
        this.gameObjects.forEach((gameObject) => {
            if(!gameObject.rigidBody) return;
            Rigidbody.setGravity(gameObject);
        });
    }
    getGravity() {
        let gravity = this.physicsWorld.getGravity();
        return {
            x: gravity.x(),
            y: gravity.y(),
            z: gravity.z()
        }
    }
    setPhysicsOn(physicsOn) {
        this.physicsOn = physicsOn;
    }
}
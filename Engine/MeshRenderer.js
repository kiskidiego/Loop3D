import * as THREE from 'three';
import FileLoader from './FileLoader';

export default class MeshRenderer {
    static Materials = new Map([
        ["steel", { color: 0x888888, metalness: 0.8, roughness: 0.4 }],
        ["plastic", { color: 0xffffff, metalness: 0.1, roughness: 0.9 }],
        ["wood", { color: 0x8b4513, metalness: 0.2, roughness: 0.8 }],
        ["quartz", { color: 0xe0e0e0, metalness: 0.0, roughness: 0.5, transparent: true, opacity: 0.7 }],
        ["jade", { color: 0x00a86b, metalness: 0.3, roughness: 0.6 }],
        ["gold", { color: 0xffd700, metalness: 1.0, roughness: 0.2 }],
        ["bronze", { color: 0xcd7f32, metalness: 0.8, roughness: 0.5 }],
        ["glass", { color: 0x87ceeb, metalness: 0.0, roughness: 0.1, transparent: true, opacity: 0.5 }]
    ]);
    static loadMesh(gameObject, callback) {
        FileLoader.loadFBX(gameObject, (object) => {
            MeshRenderer.addMesh(gameObject, object);
            MeshRenderer.setMaterials(gameObject);
            callback && callback();
        })
    }
    static setMaterials(gameObject, object3D) {
        if(!gameObject.materials) return;
        if(!gameObject.meshInstance) return;
        if(!gameObject.materials[0]) return;
        let i = 0;
        gameObject.meshInstance.traverse((node) => {
            if(!node.isMesh) return;
            node.material = new THREE.MeshStandardMaterial({
                color: gameObject.materials[i].color || 0xffffff,
                metalness: gameObject.materials[i].metalness || 0.5,
                roughness: gameObject.materials[i].roughness || 0.5,
                transparent: gameObject.materials[i].transparent || false,
                opacity: gameObject.materials[i].opacity || 1,
                alphaTest: gameObject.materials[i].opacity || 1,
            });
            node.castShadow = true;
            node.receiveShadow = true;
            i++;
            if(i >= gameObject.materials.length) i = 0;
        })
    }
    static addMesh(gameObject, meshInstance) {
        gameObject.meshInstance = meshInstance;
        if(gameObject.colliderSizeX == -1) {
            MeshRenderer.computeBoundingShape(gameObject);
        }
        if(gameObject.meshInstance)
            gameObject.meshInstance.scale.set(gameObject.scaleX, gameObject.scaleY, gameObject.scaleZ);
        
    }
    static computeBoundingShape(gameObject) {
        let vertices = [];
        gameObject.meshInstance.traverse((child) => {
            if (child.isMesh) {
                let geometry = child.geometry;
                if (geometry.attributes.position) {
                    let positions = geometry.attributes.position.array;
                    for (let i = 0; i < positions.length; i += 3) {
                        let vertex = new THREE.Vector3(
                            positions[i],
                            positions[i + 1],
                            positions[i + 2]
                        );
                        vertex.applyMatrix4(child.matrixWorld);
                        vertices.push(vertex);
                    }
                }
            }
        });

        if(gameObject.collider == ColliderTypes.Box) {
            let box = new THREE.Box3().setFromPoints(vertices);
            gameObject.colliderSizeX = box.max.x - box.min.x;
            gameObject.colliderSizeY = box.max.y - box.min.y;
            gameObject.colliderSizeZ = box.max.z - box.min.z;
            gameObject.colliderCenterX = (box.max.x + box.min.x) / 2;
            gameObject.colliderCenterY = (box.max.y + box.min.y) / 2;
            gameObject.colliderCenterZ = (box.max.z + box.min.z) / 2;
        }
        else if(gameObject.collider == ColliderTypes.Sphere) {
            let sphere = new THREE.Sphere().setFromPoints(vertices);
            gameObject.colliderSizeX = sphere.radius * 2;
            gameObject.colliderSizeY = sphere.radius * 2;
            gameObject.colliderSizeZ = sphere.radius * 2;
            gameObject.colliderCenterX = sphere.center.x;
            gameObject.colliderCenterY = sphere.center.y;
            gameObject.colliderCenterZ = sphere.center.z;
        }
    }
    static sendToHUD(gameObject) {
        if(!gameObject.meshInstance) return;
        if(gameObject.meshInstance.parent == gameObject.engine.render.hudScene) return;
        gameObject.engine.render.hudScene.add(gameObject.meshInstance);
    }
    static sendToGame(gameObject) {
        if(!gameObject.meshInstance) return;
        if(gameObject.meshInstance.parent == gameObject.engine.render.scene) return;
        gameObject.engine.render.scene.add(gameObject.meshInstance);
    }
}
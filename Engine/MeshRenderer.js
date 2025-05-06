import * as THREE from 'three';
import FileLoader from './FileLoader';

export default class MeshRenderer {
    static loadMesh(gameObject, callback) {
        FileLoader.loadFBX(gameObject, (object) => {
            MeshRenderer.addMesh(gameObject, object);
            callback && callback();
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
}
import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';

export default class Renderer{
    constructor(){
        this.sceneActors = [];
        this.scene = new THREE.Scene();
        this.renderer = new THREE.WebGLRenderer({ canvas: document.querySelector('#gameCanvas'), antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setClearColor(0xa3a3a3);
        this.renderer.shadowMap.enabled = true;
        this.fbxLoader = new FBXLoader();
        this.fbxList = [];
        this.directionalLights = [];
    }
    setSkyboxRGB(topColor, middleColor, bottomColor){
        const skyboxGeometry = new THREE.SphereGeometry(100000000, 32, 32);
        this.skyboxColors = {
            topColor: topColor,
            middleColor: middleColor,
            bottomColor: bottomColor,
        }
        const skyboxMaterial = new THREE.ShaderMaterial({
            uniforms: {
                topColor: { value: new THREE.Vector3(topColor.r, topColor.g, topColor.b) },
                middleColor: { value: new THREE.Vector3(middleColor.r, middleColor.g, middleColor.b) },
                bottomColor: { value: new THREE.Vector3(bottomColor.r, bottomColor.g, bottomColor.b) },
                camYPosition: { value: this.camera ? this.camera.position.y : 0 },
                camPerspectiveCompensator: { value: this.camera ? (this.isPerspectiveCamera ? 50000 : 1) : 1},
            },
            vertexShader: `
                varying vec4 vWorldPosition;
                void main() {
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                    vWorldPosition = modelMatrix * vec4(position, 1.0);
                    }
            `,
            fragmentShader: `
                varying vec4 vWorldPosition;
                uniform vec3 topColor;
                uniform vec3 middleColor;
                uniform vec3 bottomColor;
                uniform float camYPosition;
                uniform float camPerspectiveCompensator;
                void main() {
                    vec3 color = mix(bottomColor, middleColor, smoothstep(-100.0, 100.0, (vWorldPosition.y - camYPosition) / camPerspectiveCompensator));
                    color = mix(color, topColor, smoothstep(0.0, 100.0, (vWorldPosition.y - camYPosition) / camPerspectiveCompensator));
                    gl_FragColor = vec4(color, 1.0);
                }
            `,
            side: THREE.BackSide,
        });
        this.skybox = new THREE.Mesh(skyboxGeometry, skyboxMaterial);
        this.scene.add(this.skybox);
    }
    setSkybox(upperColor, middleColor, lowerColor){
        const topColorRGB = Utils.hexToRgb(upperColor);
        const middleColorRGB = Utils.hexToRgb(middleColor);
        const bottomColorRGB = Utils.hexToRgb(lowerColor);
        this.setSkyboxRGB(topColorRGB, middleColorRGB, bottomColorRGB);
    }
    setWindowSize(width, height){
        this.renderer.setSize(width, height);
    }
    setCamera(perspectiveType, camPositionX, camPositionY, camPositionZ, camForwardX, camForwardY, camForwardZ, camTilt, camFov){
        if(perspectiveType == PerspectiveTypes.Perspective) {
            let vec = new THREE.Vector2();
            this.renderer.getSize(vec);
            this.camera = new THREE.PerspectiveCamera(camFov, vec.x / vec.y, 0.1, 100000000);
            this.isPerspectiveCamera = true;
        }
        else if(perspectiveType == PerspectiveTypes.Orthographic) {
            let vec = new THREE.Vector2();
            this.renderer.getSize(vec);
            this.camera = new THREE.OrthographicCamera(-vec.x / 2 * camFov / 10, vec.x / 2 * camFov / 10, vec.y / 2 * camFov / 10, -vec.y / 2 * camFov / 10, 0.1, 100000000);
            this.isPerspectiveCamera = false;
        }
        this.camera.position.set(camPositionX, camPositionY, camPositionZ);
        const camTarget = new THREE.Vector3(camForwardX + camPositionX, camForwardY  + camPositionY, camForwardZ + camPositionZ);
        this.camera.up.set(Math.sin(camTilt * Math.PI / 180), Math.cos(camTilt * Math.PI / 180), 0);
        this.camera.lookAt(camTarget);
        this.camera.updateProjectionMatrix();
    }
    setDirectionalLight(dirLightDirectionX, dirLightDirectionY, dirLightDirectionZ, dirLightColor, dirLightIntensity){
        this.directionalLightIntensity = dirLightIntensity;
        this.directionalLight = new THREE.DirectionalLight(dirLightColor, dirLightIntensity);
        this.directionalLightDirection = new THREE.Vector3(dirLightDirectionX, dirLightDirectionY, dirLightDirectionZ).normalize();
        this.directionalLight.position.copy(this.directionalLightDirection);
        this.directionalLight.position.multiplyScalar(-1000);
        console.log(this.directionalLight.position);
        this.directionalLightTarget = new THREE.Object3D();
        this.directionalLightTarget.position.copy(this.directionalLightDirection);
        this.directionalLightTarget.position.add(this.directionalLight.position);
        console.log(this.directionalLightTarget.position);

        this.directionalLight.target = this.directionalLightTarget;

        this.directionalLight.castShadow = true;
        this.directionalLight.shadow.mapSize.height = 4096;
        this.directionalLight.shadow.mapSize.width = 4096;
        this.directionalLight.shadow.camera.near = 0;
        this.directionalLight.shadow.camera.far = 2000;
        this.directionalLight.shadow.camera.left = -10000;
        this.directionalLight.shadow.camera.right = 10000;
        this.directionalLight.shadow.camera.top = 10000;
        this.directionalLight.shadow.camera.bottom = -10000;
        this.directionalLight.shadow.bias = -0.001;

        this.scene.add(this.directionalLightTarget);
        this.scene.add(this.directionalLight);

        this.shadowCameraHelper = new THREE.CameraHelper(this.directionalLight.shadow.camera);
        this.scene.add(this.shadowCameraHelper);

        
    }
    setGameObjects(actorList){
        actorList.forEach(actor => {
            this.loadRenderObject(actor);
        });
    }
    loadRenderObject(actor, callback) {
        if (actor.mesh != null) {
            let object = this.fbxList.find(fbx => fbx.id == actor.mesh);
            if (object) {
                this.addRenderObject(actor, object.object3D);
                callback && callback(actor);
                return;
            }
            else {
                this.fbxLoader.load(actor.mesh, (object) => {
                    object.traverse((child) => {
                        if(child.isMesh) {
                            child.castShadow = true;
                            child.receiveShadow = true;
                        }
                    })
                    this.fbxList.push({id: actor.mesh, object3D: object});
                    this.addRenderObject(actor, object);
                    callback && callback(actor);
                });
            }
        }
        else {
            callback && callback(actor);
        }
    }
    addRenderObject(actor, object) {
        actor.renderObject = SkeletonUtils.clone(object);

        if(actor.colliderSizeX == -1) {
            this.computeBoundingShape(actor);
        }
        actor.renderObject.scale.set(actor.scaleX, actor.scaleY, actor.scaleZ);
        this.sceneActors.push(actor);
        this.scene.add(actor.renderObject);
    }
    removeRenderObject(actor) {
        if(actor.renderObject)
            this.scene.remove(actor.renderObject);
    }
    computeBoundingShape(actor) {
        let vertices = [];
        actor.renderObject.traverse((child) => {
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

        if(actor.collider == ColliderTypes.Box) {
            let box = new THREE.Box3().setFromPoints(vertices);
            actor.colliderSizeX = box.max.x - box.min.x;
            actor.colliderSizeY = box.max.y - box.min.y;
            actor.colliderSizeZ = box.max.z - box.min.z;
            actor.colliderCenterX = (box.max.x + box.min.x) / 2;
            actor.colliderCenterY = (box.max.y + box.min.y) / 2;
            actor.colliderCenterZ = (box.max.z + box.min.z) / 2;
        }
        else if(actor.collider == ColliderTypes.Sphere) {
            let sphere = new THREE.Sphere().setFromPoints(vertices);
            actor.colliderSizeX = sphere.radius * 2;
            actor.colliderSizeY = sphere.radius * 2;
            actor.colliderSizeZ = sphere.radius * 2;
            actor.colliderCenterX = sphere.center.x;
            actor.colliderCenterY = sphere.center.y;
            actor.colliderCenterZ = sphere.center.z;
        }
    }
    
    update(){
        this.skybox.position.copy(this.camera.position);
        this.sceneActors.forEach(sceneActor => {
            sceneActor.updateAppearance();
        });
        this.renderer.render(this.scene, this.camera);
    }
}
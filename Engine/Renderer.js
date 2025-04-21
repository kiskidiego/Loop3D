import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';

export default class Renderer{
    constructor(){
        this.sceneActors = [];
        this.scene = new THREE.Scene();
        this.renderer = new THREE.WebGLRenderer({ canvas: document.querySelector('#gameCanvas'), antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.fbxLoader = new FBXLoader();
    }
    setSkyboxRGB(topColor, middleColor, bottomColor){
        const skyboxGeometry = new THREE.SphereGeometry(100000000, 32, 32);
        this.skyboxColors = {
            topColor: topColor,
            middleColor: middleColor,
            bottomColor: bottomColor,
        }
        console.log(this.skyboxColors);
        console.log(this.camera ? this.camera.isPerspectiveCamera : 1);
        const skyboxMaterial = new THREE.ShaderMaterial({
            uniforms: {
                topColor: { value: new THREE.Vector3(topColor.r, topColor.g, topColor.b) },
                middleColor: { value: new THREE.Vector3(middleColor.r, middleColor.g, middleColor.b) },
                bottomColor: { value: new THREE.Vector3(bottomColor.r, bottomColor.g, bottomColor.b) },
                camYPosition: { value: this.camera ? this.camera.position.y : 0 },
                camPerspectiveCompensator: { value: this.camera ? (this.camera.isPerspectiveCamera ? 50000 : 1) : 1},
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
        if(!this.camera) return;
        if(this.camera instanceof THREE.PerspectiveCamera) {
            this.camera.aspect = width / height;
        }
        else if(this.camera instanceof THREE.OrthographicCamera) {
            this.camera.left = -width / 2;
            this.camera.right = width / 2;
            this.camera.top = height / 2;
            this.camera.bottom = -height / 2;
        }
        this.camera.updateProjectionMatrix();
    }
    setCamera(perspectiveType, camPositionX, camPositionY, camPositionZ, camForwardX, camForwardY, camForwardZ, camTilt, camFov){
        if(perspectiveType == PerspectiveTypes.Perspective) {
            let vec = new THREE.Vector2();
            this.renderer.getSize(vec);
            this.camera = new THREE.PerspectiveCamera(camFov, vec.x / vec.y, 0.1, 100000000);
        }
        else if(perspectiveType == PerspectiveTypes.Orthographic) {
            let vec = new THREE.Vector2();
            this.renderer.getSize(vec);
            this.camera = new THREE.OrthographicCamera(-vec.x / 2 * camFov / 10, vec.x / 2 * camFov / 10, vec.y / 2 * camFov / 10, -vec.y / 2 * camFov / 10, 0.1, 100000000);
        }
        this.camera.position.set(camPositionX, camPositionY, camPositionZ);
        const camTarget = new THREE.Vector3(camForwardX + camPositionX, camForwardY  + camPositionY, camForwardZ + camPositionZ);
        this.camera.up.set(Math.sin(camTilt * Math.PI / 180), Math.cos(camTilt * Math.PI / 180), 0);
        this.camera.lookAt(camTarget);
        this.camera.updateProjectionMatrix();
        this.setSkyboxRGB(this.skyboxColors.topColor, this.skyboxColors.middleColor, this.skyboxColors.bottomColor);
    }
    setDirectionalLight(dirLightDirectionX, dirLightDirectionY, dirLightDirectionZ, dirLightColor, dirLightIntensity){
        this.directionalLight = new THREE.DirectionalLight(dirLightColor, dirLightIntensity);
        this.directionalLight.position.set(-dirLightDirectionX, -dirLightDirectionY, -dirLightDirectionZ);
    }
    setGameObjects(actorList){
        this.sceneActors = [];
        actorList.forEach(actor => {
            this.addGameObject(actor);
        });
    }
    addGameObject(actor){
    if (actor.mesh != null)
        {
            this.fbxLoader.load(actor.mesh, (object) => {
                actor.renderObject = object;
                this.sceneActors.push(actor);
            });
        }
    }
    update(){
        this.scene.clear();
        this.scene.add(this.skybox);
        this.skybox.position.set(this.camera.position.x, this.camera.position.y, this.camera.position.z);
        this.scene.add(this.directionalLight);
        this.sceneActors.forEach(sceneActor => {
            if(!sceneActor.renderObject) return;
            sceneActor.updateAppearance();
            this.scene.add(sceneActor.renderObject);
        });
        this.renderer.render(this.scene, this.camera);
    }
}
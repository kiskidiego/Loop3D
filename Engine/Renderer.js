import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';

export default class Renderer{
    constructor(){
        this.sceneObjects = [];
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100000000);
        this.renderer = new THREE.WebGLRenderer({ canvas: document.querySelector('#gameCanvas'), antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.render(this.scene, this.camera);
        this.fbxLoader = new FBXLoader();
    }
    setSkybox(upperColor, middleColor, lowerColor){
        const skyboxGeometry = new THREE.SphereGeometry(100000000, 32, 32);
        const topColorRGB = Utils.hexToRgb(upperColor);
        const middleColorRGB = Utils.hexToRgb(middleColor);
        const bottomColorRGB = Utils.hexToRgb(lowerColor);
        const skyboxMaterial = new THREE.ShaderMaterial({
            uniforms: {
                topColor: { value: new THREE.Vector3(topColorRGB.r, topColorRGB.g, topColorRGB.b) },
                middleColor: { value: new THREE.Vector3(middleColorRGB.r, middleColorRGB.g, middleColorRGB.b) },
                bottomColor: { value: new THREE.Vector3(bottomColorRGB.r, bottomColorRGB.g, bottomColorRGB.b) },
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
                void main() {
                    vec3 color = mix(bottomColor, middleColor, smoothstep(-1.0, 1.0, vWorldPosition.y / 5000000.0));
                    color = mix(color, topColor, smoothstep(0.0, 1.0, vWorldPosition.y / 5000000.0));
                    gl_FragColor = vec4(color, 1.0);
                }
            `,
            side: THREE.BackSide,
        });
        this.skybox = new THREE.Mesh(skyboxGeometry, skyboxMaterial);
        this.scene.add(this.skybox);
        const colors = new THREE.BufferAttribute(new Float32Array(skyboxGeometry.attributes.position.count * 3), 3);
        //skyboxGeometry.setAttribute('color', colors);
        
        /*for (let i = 0; i < colors.length; i += 3) {
            colors[i] = upperColor.r; // R
            colors[i + 1] = upperColor.g; // G
            colors[i + 2] = upperColor.b; // B
        }
        for (let i = 0; i < colors.length; i += 3) {
            colors[i] = middleColor.r; // R
            colors[i + 1] = middleColor.g; // G
            colors[i + 2] = middleColor.b; // B
        }
        for (let i = 0; i < colors.length; i += 3) {
            colors[i] = lowerColor.r; // R
            colors[i + 1] = lowerColor.g; // G
            colors[i + 2] = lowerColor.b; // B
        }*/
    }
    setWindowSize(width, height){
        this.renderer.setSize(width, height);
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
    }
    setCamera(camPositionX, camPositionY, camPositionZ, camForwardX, camForwardY, camForwardZ, camTilt, camFov){
        const camTarget = new THREE.Vector3(camForwardX + camPositionX, camForwardY  + camPositionY, camForwardZ + camPositionZ);
        this.camera.position.set(camPositionX, camPositionY, camPositionZ);
        this.camera.up.set(Math.sin(camTilt * Math.PI / 180), Math.cos(camTilt * Math.PI / 180), 0);
        this.camera.lookAt(camTarget);
        this.camera.fov = camFov;
        this.camera.updateProjectionMatrix();
    }
    setDirectionalLight(dirLightDirectionX, dirLightDirectionY, dirLightDirectionZ, dirLightColor, dirLightIntensity){
        this.directionalLight = new THREE.DirectionalLight(dirLightColor, dirLightIntensity);
        this.directionalLight.position.set(-dirLightDirectionX, -dirLightDirectionY, -dirLightDirectionZ);
    }
    setGameObjects(actorList){
        this.sceneObjects = [];
        actorList.forEach(actor => {
            this.addGameObject(actor);
        });
    }
    addGameObject(actor){
    if (actor.mesh != null)
        {
            this.fbxLoader.load(actor.mesh, (object) => {
                this.sceneObjects.push({
                    object3D: object, 
                    actor: actor
                });
            });
        }
    }
    update(){
        this.scene.clear();
        this.scene.add(this.skybox);
        this.skybox.position.set(this.camera.position.x, this.camera.position.y, this.camera.position.z);
        this.scene.add(this.directionalLight);
        this.sceneObjects.forEach(sceneObject => {
            sceneObject.actor.updateAppearance(sceneObject.object3D);
            this.scene.add(sceneObject.object3D);
        });
        this.renderer.render(this.scene, this.camera);
    }
}
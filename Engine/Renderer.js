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
            this.camera = new THREE.OrthographicCamera(-vec.x / 2, vec.x / 2, vec.y / 2, -vec.y / 2, 0.1, 100000000);
        }
        this.camera.position.set(camPositionX, camPositionY, camPositionZ);
        const camTarget = new THREE.Vector3(camForwardX + camPositionX, camForwardY  + camPositionY, camForwardZ + camPositionZ);
        this.camera.up.set(Math.sin(camTilt * Math.PI / 180), Math.cos(camTilt * Math.PI / 180), 0);
        this.camera.lookAt(camTarget);
        this.camera.updateProjectionMatrix();
        this.renderer.render(this.scene, this.camera);
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
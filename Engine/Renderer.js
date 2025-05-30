import * as THREE from 'three';

export default class Renderer{
    constructor(){
        this.scene = new THREE.Scene();
        this.hudScene = new THREE.Scene();
        this.renderer = new THREE.WebGLRenderer({ canvas: document.querySelector('#gameCanvas'), antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setClearColor(0xa3a3a3);
        this.renderer.shadowMap.enabled = true;
        this.renderer.autoClear = false;
        this.directionalLights = [];
        this.gameObjects = [];
        this.hudAmbientLight = new THREE.AmbientLight(0xffffff, 1);
        this.hudScene.add(this.hudAmbientLight);
        this.hudDirectionalLight = new THREE.DirectionalLight(0xffffff, 1);
        this.hudDirectionalLight.position.set(0,0,10000);
        this.hudScene.add(this.hudDirectionalLight);
    }
    setSkyboxRGB(topColor, middleColor, bottomColor){
        const skyboxGeometry = new THREE.SphereGeometry(100000000 / 2, 32, 32);
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
                camPerspectiveCompensator: { value: this.camera ? (this.isPerspectiveCamera ? 5000 : 1) : 1},
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
                    vec3 color = mix(bottomColor, middleColor, smoothstep(-0.5, 0.5, (vWorldPosition.y - camYPosition) / camPerspectiveCompensator));
                    color = mix(color, topColor, smoothstep(0.0, 0.5, (vWorldPosition.y - camYPosition) / camPerspectiveCompensator));
                    gl_FragColor = vec4(color, 1.0);
                }
            `,
            side: THREE.BackSide,
        });
        this.skybox = new THREE.Mesh(skyboxGeometry, skyboxMaterial);
        this.scene.add(this.skybox);
    }
    setSkybox(upperColor, middleColor, lowerColor){
        this.skyTopColor = upperColor;
        this.skyHorizonColor = middleColor;
        this.skyBottomColor = lowerColor;
        const topColorRGB = Utils.hexToRgb(Utils.HexStringToDecimal(upperColor));
        const middleColorRGB = Utils.hexToRgb(Utils.HexStringToDecimal(middleColor));
        const bottomColorRGB = Utils.hexToRgb(Utils.HexStringToDecimal(lowerColor));
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
            this.hudCamera = new THREE.OrthographicCamera(-vec.x / 2 * 30 / 2000, vec.x / 2 * 30 / 2000, vec.y / 2 * 30 / 2000, -vec.y / 2 * 30 / 2000, 0.1, 100000000);
            this.isPerspectiveCamera = true;
        }
        else if(perspectiveType == PerspectiveTypes.Orthographic) {
            let vec = new THREE.Vector2();
            this.renderer.getSize(vec);
            this.camera = new THREE.OrthographicCamera(-vec.x / 2 * camFov / 2000, vec.x / 2 * camFov / 2000, vec.y / 2 * camFov / 2000, -vec.y / 2 * camFov / 2000, 0.1, 100000000);
            this.hudCamera = new THREE.OrthographicCamera(-vec.x / 2 * 30 / 2000, vec.x / 2 * 30 / 2000, vec.y / 2 * 30 / 2000, -vec.y / 2 * 30 / 2000, 0.1, 100000000);
            this.isPerspectiveCamera = false;
        }
        this.camera.position.set(camPositionX, camPositionY, camPositionZ);
        this.hudCamera.position.set(0,0,10000);
        this.camTarget = new THREE.Vector3(camForwardX + camPositionX, camForwardY  + camPositionY, camForwardZ + camPositionZ);
        this.camForward = new THREE.Vector3(camForwardX, camForwardY, camForwardZ);
        this.camera.up.set(Math.sin(camTilt * Math.PI / 180), Math.cos(camTilt * Math.PI / 180), 0);
        this.camTilt = camTilt;
        this.camera.lookAt(this.camTarget);
        this.camTarget.set(0,0,-1);
        this.camera.updateProjectionMatrix();
        this.hudCamera.up.set(0,1,0);
        this.hudCamera.lookAt(this.camTarget);
        this.hudCamera.updateProjectionMatrix();
    }
    setDirectionalLight(dirLightDirectionX, dirLightDirectionY, dirLightDirectionZ, dirLightColor, dirLightIntensity){
        this.directionalLightColor = Utils.HexStringToDecimal(dirLightColor);
        this.directionalLightIntensity = dirLightIntensity;
        this.directionalLight = new THREE.DirectionalLight(this.directionalLightColor, dirLightIntensity);
        this.directionalLightDirection = new THREE.Vector3(dirLightDirectionX, dirLightDirectionY, dirLightDirectionZ).normalize();
        this.directionalLight.position.set(0, 125, 0);
        this.directionalLightTarget = new THREE.Object3D();
        this.directionalLightTarget.position.copy(this.directionalLightDirection);
        this.directionalLightTarget.position.add(this.directionalLight.position);

        this.directionalLight.target = this.directionalLightTarget;

        this.directionalLight.castShadow = true;
        this.directionalLight.shadow.mapSize.height = 4096* 10;
        this.directionalLight.shadow.mapSize.width = 4096*10;
        this.directionalLight.shadow.camera.near = 0;
        this.directionalLight.shadow.camera.far = 250;
        this.directionalLight.shadow.camera.left = -250;
        this.directionalLight.shadow.camera.right = 250;
        this.directionalLight.shadow.camera.top = 250;
        this.directionalLight.shadow.camera.bottom = -250;
        this.directionalLight.shadow.bias = -0.00001;

        this.scene.add(this.directionalLightTarget);
        this.scene.add(this.directionalLight);
    }
    addGameObject(gameObject) {
        if(!gameObject.meshInstance) return;
        this.gameObjects.push(gameObject);
        this.scene.add(gameObject.meshInstance);
    }
    removeGameObject(gameObject) {
        let i = this.gameObjects.indexOf(gameObject);
        if(i == -1) return;
        this.gameObjects.splice(i, 1);
        this.scene.remove(gameObject.meshInstance);
        this.deleteObject(gameObject.meshInstance);
        gameObject.meshInstance = null;
    }
    deleteObject(object3D){
        if(!object3D) return;

        if(object3D.parent){
            object3D.parent.remove(object3D);
        }
        while(object3D.children.length > 0){
            this.deleteObject(object3D.children[0]);
        }
        if(object3D.geometry){
            object3D.geometry.dispose();
        }
        if(object3D.material){
            if(Array.isArray(object3D.material)){
                object3D.material.forEach((material) => {
                    material.dispose();
                });
            }
            else{
                object3D.material.dispose();
            }
        }
        if(object3D.texture){
            object3D.texture.dispose();
        }
    }
    setCameraForward(camForwardX, camForwardY, camForwardZ){
        if(camForwardX != undefined) this.camForward.x = camForwardX;
        if(camForwardY != undefined) this.camForward.y = camForwardY;
        if(camForwardZ != undefined) this.camForward.z = camForwardZ;
        this.camTarget.set(this.camForward.x + this.camera.position.x, this.camForward.y + this.camera.position.y, this.camForward.z + this.camera.position.z);
        this.camera.lookAt(this.camTarget);
        this.camera.updateProjectionMatrix();
    }
    setCameraPosition(camPositionX, camPositionY, camPositionZ){
        if(camPositionX != undefined) this.camera.position.x = camPositionX;
        if(camPositionY != undefined) this.camera.position.y = camPositionY;
        if(camPositionZ != undefined) this.camera.position.z = camPositionZ;
        this.camera.updateProjectionMatrix();
    }
    setCameraTilt(camTilt){
        this.camera.up.set(Math.sin(camTilt * Math.PI / 180), Math.cos(camTilt * Math.PI / 180), 0);
        this.camTilt = camTilt;
        this.camera.lookAt(this.camTarget);
        this.camera.updateProjectionMatrix();
    }
    setCameraFov(camFov){
        this.camera.fov = camFov;
        this.camera.updateProjectionMatrix();
    }
    
    update(deltaTime){
        this.skybox.position.copy(this.camera.position);
        this.renderer.clear();

        this.renderer.render(this.scene, this.camera);

        this.renderer.clearDepth();

        this.gameObjects.forEach((gameObject) => {
            if(gameObject.mixer) {
                gameObject.mixer.update(deltaTime);
            }
        });

        this.renderer.render(this.hudScene, this.hudCamera);
    }
}
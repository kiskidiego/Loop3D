import Engine from "./Engine.js";
import Game from "../Core/Game.js";
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';

export default class FileLoader {
	static fbxLoader = null;
	static fbxList = [];
	static loadGame(gameFile) {
		let game = new Game({});
		fetch(gameFile)
			.then(response => response.json())
			.then(g => {
				game = new Game(g);
				let engine = new Engine(game);
			})
			.catch(error => {
				console.error("Error loading game file:", error);
			});
	}
	
	static loadFBX(gameObject, callback) {
		if(FileLoader.fbxLoader == null)
		{
			FileLoader.fbxLoader = new FBXLoader();
		}
        if (gameObject.mesh != null) {
            let object = FileLoader.fbxList.find(fbx => fbx.id == gameObject.mesh);
            if (object) {
                callback && callback(SkeletonUtils.clone(object.object3D));
            }
            else {
                FileLoader.fbxLoader.load(gameObject.mesh, (object) => {
                    FileLoader.fbxList.push({id: gameObject.mesh, object3D: object});
                    callback && callback(SkeletonUtils.clone(object));
                });
            }
        }
		else{
			callback && callback();
		}
    }
}
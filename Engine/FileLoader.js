import Engine from "./Engine";
import Game from "../Core/Game";

export default class FileLoader {
	static loadGame(gameFile) {
	let game = new Game({});
	fetch(gameFile)
		.then(response => response.json())
		.then(game => {
			game = new Game(game);
			let engine = new Engine(game);
		})
		.catch(error => {
			console.error("Error loading game file:", error);
		});
	}
}
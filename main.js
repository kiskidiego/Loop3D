import FileLoader from "./Engine/FileLoader.js";

let tanksButton = document.getElementById("tanks");
tanksButton.addEventListener("click", () => {
    document.getElementById("start").remove();
    FileLoader.loadGame("./TestGame/tanks.json");
});

let physicsButton = document.getElementById("physics");
physicsButton.addEventListener("click", () => {
    document.getElementById("start").remove();
    FileLoader.loadGame("./TestGame/physics.json");
});
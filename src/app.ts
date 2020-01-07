// Here, we import the things we need from other script files 
import Game from './common/game';
import SpaceTrippersScene from './scenes/SpaceTrippers';

// First thing we need is to get the canvas on which we draw our scenes
const canvas: HTMLCanvasElement = document.querySelector("#app");

// Then we create an instance of the game class and give it the canvas
const game = new Game(canvas, {maxfps: 25});

// Here we list all our scenes and our initial scene
const scenes = {
    "Game": SpaceTrippersScene,
};
const initialScene = "Game";

// Then we add those scenes to the game object and ask it to start the initial scene
game.addScenes(scenes);
game.startScene(initialScene);

// Here we setup a selector element to switch scenes from the webpage
const selector: HTMLSelectElement = document.querySelector("#scenes");
for(let name in scenes){
    let option = document.createElement("option");
    option.text = name;
    option.value = name;
    selector.add(option);
}
selector.value = initialScene;
selector.addEventListener("change", ()=>{
    game.startScene(selector.value);
});
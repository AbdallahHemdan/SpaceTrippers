<p align="center">
  <a href="" rel="noopener">
 <img width=400px height=210px src="https://github.com/aashrafh/SpaceTrippers/blob/Game/demo/SpaceTrippers.png" alt="SpaceTrippers logo"></a>
</p>

<h3 align="center">Space Trippers</h3>

<div align="center">

  [![Status](https://img.shields.io/badge/status-active-success.svg)]()
  [![License](https://img.shields.io/badge/license-MIT-blue.svg)](/LICENSE)

</div>

---

<p align="center"> 🤖 :rocket: A 3D WebGL interactive game using TypeScript and NodeJS.
    <br> 
</p>

## 📝 Table of Contents
- [About](#about)
- [Demo](#demo)
- [Install](#Install)
- [How To Play](#play)
- [Technology](#tech)

## 🧐 About <a name = "about"></a>
A 3D space game. Travelling along the space trying to avoid rocks and obstacles. The ship can avoid the rocks by moving right, or left. Collision with the rocks affects its health by decreasing total health by ONE and every second with no collision with the rock your score increase by ONE.

## 🎥 Demo <div name = "demo" align="center" width=1189>
![GIFDemo](https://github.com/aashrafh/SpaceTrippers/blob/Game/demo/demoGIF.gif)
![ImageDemo1](https://github.com/aashrafh/SpaceTrippers/blob/Game/demo/demo-img-1.png)
![ImageDemo4](https://github.com/aashrafh/SpaceTrippers/blob/Game/demo/demo-img-4.png)
![ImageDemo5](https://github.com/aashrafh/SpaceTrippers/blob/Game/demo/demo-img-5.png)
![ImageDemo6](https://github.com/aashrafh/SpaceTrippers/blob/Game/demo/demo-img-6.png)
![ImageDemo2](https://github.com/aashrafh/SpaceTrippers/blob/Game/demo/demo-img-2.png)
![ImageDemo3](https://github.com/aashrafh/SpaceTrippers/blob/Game/demo/demo-img-3.png)
 </div>

## 🏁 Install <a name = "Install"></a>
1. Install [Node.js](https://nodejs.org/en/) and [Visual Studio Code](https://code.visualstudio.com/).
2. Open the folder in Visual Studio Code.
3. Open a terminal (Terminal > New Terminal).
4. Run `npm install` . If it failed for any reason, try again.
5. Run `npm run watch` .
6. Ctrl + click the link shown in the terminal (usually it will be http://localhost:1234).

**Note:** you can use yarn to enable caching so that you don't download all the packages with project. You can download yarn from [yarnpkg.com](https://yarnpkg.com/lang/en/). Then replace `npm install` with `yarn install` and `npm run watch` with `yarn watch`.

## 💭 How To Play <a name = "play"></a>
The aircraft is running "to infinity and beyond" :runner: so your job is to avoid the obstacles to get survive for as much time as you can so can get a point for every second of avoiding the rocks.
1. Click on the canvas using the mouse to get into the game.
2. Use ```J``` to moving ```left```.
3. Use ```L``` to move ```right```.
4. Press ```ESC``` to exit play mode.

## ⛏️ Built Using <a name = "tech"></a>
- [TypeScript](https://www.typescriptlang.org/) - strict syntactical superset of JavaScript.
- [glMatrix](http://glmatrix.net/) - Javascript Matrix and Vector library.
- [WebGL](https://get.webgl.org/) - JavaScript API for rendering interactive 3D graphics.
- [NodeJs](https://nodejs.org/en/) - Server Environment

import { Key } from 'ts-key-enum'
import { vec2, vec3 } from 'gl-matrix'

// This is a small helper class we created to manage the user input
// The input on webpages is received via event listeners only so this class add some listeners and collect the keyboard and mouse input to be accessed at any time
// This class is a work in progress so expect it to be enhanced in future labs
export default class Input {
    canvas: HTMLCanvasElement;

    private currentKeys: {[key: string]: boolean};
    private previousKeys: {[key: string]: boolean};

    private currentButtons: boolean[];
    private previousButtons: boolean[];

    private firstMouseMove: boolean = true;
    private currentMousePosition: vec2;
    private perviousMousePosition: vec2;

    private currentWheelPosition: vec3;
    private previousWheelPosition: vec3;

    private pointerLocked: boolean = false;

    constructor(canvas: HTMLCanvasElement){
        this.canvas = canvas;
        this.currentKeys = {};
        this.previousKeys = {};
        for(let key in Key){
            this.currentKeys[key] = false;
            this.previousKeys[key] = false;
        }
        for(let ascii = 32; ascii < 127; ascii++){
            const key = String.fromCharCode(ascii);
            this.currentKeys[key] = false;
            this.previousKeys[key] = false;
        }
        document.addEventListener("keydown", (ev)=>{
            if(document.activeElement === canvas){
                let key = ev.key;
                if(key.length == 1){
                    const code = key.charCodeAt(0);
                    if(code >= 'A'.charCodeAt(0) && code <= 'Z'.charCodeAt(0)) key = key.toLowerCase();
                }
                this.currentKeys[key] = true;
                switch(ev.key){
                    case Key.ArrowUp:
                    case Key.ArrowDown:
                    case Key.ArrowLeft:
                    case Key.ArrowRight:
                    case ' ':
                        ev.preventDefault();
                }
            }
        });
        document.addEventListener("keyup", (ev)=>{
            let key = ev.key;
            if(key.length == 1){
                const code = key.charCodeAt(0);
                if(code >= 'A'.charCodeAt(0) && code <= 'Z'.charCodeAt(0)) key = key.toLowerCase();
            }
            this.currentKeys[key] = false; 
        });

        this.currentButtons = [false, false, false];
        this.previousButtons = [false, false, false];


        canvas.addEventListener("click", (ev)=>{
            canvas.focus();
            ev.preventDefault();
            this.currentButtons[ev.button] = true;
        });
        canvas.addEventListener("mouseup", (ev)=>{
            ev.preventDefault();
            this.currentButtons[ev.button] = false;
        });

        this.currentMousePosition = vec2.fromValues(0, 0);
        this.perviousMousePosition = vec2.fromValues(0, 0);

        canvas.addEventListener("mousemove", (ev)=>{
            ev.preventDefault();
            if(this.pointerLocked){
                this.currentMousePosition[0] += ev.movementX;
                this.currentMousePosition[1] += ev.movementY;
            } else {
                vec2.set(this.currentMousePosition, ev.pageX - canvas.offsetLeft, ev.pageY - canvas.offsetTop);
            }
            if(this.firstMouseMove){
                vec2.copy(this.perviousMousePosition, this.currentMousePosition);
                this.firstMouseMove = false;
            }
        });

        this.previousWheelPosition = vec3.fromValues(0, 0, 0);
        this.currentWheelPosition = vec3.fromValues(0, 0, 0);

        canvas.addEventListener("wheel", (ev) => {
            ev.preventDefault();
            this.currentWheelPosition[0] += ev.deltaX;
            this.currentWheelPosition[1] += ev.deltaY;
            this.currentWheelPosition[2] += ev.deltaZ;
        });

        canvas.addEventListener("drag", (ev)=>{ev.preventDefault();});
        canvas.addEventListener("dragend", (ev)=>{ev.preventDefault();});
        canvas.addEventListener("dragenter", (ev)=>{ev.preventDefault();});
        canvas.addEventListener("dragexit", (ev)=>{ev.preventDefault();});
        canvas.addEventListener("dragleave", (ev)=>{ev.preventDefault();});
        canvas.addEventListener("dragover", (ev)=>{ev.preventDefault();});
        canvas.addEventListener("dragstart", (ev)=>{ev.preventDefault();});
        canvas.addEventListener("drop", (ev)=>{ev.preventDefault();});

        document.addEventListener("pointerlockchange", ()=>{ this.pointerLocked = (document.pointerLockElement == canvas); }, false);
    }

    public update(): void {
        for(let key in Key){
            this.previousKeys[key] = this.currentKeys[key];
        }
        for(let ascii = 32; ascii < 127; ascii++){
            const key = String.fromCharCode(ascii);
            this.previousKeys[key] = this.currentKeys[key];
        }
        for(let button = 0; button < 3; button++){
            this.previousButtons[button] = this.currentButtons[button];
        }
        vec2.copy(this.perviousMousePosition, this.currentMousePosition);
        vec3.copy(this.previousWheelPosition, this.currentWheelPosition);
    }

    public isKeyDown(key: Key | string): boolean { return this.currentKeys[key]; }
    public isKeyUp(key: Key | string): boolean { return !this.currentKeys[key]; }
    public isKeyJustDown(key: Key | string): boolean { return this.currentKeys[key] && !this.previousKeys[key]; }
    public isKeyJustUp(key: Key | string): boolean { return !this.currentKeys[key] && this.previousKeys[key]; }

    public isButtonDown(button: number): boolean { return this.currentButtons[button]; }
    public isButtonUp(button: number): boolean { return !this.currentButtons[button]; }
    public isButtonJustDown(button: number): boolean { return this.currentButtons[button] && !this.previousButtons[button]; }
    public isButtonJustUp(button: number): boolean { return !this.currentButtons[button] && this.previousButtons[button]; }

    public get MousePosition(): vec2 { return vec2.copy(vec2.create(), this.currentMousePosition); }
    public get MouseDelta(): vec2 { return vec2.sub(vec2.create(), this.currentMousePosition, this.perviousMousePosition); }

    public get WheelPosition(): vec3 { return vec3.copy(vec3.create(), this.currentWheelPosition); }
    public get WheelDelta(): vec3 { return vec3.sub(vec3.create(), this.currentWheelPosition, this.previousWheelPosition); }

    public requestPointerLock() { this.canvas.requestPointerLock(); }
    public exitPointerLock() { document.exitPointerLock(); }

    public isPointerLocked(): boolean { return this.pointerLocked; }
}
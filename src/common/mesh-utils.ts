import Mesh from './mesh';
import * as OBJ from 'webgl-obj-loader';

// This file contain some helper classes to create simple meshes

const BLACK = [0, 0, 0, 255];
const RED = [255, 0, 0, 255];
const GREEN = [0, 255, 0, 255];
const BLUE = [0, 0, 255, 255];
const YELLOW = [255, 255, 0, 255];
const MAGENTA = [255, 0, 255, 255];
const CYAN = [0, 255, 255, 255];
const WHITE = [255, 255, 255, 255];

function createEmptyMesh(gl: WebGL2RenderingContext): Mesh {
    return new Mesh(gl, [
        { attributeLocation: 0, buffer: "positions", size: 3, type: gl.FLOAT, normalized: false, stride: 0, offset: 0 },
        { attributeLocation: 1, buffer: "colors", size: 4, type: gl.UNSIGNED_BYTE, normalized: true, stride: 0, offset: 0 },
        { attributeLocation: 2, buffer: "texcoords", size: 2, type: gl.FLOAT, normalized: false, stride: 0, offset: 0 },
        { attributeLocation: 3, buffer: "normals", size: 3, type: gl.FLOAT, normalized: false, stride: 0, offset: 0 }
    ]);
}

export function Plane(gl: WebGL2RenderingContext, texCoords: {min:[number, number], max:[number, number]} = {min:[0,0], max:[1,1]}): Mesh {
    let mesh = createEmptyMesh(gl);
    mesh.setBufferData("positions", new Float32Array([
        -1.0,  0.0,  1.0,
         1.0,  0.0,  1.0,
         1.0,  0.0, -1.0,
        -1.0,  0.0, -1.0,
    ]), gl.STATIC_DRAW);
    mesh.setBufferData("colors", new Uint8Array([
        ...WHITE, ...WHITE, ...WHITE, ...WHITE
    ]), gl.STATIC_DRAW);
    mesh.setBufferData("texcoords", new Float32Array([
        texCoords.min[0], texCoords.min[1],
        texCoords.max[0], texCoords.min[1],
        texCoords.max[0], texCoords.max[1],
        texCoords.min[0], texCoords.max[1]
    ]), gl.STATIC_DRAW);
    mesh.setBufferData("normals", new Float32Array([
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,
        0, 1, 0 
    ]), gl.STATIC_DRAW);
    mesh.setElementsData(new Uint32Array([
        0, 1, 2,
        2, 3, 0
    ]), gl.STATIC_DRAW);
    return mesh
}


export function SubdividedPlane(gl: WebGL2RenderingContext, resolution: number | [number, number] = 1, texCoords: {min:[number, number], max:[number, number]} = {min:[0,0], max:[1,1]}): Mesh {
    if(typeof resolution === "number") resolution = [resolution, resolution]
    resolution = resolution.map((x)=>x>=1?x:1) as [number, number];
    let positions = [], colors = [], texcoords = [], normals = [], indices = [];
    for(let i = 0; i <= resolution[0]; i++){
        for(let j = 0; j <= resolution[1]; j++){
            positions.push(2 * i/resolution[0] - 1, 0, 1 - 2 * j/resolution[1]);
            colors.push(...WHITE);
            texcoords.push(
                i/resolution[0] * (texCoords.max[0] - texCoords.min[0]) + texCoords.min[0],  
                j/resolution[1] * (texCoords.max[1] - texCoords.min[1]) + texCoords.min[1]);
            normals.push(0, 1, 0);
        }
    }
    for(let i = 0; i < resolution[0]; i++){
        for(let j = 0; j < resolution[1]; j++){
            let index = j + i*(resolution[1]+1);
            indices.push(index, index+resolution[1]+1, index+resolution[1]+2);
            indices.push(index+resolution[1]+2, index+1, index);
        }
    }
    let mesh = createEmptyMesh(gl);
    mesh.setBufferData("positions", new Float32Array(positions), gl.STATIC_DRAW);
    mesh.setBufferData("colors", new Uint8Array(colors), gl.STATIC_DRAW);
    mesh.setBufferData("texcoords", new Float32Array(texcoords), gl.STATIC_DRAW);
    mesh.setBufferData("normals", new Float32Array(normals), gl.STATIC_DRAW);
    mesh.setElementsData(new Uint32Array(indices), gl.STATIC_DRAW);
    return mesh
}

export function WhiteCube(gl: WebGL2RenderingContext): Mesh {
    let mesh = createEmptyMesh(gl);
    mesh.setBufferData("positions", new Float32Array([
        //Upper Face
        -1,  1, -1,
        -1,  1,  1,
         1,  1,  1,
         1,  1, -1,
        //Lower Face
        -1, -1, -1,
         1, -1, -1,
         1, -1,  1,
        -1, -1,  1,
        //Right Face
         1, -1, -1,
         1,  1, -1,
         1,  1,  1,
         1, -1,  1,
        //Left Face
        -1, -1, -1,
        -1, -1,  1,
        -1,  1,  1,
        -1,  1, -1,
        //Front Face
        -1, -1,  1,
         1, -1,  1,
         1,  1,  1,
        -1,  1,  1,
        //Back Face
        -1, -1, -1,
        -1,  1, -1,
         1,  1, -1,
         1, -1, -1
    ]), gl.STATIC_DRAW);
    mesh.setBufferData("colors", new Uint8Array([
        //Upper Face
        ...WHITE, ...WHITE, ...WHITE, ...WHITE,
        //Lower Face
        ...WHITE, ...WHITE, ...WHITE, ...WHITE,
        //Right Face
        ...WHITE, ...WHITE, ...WHITE, ...WHITE,
        //Left Face
        ...WHITE, ...WHITE, ...WHITE, ...WHITE,
        //Front Face
        ...WHITE, ...WHITE, ...WHITE, ...WHITE,
        //Back Face
        ...WHITE, ...WHITE, ...WHITE, ...WHITE,
    ]), gl.STATIC_DRAW);
    mesh.setElementsData(new Uint32Array([
        //Upper Face
        0, 1, 2, 2, 3, 0,
        //Lower Face
        4, 5, 6, 6, 7, 4,
        //Right Face
        8, 9, 10, 10, 11, 8,
        //Left Face
        12, 13, 14, 14, 15, 12,
        //Front Face
        16, 17, 18, 18, 19, 16,
        //Back Face
        20, 21, 22, 22, 23, 20, 
    ]), gl.STATIC_DRAW);
    return mesh;
}

export function Cube(gl: WebGL2RenderingContext): Mesh {
    let mesh = createEmptyMesh(gl);
    mesh.setBufferData("positions", new Float32Array([
        //Upper Face
        -1,  1, -1,
        -1,  1,  1,
         1,  1,  1,
         1,  1, -1,
        //Lower Face
        -1, -1, -1,
         1, -1, -1,
         1, -1,  1,
        -1, -1,  1,
        //Right Face
         1, -1, -1,
         1,  1, -1,
         1,  1,  1,
         1, -1,  1,
        //Left Face
        -1, -1, -1,
        -1, -1,  1,
        -1,  1,  1,
        -1,  1, -1,
        //Front Face
        -1, -1,  1,
         1, -1,  1,
         1,  1,  1,
        -1,  1,  1,
        //Back Face
        -1, -1, -1,
        -1,  1, -1,
         1,  1, -1,
         1, -1, -1
    ]), gl.STATIC_DRAW);
    mesh.setBufferData("colors", new Uint8Array([
        //Upper Face
        ...WHITE, ...WHITE, ...WHITE, ...WHITE,
        //Lower Face
        ...WHITE, ...WHITE, ...WHITE, ...WHITE,
        //Right Face
        ...WHITE, ...WHITE, ...WHITE, ...WHITE,
        //Left Face
        ...WHITE, ...WHITE, ...WHITE, ...WHITE,
        //Front Face
        ...WHITE, ...WHITE, ...WHITE, ...WHITE,
        //Back Face
        ...WHITE, ...WHITE, ...WHITE, ...WHITE,
    ]), gl.STATIC_DRAW);
    mesh.setBufferData("texcoords", new Float32Array([
        //Upper Face
        0, 1,
        0, 0,
        1, 0,
        1, 1,
        //Lower Face
        0, 0,
        1, 0,
        1, 1,
        0, 1,
        //Right Face
        1, 0,
        1, 1,
        0, 1,
        0, 0,
        //Left Face
        0, 0,
        1, 0,
        1, 1,
        0, 1,
        //Front Face
        0, 0,
        1, 0,
        1, 1,
        0, 1,
        //Back Face
        1, 0,
        1, 1,
        0, 1,
        0, 0
    ]), gl.STATIC_DRAW);
    mesh.setBufferData("normals", new Float32Array([
        //Upper Face
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,
        //Lower Face
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,
        //Right Face
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        //Left Face
        -1, 0, 0,
        -1, 0, 0,
        -1, 0, 0,
        -1, 0, 0,
        //Front Face
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        //Back Face
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,
        0, 0, -1
    ]), gl.STATIC_DRAW);
    mesh.setElementsData(new Uint32Array([
        //Upper Face
        0, 1, 2, 2, 3, 0,
        //Lower Face
        4, 5, 6, 6, 7, 4,
        //Right Face
        8, 9, 10, 10, 11, 8,
        //Left Face
        12, 13, 14, 14, 15, 12,
        //Front Face
        16, 17, 18, 18, 19, 16,
        //Back Face
        20, 21, 22, 22, 23, 20, 
    ]), gl.STATIC_DRAW);
    return mesh;
}

export function Sphere(gl: WebGL2RenderingContext, resolution: number | [number, number] = 32): Mesh {
    if(typeof resolution === "number") resolution = [2*resolution, resolution]
    resolution = resolution.map((x)=>x>=1?x:1) as [number, number];
    let positions = [], colors = [], texcoords = [], normals = [], indices = [];
    for(let i = 0; i <= resolution[0]; i++){
        const theta = i/resolution[0] * 2 * Math.PI;
        const cos_theta = Math.cos(theta), sin_theta = Math.sin(theta);
        for(let j = 0; j <= resolution[1]; j++){
            const phi = (j/resolution[1] - 0.5) * Math.PI;
            const cos_phi = Math.cos(phi), sin_phi = Math.sin(phi);
            const x = cos_theta * cos_phi, y = sin_phi, z = - sin_theta * cos_phi;    
            positions.push(x, y, z);
            colors.push(...WHITE);
            texcoords.push(i/resolution[0], j/resolution[1]);
            normals.push(x, y, z);
        }
    }
    for(let i = 0; i < resolution[0]; i++){
        for(let j = 0; j < resolution[1]; j++){
            let index = j + i*(resolution[1]+1);
            indices.push(index, index+resolution[1]+1, index+resolution[1]+2);
            indices.push(index+resolution[1]+2, index+1, index);
        }
    }
    let mesh = createEmptyMesh(gl);
    mesh.setBufferData("positions", new Float32Array(positions), gl.STATIC_DRAW);
    mesh.setBufferData("colors", new Uint8Array(colors), gl.STATIC_DRAW);
    mesh.setBufferData("texcoords", new Float32Array(texcoords), gl.STATIC_DRAW);
    mesh.setBufferData("normals", new Float32Array(normals), gl.STATIC_DRAW);
    mesh.setElementsData(new Uint32Array(indices), gl.STATIC_DRAW);
    return mesh
}

export function LoadOBJMesh(gl: WebGL2RenderingContext, data: string){
    let obj = new OBJ.Mesh(data);
    let mesh = createEmptyMesh(gl);
    mesh.setBufferData("positions", new Float32Array(obj.vertices), gl.STATIC_DRAW);
    mesh.setBufferData("texcoords", new Float32Array(obj.textures), gl.STATIC_DRAW);
    mesh.setBufferData("normals", new Float32Array(obj.vertexNormals), gl.STATIC_DRAW);
    let colors = new Uint8Array(obj.vertices.length * 4 / 3);
    colors.fill(255);
    mesh.setBufferData("colors", colors, gl.STATIC_DRAW);
    mesh.setElementsData(new Uint32Array(obj.indices), gl.STATIC_DRAW);
    return mesh;
}
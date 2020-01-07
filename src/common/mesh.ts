//This file contains a Mesh class (used to store Vertices and how to draw them)

// This is an interface to a vertex attribute descriptor in which we will describe how to read the data from the buffers
export interface VertexDescriptor {
    attributeLocation: number,
    buffer: string,
    size: number,
    type: number,
    normalized: boolean,
    stride: number,
    offset: number
}

export default class Mesh {
    gl: WebGL2RenderingContext;
    descriptors: VertexDescriptor[];
    VBOs: {[name: string]: WebGLBuffer};
    EBO: WebGLBuffer;
    VAO: WebGLVertexArrayObject;
    elementCount: number;
    elementType: number;

    // The constructor takes a WebGL context and a list of vertex attribute descriptors
    // It will get all the buffer names and create them then it will build the Vertex Array to read the attributes from them
    constructor(gl: WebGL2RenderingContext, descriptors: VertexDescriptor[]){
        this.gl = gl;
        this.descriptors = descriptors;
        this.VBOs = {};
        const bufferNames = Array.from(new Set(descriptors.map((desc)=>desc.buffer)));
        for(const bufferName of bufferNames) this.VBOs[bufferName] = this.gl.createBuffer();
        this.EBO = this.gl.createBuffer();
        this.VAO = this.gl.createVertexArray();

        this.gl.bindVertexArray(this.VAO);
        for(let descriptor of this.descriptors){
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.VBOs[descriptor.buffer]);
            this.gl.enableVertexAttribArray(descriptor.attributeLocation);
            this.gl.vertexAttribPointer(descriptor.attributeLocation, descriptor.size, descriptor.type, descriptor.normalized, descriptor.stride, descriptor.offset);
        }
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.EBO);
        this.gl.bindVertexArray(null);
    }

    // Just a dispose variable to free memory
    public dispose(){
        this.gl.deleteVertexArray(this.VAO);
        this.gl.deleteBuffer(this.EBO);
        for(let bufferName in this.VBOs) this.gl.deleteBuffer(this.VBOs[bufferName]);
        this.VBOs = null;
    }

    // We will use this to fill the vertex buffer data
    public setBufferData(bufferName: string, bufferData: number | Int8Array | Int16Array | Int32Array | Uint8Array | Uint16Array | Uint32Array | Uint8ClampedArray | Float32Array | Float64Array | DataView | ArrayBuffer, usage: number){
        if(bufferName in this.VBOs){
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.VBOs[bufferName]);
            this.gl.bufferData(this.gl.ARRAY_BUFFER, bufferData, usage);
        } else {
            console.error(`"${bufferName}" is not found in the buffers list`);
        }
    }

    // We will use this to fill the Elements Buffer data and know how many vertex we will draw
    public setElementsData(bufferData: Uint8Array | Uint16Array | Uint32Array | Uint8ClampedArray, usage: number){
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.EBO);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, bufferData, usage);

        this.elementCount = bufferData.length;
        if(bufferData instanceof Uint8Array || bufferData instanceof Uint8ClampedArray) this.elementType = this.gl.UNSIGNED_BYTE;
        else if(bufferData instanceof Uint16Array) this.elementType = this.gl.UNSIGNED_SHORT;
        else if(bufferData instanceof Uint32Array) this.elementType = this.gl.UNSIGNED_INT;
    }

    // As the name says, this draws the mesh
    public draw(mode: number = this.gl.TRIANGLES){
        this.gl.bindVertexArray(this.VAO);
        this.gl.drawElements(mode, this.elementCount, this.elementType, 0);
        this.gl.bindVertexArray(null);
    }
}
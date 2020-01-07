// This class is responsible for handling shaders for us
// Since this is a common operation in all of our scenes, we will write in a class to reuse it every where
export default class ShaderProgram {
    gl: WebGL2RenderingContext;
    program: WebGLProgram;
    
    constructor(gl: WebGL2RenderingContext){
        this.gl = gl;
        this.program = this.gl.createProgram(); // Tell webgl to create an empty program (we will attach the shaders to it later)
    }

    public dispose(): void {
        this.gl.deleteProgram(this.program); // Tell webgl to delete our program
    }

    // This function compiles a shader from source and if the compilation was successful, it attaches it to the program
    // source: the source code of the shader
    // type: the type of the shader, it can be gl.VERTEX_SHADER or gl.FRAGMENT_SHADER
    public attach(source: string, type: number): boolean {
        let shader = this.gl.createShader(type); // Create an empty shader of the given type
        this.gl.shaderSource(shader, source); // Add the source code to the shader
        this.gl.compileShader(shader); // Now, we compile the shader
        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) { // If the shader failed to compile, we print the error messages, delete the shader and return 
            console.error(`An error occurred compiling the ${{[this.gl.VERTEX_SHADER]:"vertex", [this.gl.FRAGMENT_SHADER]:"fragment"}[type]} shader: ${this.gl.getShaderInfoLog(shader)}`);
            this.gl.deleteShader(shader);
            return false;
        }
        this.gl.attachShader(this.program, shader); // If it compiled successfully, we attach it to the program
        this.gl.deleteShader(shader); // Now that the shader is attached, we don't need to keep its object anymore, so we delete it.
        return true;
    }

    // After attaching all the shader we need for our program, we link the whole program
    public link(): boolean {
        this.gl.linkProgram(this.program); // Tell webgl to link the programs
        if (!this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS)) { // Check if the linking failed (the shaders could be incompatible)
            console.error('Unable to initialize the shader program: ' + this.gl.getProgramInfoLog(this.program));
            return false;
        } else {
            return true;
        }
    }

    public use() {
        this.gl.useProgram(this.program);
    }

    //
    // Uniform Setters (For convenience)
    //

    // One Component Setters

    public setUniform1f(name: string, x: number) {
        this.gl.uniform1f(this.gl.getUniformLocation(this.program, name), x);
    }

    public setUniform1fv(name: string, data: Float32Array | ArrayLike<number>, srcOffset?: number, srcLength?: number) {
        this.gl.uniform1fv(this.gl.getUniformLocation(this.program, name), data, srcOffset, srcLength);
    }

    public setUniform1i(name: string, x: number) {
        this.gl.uniform1i(this.gl.getUniformLocation(this.program, name), x);
    }

    public setUniform1iv(name: string, data: Int32Array | ArrayLike<number>, srcOffset?: number, srcLength?: number) {
        this.gl.uniform1iv(this.gl.getUniformLocation(this.program, name), data, srcOffset, srcLength);
    }

    public setUniform1ui(name: string, x: number) {
        this.gl.uniform1ui(this.gl.getUniformLocation(this.program, name), x);
    }

    public setUniform1uiv(name: string, data: Uint32Array | ArrayLike<number>, srcOffset?: number, srcLength?: number) {
        this.gl.uniform1uiv(this.gl.getUniformLocation(this.program, name), data, srcOffset, srcLength);
    }

    // Two Component Setters

    public setUniform2f(name: string, v: Float32Array | ArrayLike<number>) {
        this.gl.uniform2f(this.gl.getUniformLocation(this.program, name), v[0], v[1]);
    }

    public setUniform2fv(name: string, data: Float32Array | ArrayLike<number>, srcOffset?: number, srcLength?: number) {
        this.gl.uniform2fv(this.gl.getUniformLocation(this.program, name), data, srcOffset, srcLength);
    }

    public setUniform2i(name: string, v: Int32Array | ArrayLike<number>) {
        this.gl.uniform2i(this.gl.getUniformLocation(this.program, name), v[0], v[1]);
    }

    public setUniform2iv(name: string, data: Int32Array | ArrayLike<number>, srcOffset?: number, srcLength?: number) {
        this.gl.uniform2iv(this.gl.getUniformLocation(this.program, name), data, srcOffset, srcLength);
    }

    public setUniform2ui(name: string, v: Uint32Array | ArrayLike<number>) {
        this.gl.uniform2ui(this.gl.getUniformLocation(this.program, name), v[0], v[1]);
    }

    public setUniform2uiv(name: string, data: Uint32Array | ArrayLike<number>, srcOffset?: number, srcLength?: number) {
        this.gl.uniform2uiv(this.gl.getUniformLocation(this.program, name), data, srcOffset, srcLength);
    }

    // Three Component Setters

    public setUniform3f(name: string, v: Float32Array | ArrayLike<number>) {
        this.gl.uniform3f(this.gl.getUniformLocation(this.program, name), v[0], v[1], v[2]);
    }

    public setUniform3fv(name: string, data: Float32Array | ArrayLike<number>, srcOffset?: number, srcLength?: number) {
        this.gl.uniform3fv(this.gl.getUniformLocation(this.program, name), data, srcOffset, srcLength);
    }

    public setUniform3i(name: string, v: Int32Array | ArrayLike<number>) {
        this.gl.uniform3i(this.gl.getUniformLocation(this.program, name), v[0], v[1], v[2]);
    }

    public setUniform3iv(name: string, data: Int32Array | ArrayLike<number>, srcOffset?: number, srcLength?: number) {
        this.gl.uniform3iv(this.gl.getUniformLocation(this.program, name), data, srcOffset, srcLength);
    }

    public setUniform3ui(name: string, v: Uint32Array | ArrayLike<number>) {
        this.gl.uniform3ui(this.gl.getUniformLocation(this.program, name), v[0], v[1], v[2]);
    }

    public setUniform3uiv(name: string, data: Uint32Array | ArrayLike<number>, srcOffset?: number, srcLength?: number) {
        this.gl.uniform3uiv(this.gl.getUniformLocation(this.program, name), data, srcOffset, srcLength);
    }

    // four Component Setters

    public setUniform4f(name: string, v: Float32Array | ArrayLike<number>) {
        this.gl.uniform4f(this.gl.getUniformLocation(this.program, name), v[0], v[1], v[2], v[3]);
    }

    public setUniform4fv(name: string, data: Float32Array | ArrayLike<number>, srcOffset?: number, srcLength?: number) {
        this.gl.uniform4fv(this.gl.getUniformLocation(this.program, name), data, srcOffset, srcLength);
    }

    public setUniform4i(name: string, v: Int32Array | ArrayLike<number>) {
        this.gl.uniform4i(this.gl.getUniformLocation(this.program, name), v[0], v[1], v[2], v[3]);
    }

    public setUniform4iv(name: string, data: Int32Array | ArrayLike<number>, srcOffset?: number, srcLength?: number) {
        this.gl.uniform4iv(this.gl.getUniformLocation(this.program, name), data, srcOffset, srcLength);
    }

    public setUniform4ui(name: string, v: Uint32Array | ArrayLike<number>) {
        this.gl.uniform4ui(this.gl.getUniformLocation(this.program, name), v[0], v[1], v[2], v[3]);
    }

    public setUniform4uiv(name: string, data: Uint32Array | ArrayLike<number>, srcOffset?: number, srcLength?: number) {
        this.gl.uniform4uiv(this.gl.getUniformLocation(this.program, name), data, srcOffset, srcLength);
    }

    // Matrix Setters

    public setUniformMatrix2fv(name: string, transpose: boolean, data: Float32Array | ArrayLike<number>, srcOffset?: number, srcLength?: number){
        this.gl.uniformMatrix2fv(this.gl.getUniformLocation(this.program, name), transpose, data, srcOffset, srcLength);
    }

    public setUniformMatrix2x3fv(name: string, transpose: boolean, data: Float32Array | ArrayLike<number>, srcOffset?: number, srcLength?: number){
        this.gl.uniformMatrix2x3fv(this.gl.getUniformLocation(this.program, name), transpose, data, srcOffset, srcLength);
    }

    public setUniformMatrix2x4fv(name: string, transpose: boolean, data: Float32Array | ArrayLike<number>, srcOffset?: number, srcLength?: number){
        this.gl.uniformMatrix2x4fv(this.gl.getUniformLocation(this.program, name), transpose, data, srcOffset, srcLength);
    }

    public setUniformMatrix3fv(name: string, transpose: boolean, data: Float32Array | ArrayLike<number>, srcOffset?: number, srcLength?: number){
        this.gl.uniformMatrix3fv(this.gl.getUniformLocation(this.program, name), transpose, data, srcOffset, srcLength);
    }

    public setUniformMatrix3x2fv(name: string, transpose: boolean, data: Float32Array | ArrayLike<number>, srcOffset?: number, srcLength?: number){
        this.gl.uniformMatrix3x2fv(this.gl.getUniformLocation(this.program, name), transpose, data, srcOffset, srcLength);
    }

    public setUniformMatrix3x4fv(name: string, transpose: boolean, data: Float32Array | ArrayLike<number>, srcOffset?: number, srcLength?: number){
        this.gl.uniformMatrix3x4fv(this.gl.getUniformLocation(this.program, name), transpose, data, srcOffset, srcLength);
    }

    public setUniformMatrix4fv(name: string, transpose: boolean, data: Float32Array | ArrayLike<number>, srcOffset?: number, srcLength?: number){
        this.gl.uniformMatrix4fv(this.gl.getUniformLocation(this.program, name), transpose, data, srcOffset, srcLength);
    }

    public setUniformMatrix4x2fv(name: string, transpose: boolean, data: Float32Array | ArrayLike<number>, srcOffset?: number, srcLength?: number){
        this.gl.uniformMatrix4x2fv(this.gl.getUniformLocation(this.program, name), transpose, data, srcOffset, srcLength);
    }
    
    public setUniformMatrix4x3fv(name: string, transpose: boolean, data: Float32Array | ArrayLike<number>, srcOffset?: number, srcLength?: number){
        this.gl.uniformMatrix4x3fv(this.gl.getUniformLocation(this.program, name), transpose, data, srcOffset, srcLength);
    }
}
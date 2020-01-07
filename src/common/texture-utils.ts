export function LoadImage(gl: WebGL2RenderingContext, image: ImageData): WebGLTexture {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 4);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.generateMipmap(gl.TEXTURE_2D);
    return texture;
}

type Size = [number, number];
type Color = [number, number, number, number];

export function CheckerBoard(gl: WebGL2RenderingContext, imageSize: Size, cellSize: Size, color0: Color, color1: Color): WebGLTexture {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 4);
    let data = Array(imageSize[0] * imageSize[1] * 4);
    for (let j = 0; j < imageSize[1]; j++) {
        for (let i = 0; i < imageSize[0]; i++) {
            data[i + j * imageSize[0]] = (Math.floor(i / cellSize[0]) + Math.floor(j / cellSize[1])) % 2 == 0 ? color0 : color1;
        }
    }
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, imageSize[0], imageSize[1], 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(data.flat()));
    gl.generateMipmap(gl.TEXTURE_2D);
    return texture;
}

export function SingleColor(gl: WebGL2RenderingContext, color: Color = [255, 255, 255, 255]): WebGLTexture {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 4);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(color));
    gl.generateMipmap(gl.TEXTURE_2D);
    return texture;
}
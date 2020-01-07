import { vec3, mat4 } from 'gl-matrix';

// Just for organization, we will keep all of our camera data and functions in here

export default class Camera {
    type: 'orthographic' | 'perspective' = 'perspective';
    
    position: vec3 = vec3.fromValues(0, 0, 0);
    direction: vec3 = vec3.fromValues(0, 0, 1);
    up: vec3 = vec3.fromValues(0, 1, 0);
    
    perspectiveFoVy: number = Math.PI/2;
    orthographicHeight: number = 10;
    aspectRatio: number = 1;
    near: number = 0.01;
    far: number = 1000;

    public get ViewMatrix(): mat4 { return mat4.lookAt(mat4.create(), this.position, vec3.add(vec3.create(), this.position, this.direction), this.up); }
    public get ProjectionMatrix(): mat4 {
        if(this.type === 'orthographic'){
            const halfH = this.orthographicHeight/2;
            const halfW = halfH * this.aspectRatio;
            return mat4.ortho(mat4.create(), -halfW, halfW, -halfH, halfH, this.near, this.far);
        } else {
            return mat4.perspective(mat4.create(), this.perspectiveFoVy, this.aspectRatio, this.near, this.far);
        }
    }
    public get ViewProjectionMatrix(): mat4 {
        const V = this.ViewMatrix, P = this.ProjectionMatrix;
        return mat4.mul(P, P, V);
    }

    public setTarget(value: vec3) {
        vec3.sub(this.direction, value, this.position);
    }

    public get right(): vec3 {
        const up = vec3.normalize(vec3.create(), this.up);
        return vec3.cross(up, this.direction, up);
    }
}
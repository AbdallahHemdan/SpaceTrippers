import { Scene } from '../common/game';
import ShaderProgram from '../common/shader-program';
import Mesh from '../common/mesh';
import * as MeshUtils from '../common/mesh-utils';
import * as TextureUtils from '../common/texture-utils';
import Camera from '../common/camera';
import FlyCameraController from '../common/camera-controllers/fly-camera-controller';
import { vec3, mat4, quat } from 'gl-matrix';
import { Vector, Selector, Color, CheckBox } from '../common/dom-utils';
import { createElement } from 'tsx-create-element';

// It is better to create interfaces for each type of light for organization (think of them as structs)
// We simplify things here and consider the light to have only one color
// Also we separate the ambient light into its own light and make it a hemispherical light (the ambient differs according to the direction)
interface AmbientLight {
    type: 'ambient',
    enabled: boolean,
    skyColor: vec3,
    groundColor: vec3,
    skyDirection: vec3
};

interface DirectionalLight {
    type: 'directional',
    enabled: boolean,
    color: vec3,
    direction: vec3
};

interface PointLight {
    type: 'point',
    enabled: boolean,
    color: vec3,
    position: vec3,
    attenuation_quadratic: number,
    attenuation_linear: number,
    attenuation_constant: number
};

interface SpotLight {
    type: 'spot',
    enabled: boolean,
    color: vec3,
    position: vec3,
    direction: vec3,
    attenuation_quadratic: number,
    attenuation_linear: number,
    attenuation_constant: number,
    inner_cone: number,
    outer_cone: number
};

// This union type: it can be any of the specified types
type Light = AmbientLight | DirectionalLight | SpotLight;

// This will store the material properties
// To be more consistent with modern workflows, we use what is called albedo to define the diffuse and ambient
// And since specular power (shininess) is in the range 0 to infinity and the more popular roughness paramater is in the range 0 to 1, we read the roughness from the image and convert it to shininess (specular power)
// We also add an emissive properties in case the object itself emits light
// Finally, while the ambient is naturally the same a the diffuse, some areas recieve less ambient than other (e.g. folds), so we use the ambient occlusion texture to darken the ambient in these areas
// We also add tints and scales to control the properties without using multiple textures
interface Material {
    albedo: WebGLTexture,    //ambient + diffuse
    albedo_tint: vec3,       
    specular: WebGLTexture,  //shiness
    specular_tint: vec3
    roughness: WebGLTexture,
    roughness_scale: number,
    ambient_occlusion: WebGLTexture,
    emissive: WebGLTexture,
    emissive_tint: vec3
};

// This will represent an object in 3D space
interface Object3D {
    mesh: Mesh,
    material: Material,
    modelMatrix: mat4
};

interface MoonJSON {
    RotationX: number,
    RotationY: number,
    RotationZ: number,

    TranslationX: number,
    TranslationY: number,
    TranslationZ: number,

    ScaleX: number,
    ScaleY: number,
    ScaleZ: number,

    RotationAngle: number
};
interface SpaceShuttlJSON {
    RotationX: number,
    RotationY: number,
    RotationZ: number,

    TranslationX: number,
    TranslationY: number,
    TranslationZ: number,

    ScaleX: number,
    ScaleY: number,
    ScaleZ: number,
};
interface StoneJson {
    RotationX: number,
    RotationY: number,
    RotationZ: number,

    TranslationX: number,
    TranslationY: number,
    TranslationZ: number,

    ScaleX: number,
    ScaleY: number,
    ScaleZ: number,
};

// In this scene we will draw a scene to multiple targets then use the targets to do a motion blur post processing
export default class SpaceTrippersScene extends Scene {
    
    programs: {[name: string]: ShaderProgram} = {};
    camera: Camera;
    controller: FlyCameraController;
    meshes: {[name: string]: Mesh} = {};
    textures: {[name: string]: WebGLTexture} = {};
    samplers: {[name: string]: WebGLSampler} = {};

    moonData: MoonJSON;
    SpaceShuttleData: SpaceShuttlJSON;
    StonesData: StoneJson;

    time: number = 0;
    Score: number = 0;
    lifes: number = 15;

    Space_Displacement: number = -70;

    movementX: number = 0;

    nubmerOfStones: number = 5;
    Stones_pos: number[][];

    Shuttle_X: number = 0;
    Shuttle_Y: number = 8;
    Shuttle_Z: number = -5;
    // We will store the lights here
    lights: Light[] = [
        { type: "ambient", enabled: true, skyColor: vec3.fromValues(1, 1, 1), groundColor: vec3.fromValues(0, 0, 0), skyDirection: vec3.fromValues(0,1,0)},
        { type: 'directional', enabled: true, color: vec3.fromValues(1,1,1), direction:vec3.fromValues(-1,-1,-1) },
        { type: 'spot', enabled: true, color: vec3.fromValues(5,5,0), position:vec3.fromValues(-80, 30, 0), direction:vec3.fromValues(+1,0,+1), attenuation_quadratic:1, attenuation_linear:0, attenuation_constant:0, inner_cone: 0.25*Math.PI, outer_cone: 10000  },
    ];

    // And we will store the objects here
    objects: {[name: string]: Object3D} = {};
    public load(): void {
        // All the lights will use the same vertex shader combined with different fragment shaders
        this.game.loader.load({
            ["light.vert"]:{url:'shaders/phong/textured-materials/light.vert', type:'text'},
            ["ambient.frag"]:{url:'shaders/phong/textured-materials/ambient.frag', type:'text'},
            ["directional.frag"]:{url:'shaders/phong/textured-materials/directional.frag', type:'text'},
            ["point.frag"]:{url:'shaders/phong/textured-materials/point.frag', type:'text'},
            ["spot.frag"]:{url:'shaders/phong/textured-materials/spot.frag', type:'text'},
            ["SpaceShuttle"]:{url:'models/SpaceShuttle/SpaceShuttle.obj', type:'text'},
            ["SpaceShuttle.tx"]:{url:'models/SpaceShuttle/SpaceShuttle_BaseColor.png', type:'image'},
            ["ground.tx"]:{url:'models/Floor/bluegrid1.jpg', type:'image'},
            ["stone-model"]: { url: 'models/Stone/PUSHILIN_boulder.obj', type: 'text' },
            ["stone-texture"]: { url: 'models/Stone/PUSHILIN_boulder.png', type: 'image' },
            ["moon"]:{url:'images/moon.jpg', type:'image'},
            ["moonData"]:{url: 'moon.json', type:'json'},
            ["SpaceShuttleData"]:{url: 'SpaceShuttle.json', type:'json'},
            ["StoneData"]:{url: 'Stone.json', type:'json'}
        });
    }

    public start(): void {
        //Stones
        this.SpaceShuttleData = this.game.loader.resources["SpaceShuttleData"];
        this.moonData = this.game.loader.resources["moonData"];
        this.StonesData = this.game.loader.resources["StoneData"];

        this.Stones_pos = new Array<Array<number>>();
        for(let i = 0; i < this.nubmerOfStones; i++)
        {
            let row:number[] = new Array<number>();
            for (let j = 0; j < 3; j++)
            {
                row.push(0);
            }            
            this.Stones_pos.push(row);
        }


        // For each light type, compile and link a shader
        for(let type of ['ambient', 'directional', 'spot']){
            this.programs[type] = new ShaderProgram(this.gl);
            this.programs[type].attach(this.game.loader.resources['light.vert'], this.gl.VERTEX_SHADER);
            this.programs[type].attach(this.game.loader.resources[`${type}.frag`], this.gl.FRAGMENT_SHADER);
            this.programs[type].link();
        }

        // Load the models
        this.meshes['ground'] = MeshUtils.Plane(this.gl, {min:[0,0], max:[50,50]});
        this.meshes['SpaceShuttle'] = MeshUtils.LoadOBJMesh(this.gl, this.game.loader.resources["SpaceShuttle"]);
        //stone meshes
        this.meshes['stone'] = MeshUtils.LoadOBJMesh(this.gl, this.game.loader.resources["stone-model"]);
        this.meshes['moon'] = MeshUtils.Sphere(this.gl);

        this.textures['SpaceShuttle.tx'] = TextureUtils.LoadImage(this.gl, this.game.loader.resources['SpaceShuttle.tx']);
        this.textures['ground.tx'] = TextureUtils.LoadImage(this.gl, this.game.loader.resources['ground.tx']);
        this.textures['white'] = TextureUtils.SingleColor(this.gl, [255, 255, 255, 255]);
        this.textures['black'] = TextureUtils.SingleColor(this.gl, [0, 0, 0, 255]);
        //stone textures
        this.textures['stone'] = TextureUtils.LoadImage(this.gl, this.game.loader.resources['stone-texture']);
        //moon
        this.textures['moon'] = TextureUtils.LoadImage(this.gl, this.game.loader.resources['moon']);

        // Create the 3D ojbects
        
        this.objects['moon'] = {
            mesh: this.meshes['moon'],
            material: {
                albedo: this.textures['moon'],
                albedo_tint: vec3.fromValues(1, 1, 1),
                specular: this.textures['moon'],
                specular_tint: vec3.fromValues(1, 1, 1),
                roughness: this.textures['moon'],
                roughness_scale: 1,
                emissive: this.textures['black'],
                emissive_tint: vec3.fromValues(1, 1, 1),
                ambient_occlusion: this.textures['white']
            },
            modelMatrix: mat4.fromRotationTranslationScale(mat4.create(), quat.fromEuler(quat.create(), this.moonData.RotationX, this.moonData.RotationY, this.moonData.RotationZ), vec3.fromValues(this.moonData.TranslationX, this.moonData.TranslationY, this.moonData.TranslationZ), vec3.fromValues(this.moonData.ScaleX, this.moonData.ScaleY, this.moonData.ScaleZ))
        };
        this.objects['ground'] = {
            mesh: this.meshes['ground'],
            material: {
                albedo: this.textures['ground.tx'],
                albedo_tint: vec3.fromValues(1, 1, 1),
                specular: this.textures['ground.tx'],
                specular_tint: vec3.fromValues(1, 1, 1),
                roughness: this.textures['ground.tx'],
                roughness_scale: 1,
                emissive: this.textures['black'],
                emissive_tint: vec3.fromValues(1, 1, 1),
                ambient_occlusion: this.textures['white']
            },
            modelMatrix: mat4.fromRotationTranslationScale(mat4.create(), quat.fromEuler(quat.create(), 0, 45, 0), vec3.fromValues(0, 0, 0), vec3.fromValues(100, 1, 100))
        };
        this.objects['groundTwo'] = {
            mesh: this.meshes['ground'],
            material: {
                albedo: this.textures['ground.tx'],
                albedo_tint: vec3.fromValues(1, 1, 1),
                specular: this.textures['ground.tx'],
                specular_tint: vec3.fromValues(1, 1, 1),
                roughness: this.textures['ground.tx'],
                roughness_scale: 1,
                emissive: this.textures['black'],
                emissive_tint: vec3.fromValues(1, 1, 1),
                ambient_occlusion: this.textures['white']
            },
            modelMatrix: mat4.fromRotationTranslationScale(mat4.create(), quat.fromEuler(quat.create(), 0, 45, 0), vec3.fromValues(0, 0, 0), vec3.fromValues(100, 1, 100))
        };
        for (let i = 0; i < this.nubmerOfStones; i++)
        {   
            this.Stones_pos[i][0] = Math.random() * 100 - 80 - 40 * i;
            this.Stones_pos[i][1] = 15;
            this.Stones_pos[i][2] = Math.random() * 100 - 80 - 40 * i;
            this.objects[i] = {
                mesh: this.meshes['stone'],
            material: {
                albedo: this.textures['stone'],
                albedo_tint: vec3.fromValues(1, 1, 1),
                specular: this.textures['stone'],
                specular_tint: vec3.fromValues(1, 1, 1),
                roughness: this.textures['stone'],
                roughness_scale: 1,
                emissive: this.textures['black'],
                emissive_tint: vec3.fromValues(1, 1, 1),
                ambient_occlusion: this.textures['white']
            },
            modelMatrix: mat4.fromRotationTranslationScale(mat4.create(), quat.create(), vec3.fromValues(this.Stones_pos[i][0], this.Stones_pos[i][1], this.Stones_pos[i][2]), vec3.fromValues(this.StonesData.ScaleX, this.StonesData.ScaleY, this.StonesData.ScaleZ))
            };
        }
        
        this.objects['SpaceShuttle'] = {
            mesh: this.meshes['SpaceShuttle'],
            material: {
                albedo: this.textures['SpaceShuttle.tx'],
                albedo_tint: vec3.fromValues(1, 1, 1),
                specular: this.textures['SpaceShuttle.tx'],
                specular_tint: vec3.fromValues(1, 1, 1),
                roughness: this.textures['SpaceShuttle.tx'],
                roughness_scale: 1,
                emissive: this.textures['black'],
                emissive_tint: vec3.fromValues(1, 1, 1),
                ambient_occlusion: this.textures['SpaceShuttle.tx']
            },
            //quat.fromEuler(quat.create(), -90, 45, 0)
            modelMatrix: mat4.fromRotationTranslationScale(mat4.create(), quat.fromEuler(quat.create(), this.SpaceShuttleData.RotationX, this.SpaceShuttleData.RotationY, this.SpaceShuttleData.RotationZ), vec3.fromValues(this.SpaceShuttleData.TranslationX, this.SpaceShuttleData.TranslationY, this.SpaceShuttleData.TranslationZ), vec3.fromValues(this.SpaceShuttleData.ScaleX, this.SpaceShuttleData.ScaleY, this.SpaceShuttleData.ScaleZ))
        };

        // Create a regular sampler for textures rendered on the scene objects
        this.samplers['regular'] = this.gl.createSampler();
        this.gl.samplerParameteri(this.samplers['regular'], this.gl.TEXTURE_WRAP_S, this.gl.REPEAT);
        this.gl.samplerParameteri(this.samplers['regular'], this.gl.TEXTURE_WRAP_T, this.gl.REPEAT);
        this.gl.samplerParameteri(this.samplers['regular'], this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
        this.gl.samplerParameteri(this.samplers['regular'], this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR_MIPMAP_LINEAR);

        // Create a camera and a controller
        this.camera = new Camera();
        this.camera.type = 'perspective';
        this.camera.position = vec3.fromValues(30,30,30);
        this.camera.direction = vec3.fromValues(-1,-1,-1);
        this.camera.aspectRatio = this.gl.drawingBufferWidth/this.gl.drawingBufferHeight;
        
        this.controller = new FlyCameraController(this.camera, this.game.input);
        this.controller.movementSensitivity = 0.01;

        // As usual, we enable face culling and depth testing
        this.gl.enable(this.gl.CULL_FACE);
        this.gl.cullFace(this.gl.BACK);
        this.gl.frontFace(this.gl.CCW);

        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.depthFunc(this.gl.LEQUAL);

        // Use a dark grey clear color
        this.gl.clearColor(0.1,0.1,0.1,1);

        this.setupControls();
    }

    public draw(deltaTime: number): void {
        if (this.lifes > 0)
        {
            
            this.Score++;
            this.controller.update(deltaTime); // Update camera
            this.time += deltaTime;
    
            if(this.game.input.isButtonDown(0)){
                if(this.game.input.isKeyDown("l")) this.movementX += 1;
                if(this.game.input.isKeyDown("j")) this.movementX -= 1;
                this.movementX = Math.max(-40, this.movementX);
                this.movementX = Math.min(40, this.movementX);
            }
    
            this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT); // Clear color and depth
    
            let first_light = true;
            // for each light, draw the whole scene
            for(const light of this.lights){
                if(!light.enabled) continue; // If the light is not enabled, continue
    
                if(first_light){ // If tihs is the first light, there is no need for blending
                    this.gl.disable(this.gl.BLEND);
                    first_light = false;
                }else{ // If this in not the first light, we need to blend it additively with all the lights drawn before
                    this.gl.enable(this.gl.BLEND);
                    this.gl.blendEquation(this.gl.FUNC_ADD);
                    this.gl.blendFunc(this.gl.ONE, this.gl.ONE); // This config will make the output = src_color + dest_color
                }
    
                let program = this.programs[light.type]; // Get the shader to use with this light type
                program.use(); // Use it
    
                // Send the VP and camera position
                program.setUniformMatrix4fv("VP", false, this.camera.ViewProjectionMatrix);
                program.setUniform3f("cam_position", this.camera.position);
    
                // Send the light properties depending on its type (remember to normalize the light direction)
                if(light.type == 'ambient'){
                    program.setUniform3f(`light.skyColor`, light.skyColor);
                    program.setUniform3f(`light.groundColor`, light.groundColor);
                    program.setUniform3f(`light.skyDirection`, light.skyDirection);
                } else {
                    program.setUniform3f(`light.color`, light.color);
                    
                    if(light.type == 'directional' || light.type == 'spot'){
                        program.setUniform3f(`light.direction`, vec3.normalize(vec3.create(), light.direction));
                    }
                    if(light.type == 'spot'){
                        program.setUniform3f(`light.position`, light.position);
                        program.setUniform1f(`light.attenuation_quadratic`, light.attenuation_quadratic);
                        program.setUniform1f(`light.attenuation_linear`, light.attenuation_linear);
                        program.setUniform1f(`light.attenuation_constant`, light.attenuation_constant);
                    }
                    if(light.type == 'spot'){
                        program.setUniform1f(`light.inner_cone`, light.inner_cone);
                        program.setUniform1f(`light.outer_cone`, light.outer_cone);
                    }
                }
    
                // Loop over objects and draw them
                for(let name in this.objects){
                    let obj = this.objects[name];
    
                    // Create model matrix for the object
                    program.setUniformMatrix4fv("M", false, obj.modelMatrix);
                    program.setUniformMatrix4fv("M_it", true, mat4.invert(mat4.create(), obj.modelMatrix));
                    
                    // Send material properties and bind the textures
                    program.setUniform3f("material.albedo_tint", obj.material.albedo_tint);
                    program.setUniform3f("material.specular_tint", obj.material.specular_tint);
                    program.setUniform3f("material.emissive_tint", obj.material.emissive_tint);
                    program.setUniform1f("material.roughness_scale", obj.material.roughness_scale);
    
                    this.gl.activeTexture(this.gl.TEXTURE0);
                    this.gl.bindTexture(this.gl.TEXTURE_2D, obj.material.albedo);
                    this.gl.bindSampler(0, this.samplers['regular']);
                    program.setUniform1i("material.albedo", 0);
    
                    this.gl.activeTexture(this.gl.TEXTURE1);
                    this.gl.bindTexture(this.gl.TEXTURE_2D, obj.material.specular);
                    this.gl.bindSampler(1, this.samplers['regular']);
                    program.setUniform1i("material.specular", 1);
    
                    this.gl.activeTexture(this.gl.TEXTURE2);
                    this.gl.bindTexture(this.gl.TEXTURE_2D, obj.material.roughness);
                    this.gl.bindSampler(2, this.samplers['regular']);
                    program.setUniform1i("material.roughness", 2);
    
                    this.gl.activeTexture(this.gl.TEXTURE3);
                    this.gl.bindTexture(this.gl.TEXTURE_2D, obj.material.emissive);
                    this.gl.bindSampler(3, this.samplers['regular']);
                    program.setUniform1i("material.emissive", 3);
    
                    this.gl.activeTexture(this.gl.TEXTURE4);
                    this.gl.bindTexture(this.gl.TEXTURE_2D, obj.material.ambient_occlusion);
                    this.gl.bindSampler(4, this.samplers['regular']);
                    program.setUniform1i("material.ambient_occlusion", 4);
                    
                    obj.mesh.draw(this.gl.TRIANGLES);
                }
                
    
                this.Space_Displacement += 4;
                if(this.Space_Displacement >= 204) this.Space_Displacement = -50;
                for(let i=0; i<this.nubmerOfStones; ++i){
    
                    if (this.Stones_pos[i][0] > 70 || this.Stones_pos[i][2] > 70)
                    {
                        this.Stones_pos[i][0] = Math.random() * 100 - 140 - 40 * i;
                        this.Stones_pos[i][1] = 10;
                        this.Stones_pos[i][2] = Math.random() * 100 - 140 - 40 * i;
                    } 
    
                    this.Stones_pos[i][0] += 1, this.Stones_pos[i][2] += 1;
    
                    this.objects[i].modelMatrix = mat4.fromRotationTranslationScale(mat4.create(), quat.create(), vec3.fromValues(this.Stones_pos[i][0], this.Stones_pos[i][1], this.Stones_pos[i][2]), vec3.fromValues(6, 6, 6))
                }
                const moonData = this.game.loader.resources["moonData"];
                this.objects['moon'].modelMatrix =  mat4.fromRotationTranslationScale(mat4.create(), quat.fromEuler(quat.create(), moonData.RotationX, moonData.RotationAngle*this.time/1000, moonData.RotationZ), vec3.fromValues(moonData.TranslationX, moonData.TranslationY, moonData.TranslationZ), vec3.fromValues(moonData.ScaleX, moonData.ScaleY, moonData.ScaleZ))
                this.objects['ground'].modelMatrix = mat4.fromRotationTranslationScale(mat4.create(), quat.fromEuler(quat.create(), 0, 45, 0), vec3.fromValues(this.Space_Displacement, 0, this.Space_Displacement), vec3.fromValues(100, 1, 600));
                this.objects['groundTwo'].modelMatrix = mat4.fromRotationTranslationScale(mat4.create(), quat.fromEuler(quat.create(), 0, 45, 0), vec3.fromValues(-200 + this.Space_Displacement, 0, -200 + this.Space_Displacement), vec3.fromValues(100, 1, 600));
                this.objects['SpaceShuttle'].modelMatrix = mat4.fromRotationTranslationScale(mat4.create(), quat.fromEuler(quat.create(), this.SpaceShuttleData.RotationX, this.SpaceShuttleData.RotationY, this.SpaceShuttleData.RotationZ), vec3.fromValues(this.movementX, 10,-this.movementX), vec3.fromValues(this.SpaceShuttleData.ScaleX, this.SpaceShuttleData.ScaleY, this.SpaceShuttleData.ScaleZ));
    
                 this.DetectCollision();
    
                this.controlHealthScore();
            }
        }
    }

    private DetectCollision(): void{
        ////// Collision //////
        for (let i = 0; i < this.nubmerOfStones; i++)
        {
            if (Math.abs(this.Stones_pos[i][0] - this.Shuttle_X) < 12)
            {
                if (Math.abs(this.Stones_pos[i][2] - this.Shuttle_Z) < 12)
                {
                    this.Stones_pos[i][0] = Math.random() * 100 - 140 - 40 * i;
                    this.Stones_pos[i][1] = 10; 
                    this.Stones_pos[i][2] = Math.random() * 100 - 140 - 40 * i;
                    this.lifes--;
                }
            }
        }
    }

    public end(): void {
        for(let key in this.programs)
            this.programs[key].dispose();
        this.programs = {};
        for(let key in this.meshes)
            this.meshes[key].dispose();
        this.meshes = {};
        this.clearControls();
    }
   
    private setupControls() {
        const controls = document.querySelector('#controls');
        controls.appendChild(
            <div>
                <div className="control-row">
                    <label className="control-label">Lights</label>
                    {this.lights.map((light)=>{
                        return <CheckBox value={light.enabled} onchange={(v)=>{light.enabled=v;}}/>
                    })}
                </div>
            </div>
            
        );      
        
    }
    
    private clearControls() {
        const controls = document.querySelector('#controls');
        controls.innerHTML = "";
    }
    private controlHealthScore() {
        if(this.lifes <= 0){
            document.querySelector("#health").innerHTML = "";
            document.querySelector("#over").innerHTML = "GAME OVER";
        }
        else{
           document.querySelector("#score").innerHTML = (this.Score/60).toFixed(0).toString();
            document.querySelector("#health").innerHTML = this.lifes.toString();
       }
    }


}
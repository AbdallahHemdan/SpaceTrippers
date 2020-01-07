#version 300 es
layout(location=0) in vec3 position;
layout(location=2) in vec2 texcoord;
layout(location=3) in vec3 normal;


out vec2 v_texcoord;
out vec3 v_world;
out vec3 v_normal;
out vec3 v_view;

uniform mat4 M;
uniform mat4 M_it;
uniform mat4 VP;
uniform vec3 cam_position;

void main(){
    vec4 world = M * vec4(position, 1.0f);
    gl_Position = VP * world;
    v_texcoord = texcoord; 
    v_world = world.xyz;
    v_normal = (M_it * vec4(normal, 0.0f)).xyz;
    v_view = cam_position - world.xyz;
}
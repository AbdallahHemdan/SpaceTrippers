#version 300 es
precision highp float;

// Most of the documentation in ambient.frag applies here

in vec2 v_texcoord;
in vec3 v_world;
in vec3 v_normal;
in vec3 v_view;

out vec4 color;

struct Material {
    sampler2D albedo;
    vec3 albedo_tint;
    sampler2D specular;
    vec3 specular_tint;
    sampler2D roughness;
    float roughness_scale;
    sampler2D ambient_occlusion;
    sampler2D emissive;
    vec3 emissive_tint;
};
uniform Material material;

struct DirectionalLight {
    vec3 color;
    vec3 direction;
};
uniform DirectionalLight light;

float diffuse(vec3 n, vec3 l){
    //Diffuse (Lambert) term computation: reflected light = cosine the light incidence angle on the surface
    //max(0, ..) is used since light shouldn't be negative
    return max(0.0f, dot(n,l));
}

float specular(vec3 n, vec3 l, vec3 v, float shininess){
    //Phong Specular term computation
    return pow(max(0.0f, dot(v,reflect(-l, n))), shininess);
}

struct SampledMaterial {
    vec3 albedo;
    vec3 specular;
    vec3 emissive;
    float shininess;
    float ambient_occlusion;
};

SampledMaterial sampleMaterial(Material material, vec2 texcoord){
    SampledMaterial mat;
    mat.albedo = material.albedo_tint * texture(material.albedo, texcoord).rgb;
    mat.specular = material.specular_tint * texture(material.specular, texcoord).rgb;
    mat.emissive = material.emissive_tint * texture(material.emissive, texcoord).rgb;
    float roughness = material.roughness_scale * texture(material.roughness, texcoord).r;
    mat.shininess = 2.0f/pow(max(0.01f,roughness), 4.0f) - 2.0f;
    mat.ambient_occlusion = texture(material.ambient_occlusion, texcoord).r;
    return mat;
}

void main(){
    SampledMaterial sampled = sampleMaterial(material, v_texcoord);

    vec3 n = normalize(v_normal);
    vec3 v = normalize(v_view);
    // No more ambient here, it is moved to ambient.frag
    // Also, the light color is no longer seperated by diffuse and specular
    color = vec4(
        (sampled.albedo*diffuse(n, -light.direction) + 
        sampled.specular*specular(n, -light.direction, v, sampled.shininess)) * light.color,
        1.0f
    );
}
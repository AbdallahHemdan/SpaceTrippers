#version 300 es
precision highp float;

in vec2 v_texcoord;
in vec3 v_world;
in vec3 v_normal;
in vec3 v_view;

out vec4 color;

struct Material {
    sampler2D albedo; // Albedo will be used for diffuse and ambient
    vec3 albedo_tint; // This tint will be multiplied by the the albedo to control its color
    sampler2D specular;
    vec3 specular_tint;
    sampler2D roughness; // Roughness will be used for the specular
    float roughness_scale; // This will be used to scale the roughness (Note: it should be less than 1)
    sampler2D ambient_occlusion; // This will be used to occlude the ambient light
    sampler2D emissive; // This will be used for emissive materials
    vec3 emissive_tint;
};
uniform Material material;

// For ambient lighting, we will use Hemisphere light since it is slightly more realistic than plain ambient light
// In Hemisphere light, the ambient lighting will depend on the pixel normal
struct HemisphereLight {
    vec3 skyColor; // What color is the sky bounce light
    vec3 groundColor; // What color is the ground bounce light
    vec3 skyDirection; // Which direction points toward the sky
};
uniform HemisphereLight light;

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
// This will sample the material textures and return the sampling results
SampledMaterial sampleMaterial(Material material, vec2 texcoord){
    SampledMaterial mat;
    mat.albedo = material.albedo_tint * texture(material.albedo, texcoord).rgb;
    mat.specular = material.specular_tint * texture(material.specular, texcoord).rgb;
    mat.emissive = material.emissive_tint * texture(material.emissive, texcoord).rgb;
    float roughness = material.roughness_scale * texture(material.roughness, texcoord).r;
    mat.shininess = 2.0f/pow(max(0.01f,roughness), 2.0f) - 2.0f;
    mat.ambient_occlusion = texture(material.ambient_occlusion, texcoord).r;
    return mat;
}

void main(){
    SampledMaterial sampled = sampleMaterial(material, v_texcoord);

    vec3 n = normalize(v_normal);
    vec3 v = normalize(v_view);
    vec3 ambient = mix(light.groundColor, light.skyColor , 0.5f * dot(n, light.skyDirection) + 0.5f); // Mix the sky and ground color based on the normal direction
    color = vec4(
        sampled.emissive + // Ideally, we should separate emissive light but this mean that we will have to add one more pass... no thanks
        sampled.albedo * sampled.ambient_occlusion * ambient, // Note that, we multiply the ambient occlusion with the albedo to get the material ambient color
        1.0f
    );
}
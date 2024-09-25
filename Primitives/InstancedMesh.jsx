
import * as THREE from 'three';
// Import the material object
import Material from '../Videos/Scenes/Material';

class InstancedMesh
{

    constructor ( scene_context, geometry )
    {

        // Set the scene_contet
        this.scene_context = scene_context;

        this.lights_texture = scene_context.lights;
        this.material = new Material();

        // Set the scene as the main scene by default
        this.scene = this.scene_context.scene;

        // Geometry
        this.geometry = geometry;

        // Materialization constant
        this.uv_limit = 1.0;


        // Index slots for the tails of the instanced
        this.instance_tail = 0;

        // Capacity of the instance mesh
        this.instance_capacity = 1;

        // Generate the opacities array for use in the shader.
        this.generate_opacities_texture ( );

        // Create the material for the instanced mesh.
        this.generate_material ( ) ;

        // This is the base instanced mesh.
        this.InstancedMesh = new THREE.InstancedMesh( geometry, this.shader_material, this.instance_capacity );

        // Stack, we pull off the back and we reuse.
        this.reusable_ids = [ ];

        this.minimize();
        this.add_one_time_update ( );

    }

    minimize()
    {

        for ( let i = 0; i < this.instance_capacity; i++ )
        {
            
            this.InstancedMesh.setMatrixAt ( i, new THREE.Matrix4(0.0) );
        }



    }

    resize ( )
    {
        
        // Update capacity before creating the new mesh
        const newCapacity = this.instance_capacity * 2; // or any other factor you deem fit
        const newMesh = new THREE.InstancedMesh(this.geometry, this.shader_material, newCapacity);

        if (this.InstancedMesh !== undefined) {
            for (let i = 0; i < this.instance_tail; i++) {
                const matrix = new THREE.Matrix4();
                this.InstancedMesh.getMatrixAt(i, matrix);
                newMesh.setMatrixAt(i, matrix);
            }

            // Optional: Update any other attributes or uniforms here if needed

            for(let i = this.instance_tail; i < newCapacity; i++ )
            {
                newMesh.setMatrixAt(i, new THREE.Matrix4(0));
            }
        }

        // Replace the old mesh with the new one in the scene
        //this.scene.remove(this.InstancedMesh);
        this.InstancedMesh = newMesh;
        //this.scene.add(this.InstancedMesh);

        // Update the capacity and flag for update
        this.instance_capacity = newCapacity;
        this.InstancedMesh.instanceMatrix.needsUpdate = true;

        this.resize_opacities_texture( );
        this.shader_material.uniforms.opacities.value = this.opacities_data;


    }

    // Handle that attribute tag for you.
    handle_attribute ( attributes, index )
    {

        // Build a logic matrix.
        let position = new THREE.Vector3(0,0,0);

        let quaternion = new THREE.Quaternion(0,0,0,0);

        let scale = new THREE.Vector3(0,0,0);

        if ( attributes["position"] != undefined )
        {

            position = attributes["position"];

        }

        if ( attributes["quaternion"] != undefined )
        {

            quaternion = attributes["quaternion"];

        }

        if ( attributes["scale"] != undefined )
        {

            scale = attributes["scale"];

        }
        // postion, quaternion, euler, scale

        let total_matrix = new THREE.Matrix4().compose ( position, quaternion, scale );

        this.InstancedMesh.setMatrixAt( index, total_matrix );

    }

    // Push a single unit of mesh based, quaternion, position, rotation 
    push ( position = new THREE.Vector3(0,0,0), scale = new THREE.Vector3(1,1,1), quaternion = new THREE.Quaternion().setFromEuler(new THREE.Euler(0,0,0) ) )
    {
        if ( this.instance_tail + 1 > this.instance_capacity )
        {
               
            this.resize();


        }

        // Find the index
        let index = this.instance_tail;

        this.instance_tail += 1;

        let total_matrix = new THREE.Matrix4().compose ( position, quaternion, scale );
 

        this.InstancedMesh.setMatrixAt( index, total_matrix );
        this.InstancedMesh.instanceMatrix.needsUpdate= true;

        return index;
    }

    dispose ( index )
    {

        this.reusable_ids.push ( index );

        let m = new THREE.Matrix4();
        m.setPosition( new THREE.Vector3(0,0,0) );
        m.scale(new THREE.Vector3(0.0,0.0,0.0));

        this.InstancedMesh.setMatrixAt( index, m );

    }

    generate_opacities_texture( )
    {

        this.opacities_data = new Float32Array( this.instance_capacity ).fill( 1.0 );

    }

    resize_opacities_texture ( )
    {
        let newData = new Float32Array( this.instance_capacity ).fill( 1.0 );

        for ( let i = 0; i < this.instance_tail; i++ )
        {
            newData[i] = this.opacities_data[i];
        }

        this.opacities_data = newData;
    }
    

    generate_material ( )
    {

        let vertex_shader = `

        // Opacities and opacity out.
        uniform float opacities[300];
        varying float opacity_out;

        // Send out the normal
        varying vec3 o_normal;
        // Send the fragment position
        varying vec3 o_fragpos;
        // Send out the uv
        varying vec2 o_uv;
        

        void main ( )
        {

            opacity_out = opacities[ gl_InstanceID ];

            // Send out the normal
            o_normal = (instanceMatrix*vec4(normal, 0)).xyz;

            // Send the fragment pos
            o_fragpos = vec3( modelViewMatrix * vec4(position, 1.0) );

            //Send out the uv
            o_uv = uv;

            gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4 ( position, 1.0 );

        }
        `;


        let fragment_shader = `

        varying float opacity_out;

        // Send out the normal
        varying vec3 o_normal;
        varying vec3 o_fragpos;
        varying vec2 o_uv;

        // Get the view pos in there
        uniform vec3 viewPos;

        uniform vec3 ambient;
        uniform vec3 diffuse;
        uniform vec3 specular;
        uniform float shininess;

        // Texture of lights these are the essential ingredients of a texture vector;
        uniform sampler2D lights;
        // Resolution of the lights texture.
        uniform ivec2 lights_dimension;
        // Number of lights
        uniform int lights_count;
        // Then the size of the structure in terms of floats 
        uniform int lights_struct_size;

        ivec2 light_index ( int light, int stride )
        {

            int index =  ( ( light * lights_struct_size )/4 ) + stride;

            int index_x = index % lights_dimension.x;
            int index_y = index / lights_dimension.x;

            return ivec2( index_x, index_y );

        }

        vec4 point_light ( vec4 color, vec4 light_pos, vec4 light_diffuse, vec4 light_ambient, vec4 light_specular, vec4 light_type )
        {

            // Set the light color
            vec3 lightAmbient = light_ambient.xyz;

            vec3 ambient = lightAmbient * ambient;

            // This lighting runs for each light and updates the light of the object in each pass.
            vec3 norm = normalize(o_normal);
            vec3 lightDir = light_pos.xyz - o_fragpos;

            // Distance.
            float lightDirLength = length(lightDir);

            float intensity = 4.0;
            float attenuation = ( intensity/ (  1.0 + (0.7*lightDirLength) + 0.0*( lightDirLength*lightDirLength ) ));
            //attenuation = intensity / lightDirLength;


            lightDir = normalize(lightDir);

            float diff = max( dot(norm,lightDir), 0.0 );
            
            vec3 diffuse = ( diff * diffuse  ) * light_diffuse.xyz;

            // Specular
            float specularStrength = 0.5;
            vec3 viewDir = normalize(viewPos.xyz - o_fragpos);
            vec3 reflectDir = reflect(-lightDir, norm);
            float spec = pow( max( dot(viewDir,reflectDir),0.0 ), shininess);
            vec3 specular = (spec * specular) * lightAmbient;

            ambient *= attenuation;
            diffuse *= attenuation;
            specular *= attenuation;


            return vec4(diffuse + specular + ambient, 1.0);
            

        }

        vec4 sun_light ( vec4 color, vec4 light_pos, vec4 light_diffuse, vec4 light_ambient, vec4 light_specular, vec4 light_type )
        {

             // Set the light color
            vec3 lightAmbient = light_ambient.xyz;

            vec3 ambient = lightAmbient * ambient;

            // This lighting runs for each light and updates the light of the object in each pass.
            vec3 norm = normalize(o_normal);
            vec3 lightDir = light_pos.xyz - o_fragpos;

            lightDir = normalize(lightDir);

            float diff = max( dot(norm,lightDir), 0.0 );
            
            vec3 diffuse = ( diff * diffuse  ) * light_diffuse.xyz;

            // Specular
            vec3 viewDir = normalize(viewPos.xyz - o_fragpos);
            vec3 reflectDir = reflect(-lightDir, norm);
            float spec = pow( max( dot(viewDir,reflectDir),0.0 ), shininess);
            vec3 specular = (spec * specular) * lightAmbient;




            return vec4(diffuse + specular + ambient, 1.0);

        }



        
        vec4 calculate_lighting ( )
        {

            // Set the color
            vec4 color = vec4(0,0,0,1);

            // Iterate through each light and extract it from the lights sampler2D
            for ( int i = 0; i < lights_count; i++ )
            {
            
                vec4 light_pos = texelFetch( lights, light_index(i, 0), 0 );
                vec4 light_diffuse = texelFetch ( lights, light_index(i,1), 0 );
                vec4 light_ambient = texelFetch ( lights, light_index(i,2), 0);
                vec4 light_specular = texelFetch ( lights, light_index(i,3), 0);
                vec4 light_type = texelFetch ( lights, light_index(i,4), 0);

                if ( light_type.x == 1.0 )
                {
                    color += point_light ( color, light_pos, light_diffuse, light_ambient, light_specular, light_type );  
                    
                }

                if ( light_type.x == 0.0 )
                {
                    color += sun_light ( color, light_pos, light_diffuse, light_ambient, light_specular, light_type );
                }

                
                
                
                
            }



            return color;
        


        }


        uniform float uv_limit;

        void main ( )
        {
        
            vec4 color = calculate_lighting( );

            if ( o_uv.x > uv_limit )
            {
                discard;
            }

            

            gl_FragColor = vec4 ( color.xyz, opacity_out ) ;
            //gl_FragColor = vec4(o_uv,1,1);
            //gl_FragColor = vec4 (o_normal, 1);

        }
        `;

        this.shader_material = new THREE.ShaderMaterial ( {
            vertexShader: vertex_shader,
            fragmentShader: fragment_shader,
            uniforms: {
                "opacities": { value: this.opacities_data },
                "lights": {value: this.lights_texture.texture() },
                "lights_dimension" : {value: this.lights_texture.dimension() },
                "lights_count" : {value: this.lights_texture.count()  },
                "lights_struct_size": {value: this.lights_texture.struct_size() },
                "viewPos" : {value:this.scene_context.camera.position},
                "ambient" : { value:this.material.ambient },
                "diffuse" : {value:this.material.diffuse},
                "specular" : {value:this.material.specular},
                "shininess" : {value:this.material.shininess},
                "uv_limit" : { value:this.uv_limit },
            },
            transparent: true,
            blending: THREE.NormalBlending,
            depthTest: true,
    
        });

        //this.material.uniforms.opacities.value[0] = 0.5;

    }

    // Rendering functions, assign a scene
    assign_scene ( scene )
    {
        
        // Remove the mesh from the scene entirely.
        this.scene.remove ( this.InstancedMesh );

        // Set the scene as the new scene.
        this.scene = scene;

        // I guess add a one time event.
        //this.scene_context.onAnimate.add_one_time_event ( this.render.bind(this) );
        this.scene.add ( this.InstancedMesh );

    }

    render (  ) 
    {

        this.scene.add ( this.InstancedMesh );
    }

    

    // Add a one time update event
    add_one_time_update()
    {

        this.scene_context.onAnimate.add_one_time_event( this.render.bind(this) );

    }



};

export { InstancedMesh } ;
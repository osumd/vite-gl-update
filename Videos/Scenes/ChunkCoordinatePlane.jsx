
// Chunk Coordinate System

import * as THREE from 'three';

class ChunkCoordinatePlane {

    constructor( scene_context, origin=new THREE.Vector3(0,0,0) )
    {

        

        //  Set the origin  of the chunk coordinate plane
        this.origin = origin;


        this.scene_context = scene_context;

        this.subdivisions = 4;

        // Chunk section.
        // Limit the amount of chunks in the chunk array at a time.
        this.chunks_array_limit = 10000;

        // Should always be a power of two.
        this.size_of_chunk_structure = 8;

        // Create the tail of the chunks array
        this.chunks_array_tail = 0;

        this.number_of_active_chunks = 0;

        this.primitives_per_chunk = 2;

        this.primitive_type = 4;


        // Chunk finding properties
        // Design the chunk size.
        this.chunk_size = 2;

        // Define the chunk radius spread
        this.chunk_radius = 10; 

        // Generate the chunks array
        this.generate_chunks_array_texture();
        this.find_chunks();
        this.generate_geometry_texture();
        this.render_geometry_texture();


        //scene_context.onAnimate.add_event ( this.update_chunks.bind(this) );

    }


    // System for adding procedures for mesh generation.

    generate_geometry_texture()
    {

        

        // Create secondary camera
        this.secondaryCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
        this.secondaryCamera.position.z = 1;

        // Create secondary scene
        this.secondaryScene = new THREE.Scene();

        // Create the shader
        const vertexShader = `
            varying vec2 vUv;

            // Layout of the buffer, 

            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `;

        const fragmentShader = `

            
            // UV
            varying vec2 vUv;
            
            // Resolution of the geometry texture.
            uniform ivec2 resolution;

            uniform int primitives_per_chunk;
            uniform int primitive_type;

            uniform sampler2D chunks_texture;
            uniform ivec2 chunks_texture_resolution;
            uniform int pixel_per_chunk;

            uniform int number_of_active_chunks;

            void main() {

                // Get the pixel ID or pixel number.
                int pixel_id = ( int(gl_FragCoord.y)*int(resolution.x) ) + int(gl_FragCoord.x);

                // The group id is current group number per primitive.
                int primitive_id = ((pixel_id)/primitive_type);

                // The vertex is the current vertex of the group id primitive; 
                int vertex_id = (pixel_id%primitive_type);

                // The sequence index
                int chunk_id = (primitive_id) / primitives_per_chunk;

                // Current relative count of primitives
                int relative_primitive = primitive_id % primitives_per_chunk;

                // Get the relative t in terms of primitives available per chunk.
                float relative_t = ( float ( relative_primitive ) / float ( primitives_per_chunk ) );

                // Discard the fragment if it belongs to a chunk that in the current active chunks.
                if ( chunk_id > number_of_active_chunks || number_of_active_chunks == 0 )
                {
                    //discard;
                }

                // Get the pixel coordinates in terms of the chunk_id
                int chunk_pixel0 = ( chunk_id*pixel_per_chunk );
                int chunk_pixel1 = chunk_pixel0+1;

                // Get the chunk coords.
                ivec2 chunk_coord0 = ivec2 ( chunk_pixel0 % chunks_texture_resolution.x, chunk_pixel0 / chunks_texture_resolution.x );
                ivec2 chunk_coord1 = ivec2 ( chunk_pixel1 % chunks_texture_resolution.x, chunk_pixel1 / chunks_texture_resolution.x );

                // Retrieve the chunk coordinates
                vec3 chunk_lower_left = texelFetch ( chunks_texture, chunk_coord0, 0 ).xyz;
                vec3 chunk_upper_right = texelFetch ( chunks_texture, chunk_coord1, 0 ).xyz;

                // The lengths of the x,y,z 
                float delta_x = chunk_upper_right.x - chunk_lower_left.x;
                float delta_y = chunk_upper_right.y - chunk_lower_left.y;
                float delta_z = chunk_upper_right.z - chunk_lower_left.z;

                // Find the real delta_x values by dividing them by
                float double_delta_x = ( delta_x )/ ( float ( primitives_per_chunk) );
                float double_delta_y = ( delta_y ) / ( float ( primitives_per_chunk));
                float double_delta_z =  ( delta_z ) / ( float ( primitives_per_chunk));

                // Build the chunk unit vectors, assuming uniform orientation.
                vec3 chunk_x = normalize ( vec3 ( delta_x, 0.0, 0.0 ) );
                vec3 chunk_y = normalize ( vec3 ( 0.0, delta_y, 0.0 ) );
                vec3 chunk_z = normalize ( vec3 ( 0.0, 0.0, delta_z ) );

                vec4 color = vec4( 10, 0, 0, 1);

                float thickness = 0.1;
                
                if ( relative_primitive % 2 == 0 )
                {

                    int sub_relative_primitive = relative_primitive;



                    if ( vertex_id == 0 )
                    {
                        
                        vec3 position = chunk_lower_left - chunk_z*thickness + (double_delta_z*float(sub_relative_primitive))*chunk_z;

                       // position = chunk_lower_left;


                        color = vec4(position, 1);

                    }
                    if ( vertex_id == 1 )
                    {

                        vec3 position = chunk_lower_left - chunk_z*thickness + chunk_x*delta_x + (double_delta_z*float(sub_relative_primitive))*chunk_z;
                        //position = chunk_lower_left + vec3(0.1,0,0);

                        color = vec4(position, 1);
                        
                    }
                    if ( vertex_id == 2 )
                    {

                        vec3 position = chunk_lower_left + chunk_x*delta_x + chunk_z*thickness + (double_delta_z*float(sub_relative_primitive))*chunk_z;
                        
                       //position = chunk_upper_right;
                       color = vec4(position, 1);
                        
                    }

                    if ( vertex_id == 3 )
                    {
                        
                        vec3 position = chunk_lower_left + chunk_z*thickness + (double_delta_z*float(sub_relative_primitive))*chunk_z;
                        //position = chunk_upper_right + vec3(0.1,0,0);

                        color = vec4(position, 1);
                    }

                }else
                {

                    int sub_relative_primitive = relative_primitive;

                    if ( vertex_id == 0 )
                    {
                        
                        vec3 position = chunk_lower_left - chunk_x*thickness +  (double_delta_x*float(sub_relative_primitive+1))*chunk_x;
                        color = vec4(position, 1);

                    }
                    if ( vertex_id == 1 )
                    {

                        vec3 position = chunk_lower_left + chunk_z*delta_z - chunk_x*thickness + (double_delta_x*float(sub_relative_primitive+1))*chunk_x;
                        color = vec4(position, 1);
                        
                    }
                    if ( vertex_id == 2 )
                    {

                        vec3 position = chunk_lower_left + chunk_z*delta_z + chunk_x*thickness + (double_delta_x*float(sub_relative_primitive+1))*chunk_x;
                        color = vec4(position, 1);
                        
                    }

                    if ( vertex_id == 3 )
                    {
                        
                        vec3 position = chunk_lower_left + chunk_x*thickness + (double_delta_x*float(sub_relative_primitive+1))*chunk_x;
                        color = vec4(position, 1);
                    }

                }

                

                

                

                

                    


            


                


                

                gl_FragColor = vec4( 0.0, 0.0, 0.0, 1);

                gl_FragColor = color;

                //gl_FragColor = texture ( chunks_texture, vUv );

                

                
            }
        `;
        
        this.geometry_texture_resolution = new THREE.Vector2(100,100);

        this.texture_generator = new THREE.ShaderMaterial({
            vertexShader: vertexShader, fragmentShader: fragmentShader,
            uniforms:{
                
                // Number of vertex per primitive
                primitive_type : { value: this.primitive_type },

                // Number of vertex per chunk.
                primitives_per_chunk : { value: this.primitives_per_chunk } ,

                // Structure of current chunk.
                chunks_texture : { value: this.chunks_texture }, 
                chunks_texture_resolution : { value: this.chunks_texture_resolution },
                pixel_per_chunk : { value: this.pixel_per_chunk },

                // Resolution of the render target.
                resolution: { value: this.geometry_texture_resolution },

                // Number of active chunks.
                number_of_active_chunks : { value: this.number_of_active_chunks },


                    
            }
            
        });

        this.secondaryScene.add( new THREE.Mesh(new THREE.PlaneGeometry(2,2),  this.texture_generator) )

        // Create a render target
        this.renderTarget = new THREE.WebGLRenderTarget(this.geometry_texture_resolution.x,this.geometry_texture_resolution.y,{
            format: THREE.RGBAFormat,
            type: THREE.FloatType,
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
        });

        // Map a plane to display.
        const displayPlane = new THREE.Mesh(new THREE.PlaneGeometry(2,2), new THREE.MeshBasicMaterial({map: this.renderTarget.texture}));
            
        //this.scene_context.scene.add(displayPlane);

        // Register on animate to generate the texture
        //this.scene_context.onAnimate.add_event( this.render_geometry_texture.bind(this) );
    }

    render_geometry_texture()
    {
        this.scene_context.renderer.setRenderTarget( this.renderTarget );
        this.scene_context.renderer.render( this.secondaryScene, this.secondaryCamera );
        this.scene_context.renderer.setRenderTarget(null);
    }

    render_texture_to_plane ( )
    {

        let plane_geometry = new THREE.PlaneGeometry(2,2);

        let vertex_shader = `

            varying vec2 vUv;
            void main ( )
            {

                vUv = uv;

                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

            }
        `;

        let fragment_shader = `
        
            varying vec2 vUv;

            uniform sampler2D geometry_texture;

            
            void main ( )
            {
            

                gl_FragColor = texture ( geometry_texture, vUv );

            }
        `;

        let plane_material = new THREE.ShaderMaterial({
            vertexShader: vertex_shader,
            fragmentShader: fragment_shader,
            uniforms : {
                "geometry_texture" : { value : this.renderTarget.texture }
            }
        });


        return new THREE.Mesh( plane_geometry, plane_material );

    }

    add_chunk( lower_left, upper_right )
    {

        //console.log ( "chunk", lower_left, upper_right );

        if ( this.chunks_array_tail + 1 > this.chunks_array_limit )
        {
            return;
        }

        // Formatted tail
        let formatted_tail = this.chunks_array_tail*this.size_of_chunk_structure;

        this.chunks_array[ formatted_tail ] = lower_left.x;
        this.chunks_array[ formatted_tail +1 ] = lower_left.y;
        this.chunks_array[ formatted_tail +2 ] = lower_left.z;
        this.chunks_array [ formatted_tail +3] = 0;



        this.chunks_array[ formatted_tail +4 ] = upper_right.x;
        this.chunks_array[ formatted_tail +5 ] = upper_right.y;
        this.chunks_array[ formatted_tail +6 ] = upper_right.z;
        this.chunks_array [ formatted_tail +7] = 0;


        this.chunks_array_tail += 1;

        this.number_of_active_chunks += 1;
        
    }

    clear_chunks ( )
    {

        this.chunks_array_tail  = 0;

        this.number_of_active_chunks = 0;

    }

    find_radial_chunks ( )
    {

        this.clear_chunks();

        // Design the chunk size.
        let chunk_size = 1;

        // get the camera location
        let camera_position = this.scene_context.camera.position.clone();

        // Define the chunk radius spread
        let chunk_radius = 2; 

       // The amount of chunks to be added would be.
        let chunks_added = 1 + ( chunk_radius*chunk_radius*chunk_radius*4);

        let camera_chunk_x = Math.floor ( camera_position.x / chunk_size );
        let camera_chunk_y = Math.floor ( camera_position.y / chunk_size );

        // The floor with snap to the lowest Z value which is on the back side of the chunk.
        let camera_chunk_z = Math.floor ( camera_position.z / chunk_size );

        let camera_chunk_lower = new THREE.Vector3( camera_chunk_x, camera_chunk_y, camera_chunk_z );
        let camera_chunk_upper = new THREE.Vector3( camera_chunk_x + chunk_size, camera_chunk_y + chunk_size, camera_chunk_z - chunk_size ); 

        // Generate a floating point array for the chunk structures.
        this.chunks_array = new Float32Array( this.size_of_chunk_structure * chunks_added * 4 );


        //this.add_chunk ( new THREE.Vector3(0,0,0), new THREE.Vector3(1,1,-1) );

        //this.add_chunk ( new THREE.Vector3(0,0,0), new THREE.Vector3(2,1,-1) );

        //this.add_chunk ( new THREE.Vector3(0,1,0), new THREE.Vector3(1,2,-1) );



        this.add_chunk ( camera_chunk_lower, camera_chunk_upper );

        for ( let i = 0; i < chunk_radius; i ++ )
        {

            for ( let j = 0; j < chunk_radius; j ++ )
            {

                for ( let z = 0; z < chunk_radius; z ++ )
                {

                    
                    

                    camera_chunk_lower.x = camera_chunk_x + i;
                    camera_chunk_lower.y = camera_chunk_y + j;
                    camera_chunk_lower.z = camera_chunk_z - z;

                    camera_chunk_upper.x = camera_chunk_lower.x + chunk_size;
                    camera_chunk_upper.y = camera_chunk_lower.y + chunk_size;
                    camera_chunk_upper.z = camera_chunk_lower.z - chunk_size;

                    this.add_chunk ( camera_chunk_lower, camera_chunk_upper );


                    camera_chunk_lower.x = camera_chunk_x + i;
                    camera_chunk_lower.y = camera_chunk_y + j;
                    camera_chunk_lower.z = camera_chunk_z + z;

                    camera_chunk_upper.x = camera_chunk_lower.x + chunk_size;
                    camera_chunk_upper.y = camera_chunk_lower.y + chunk_size;
                    camera_chunk_upper.z = camera_chunk_lower.z - chunk_size;

                    this.add_chunk ( camera_chunk_lower, camera_chunk_upper );


                    camera_chunk_lower.x = camera_chunk_x + i;
                    camera_chunk_lower.y = camera_chunk_y - j;
                    camera_chunk_lower.z = camera_chunk_z + z;

                    camera_chunk_upper.x = camera_chunk_lower.x + chunk_size;
                    camera_chunk_upper.y = camera_chunk_lower.y + chunk_size;
                    camera_chunk_upper.z = camera_chunk_lower.z - chunk_size;

                    this.add_chunk ( camera_chunk_lower, camera_chunk_upper );


                    camera_chunk_lower.x = camera_chunk_x + i;
                    camera_chunk_lower.y = camera_chunk_y - j;
                    camera_chunk_lower.z = camera_chunk_z - z;

                    camera_chunk_upper.x = camera_chunk_lower.x + chunk_size;
                    camera_chunk_upper.y = camera_chunk_lower.y + chunk_size;
                    camera_chunk_upper.z = camera_chunk_lower.z - chunk_size;

                    this.add_chunk ( camera_chunk_lower, camera_chunk_upper );


                    camera_chunk_lower.x = camera_chunk_x - i;
                    camera_chunk_lower.y = camera_chunk_y - j;
                    camera_chunk_lower.z = camera_chunk_z - z;

                    camera_chunk_upper.x = camera_chunk_lower.x + chunk_size;
                    camera_chunk_upper.y = camera_chunk_lower.y + chunk_size;
                    camera_chunk_upper.z = camera_chunk_lower.z - chunk_size;

                    this.add_chunk ( camera_chunk_lower, camera_chunk_upper );

                    camera_chunk_lower.x = camera_chunk_x - i;
                    camera_chunk_lower.y = camera_chunk_y + j;
                    camera_chunk_lower.z = camera_chunk_z - z;

                    camera_chunk_upper.x = camera_chunk_lower.x + chunk_size;
                    camera_chunk_upper.y = camera_chunk_lower.y + chunk_size;
                    camera_chunk_upper.z = camera_chunk_lower.z - chunk_size;

                    this.add_chunk ( camera_chunk_lower, camera_chunk_upper );


                    camera_chunk_lower.x = camera_chunk_x - i;
                    camera_chunk_lower.y = camera_chunk_y - j;
                    camera_chunk_lower.z = camera_chunk_z + z;

                    camera_chunk_upper.x = camera_chunk_lower.x + chunk_size;
                    camera_chunk_upper.y = camera_chunk_lower.y + chunk_size;
                    camera_chunk_upper.z = camera_chunk_lower.z - chunk_size;

                    this.add_chunk ( camera_chunk_lower, camera_chunk_upper );

                    camera_chunk_lower.x = camera_chunk_x - i;
                    camera_chunk_lower.y = camera_chunk_y + j;
                    camera_chunk_lower.z = camera_chunk_z + z;

                    camera_chunk_upper.x = camera_chunk_lower.x + chunk_size;
                    camera_chunk_upper.y = camera_chunk_lower.y + chunk_size;
                    camera_chunk_upper.z = camera_chunk_lower.z - chunk_size;

                    this.add_chunk ( camera_chunk_lower, camera_chunk_upper );

                    

                    


                }

            }

        }
        

        // A single chunk is worth two pixels
        this.pixel_per_chunk = 2;
        this.chunks_texture_resolution = new THREE.Vector2( Math.floor ( Math.sqrt ( this.size_of_chunk_structure * chunks_added ) ), Math.floor ( Math.sqrt ( this.size_of_chunk_structure * chunks_added ) ) );


        this.chunks_texture = new THREE.DataTexture( this.chunks_array, this.chunks_texture_resolution.x, this.chunks_texture_resolution.y, THREE.RGBAFormat, THREE.FloatType );

        console.log ( this.chunks_array );

        this.chunks_texture.needsUpdate = true;

    }

    // All functions surrounding the chunks array and property array
    generate_chunks_array_texture ( )
    {
        // The amount of chunks to be added would be.
        let chunks_added = 1 + ( this.chunk_radius*this.chunk_radius*this.chunk_radius*4);

        // Generate a floating point array for the chunk structures.
        this.chunks_array = new Float32Array( this.size_of_chunk_structure * chunks_added * 4 );

        // A single chunk is worth two pixels
        this.pixel_per_chunk = 2;
        this.chunks_texture_resolution = new THREE.Vector2( Math.floor ( Math.sqrt ( this.size_of_chunk_structure * chunks_added ) ), Math.floor ( Math.sqrt ( this.size_of_chunk_structure * chunks_added ) ) );

        this.chunks_texture = new THREE.DataTexture( this.chunks_array, this.chunks_texture_resolution.x, this.chunks_texture_resolution.y, THREE.RGBAFormat, THREE.FloatType );
    }

    find_chunks ( ) 
    {

        this.clear_chunks();


        // Get the camera position
        let camera_position = this.scene_context.camera.position.clone();

       // The amount of chunks to be added would be.
        let chunks_added = 1 + ( this.chunk_radius*this.chunk_radius*this.chunk_radius*4);

        let camera_chunk_x = this.origin.x;
        let camera_chunk_y = this.origin.y;

        // The floor with snap to the lowest Z value which is on the back side of the chunk.
        let camera_chunk_z = this.origin.z ;

        let camera_chunk_lower = new THREE.Vector3( camera_chunk_x, camera_chunk_y, camera_chunk_z );
        let camera_chunk_upper = new THREE.Vector3( camera_chunk_x + this.chunk_size, camera_chunk_y + this.chunk_size, camera_chunk_z - this.chunk_size ); 

        this.add_chunk ( camera_chunk_lower, camera_chunk_upper );

        for ( let i = 0; i < this.chunk_radius; i ++ )
        {

            for ( let j = 0; j < this.chunk_radius; j ++ )
            {

                    camera_chunk_lower.x = camera_chunk_x + i*this.chunk_size;
                    camera_chunk_lower.y = camera_chunk_y;
                    camera_chunk_lower.z = camera_chunk_z - j*this.chunk_size;

                    camera_chunk_upper.x = camera_chunk_lower.x + this.chunk_size;
                    camera_chunk_upper.y = camera_chunk_lower.y + this.chunk_size;
                    camera_chunk_upper.z = camera_chunk_lower.z - this.chunk_size;

                    this.add_chunk ( camera_chunk_lower, camera_chunk_upper );


                    camera_chunk_lower.x = camera_chunk_x - i*this.chunk_size;
                    camera_chunk_lower.y = camera_chunk_y;
                    camera_chunk_lower.z = camera_chunk_z - j*this.chunk_size;

                    camera_chunk_upper.x = camera_chunk_lower.x + this.chunk_size;
                    camera_chunk_upper.y = camera_chunk_lower.y + this.chunk_size;
                    camera_chunk_upper.z = camera_chunk_lower.z - this.chunk_size;

                    this.add_chunk ( camera_chunk_lower, camera_chunk_upper );


                    camera_chunk_lower.x = camera_chunk_x - i*this.chunk_size;
                    camera_chunk_lower.y = camera_chunk_y;
                    camera_chunk_lower.z = camera_chunk_z + j*this.chunk_size;

                    camera_chunk_upper.x = camera_chunk_lower.x + this.chunk_size;
                    camera_chunk_upper.y = camera_chunk_lower.y + this.chunk_size;
                    camera_chunk_upper.z = camera_chunk_lower.z - this.chunk_size;

                    this.add_chunk ( camera_chunk_lower, camera_chunk_upper );

                    camera_chunk_lower.x = camera_chunk_x + i*this.chunk_size;
                    camera_chunk_lower.y = camera_chunk_y;
                    camera_chunk_lower.z = camera_chunk_z + j*this.chunk_size;

                    camera_chunk_upper.x = camera_chunk_lower.x + this.chunk_size;
                    camera_chunk_upper.y = camera_chunk_lower.y + this.chunk_size;
                    camera_chunk_upper.z = camera_chunk_lower.z - this.chunk_size;

                    this.add_chunk ( camera_chunk_lower, camera_chunk_upper );

            }

        }
        

        

        this.chunks_texture.image.data.set( this.chunks_array );

        //console.log ( this.chunks_array );

        this.chunks_texture.needsUpdate = true;

    }

    // Update chunks on the animation frame, or camera update frame.
    update_chunks()
    {

        
        this.find_chunks();
        this.render_geometry_texture();
    }

    // Render should return a mesh which has the render texture target bound
    render ( scene )
    {

        let vertices = new Float32Array([

            -1.0, -1.0, 0.0,
            1.0, -1.0, 0.0,
            1.0, 1.0, 0.0,
            -1.0, 1.0, 0.0,
        ]);

        let uvs = new Float32Array([
            0.0, 0.0,
            1.0, 0.0,
            1.0, 1.0,
            0.0, 1.0,
        ]);

        let element_buffer = new Uint16Array(6);
        element_buffer[0] = 0;
        element_buffer[1] = 1;
        element_buffer[2] = 2;
        element_buffer[3] = 0;
        element_buffer[4] = 2;
        element_buffer[5] = 3;

        

        // Create a BufferGeometry and set its attributes
        const plane_geometry = new THREE.BufferGeometry();
        plane_geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
        plane_geometry.setAttribute('uv', new THREE.BufferAttribute(vertices, 2));

        plane_geometry.setIndex( new THREE.BufferAttribute(element_buffer, 1));

        let vertex_shader = `
        
        varying vec2 vUv;

        uniform sampler2D geometry_texture;
        uniform vec2 resolution;
        uniform int primitive_type;

        uniform mat4 model;

        void main ( )
        {

            // Calculate the pixel coordinate from instance variable
            ivec2 pixel_coordinate = ivec2 ( ((gl_InstanceID*primitive_type) + gl_VertexID) % int(resolution.x), ((gl_InstanceID*primitive_type) + gl_VertexID ) / int(resolution.x) );

            // Texel snatch the according vertex.
            vec4 geom = texelFetch(geometry_texture, pixel_coordinate, 0);

            // Modify position based on instance ID
            vec3 pos = geom.xyz;
                
      
            // Apply standard transformations
            gl_Position = projectionMatrix * modelViewMatrix * model* vec4(pos, 1.0);
        }
        `

        let fragment_shader = `
        
        void main ( )
        {

            gl_FragColor = vec4 ( 0.0, 1.0, 0.0, 1.0 );

        }
        `

        let material = new THREE.ShaderMaterial({
            vertexShader : vertex_shader,
            fragmentShader: fragment_shader,
            uniforms : {
                "geometry_texture" : { value: this.renderTarget.texture },
                "resolution" : { value: this.geometry_texture_resolution },
                "primitive_type" : { value: this.primitive_type },
                "model" : { value: new THREE.Matrix4() }
            },
            side: THREE.DoubleSide
        });

        let mesh = new THREE.InstancedMesh(plane_geometry, material, this.number_of_active_chunks*this.primitives_per_chunk);

        scene.add ( mesh );


    }

    return_mesh ( )
    {
        let vertices = new Float32Array([

            -1.0, -1.0, 0.0,
            1.0, -1.0, 0.0,
            1.0, 1.0, 0.0,
            -1.0, 1.0, 0.0,
        ]);

        let uvs = new Float32Array([
            0.0, 0.0,
            1.0, 0.0,
            1.0, 1.0,
            0.0, 1.0,
        ]);

        let element_buffer = new Uint16Array(6);
        element_buffer[0] = 0;
        element_buffer[1] = 1;
        element_buffer[2] = 2;
        element_buffer[3] = 0;
        element_buffer[4] = 2;
        element_buffer[5] = 3;

        

        // Create a BufferGeometry and set its attributes
        const plane_geometry = new THREE.BufferGeometry();
        plane_geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
        plane_geometry.setAttribute('uv', new THREE.BufferAttribute(vertices, 2));

        plane_geometry.setIndex( new THREE.BufferAttribute(element_buffer, 1));

        let vertex_shader = `
        
        varying vec2 vUv;

        uniform sampler2D geometry_texture;
        uniform vec2 resolution;
        uniform int primitive_type;

        uniform mat4 model;

        void main ( )
        {

            // Calculate the pixel coordinate from instance variable
            ivec2 pixel_coordinate = ivec2 ( ((gl_InstanceID*primitive_type) + gl_VertexID) % int(resolution.x), ((gl_InstanceID*primitive_type) + gl_VertexID ) / int(resolution.x) );

            // Texel snatch the according vertex.
            vec4 geom = texelFetch(geometry_texture, pixel_coordinate, 0);

            // Modify position based on instance ID
            vec3 pos = geom.xyz;
                
      
            // Apply standard transformations
            gl_Position = projectionMatrix * modelViewMatrix * model* vec4(pos, 1.0);
        }
        `

        let fragment_shader = `
        
        void main ( )
        {

            gl_FragColor = vec4 ( 0.0, 1.0, 0.0, 1.0 );

        }
        `

        let material = new THREE.ShaderMaterial({
            vertexShader : vertex_shader,
            fragmentShader: fragment_shader,
            uniforms : {
                "geometry_texture" : { value: this.renderTarget.texture },
                "resolution" : { value: this.geometry_texture_resolution },
                "primitive_type" : { value: this.primitive_type },
                "model" : { value: new THREE.Matrix4() }
            },
            side: THREE.DoubleSide
        });

        this.mesh = new THREE.InstancedMesh(plane_geometry, material, this.number_of_active_chunks*this.primitives_per_chunk);

        // If the mesh instance count where to be changed, then a new mesh object would be created, if the plane were to keep up with this
        // then there would have to be a circular update dependency 

        return this.mesh;
    }




};


export { ChunkCoordinatePlane } ;
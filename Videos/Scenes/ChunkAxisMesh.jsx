
import * as THREE from 'three';
// Import the material object
import Material from './Material';

// Import troika text.
import {Text} from 'troika-three-text';


class ChunkAxisTikz {

    constructor( axis, normal, binormal )
    {
        //  Link the axis, normal and binormal.
        this.axis = axis;
        this.normal = normal;
        this.binormal = binormal;

        // Store the text objects per chunk.
        this.text_objects = [];

        // Set the step length
        this.step_length = 0.1;

    }

    

    update_labels ( axis_projection )
    {

        // Find the nearest step value.

    }



};

class ChunkAxisMesh
{

    constructor ( scene_context )
    {
        
        this.scene_context = scene_context;

        this.origin = new THREE.Vector3(0,0,0);
        this.axis = new THREE.Vector3(0,0,-1);

        // Need to calculate the normal of the axis.
        this.normal = this.axis.clone().cross( new THREE.Vector3(-this.origin.x,1,1).add(this.origin) ).normalize();
        this.binormal = this.normal.clone().cross(this.axis).normalize();

        this.primitive_type = 4;
        // Maximum number of primitives per chunk.
        this.primitives_per_chunk = 20;
        this.pixel_per_chunk = 1;
        this.size_of_chunk_structure = 4;

        this.number_of_active_chunks = 0;
        this.point_chunk_tail = 0;


        // Chunk property region list
        this.chunk_properties_settings = [
            {t_start: 0.0, radius: 0.2 },
            {t_start: 0.5, radius: 0.2 },
            {t_start: 0.8,  radius: 0.2 },
            {t_start: 0.9, radius: 1.0 },
            {t_start: 1.0, radius: 0.0 },
        ];

        // Arbitrary light setup
        this.lights_texture = scene_context.lights;
        this.material = new Material();


        // Settings for base and tip length
        this.shaft_radius = 0.2;
        this.base_radius = this.shaft_radius*2;
        this.tip_length = this.shaft_radius*8;

        // Generate the chunk properties after finding the chunks.
        this.init_point_chunks_array ( );
        this.init_point_chunks_property_array();
        this.find_point_chunks0();
        this.generate_geometry_texture();
        
        this.render_geometry_texture();

    }

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

            uniform sampler2D chunks_property_texture;
            uniform ivec2 chunks_property_texture_resolution;

            uniform int number_of_active_chunks;

            uniform vec3 normal;
            uniform vec3 binormal;

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
                float prev_relative_t = ( float ( relative_primitive ) / float ( primitives_per_chunk ) );
                float next_relative_t = ( float ( relative_primitive+1) / float ( primitives_per_chunk ) );

                // Get the previous and next chunks available.
                int previous_chunk_id = chunk_id;
                bool previous_available = false;

                if ( chunk_id > 0 )
                {
                    previous_chunk_id = chunk_id - 1;

                    previous_available = true;
                }

                int next_chunk_id = chunk_id;
                bool next_available = false;

                if ( chunk_id + 1 < number_of_active_chunks )
                {
                    next_chunk_id = chunk_id + 1;

                    next_available = true;
                }

                // Discard the fragment if it belongs to a chunk that in the current active chunks.
                if ( chunk_id > number_of_active_chunks || number_of_active_chunks == 0 )
                {
                    //discard;
                }

                int pixel_per_chunk_property = 1;

                // Get the pixel coordiantes of the chunk property
                int previous_chunk_property_pixel0 = ( previous_chunk_id*pixel_per_chunk_property);
                int next_chunk_property_pixel0 = ( next_chunk_id*pixel_per_chunk_property );
                int chunk_property_pixel0 = ( chunk_id*pixel_per_chunk_property );        

                // Get the chunk property chunk coord
                ivec2 previous_chunk_property_coord0 = ivec2 ( previous_chunk_property_pixel0 % chunks_property_texture_resolution.x, previous_chunk_property_pixel0 / chunks_property_texture_resolution.x );
                ivec2 next_chunk_property_coord0 = ivec2 ( next_chunk_property_pixel0 % chunks_property_texture_resolution.x, next_chunk_property_pixel0 / chunks_property_texture_resolution.x );

                ivec2 chunk_property_coord0 = ivec2 ( chunk_property_pixel0 % chunks_property_texture_resolution.x, chunk_property_pixel0 / chunks_property_texture_resolution.x );

                // Get the pixel coordinates in terms of the previous 
                int previous_chunk_pixel0 = ( previous_chunk_id*pixel_per_chunk );
                int next_chunk_pixel0 = ( next_chunk_id*pixel_per_chunk );

                // Get the pixel coordinates in terms of the chunk_id
                int chunk_pixel0 = ( chunk_id*pixel_per_chunk );

                // Get the chunk coords.
                ivec2 chunk_coord0 = ivec2 ( chunk_pixel0 % chunks_texture_resolution.x, chunk_pixel0 / chunks_texture_resolution.x );

                // Get the next and previous chunk coords.
                ivec2 previous_chunk_coord0 = ivec2 ( previous_chunk_pixel0 % chunks_texture_resolution.x, previous_chunk_pixel0 / chunks_texture_resolution.x );
                ivec2 next_chunk_coord0 = ivec2 ( next_chunk_pixel0 % chunks_texture_resolution.x, next_chunk_pixel0 / chunks_texture_resolution.x );

                // Retrieve the chunk coordinates
                vec3 previous_chunk_point = texelFetch ( chunks_texture, previous_chunk_coord0, 0 ).xyz;
                vec3 next_chunk_point = texelFetch ( chunks_texture, next_chunk_coord0, 0 ).xyz;
                vec3 chunk_point = texelFetch ( chunks_texture, chunk_coord0, 0 ).xyz;

                // Get the chunk properties
                float previous_chunk_radius = texelFetch ( chunks_property_texture, previous_chunk_property_coord0, 0 ).x;
                float next_chunk_radius = texelFetch ( chunks_property_texture, next_chunk_property_coord0, 0 ).x;
                float chunk_radius = texelFetch ( chunks_property_texture, chunk_property_coord0, 0 ).x;

                vec4 color = vec4( 10, 0, 0, 1);

                float thickness = 0.2;


                // Calculate the delta radians
                float delta_radians = relative_t*(2.0*3.14159);
                float next_delta_radians = next_relative_t*(2.0*3.14159);
                
                // Initial boundary condition
                if ( next_available == true && previous_available == false )
                {
                    // if ( vertex_id == 0 )
                    // {
                        
                    //     vec3 position = chunk_point + cos( delta_radians )*normal + sin( delta_radians )*binormal;
                    //     color = vec4(position, 1);

                    // }
                    // if ( vertex_id == 1 )
                    // {

                    //     vec3 position = next_chunk_point + cos ( delta_radians )*normal + sin ( delta_radians )*binormal;
                    //     color = vec4(position, 1);
                        
                    // }
                    // if ( vertex_id == 2 )
                    // {

                    //     vec3 position = next_chunk_point + cos ( next_delta_radians )*normal + sin ( next_delta_radians )*binormal;
                    //     color = vec4(position, 1);
                        
                    // }

                    // if ( vertex_id == 3 )
                    // {
                        
                    //     vec3 position = chunk_point + cos ( next_delta_radians )*normal + sin ( next_delta_radians )*binormal;
                    //     color = vec4(position, 1);
                    // }

                } else if ( next_available == false && previous_available == true )
                {
                    // if ( vertex_id == 0 )
                    // {
                        
                    //     vec3 position = chunk_point + cos( delta_radians )*normal + sin( delta_radians )*binormal;
                    //     color = vec4(position, 1);

                    // }
                    // if ( vertex_id == 1 )
                    // {

                    //     vec3 position = next_chunk_point + cos ( delta_radians )*normal + sin ( delta_radians )*binormal;
                    //     color = vec4(position, 1);
                        
                    // }
                    // if ( vertex_id == 2 )
                    // {

                    //     vec3 position = next_chunk_point + cos ( next_delta_radians )*normal + sin ( next_delta_radians )*binormal;
                    //     color = vec4(position, 1);
                        
                    // }

                    // if ( vertex_id == 3 )
                    // {
                        
                    //     vec3 position = chunk_point + cos ( next_delta_radians )*normal + sin ( next_delta_radians )*binormal;
                    //     color = vec4(position, 1);
                    // }

                }else 
                {
                    if ( vertex_id == 0 )
                    {
                        
                        vec3 position = chunk_point + chunk_radius*cos( delta_radians )*normal + chunk_radius*sin( delta_radians )*binormal;

                        //position = chunk_point;
                        color = vec4(position, 1);

                    }
                    if ( vertex_id == 1 )
                    {

                        vec3 position = next_chunk_point + next_chunk_radius*cos ( delta_radians )*normal + next_chunk_radius*sin ( delta_radians )*binormal;
                        //position = next_chunk_point - vec3(0.5,0,0);
                        color = vec4(position, 1);
                        
                    }
                    if ( vertex_id == 2 )
                    {

                        vec3 position = next_chunk_point + next_chunk_radius*cos ( next_delta_radians )*normal + next_chunk_radius*sin ( next_delta_radians )*binormal;
                        //position = next_chunk_point+vec3(0,0,-1) - vec3(0.5,0,0);
                        color = vec4(position, 1);
                        
                    }

                    if ( vertex_id == 3 )
                    {
                        
                        vec3 position = chunk_point + chunk_radius*cos ( next_delta_radians )*normal + chunk_radius*sin ( next_delta_radians )*binormal;
                        //position = chunk_point + vec3(0,0,-1);
                        color = vec4(position, 1);
                    }
                }

                




                //gl_FragColor = vec4( 1.0, 0.0, 0.0,  1.0);

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

                // Structure of the chunk properties
                chunks_property_texture: { value: this.chunks_property_texture },
                chunks_property_texture_resolution: { value: this.chunks_property_texture_resolution },
                
                // Resolution of the render target.
                resolution: { value: this.geometry_texture_resolution },

                // Number of active chunks.
                number_of_active_chunks : { value: this.number_of_active_chunks },

                normal : { value: this.normal },
                binormal : { value: this.binormal },

                
                    
            }
            
        });

        this.ortho_plane_mesh = new THREE.Mesh(new THREE.PlaneGeometry(2,2),  this.texture_generator);

        this.secondaryScene.add( this.ortho_plane_mesh );

        // Create a render target
        this.renderTarget = new THREE.WebGLRenderTarget(this.geometry_texture_resolution.x,this.geometry_texture_resolution.y,{
            format: THREE.RGBAFormat,
            type: THREE.FloatType,
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
        });

        // Map a plane to display.
        const displayPlane = new THREE.Mesh(new THREE.PlaneGeometry(2,2), new THREE.MeshBasicMaterial({map: this.renderTarget.texture}));
            
        this.scene_context.scene.add(displayPlane);

        // Register on animate to generate the texture
        //this.scene_context.onAnimate.add_event( this.render_geometry_texture.bind(this) );

        
    }

    // Use to update the geometry texture
    update_geometry_texture()
    {
        // Update the uniforms
        this.ortho_plane_mesh.material.uniforms.chunks_texture.value = this.chunks_texture;
        this.ortho_plane_mesh.material.uniforms.chunks_property_texture.value = this.chunks_property_texture;
        this.ortho_plane_mesh.material.uniforms.normal.value = this.normal;
        this.ortho_plane_mesh.material.uniforms.binormal.value = this.binormal;

        // Notify that the uniforms have been updated
        this.ortho_plane_mesh.material.uniforms.chunks_texture.needsUpdate = true;
        this.ortho_plane_mesh.material.uniforms.chunks_property_texture.needsUpdate = true;

        // Re-render the geometry texture
        this.render_geometry_texture();
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

    add_point_chunk( point )
    {

        //console.log ( point );

        this.point_chunk_array[ this.point_chunk_tail * this.size_of_chunk_structure ] = point.x;
        this.point_chunk_array[ (this.point_chunk_tail * this.size_of_chunk_structure) + 1] = point.y;
        this.point_chunk_array[ (this.point_chunk_tail * this.size_of_chunk_structure) + 2 ] = point.z;
        this.point_chunk_array[ (this.point_chunk_tail * this.size_of_chunk_structure) + 3 ] = 0;

        this.number_of_active_chunks += 1;
        this.point_chunk_tail += 1;

    }

    // Help find the property based on t value 
    find_chunk_property ( t_value )
    {

        let last_chunk_property = undefined;

        for ( const [k,v] of this.chunk_properties_settings.entries() )
        {

            

            if ( t_value < v.t_start )
            {
                

                //console.log ( t_value, last_chunk_property );

                return last_chunk_property;

            }

            last_chunk_property = v;

        }

        //console.log ( t_value, last_chunk_property );

        return last_chunk_property;

    }

    // Add a chunk property to the chunk
    add_chunk_property ( chunk_property )
    {
        this.point_chunk_properties_array[ this.point_chunk_property_tail * this.point_chunk_property_size ] = chunk_property;
        this.point_chunk_property_tail += 1;
    }

    init_point_chunks_array ( )
    {
        this.point_chunk_array = undefined;
        this.point_chunk_array_capacity = 0;
        this.number_of_active_chunks = 0;
        this.point_chunk_tail = 0;
    }

    init_point_chunks_property_array ( )
    {
        this.point_chunk_property_size = 1;
        this.point_chunk_property_tail = 0;
        this.point_chunk_properties_array_capacity = 0;
        this.point_chunk_properties_array = undefined;

    }


    update_point_chunks_array( search_radius )
    {

        if ( this.point_chunk_array == undefined )
        {
            this.point_chunk_array = new Float32Array ( this.size_of_chunk_structure * search_radius * 2 * 4 );
            this.point_chunk_array_capacity = this.size_of_chunk_structure * search_radius * 2 * 4;
            this.number_of_active_chunks = 0;
            this.point_chunk_tail = 0;
        }
        else if ( this.size_of_chunk_structure * search_radius * 2 * 4 > this.point_chunk_array_capacity )
        {
            this.point_chunk_array = new Float32Array ( this.size_of_chunk_structure * search_radius * 2 * 4 );
            this.point_chunk_array_capacity = this.size_of_chunk_structure * search_radius * 2 * 4;
            this.number_of_active_chunks = 0;
            this.point_chunk_tail = 0;

            console.log("new chunks");


        }else{

                

            this.number_of_active_chunks = 0;
            this.point_chunk_tail = 0;
        }

        

    }

    update_point_chunks_properties ( search_radius )
    {

        this.point_chunk_property_size = 1;
        this.point_chunk_property_tail = 0;

        if ( this.point_chunk_properties_array == undefined )
        {
            this.point_chunk_properties_array = new Float32Array ( this.point_chunk_property_size * search_radius*2*4 );
            this.point_chunk_properties_array_capacity = this.point_chunk_property_size * search_radius*2*4;

        }
        else if ( this.point_chunk_property_size * search_radius*2*4 )
        {
            this.point_chunk_properties_array = new Float32Array ( this.point_chunk_property_size * search_radius*2*4 );
            this.point_chunk_properties_array_capacity = this.point_chunk_property_size * search_radius*2*4;

        }
    }

    update_chunks_texture  ( chunks_added )
    {

        if ( this.chunks_texture == undefined )
        {
            this.chunks_texture_resolution = new THREE.Vector2( Math.floor ( Math.sqrt ( this.size_of_chunk_structure * chunks_added ) ), Math.floor ( Math.sqrt ( this.size_of_chunk_structure * chunks_added ) ) );

            this.chunks_texture = new THREE.DataTexture( this.point_chunk_array, this.chunks_texture_resolution.x, this.chunks_texture_resolution.y, THREE.RGBAFormat, THREE.FloatType );

            this.last_chunks_added = chunks_added;

            this.chunks_texture.needsUpdate = true;
            
        }else if ( chunks_added > this.last_chunks_added )
        {

            this.chunks_texture_resolution = new THREE.Vector2( Math.floor ( Math.sqrt ( this.size_of_chunk_structure * chunks_added ) ), Math.floor ( Math.sqrt ( this.size_of_chunk_structure * chunks_added ) ) );

            this.chunks_texture = new THREE.DataTexture( this.point_chunk_array, this.chunks_texture_resolution.x, this.chunks_texture_resolution.y, THREE.RGBAFormat, THREE.FloatType );

            this.last_chunks_added = chunks_added;
            this.chunks_texture.needsUpdate = true;
                

        }else
        {
            this.chunks_texture.needsUpdate = true;
            this.last_chunks_added = chunks_added;
        }

    }

    update_chunks_properties_texture ( chunks_added )
    {

        if ( this.chunks_property_texture == undefined )
        {
            this.chunks_property_texture_resolution = new THREE.Vector2( Math.ceil ( Math.sqrt ( this.point_chunk_property_size * chunks_added ) ), Math.ceil ( Math.sqrt ( this.point_chunk_property_size * chunks_added ) ) );

            this.chunks_property_texture = new THREE.DataTexture ( this.point_chunk_properties_array, this.chunks_property_texture_resolution.x, this.chunks_property_texture_resolution.y, THREE.RedFormat, THREE.FloatType );

            this.last_chunks_added = chunks_added;
            this.chunks_property_texture.needsUpdate = true;

        }else if ( chunks_added > this.last_chunks_added ) {
            this.chunks_property_texture_resolution = new THREE.Vector2( Math.ceil ( Math.sqrt ( this.point_chunk_property_size * chunks_added ) ), Math.ceil ( Math.sqrt ( this.point_chunk_property_size * chunks_added ) ) );

            this.chunks_property_texture = new THREE.DataTexture ( this.point_chunk_properties_array, this.chunks_property_texture_resolution.x, this.chunks_property_texture_resolution.y, THREE.RedFormat, THREE.FloatType );

            this.last_chunks_added = chunks_added;
            this.chunks_property_texture.needsUpdate = true;
            
        }else {
            this.last_chunks_added = chunks_added;
            this.chunks_property_texture.needsUpdate = true;

        }
        


    }
        

    find_point_chunks()
    {


        this.clear_point_chunks();

        // Find the radius in which to look
        let search_radius = 1;

        // Define the particular chunk size.
        let chunk_size = 1;

        // Get the camera position
        let camera_position = this.scene_context.camera.position.clone();

        // Get the camera to origin of the axis.
        let camera_to_origin = this.origin.clone().sub( camera_position );

        let camera_normal_dot = camera_to_origin.dot( this.axis ) ;

        let axis_projection = this.axis.clone().multiplyScalar ( -camera_normal_dot );

        //console.log( "axis_to_projection", axis_projection);

        let camera_to_projection = axis_projection.clone().sub(camera_position );

        let axis_distance = camera_to_projection.length();

        // if ( axis_distance/chunk_size > search_radius )
        // {
            
        //     return;

        // } 

        let chunks_added = search_radius+1;

        this.update_point_chunks_array( search_radius );
        this.update_point_chunks_properties ( search_radius );

        let point = axis_projection.clone();

        // Distance to projection
        let distance_to_projection = point.clone().sub(axis_projection).length();

        // Find relative t range in which is chunk falls into. + 1 if the first and last points are not boundaries otherwise no plus one.
        let  upper_bound = axis_projection.clone().add( this.axis.clone().multiplyScalar ( (search_radius-1)*(chunk_size) ) );

        let  total_distance = (search_radius-1)*(chunk_size);

        //console.log("total_distance", total_distance);
        
        // Find the relative distance in terms of the total distance
        let point_t = (distance_to_projection)/(total_distance);

        // Find the correct chunk property based on t.
        let chunk_property = this.find_chunk_property( point_t );

        this.add_point_chunk ( new THREE.Vector3(0,0,0) );
        this.add_chunk_property ( chunk_property.radius );


        this.add_point_chunk ( new THREE.Vector3(0,0,1) );
        this.add_chunk_property(1.0);

        this.add_point_chunk ( new THREE.Vector3(0,0,-1) );
        this.add_chunk_property(1.0);
        


        for ( let s = search_radius-1; s > 1; s-- )
        {
            point = axis_projection.clone().sub ( this.axis.clone().multiplyScalar(s*chunk_size) );

            distance_to_projection = point.clone().sub(axis_projection).length();

            // Find the relative distance in terms of the total distance
            point_t = (distance_to_projection)/(total_distance);

            
            chunk_property = this.find_chunk_property( point_t );

            //console.log(chunk_property);

            //this.add_point_chunk ( point );

            //this.add_chunk_property ( chunk_property.radius );
        }

        for ( let s = 1; s < search_radius; s++ )
        {
            
            point = axis_projection.clone().add ( this.axis.clone().multiplyScalar(s*chunk_size) );
            // Find the distance of the point from the origin
            distance_to_projection = point.clone().sub(axis_projection).length();

            // Find the relative distance in terms of the total distance
            let point_t = (distance_to_projection)/(total_distance);

            // Find the correct chunk property based on t.
            let chunk_property = this.find_chunk_property( point_t );

            // We can then find the property associated with the chunk.

           // this.add_chunk_property ( chunk_property.radius );

            //this.add_point_chunk ( point );

        }


        this.update_chunks_texture( chunks_added );
        this.update_chunks_properties_texture( chunks_added );

        

    }

    find_point_chunks0()
    {

        // Searches large a reas with respect the projection to the axis itself,
        // If the point falls outside of the current chunk span then reset the chunk array
        // and add the current chunk to the 

        this.clear_point_chunks();

        let chunk_block_size = 17;

        // Define the dimensions of the cone tip
        let tip_length = this.tip_length;

        // Get the projection point to the axis.

        // Get the camera position
        let camera_position = this.scene_context.camera.position.clone();

        // Get the camera to origin of the axis.
        let camera_to_origin = this.origin.clone().sub( camera_position );

        let camera_normal_dot = camera_to_origin.dot( this.axis ) ;

        let axis_projection = this.axis.clone().multiplyScalar ( -camera_normal_dot );
        let neg_axis_projection = this.axis.clone().multiplyScalar( camera_normal_dot );

        let search_radius = 10;

        if ( this.previous_axis_projection == undefined )
        {
            // Then reset the chunks array and build the new axis mesh.
            this.update_point_chunks_array( search_radius );
            this.update_point_chunks_properties ( search_radius );

            this.add_point_chunk ( this.origin );
            this.add_chunk_property ( 1.0 );


            // Just add the origin as the origin point.
            if ( camera_normal_dot < 0 )
                {
                    // Add manually 
                    let end_base_pos = axis_projection.clone().add ( this.axis.clone().multiplyScalar(chunk_block_size - tip_length) );
                    let end_base_neg = neg_axis_projection.clone().sub( this.axis.clone().multiplyScalar(chunk_block_size - tip_length) );

                    let tip_pos  = axis_projection.clone().add ( this.axis.clone().multiplyScalar(chunk_block_size) );
                    let tip_neg  = neg_axis_projection.clone().sub ( this.axis.clone().multiplyScalar(chunk_block_size) );

                    // Just add the origin as the origin point.
                    this.add_point_chunk ( tip_neg );
                    this.add_chunk_property( 0.0 );

                    this.add_point_chunk ( end_base_neg );
                    this.add_chunk_property( this.base_radius );

                    this.add_point_chunk ( end_base_neg );
                    this.add_chunk_property( this.shaft_radius );

                    this.add_point_chunk ( end_base_pos );
                    this.add_chunk_property( this.shaft_radius );

                    this.add_point_chunk ( end_base_pos );
                    this.add_chunk_property( this.base_radius );

                    this.add_point_chunk ( tip_pos );
                    this.add_chunk_property( 0.0 );

                }else
                {

                    // Add manually 
                    let end_base_pos = axis_projection.clone().sub ( this.axis.clone().multiplyScalar(chunk_block_size - tip_length) );
                    let end_base_neg = neg_axis_projection.clone().add( this.axis.clone().multiplyScalar(chunk_block_size - tip_length) );

                    let tip_pos  = axis_projection.clone().sub ( this.axis.clone().multiplyScalar(chunk_block_size) );
                    let tip_neg  = neg_axis_projection.clone().add ( this.axis.clone().multiplyScalar(chunk_block_size) );

                    this.add_point_chunk ( tip_pos );
                    this.add_chunk_property(0.0);

                    this.add_point_chunk ( end_base_pos );
                    this.add_chunk_property(this.base_radius);

                    // Just add the origin as the origin point.
                    this.add_point_chunk ( end_base_pos );
                    this.add_chunk_property(this.shaft_radius);

                    
                    this.add_point_chunk ( end_base_neg );
                    this.add_chunk_property(this.shaft_radius);

                    this.add_point_chunk ( end_base_neg );
                    this.add_chunk_property( this.base_radius );

                    this.add_point_chunk ( tip_neg );
                    this.add_chunk_property( 0.0 );

                
                }

            
            // Set the previous axis projection point.
            this.previous_axis_projection = axis_projection.clone();
            

        }else
        {

            // Calculate the distance between the projection points.

            let distance = axis_projection.clone().sub(this.previous_axis_projection).length();

            //console.log(distance);

            if ( distance > chunk_block_size )
            {

                
                // Then reset the chunks array and build the new axis mesh.
                this.update_point_chunks_array( search_radius );
                this.update_point_chunks_properties ( search_radius );

                this.add_point_chunk ( this.origin );
                this.add_chunk_property ( 1.0 );

                

                if ( camera_normal_dot < 0 )
                {
                    // Add manually 
                    let end_base_pos = axis_projection.clone().add ( this.axis.clone().multiplyScalar(chunk_block_size - tip_length) );
                    let end_base_neg = neg_axis_projection.clone().sub( this.axis.clone().multiplyScalar(chunk_block_size - tip_length) );

                    let tip_pos  = axis_projection.clone().add ( this.axis.clone().multiplyScalar(chunk_block_size) );
                    let tip_neg  = neg_axis_projection.clone().sub ( this.axis.clone().multiplyScalar(chunk_block_size) );

                    // Just add the origin as the origin point.
                    this.add_point_chunk ( tip_neg );
                    this.add_chunk_property( 0.0 );

                    this.add_point_chunk ( end_base_neg );
                    this.add_chunk_property( this.base_radius );

                    this.add_point_chunk ( end_base_neg );
                    this.add_chunk_property( this.shaft_radius );

                    this.add_point_chunk ( end_base_pos );
                    this.add_chunk_property( this.shaft_radius );

                    this.add_point_chunk ( end_base_pos );
                    this.add_chunk_property( this.base_radius );

                    this.add_point_chunk ( tip_pos );
                    this.add_chunk_property( 0.0 );

                }else
                {

                    // Add manually 
                    let end_base_pos = axis_projection.clone().sub ( this.axis.clone().multiplyScalar(chunk_block_size - tip_length) );
                    let end_base_neg = neg_axis_projection.clone().add( this.axis.clone().multiplyScalar(chunk_block_size - tip_length) );

                    let tip_pos  = axis_projection.clone().sub ( this.axis.clone().multiplyScalar(chunk_block_size) );
                    let tip_neg  = neg_axis_projection.clone().add ( this.axis.clone().multiplyScalar(chunk_block_size) );

                    this.add_point_chunk ( tip_pos );
                    this.add_chunk_property(0.0);

                    this.add_point_chunk ( end_base_pos );
                    this.add_chunk_property(this.base_radius);

                    // Just add the origin as the origin point.
                    this.add_point_chunk ( end_base_pos );
                    this.add_chunk_property(this.shaft_radius);

                    
                    this.add_point_chunk ( end_base_neg );
                    this.add_chunk_property(this.shaft_radius);

                    this.add_point_chunk ( end_base_neg );
                    this.add_chunk_property( this.base_radius );

                    this.add_point_chunk ( tip_neg );
                    this.add_chunk_property( 0.0 );

                
                }

                
                
                // Set the previous axis projection point.
                this.previous_axis_projection = axis_projection.clone();
            }

        }

        
        
        this.update_chunks_texture( search_radius );
        this.update_chunks_properties_texture( search_radius ) ;

    }

    clear_point_chunks()
    {
        this.number_of_active_chunks = 0;
        this.point_chunk_tail = 0;
    }

    set_axis ( axis )
    {   
        this.axis = axis.clone();
        // Need to calculate the normal of the axis.
        this.normal = this.axis.clone().cross( new THREE.Vector3(-this.origin.x,1,1).add(this.origin) ).normalize();
        this.binormal = this.normal.clone().cross(this.axis).normalize();

        this.find_point_chunks0();
        this.update_geometry_texture();
        //this.generate_geometry_texture();
        //this.render_geometry_texture();
        
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

        // Sending the normal 
        varying vec3 o_normal;
        // Send the fragment position
        varying vec3 o_fragpos;

        vec3 calculate_normal (  )
        {

            // Left hand side so the normal so the reference coordinates should be
            ivec2 bottom_pixel = ivec2 ( ((gl_InstanceID*primitive_type)) % int(resolution.x), ((gl_InstanceID*primitive_type)) / int(resolution.x) );
            ivec2 right_pixel = ivec2 ( ((gl_InstanceID*primitive_type) + 1) % int(resolution.x), ((gl_InstanceID*primitive_type) + 1) / int(resolution.x) );
            ivec2 top_pixel = ivec2 ( ((gl_InstanceID*primitive_type) + 2) % int(resolution.x), ((gl_InstanceID*primitive_type) + 2) / int(resolution.x) );
            ivec2 up_pixel = ivec2 ( ((gl_InstanceID*primitive_type) + 3) % int(resolution.x), ((gl_InstanceID*primitive_type) + 3) / int(resolution.x) );

            // Texel snatch the according vertex.
            vec3 right_pos = texelFetch(geometry_texture, right_pixel, 0).xyz;
            vec3 bottom_pos = texelFetch ( geometry_texture, bottom_pixel, 0).xyz;
            vec3 up_pos = texelFetch(geometry_texture, up_pixel, 0).xyz;
            
            vec4 right_vec = model*vec4 ( normalize ( right_pos - bottom_pos ), 1.0);
            vec4 up_vec = model* vec4 ( normalize ( up_pos - bottom_pos ), 1.0 );

            return cross ( right_vec.xyz, up_vec.xyz );

        }


        void main ( )
        {

            // Calculate the pixel coordinate from instance variable
            ivec2 pixel_coordinate = ivec2 ( ((gl_InstanceID*primitive_type) + gl_VertexID) % int(resolution.x), ((gl_InstanceID*primitive_type) + gl_VertexID ) / int(resolution.x) );

            // Texel snatch the according vertex.
            vec4 geom = texelFetch(geometry_texture, pixel_coordinate, 0);

            // Modify position based on instance ID
            vec3 pos = geom.xyz;
            
            // Calculate the normal and ship it out
                o_normal = calculate_normal ( );
            // Send the fragment pos
                o_fragpos = vec3( model * vec4(pos, 1.0) );
      
            // Apply standard transformations
            gl_Position = projectionMatrix * modelViewMatrix * model* vec4(pos, 1.0);
        }
        `

        let fragment_shader = `
        

        // Sending the normal 
            varying vec3 o_normal;
        // Send the fragment position
            varying vec3 o_fragpos;
        
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

                
                
                
                
            }



            return color;
        


        }

        void main ( )
        {

            gl_FragColor = calculate_lighting();

        }
        `

        let material = new THREE.ShaderMaterial({
            vertexShader : vertex_shader,
            fragmentShader: fragment_shader,
            uniforms : {
                "geometry_texture" : { value: this.renderTarget.texture },
                "resolution" : { value: this.geometry_texture_resolution },
                "primitive_type" : { value: this.primitive_type },
                "model" : { value: new THREE.Matrix4() },

                "lights": {value: this.lights_texture.texture() },
                "lights_dimension" : {value: this.lights_texture.dimension() },
                "lights_count" : {value: this.lights_texture.count()  },
                "lights_struct_size": {value: this.lights_texture.struct_size() },
                "viewPos" : {value:this.scene_context.camera.position},
                "ambient" : { value:this.material.ambient },
                "diffuse" : {value:this.material.diffuse},
                "specular" : {value:this.material.specular},
                "shininess" : {value:this.material.shininess}
            },
            side: THREE.DoubleSide
        });

        this.mesh = new THREE.InstancedMesh(plane_geometry, material, this.number_of_active_chunks*this.primitives_per_chunk);

        scene.add ( this.mesh );


    }

};


export { ChunkAxisMesh };
import * as THREE from 'three';




export default class FibbonaciMap
{

    constructor(scene_context)
    {
            // Store the scene context
            this.scene_context = scene_context;

            // Generate the uniform map for the geometry texture.
            // The camera zooms into a platform, a couple of fibbonaci sequences are calculated and shown, in the way they are visualized, accompanied by the ugly spheres.
            // The camera then shows the plane drift into reality, then the planes insides are animated with time.
            

            this.generate_sequences();
            //this.generate_geometry_texture();
            //this.texture_to_instance();

            // Set a knob, which the number of revealed sequences
            // Integer
            
    }

    generate_geometry_texture()
    {
        // Create secondary camera
        this.secondaryCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
        this.secondaryCamera.position.z = 1;

        // Create secondary scene
        this.secondaryScene = new THREE.Scene();
        //this.secondaryScene.background = new THREE.Color(0xFF0000);

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

            // Store the resolution of the texture being drawn into.
            uniform vec2 resolution;

            // Information regarding number of sequences
            uniform int number_of_sequences;

            // Information about which primitive id is associated with which sequence.
            // Stores the end limit for each range including the previous range for primitive counts.
            uniform sampler2D primitive_id_map;

            uniform float max_primitives;

            // Sequence map texture.
            uniform sampler2D sequence_map;

            // Sequence the arc length and resolution textures
            uniform sampler2D sequence_resolutions;
            uniform sampler2D sequence_arc_lengths;

            // Sequence tranforms
            uniform sampler2D sequence_transforms;
        
            // UV
            varying vec2 vUv;
            
            // Inefficently find sequence range
            int get_sequence_id( int primitive_id )
            {
                // Define a base index
                int id = 0;
                
                // Fetch the inital range
                int id_range = int(texelFetch(primitive_id_map, ivec2(id,0), 0).x);

                while ( primitive_id > id_range && id < number_of_sequences )
                {
                    id = id + 1;
                    id_range = int(texelFetch(primitive_id_map, ivec2(id,0), 0).x);
                }
                
                if ( id == number_of_sequences  )
                {
                    return 0;
                }

                return id;
            }

            
            float get_sequence_t( int sequence_id, int primitive_id )
            {

                int current_end_range  = int(texelFetch(sequence_map, ivec2(sequence_id,0), 0).x);
                int current_resolution = int(texelFetch(sequence_resolutions, ivec2(sequence_id, 0), 0).x);
                
                return float(primitive_id - current_end_range)/float(current_resolution);

            }

            void main() {

                // If id > id_limit | animations discard
                // Else if id == id_limit -1, and t > | animation t_limit discard.


                // Primitive type.
                int primitive_type = 4;
            
                // Get the pixel ID or pixel number.
                int pixel_id = ( int(gl_FragCoord.y)*int(resolution.x) ) + int(gl_FragCoord.x);

                // The group id is current group number per primitive.
                int primitive_id = ((pixel_id)/primitive_type);

                // The vertex is the current vertex of the group id primitive; 
                int vertex_id = (pixel_id%primitive_type);

                // The sequence index
                int sequence_id = get_sequence_id(primitive_id);

                // Resolutions of the current curve
                float resolution = texelFetch(sequence_resolutions, ivec2(sequence_id, 0), 0).x;

                // Getting t information
                int current_end_range = int(texelFetch(primitive_id_map, ivec2(sequence_id, 0), 0).x);
                int current_resolution = int(texelFetch(sequence_resolutions, ivec2(sequence_id, 0), 0).x);

                float t = 1.0-(float(current_end_range - primitive_id)/float(current_resolution));
                float t1 = 1.0-(float(current_end_range - (primitive_id+1))/float(current_resolution));

                // Sphere radius
                float current_sphere_radius = texelFetch(sequence_map, ivec2(sequence_id, 0), 0).x;

                float next_radius = current_sphere_radius*t1;
                float sphere_radius = current_sphere_radius*t;
                
                // Getting current transform
                vec3 v0 = texelFetch(sequence_transforms, ivec2( (sequence_id*4), 0), 0).xyz;

                vec3 v1 = texelFetch(sequence_transforms, ivec2( (sequence_id*4)+1, 0), 0).xyz;
                vec3 v2 = texelFetch(sequence_transforms, ivec2( (sequence_id*4)+2, 0), 0).xyz;
                vec3 o  = texelFetch(sequence_transforms, ivec2( (sequence_id*4)+3,0), 0).xyz;
                
                // Sphere arc length
                float sphere_arc_length = texelFetch(sequence_arc_lengths, ivec2(sequence_id, 0), 0).x;

                // Current theta
                float current_theta = t*(sphere_arc_length*6.28318530718);
                float next_theta =  t1*(sphere_arc_length*6.28318530718);

                // Current Phi
                float current_phi = 1.0;
                
                vec4 color = vec4(0, 0, 0, 1);

                if ( vertex_id == 0 )
                {
                    
                    vec3 position = v0*sphere_radius*cos(current_theta) + v1*sphere_radius*sin(current_theta) + v2;
                    position = o +  v0*sphere_radius*cos(current_theta)*sin(current_phi) + v1*sphere_radius*sin(current_theta)*sin(current_phi) + v2*sphere_radius*cos(current_phi);
                    color = vec4(position, 1);

                }
                if ( vertex_id == 1 )
                {
                    vec3 position = v0*sphere_radius*cos(current_theta) + v1*sphere_radius*sin(current_theta)  + vec3(0.1,0,0) + v2;
                    position = o + v0*sphere_radius*cos(current_theta)*sin(current_phi) + v1*sphere_radius*sin(current_theta)*sin(current_phi)  + vec3(sphere_radius/7.0,0,0) + v2*sphere_radius*cos(current_phi);
                    color = vec4(position, 1);
                    
                }
                if ( vertex_id == 2 )
                {
                    vec3 position = v0*next_radius*cos(next_theta) + v1*next_radius*sin(next_theta) + v2 ;
                    position = o + v0*next_radius*cos(next_theta)*sin(current_phi) + v1*next_radius*sin(next_theta)*sin(current_phi) + v2*next_radius*cos(current_phi) ;
                    color = vec4(position, 1);
                    
                }
                if ( vertex_id == 3 )
                {
                    vec3 position = o + v0*next_radius*cos(next_theta)*sin(current_phi) + v1*next_radius*sin(next_theta)*sin(current_phi)  + vec3(sphere_radius/7.0,0,0) + v2*next_radius*cos(current_phi);
                    color = vec4(position, 1);
                }


                // Getting primitive limits
                if ( primitive_id+2 >= current_end_range-1 )
                {
                    color = vec4( o + v0*next_radius*cos(next_theta)*sin(current_phi) + v1*next_radius*sin(next_theta)*sin(current_phi)  + vec3(sphere_radius/7.0,0,0) + v2*next_radius*cos(current_phi), 0);
                }
                
                

                //color = vec4(float(sphere_arc_length),0,0,1);
                //color = texelFetch(sequence_arc_lengths, ivec2(gl_FragCoord.x, 0), 0);
                //color = vec4( 0,0,0,1 );
                
                //vec4 p = texture(primitive_id_map, vec2(vUv.x, 0));
                //vec4 p = texelFetch(primitive_id_map, ivec2(vUv.x, 0),  0);
                
                //color = vec4(float(primitive_id)/3333.0, 0, 0, 1);
                //color = vec4(float(sequence_id)/22.0, 0, 0, 1);
                //color = vec4(float(current_end_range)/10000.0, 0,0,1);
                //color = vec4(float(current_end_range)/1000.0, 0,0,1);
                //color = vec4(float(p.x)/10000.0, 0,0,0);
    
                //color = vec4( float(t),0,0, 1 );
                //color = texture(sequence_transforms, vUv);

                gl_FragColor = color;
            }
        `;
        
        // Set the resolution
        this.geometry_texture_resolution = new THREE.Vector3(600,600);

        

        this.texture_generator = new THREE.ShaderMaterial({
            vertexShader: vertexShader, fragmentShader: fragmentShader,
            uniforms:{
                resolution: {value: this.geometry_texture_resolution },
                sequence_map: {value: this.sequence_texture },
                sequence_resolutions: { value: this.sequence_resolutions },
                sequence_arc_lengths: { value: this.sequence_arc_lengths },
                number_of_sequences: {value: this.number_of_sequences },
                primitive_id_map :  {value: this.primitive_id_map },
                sequence_transforms: {value: this.sequence_transforms},
                    
            }
            
        });

        this.secondaryScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2,2),  this.texture_generator))

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
        this.scene_context.onAnimate.add_event( this.render_geometry_texture.bind(this) );
    }



    render_geometry_texture()
    {
        this.scene_context.renderer.setRenderTarget( this.renderTarget );
        this.scene_context.renderer.render( this.secondaryScene, this.secondaryCamera );
        this.scene_context.renderer.setRenderTarget(null);
    }

    play()
    {

    }

    generate_sequences()
    {
        // n
        let fibbonacci_cap = 12;
        // Generate sequences of the fibonacci up to a certain number n.

        // Generate the shader meta data sequences.
        let sequences = new Float32Array( fibbonacci_cap*fibbonacci_cap  );
        let resolutions = new Float32Array( fibbonacci_cap*fibbonacci_cap );
        let arc_lengths = new Float32Array( fibbonacci_cap*fibbonacci_cap );
        let transforms = new Float32Array( fibbonacci_cap*fibbonacci_cap*16 );

        // Generate a proper way of retrieving the sequence id
        let primitive_id_map = new Float32Array(  fibbonacci_cap*fibbonacci_cap );
        // Set a counter for the current primitive ids
        let primitive_id = 0;

        // Generate an index for the sphere sequences
        let sequence_index = 0;

        for( let i = 1; i < fibbonacci_cap; i ++ )
        {
            let fib_0 = 0;
            let fib_1 = 1;

            for ( let j = 0; j < i ; j++)
            {
                
                let temp = fib_0 + fib_1;
                fib_0 = fib_1;
                fib_1 = temp;


                // Build a transform for the different fibbonaccis.
                let v0 = new THREE.Vector3(1,0,0);
                let v1 = new THREE.Vector3(0,1,0);
                let v2 = new THREE.Vector3(0,0,1);
                let o = new THREE.Vector3(0,4,0);

                transforms[ (sequence_index*16) ] = v0.x ;
                transforms[ (sequence_index*16) +1  ] = v0.y;
                transforms[ (sequence_index*16) +2 ] = v0.z;
                transforms[ (sequence_index*16) +3 ] = 1;

                transforms[ (sequence_index*16) +4 ] = v1.x;
                transforms[ (sequence_index*16) +5 ] = v1.y;
                transforms[ (sequence_index*16) +6 ] = v1.z;
                transforms[ (sequence_index*16) +7 ] = 1;

                transforms[ (sequence_index*16) +8 ] = v2.x;
                transforms[ (sequence_index*16) +9 ] = v2.y;
                transforms[ (sequence_index*16) +10 ] = v2.z;
                transforms[ (sequence_index*16) +11 ] = 1;

                transforms[ (sequence_index*16) +12 ] = o.x;
                transforms[ (sequence_index*16) +13 ] = o.y;
                transforms[ (sequence_index*16) +14 ] = o.z;
                transforms[ (sequence_index*16) +15 ] = 1;

                // Set the array to include information about how many primitives there are in this sequence.
                resolutions[ sequence_index ] = 10*temp;

                // Set the primitive id map to include 20*temp ontop of the curent counter.
                primitive_id_map[sequence_index] = 10*temp + primitive_id;
                primitive_id += 10*temp;
                
                // Let arc length
                let arc_length = 0.2;

                if ( i != 0 )
                {
                    arc_length = j/(i);
                }

                // Then push the 
                arc_lengths[ sequence_index ] = arc_length;

                //console.log(arc_length);

                // Then push the fibbonaci numbers
                sequences[sequence_index++] = temp*0.5;

            }

            
              
        }
        
        for( let i = 1; i < fibbonacci_cap; i ++ )
        {
            let fib_0 = 0;
            let fib_1 = 1;

            for ( let j = 0; j < i ; j++)
            {
                
                let temp = fib_0 + fib_1;
                fib_0 = fib_1;
                fib_1 = temp;


                // Build a transform for the different fibbonaccis.
                let v0 = new THREE.Vector3(1,0,0);
                let v1 = new THREE.Vector3(0,1,0);
                let v2 = new THREE.Vector3(0,0,-1);
                let o = new THREE.Vector3(0,4,0);

                transforms[ (sequence_index*16) ] = v0.x;
                transforms[ (sequence_index*16) +1  ] = v0.y;
                transforms[ (sequence_index*16) +2 ] = v0.z;
                transforms[ (sequence_index*16) +3 ] = 1;

                transforms[ (sequence_index*16) +4 ] = v1.x;
                transforms[ (sequence_index*16) +5 ] = v1.y;
                transforms[ (sequence_index*16) +6 ] = v1.z;
                transforms[ (sequence_index*16) +7 ] = 1;

                transforms[ (sequence_index*16) +8 ] = v2.x;
                transforms[ (sequence_index*16) +9 ] = v2.y;
                transforms[ (sequence_index*16) +10 ] = v2.z;
                transforms[ (sequence_index*16) +11 ] = 1;

                transforms[ (sequence_index*16) +12 ] = o.x;
                transforms[ (sequence_index*16) +13 ] = o.y;
                transforms[ (sequence_index*16) +14 ] = o.z;
                transforms[ (sequence_index*16) +15 ] = 1;

                // Set the array to include information about how many primitives there are in this sequence.
                resolutions[ sequence_index ] = 10*temp;

                // Set the primitive id map to include 20*temp ontop of the curent counter.
                primitive_id_map[sequence_index] = 10*temp + primitive_id;
                primitive_id += 10*temp;
                
                // Let arc length
                let arc_length = 0.2;

                if ( i != 0 )
                {
                    arc_length = j/(i);
                }

                // Then push the 
                arc_lengths[ sequence_index ] = arc_length;

                //console.log(arc_length);

                // Then push the fibbonaci numbers
                sequences[sequence_index++] = temp*0.5;

            }

            
              
        }

        // Number of sequences.
        this.number_of_sequences = sequence_index;

        // Fill the transform map
        this.sequence_transforms = new THREE.DataTexture(transforms, sequence_index*4, 1, THREE.RGBAFormat, THREE.FloatType)
        this.sequence_transforms.needsUpdate = true;

        // Fill the primitive id map
        this.primitive_id_map = new THREE.DataTexture(primitive_id_map, sequence_index, 1, THREE.RedFormat, THREE.FloatType);
        this.primitive_id_map.needsUpdate = true;
        // Resolutions
        this.sequence_resolutions = new THREE.DataTexture(resolutions, sequence_index, 1, THREE.RedFormat, THREE.FloatType);
        this.sequence_resolutions.needsUpdate = true;

        // Fill the fibbonacci numbers.
        this.sequence_texture = new THREE.DataTexture(sequences, sequence_index, 1, THREE.RedFormat, THREE.FloatType);
        this.sequence_texture.needsUpdate = true;

        // Arc lengths
        this.sequence_arc_lengths = new THREE.DataTexture(arc_lengths, sequence_index, 1, THREE.RedFormat,
    THREE.FloatType);
        this.sequence_arc_lengths.needsUpdate = true;

    }

    texture_to_instance()
    {
        let vertices = new Float32Array([

            -1.0, -1.0, 0.0,
            1.0, -1.0, 0.0,
            1.0, 1.0, 0.0,
            -1.0, -1.0, 0.0,
            1.0, 1.0, 0.0,
            -1.0, 1.0, 0.0,
        ]);

        let uvs = new Float32Array([
            0.0, 0.0,
            1.0, 0.0,
            1.0, 1.0,

            0.0, 0.0,
            1.0,1.0,
            0.0, 1.0
        ]);

        // Create a BufferGeometry and set its attributes
        const plane_geometry = new THREE.BufferGeometry();
        plane_geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
        plane_geometry.setAttribute('uv', new THREE.BufferAttribute(vertices, 2));

        // Vertex shader
        const vertexShader = `
            varying vec2 vUv;

            uniform sampler2D geometry_texture;
            uniform vec2 resolution;

            varying vec3 out_position;
            varying vec3 out_norm;
            flat varying ivec2 pixel_coordinate;

            void main() {

                // Grab the UV
                vUv = uv;

                // Calculate the pixel coordinate from instance variable
                pixel_coordinate = ivec2 ( (gl_InstanceID + gl_VertexID) % int(resolution.x), (gl_InstanceID + gl_VertexID) / int(resolution.x) );

            
                // Texel snatch the according vertex.
                vec4 geom = texelFetch(geometry_texture, pixel_coordinate, 0);

                // Calculate adjacent pixels' coordinates
                ivec2 right_pixel = pixel_coordinate + ivec2(1, 0);
                ivec2 up_pixel = pixel_coordinate + ivec2(0, 1);

                // Ensure coordinates are within texture bounds
                right_pixel = ivec2(mod( float(right_pixel.x), resolution.x), right_pixel.y);
                up_pixel = ivec2(up_pixel.x, mod( float(up_pixel.y), resolution.y));

                // Fetch adjacent vertex positions
                vec3 right_pos = texelFetch(geometry_texture, right_pixel, 0).xyz;
                vec3 up_pos = texelFetch(geometry_texture, up_pixel, 0).xyz;

                // Compute edges
                vec3 edge1 = right_pos - geom.xyz;
                vec3 edge2 = up_pos - geom.xyz;

                // Compute normal using cross product
                vec3 normal = normalize(cross(edge1, edge2));

                out_norm = normal;

                // Modify position based on instance ID
                vec3 pos = geom.xyz;
                
                out_position = pos;
      
                // Apply standard transformations
                gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);

            }
        `;

        // Fragment shader
        const fragmentShader = `
            // Add supports for lights
            varying vec2 vUv;

            varying vec3 out_norm;

            flat varying ivec2 pixel_coordinate;
            
            vec3 light1 = vec3(-1,0,0);
            vec3 light2 = vec3(0,0,20);
            vec3 light3 = vec3(-1,0,0);
            vec3 light4 = vec3(-1,0,0);

            varying vec3 out_position;

            uniform sampler2D sequence_map;

            void main() {
                

                vec3 dir1 = normalize(light1 - out_position);
                vec3 dir2 = normalize(light2 - out_position);
                vec3 dir3 = normalize(light3 - out_position);
                vec3 dir4 = normalize(light4 - out_position);

                // Simple color
                float d1 = dot( dir1, out_norm);
                float d2 = dot( out_norm, dir2);
                float d3 = dot( out_norm, dir3);
                float d4 = dot( out_norm, dir4);

                float total_d = (d1+d2+d3+d4)/4.0;

                vec3 color = vec3(0.5,0.0 , 0.4);

                vec3 ambient = vec3(0.7,0.3,0.3);
                
                vec4 sequence = texture(sequence_map, 0.5*fract( vec2(d4,d2) ) );

                gl_FragColor = vec4( color*total_d + ambient, 1);
                //gl_FragColor = vec4( out_norm, 1);
                
            }
        `;

        // Create a material for the triangle
        this.geometry_material = new THREE.ShaderMaterial({
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            side: THREE.DoubleSide,
            uniforms:
            {
                geometry_texture: {value: this.renderTarget.texture },
                resolution: {value: this.geometry_texture_resolution},
                sequence_map: {value: this.sequence_texture },
            }
        });

        // Create an instanced mesh with 100 instances
        const planeMesh = new THREE.InstancedMesh(plane_geometry, this.geometry_material, (this.geometry_texture_resolution.x*this.geometry_texture_resolution.y)/4.0);
        planeMesh.frustumCulled = false;

        // Add the instanced mesh to the scene
        this.scene_context.scene.add(planeMesh);




    }

    render(renderer)
    {

        //this.texture_generator.uniforms.max_primitives.value -= 0.1;
        renderer.setRenderTarget(this.renderTarget);
        renderer.render(this.secondaryScene, this.secondaryCamera);
        renderer.setRenderTarget(null);

        // const pixelBuffer = new Float32Array(100, 100); // RGBA, hence 4 components per pixel

        // renderer.readRenderTargetPixels(
        //     renderTarget,
        //     0, 0, // x, y of the starting point
        //     width, height, // width and height of the area to read
        //     pixelBuffer
        // );




    }

    


};
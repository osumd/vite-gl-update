
import * as THREE from 'three';

class InstancedMesh
{

    constructor ( scene_context, geometry )
    {

        // Set the scene_contet
        this.scene_context = scene_context;

        // Set the scene as the main scene by default
        this.scene = this.scene_context.scene;

        // Geometry
        this.geometry = geometry;


        // Index slots for the tails of the instanced
        this.instance_tail = 0;

        // Capacity of the instance mesh
        this.instance_capacity = 1;

        // Generate the opacities array for use in the shader.
        this.generate_opacities_texture ( );

        // Create the material for the instanced mesh.
        this.generate_material ( ) ;

        // This is the base instanced mesh.
        this.InstancedMesh = new THREE.InstancedMesh( geometry, this.material, this.instance_capacity );

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
        

        this.instance_capacity = this.instance_capacity*2;


        var new_mesh = new THREE.InstancedMesh(this.geometry, this.material, this.instance_capacity );

        if(this.InstancedMesh != undefined )
        {
            
            
            for(let i = 0; i < this.instance_tail; i++)
            {
                let matrix = new THREE.Matrix4();

                this.InstancedMesh.getMatrixAt(i, matrix);

                new_mesh.setMatrixAt(i, matrix);

                
            }

            // for(let i = this.instance_capacity+1; i < this.instance_capacity; i++)
            // {
            //     new_mesh.setMatrixAt(i,new THREE.Matrix4(0));
            // }

        }

        this.InstancedMesh = new_mesh;
        this.InstancedMesh.instanceMatrix.needsUpdate= true;

        
        
        //this.scene_context.scene.add(this.InstancedMesh);
        
        // Add an update event to better atone for the typing sins
        //this.add_one_time_update();

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
    push ( position = new THREE.Vector3(0,0,0), quaternion = new THREE.Quaternion().setFromEuler(new THREE.Euler(0,0,0) ), scale = new THREE.Vector3(0.2,1.0,0.2) )
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
        this.InstancedMesh.instanceMatrix.needsUpdate = true;

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

    generate_material ( )
    {

        let vertex_shader = `

        // Opacities and opacity out.
        uniform float opacities[300];
        varying float opacity_out;

        void main ( )
        {

            opacity_out = opacities[ gl_InstanceID ];

            gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4 ( position, 1.0 );

        }
        `;


        let fragment_shader = `

        varying float opacity_out;

        void main ( )
        {
        
            gl_FragColor = vec4 ( 1.0 , 0.0, 0.0, opacity_out ) ;
        }
        `;


        this.material = new THREE.ShaderMaterial ( {
            vertexShader: vertex_shader,
            fragmentShader: fragment_shader,
            uniforms: {
                "opacities": { value: this.opacities_data },
            },
            transparent: true,
            blending: THREE.NormalBlending,
            depthTest: true,
            depthWrite: false,
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
        this.scene_context.onAnimate.add_one_time_event ( this.render.bind(this) );

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
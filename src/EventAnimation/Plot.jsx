
import * as THREE from 'three';



// Virtual class for a render target plane which renders a background visual element  onto it.

class RenderTargetPlane 
{

    constructor( { position = new THREE.Vector3(0,0,0), right = "empty", up = "empty", normal = "empty", width = 1.0, height = 1.0} )
    {

        this.position = position;
        
        // Get the planar details neccecary for the planar positioning and orientation.
        this.default_planar_details( right, up, normal );

        // Set the width and height of the plane
        this.width = width;
        this.height = height;

        // Create secondary scene
        this.scene = new THREE.Scene();

        this.renderTarget = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, {
            format: THREE.RGBAFormat,
            type: THREE.FloatType,
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
        });

        

        
        let vertex_shader = `
        #version 460 core

        varying vec2 i_uv;


        void main ( )
        {
            i_uv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
        }

        `;

        let fragment_shader = `
        #version 460 core

        varying vec2 i_uv;

        uniform sampler2D scene;

        out vec4 color;

        void main () 
        {

            color = texture ( scene, i_uv );
        }
        `;

        this.material = new THREE.ShaderMaterial(
            {
                vertexShader: vertex_shader,
                fragmentShader: fragment_shader,
                uniforms: {
                    scene : { value: this.renderTarget.texture }
                }
            }); 

        this.plane = new THREE.Mesh(new THREE.PlaneGeometry(2,2), this.material );

        this.rotAxis = new THREE.Vector3(0,0,-1).cross( this.normal );
        this.angle = new THREE.Vector3(0,0,-1).dot( this.normal );

        this.plane.quaternion.set ( new THREE.Quaternion().setFromAxisAngle( this.rotAxis, this.angle ) );
        this.plane.position.set( this.position.x, this.position.y, this.position.z );
        this.plane.scale.set ( width, height, 0 );


            




    }

    default_planar_details( right, up , normal )
    {

        if ( normal == "empty" && right != "empty" && up != "empty" )
        {

            this.normal = up.clone().cross(right);
            this.up = up;
            this.right = right;

        }

        else if ( normal != "empty" )
        {
            
            this.right = new THREE.Vector3(0,1,0).cross ( normal );
            this.up = new THREE.Vector3(1,0,0).cross ( normal );
            this.normal = normal;
        }
        else 
        {
            this.right = new THREE.Vector3(1,0,0);
            this.up = new THREE.Vector3(0,1,0);
            this.normal = new THREE.Vector3(0.0, 0.0, 0.0);
        }

        

    }
    
    render()
    {

        this.scene_context.scene.add ( this.plane );

    }

};


// Has event responders, and a scene and perspective camera functionality 
// Virtual class for asbtract functionality/meshing and programing

class Plot 
{

    // camera_type, of supported camera types.
    constructor( camera_type, render_target  )
    {

        // Get the scene context from the render target.

        // Set the camera type
        this.camera_type = camera_type;

        // Focus mode for whether this object has to be active selected in order for key events to take place.
        this.focus_mode = 0;

        // Setup camera
        this.make_camera();

        // Set up a render plane to set as render target when rendering.
        this.render_target = render_target;

        // Create the scene to add the objects to.
        this.scene = new THREE.Scene();
    
    }

    add_sphere()
    {

    }

    make_camera()
    {

        if ( this.camera_type == "perspective" )
        {
                this.camera = new THREE.PerspectiveCamera(90, window.innerWidth/window.innerHeight, 0.1, 1000.0);
                this.camera.position.z = 1;
        }

    }

    render()
    {
        this.scene_context.renderer.setRenderTarget( this.render_target_plane.renderTarget );
        this.scene_context.renderer.render( this.scene, this.camera );
        this.scene_context.renderer.setRenderTarget(null);

        this.render_target.render();


    }

    


    OnClick()
    {

    }

    OnKey()
    {

    }

};

export {Plot, RenderTargetPlane};
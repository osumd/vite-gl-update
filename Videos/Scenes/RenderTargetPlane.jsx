

import * as THREE from 'three';



class RenderTargetPlane
{

    constructor( scene_context )
    {

        // Store the scene context
        this.scene_context = scene_context;

        this.center = new THREE.Vector3(0,0,0);
        this.normal = new THREE.Vector3(0,0,0);
        this.width = 1.0;
        this.height = 1.0;

        // generate scene and camera
        this.camera = new THREE.PerspectiveCamera( 90, 1280/720, 0.1, 1000);
        this.scene = new THREE.Scene();

        
        // generate the render target texture
        this.geometry_texture_resolution = new THREE.Vector2(1280,720);
        this.generate_render_target();
        // attach objects to the scene 

        // then render the scene to the texture, every frame
        this.scene_context.onAnimate.add_event ( this.render_scene_to_render_target.bind(this) );

        // plane geometry, the scene material
        this.generate_plane_geometry_material();

        // And add it to the scene

        // If a set of controls where to be in mind for the render target plane.
        // Add update controls, then just check if the target plane is selected or mouse is in inside of target plane.

    }

    // Generate the render target texture
    generate_render_target ( ) 
    {
        this.renderTarget = new THREE.WebGLRenderTarget(this.geometry_texture_resolution.x,this.geometry_texture_resolution.y,{
            format: THREE.RGBAFormat,
            type: THREE.FloatType,
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
        });
    }

    // Render the scene to the render target
    render_scene_to_render_target()
    {

        this.scene_context.renderer.setRenderTarget( this.renderTarget );
        this.scene_context.renderer.render( this.scene, this.camera );
        this.scene_context.renderer.setRenderTarget(null);


    }

    // generate the plane geometry and set the model matrix to reflect the width,height, position and etc
    generate_plane_geometry_material ( )
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

            uniform sampler2D scene_texture;

            void main ( )
            {
            
                gl_FragColor = texture ( scene_texture, vUv );

            }

        `;

        this.plane_material = new THREE.ShaderMaterial(
            {
                vertexShader: vertex_shader,
                fragmentShader: fragment_shader,
                uniforms: {
                    "scene_texture": { value: this.renderTarget.texture }
                }
            }
        );

        this.plane_mesh = new THREE.Mesh ( plane_geometry, this.plane_material );

        this.scene_context.scene.add ( this.plane_mesh );

    }

    // Attach the scenes in which will be rendered onto the plane texture
    attach_mesh ( mesh )
    {
        this.scene.add ( mesh );
    }

    




};


export {RenderTargetPlane};
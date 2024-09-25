

import * as THREE from 'three';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';



class RenderTargetPlane
{

    constructor( scene_context, width = 1.0, height = 1.0, center = new THREE.Vector3(0,0,0), normal = new THREE.Vector3(0,0,0) )
    {

        // Store the scene context
        this.scene_context = scene_context;

        this.center = center;
        this.normal = normal;
        this.width = width;
        this.height = height;

        //console.log( this.width, this.height, width, height );

        // generate scene and camera
        this.camera = undefined
        
        //this.controls = new OrbitControls(this.camera, this.scene_context.renderer.domElement);
        this.scene = undefined;

        // generate the render target texture
        this.geometry_texture_resolution = new THREE.Vector2(500*this.width,500*this.height);
        this.generate_render_target();
        // attach objects to the scene 

        

        // plane geometry, the scene material
        this.generate_plane_geometry_material();

        // And add it to the scene

        // If a set of controls where to be in mind for the render target plane.
        // Add update controls, then just check if the target plane is selected or mouse is in inside of target plane.

    }


    // Assign a scene to handle
    assign_scene_camera ( scene,  camera )
    {
        this.scene = scene;
        this.camera = camera;
        // then render the scene to the texture, every frame
        this.scene_context.onAnimate.add_event ( this.render_scene_to_render_target.bind(this) );
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
        

        // Create the scene and camera

        let prev_clear_color = new THREE.Color();

        this.scene_context.renderer.getClearColor( prev_clear_color );

        this.scene_context.renderer.setClearColor( new THREE.Color(0x000000) );
        this.scene_context.renderer.setRenderTarget( this.renderTarget );
        this.scene_context.renderer.render( this.scene, this.camera );
        this.scene_context.renderer.setRenderTarget(null);

        this.scene_context.renderer.setClearColor( prev_clear_color);

        //const composer = new EffectComposer( this.scene_context.renderer);
        //const renderPass = new RenderPass ( this.scene, this.camera );
        //composer.addPass ( renderPass );


        // const texturePass = new TexturePass ( this.renderTarget.texture );
        // composer.addPass ( texturePass );

        // const fxaaPass = new ShaderPass ( FXAAShader );
        // fxaaPass.uniforms['resolution'].value.set ( this.geometry_texture_resolution );
        // composer.addPass ( fxaaPass );
        
        //composer.render();



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
            uniform vec2 scene_texture_resolution;

            uniform float opacity;

            void main ( )
            {
            
                // Sample offsets for 4 sub-pixels (supersampling)
                vec2 offset1 = vec2(1.0, 0.0) / scene_texture_resolution;
                vec2 offset2 = vec2(-1.0, 0.0) / scene_texture_resolution;
                vec2 offset3 = vec2(0.0, -1.0) / scene_texture_resolution;
                vec2 offset4 = vec2(0.0, 1.0) / scene_texture_resolution;

                vec2 offset5 = vec2(-0.25, -0.25) / scene_texture_resolution;
                vec2 offset6 = vec2(0.25, -0.25) / scene_texture_resolution;
                vec2 offset7 = vec2(-0.25, 0.25) / scene_texture_resolution;
                vec2 offset8 = vec2(0.25, 0.25) / scene_texture_resolution;

                // Sample the texture at the four positions
                vec4 color1 = texture2D(scene_texture, vUv + offset1);
                vec4 color2 = texture2D(scene_texture, vUv + offset2);
                vec4 color3 = texture2D(scene_texture, vUv + offset3);
                vec4 color4 = texture2D(scene_texture, vUv + offset4);

                vec4 color5 = texture2D(scene_texture, vUv + offset5);
                vec4 color6 = texture2D(scene_texture, vUv + offset6);
                vec4 color7 = texture2D(scene_texture, vUv + offset7);
                vec4 color8 = texture2D(scene_texture, vUv + offset8);

                vec4 color = (color1 + color2 + color3 + color4 ) / 4.0;

                color.w = opacity;
                gl_FragColor = texture( scene_texture, vUv);
                gl_FragColor = color;

            }

        `;

        this.plane_material = new THREE.ShaderMaterial(
            {
                vertexShader: vertex_shader,
                fragmentShader: fragment_shader,
                uniforms: {
                    "scene_texture": { value: this.renderTarget.texture },
                    "scene_texture_resolution" : { value: this.geometry_texture_resolution },
                    "opacity" : { value: 1.0 }
                },
                transparent: true,
            }
        );

        

        this.plane_mesh = new THREE.Mesh ( plane_geometry, this.plane_material );
        this.plane_mesh.scale.set( this.width, this.height, 1.0);

        this.plane_mesh.position.set(this.center.x, this.center.y, this.center.z);

        this.scene_context.scene.add ( this.plane_mesh );

    }

    // Attach the scenes in which will be rendered onto the plane texture
    attach_mesh ( mesh )
    {
        this.scene.add ( mesh );
    }

    set_texture( render_target )
    {

        
        this.plane_mesh.material.uniforms.scene_texture_resolution.value = new THREE.Vector2(render_target.width, render_target.height);
        this.plane_mesh.material.uniforms.scene_texture.value = render_target.texture;


    }

    set_position_scale ( center, width, height )
    {
        this.plane_mesh.scale.set( width, height, 1.0);

        this.plane_mesh.position.set(center.x, center.y, center.z);

    }


};


export {RenderTargetPlane};

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import InstanceMachine from '../../Primitives/InstanceMachine';

//Animation system
import {EventAnimation, EventSystem} from '../EventAnimation/EventAnimation.jsx';

// Import OnAnimate to jack into the main animation loop.
import OnAnimate from '../EventAnimation/OnAnimate.jsx';

//Importing reuseable text to test its functionality.
import ReusableText from '../../Primitives/ReuseableText.jsx';

import { Text } from 'troika-three-text';

// Import math parser and creator.
import MathParser from '../MathParser/MathParser.js';

// Import frustrum UI
import {FUIDoc, FUIParser} from '../EventAnimation/FrustrumUI.js';

// Import the Chunk Mesh for driving
import { ChunkMesh } from '../../Videos/Scenes/ChunkMesh.jsx';

// Import the Chunk Axis Mesh
import { ChunkAxisMesh } from '../../Videos/Scenes/ChunkAxisMesh.jsx';

// Import the Chunk Coordinate Plane
import { ChunkCoordinatePlane } from '../../Videos/Scenes/ChunkCoordinatePlane.jsx';

import { RenderTargetPlane } from '../../Videos/Scenes/RenderTargetPlane.jsx';

// Import the Plot
import { Plot } from '../../Videos/Scenes/Plot.jsx';

// Import the instanced mesh.
import { InstancedMesh } from '../../Primitives/InstancedMesh.jsx';

import { XYSphere } from '../../Primitives/PrimitiveSphere.jsx';

import './HubbleRedshift.css'


function create_scene_context(scene, renderer)
{

    // Set up the OnAnimate system
    let onAnimate = new OnAnimate();

    //may to need to create reference to scene and return it | fix to enable adding more instance types to this machine in terms of a modular connection.
    let instanceMachine = new InstanceMachine();

    // set up reusable text object
    let reusable_text = new ReusableText();

    // Set up math parser
    let math_parser = new MathParser( {reusable_text, scene, renderer} );

    // Set up the event animation system
    let eventSystem = new EventSystem( {instanceMachine, reusable_text, math_parser} );

    // Setup the FUI Parser
    let fui_parser = new FUIParser();

    return { instanceMachine, eventSystem, reusable_text, onAnimate, math_parser, fui_parser, scene, renderer };
}

function handle_scene_context( scene, scene_context )
{
    scene_context.instanceMachine.render_to_scene(scene);
    scene_context.reusable_text.render_to_scene(scene);
}


function OriginalThree ()
{
        useEffect(() => {

            const scene = new THREE.Scene();
            // Create a clock object
            var clock = new THREE.Clock();
            
            const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            camera.position.z = 5;

            const canvas = document.getElementById("myThreeJsCanvas");

            // Create renderer
            const renderer = new THREE.WebGLRenderer({
                canvas,
                antialias: true,
            });

            renderer.setSize(window.innerWidth, window.innerHeight);
            
            document.body.appendChild(renderer.domElement);

            const controls = new OrbitControls(camera, renderer.domElement);
            //controls.target = new THREE.Vector3(0,0,0);

            const geometry = new THREE.BoxGeometry();
            const material = new THREE.MeshBasicMaterial({ color: 0x00ffff });

            const cube = new THREE.Mesh(geometry, material);


            const cube2 = new THREE.Mesh(geometry, material);
            cube2.position.set(20,0,0);

        
            //scene.add ( mesh );
            //scene.add(cube);
            //scene.add(cube2);

            //scene context
            let scene_context = create_scene_context(scene, renderer);
            // Set up ref to the camera
            scene_context.camera = camera;


            // Import the chunk coordinate plane
            //let chunk_plane = new ChunkCoordinatePlane ( scene_context );

            //scene.add ( chunk_plane.return_mesh( ));

            // let render_target_plane = new RenderTargetPlane ( scene_context );
            // let plot = new Plot ( scene_context );
            // plot.assign_scene( render_target_plane.scene );
            // let point_reference = plot.add_point ( new THREE.Vector3(1,0,0) );
            // plot.add_coordinate_plane( scene );
            
            //scene_context.eventSystem.add_event ( { object: point_reference, duration: 1 }, { attribute: "position", from: new THREE.Vector3(0,0,0), to:new THREE.Vector3(2,0,0)} );

            //  Generate a new Chunk Axis 
            //let chunk_axis = new ChunkAxisMesh( scene_context );

            //chunk_axis.set_axis ( new THREE.Vector3(1,0,0) );

            //chunk_plane.render(scene);
            //chunk_axis.render(scene);

            //scene.add ( chunk_plane.render_texture_to_plane() );

            //scene.add ( chunk_axis.render_texture_to_plane() );
            

            //chunk_axis.render(scene);
            
            //scene_context.instanceMachine.add_xy_sphere ( new THREE.Vector3(0,0,0), 1.0 ) ;

            //scene_context.math_parser.parse_math("|frac{a}{b} = a+b");

            
            //let math_ids = scene_context.math_parser.parse_math ( `f_n = abc` );

            



            let fui_doc = new FUIDoc(scene_context);


            // Get the FUI parser

            let doc = fui_doc.parse(`


            < grid col=[40 %, 25%] row=[25%, 25%] >
            
                <> 
                    <> f_n = f_{n-1} + f_{n-2} </>
                    <> f_0 = 0 </>
                    <> f_1 = 1 </>
                </>

                <>
                    huh?
                    is this thing working?
                
                </>
                <>
                    what
                </>
                < plot ></>
            </>
            `);

            console.log ( doc );

            //fui_doc.add_equation ( "<>hey</>" )

            //console.log ( fui_doc );
            //console.log( scene_context.fui_parser.parse_single_node("<> hey hey </>") );

            

            handle_scene_context(scene, scene_context);
            
            // Animation loop   
            const animate = () => {

                // Update the on animate settings
                scene_context.onAnimate.update();

                // Renders the scene.
                renderer.render( scene, camera );

                
                renderer.setClearColor( new THREE.Color(0x202020) );

                //Fire animation subroutines
                scene_context.eventSystem.update(clock.getDelta());

                // Render instances from the instance machine.
                scene_context.instanceMachine.render_to_scene( scene );

                window.requestAnimationFrame(animate);
            };

            animate();

            // Cleanup
            return () => {
                // Clean up the scene and renderer when component unmounts
                renderer.dispose();
            };

            

        },[]);

        return <div>
            <div>
                <canvas id="myThreeJsCanvas"/>
            </div>
        </div>;
}

export default OriginalThree;
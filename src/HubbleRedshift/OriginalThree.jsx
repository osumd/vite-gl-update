
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import InstanceMachine from '../../Primitives/InstanceMachine';

//Animation system
import {EventSystem, EventAnimation} from '../EventAnimation/EventAnimation.jsx';

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
    let animate = new EventSystem( {instanceMachine, reusable_text, math_parser} );

    // Setup the FUI Parser
    let fui_parser = new FUIParser();

    return { instanceMachine, animate, reusable_text, onAnimate, math_parser, fui_parser, scene, renderer };
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
            let context = create_scene_context(scene, renderer);
            // Set up ref to the camera
            context.camera = camera;

            


            // let fui_doc = new FUIDoc(context);

            // let doc = fui_doc.parse(`
            // < grid col=[50%, 50%] row=[40%, 50%] >
            //     <> F_n = 1 </>
            //     <> child1 </>
            //     <> child2 </>
            //     < plot >  </>
            // </>
            // `);



            handle_scene_context(scene, context);
            
            // Animation loop   
            const animate = () => {

                // Update the on animate settings
                context.onAnimate.update();

                // Renders the scene.
                renderer.render( scene, camera );

                
                renderer.setClearColor( new THREE.Color(0x202020) );

                //Fire animation subroutines
                context.animate.update(clock.getDelta());

                // Render instances from the instance machine.
                context.instanceMachine.render_to_scene( scene );

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
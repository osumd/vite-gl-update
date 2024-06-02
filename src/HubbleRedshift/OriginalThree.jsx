
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import InstanceMachine from '../../Primitives/InstanceMachine';

//Mesh Data Structures
import WingedEdgeGraph from '../MeshStructures/WingedEdgeGraph.jsx';

//Animation system
import {EventAnimation, EventSystem} from '../EventAnimation/EventAnimation.jsx';

//Importing reuseable text to test its functionality.
import ReusableText from '../../Primitives/ReuseableText.jsx';


import './HubbleRedshift.css'


// Create a global scene context to prevent
// javashift from piling it out.
let scene_context_created = 0;

// Create a global context edit identifer
let context_edit = 0;

function create_scene_context()
{
    //may to need to create reference to scene and return it
    
    if ( scene_context_created != 0)
    {
        return scene_context_created;
    }

    const instanceMachine = new InstanceMachine();
    //nstanceMachine.add_xy_sphere(new THREE.Vector3(0.0, 4.0, 0.0), 1.0);

    // set up reusable text object
    let reusable_text = new ReusableText();

    const eventSystem = new EventSystem({instanceMachine, reusable_text});
        

    scene_context_created = {instanceMachine, eventSystem, reusable_text};

    return {instanceMachine, eventSystem, reusable_text};
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

            renderer.setSize(window.innerWidth*0.5, window.innerHeight*0.5);

            document.body.appendChild(renderer.domElement);

            const controls = new OrbitControls(camera, renderer.domElement);
            
            const geometry = new THREE.BoxGeometry();
            const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
            const cube = new THREE.Mesh(geometry, material);
            const cube2 = new THREE.Mesh(geometry, material);
            cube.position.set(0,4,0);
            scene.add(cube);
            cube2.position.set(0,0,8);
            //scene.add(cube2);
            // Generate and add some text to the scene.
            //let reusable_text = new ReusableText();
            //let t0_id = reusable_text.add_text({text:"hello", size:2});
            //reusable_text.dispose_text(t0_id);  
            //reusable_text.add_text({text:"goodbytes"});

            // Add the text objects to the scene.
            //reusable_text.render_to_scene(scene);


            //scene context
            let scene_context = create_scene_context();
            scene_context.camera = camera;

            

            
            if ( context_edit == 0)
            {
                
                
            }

            scene_context.eventSystem.add_text({text:"damn", duration:1},{attribute:"position", to: new THREE.Vector3(0.0,4.0,0.0)});


            if ( context_edit == 1)
            {
                //set up event system

                

                //

                /* scene_context.eventorSystem.add_event({object: scene_context.camera, duration:2}, {attribute:"lookat", to: new THREE.Vector3(0.0,4.0,0.0)});
            
                scene_context.eventSystem.add_event({object: scene_context.camera, duration:2}, {attribute:"lookat", to: new THREE.Vector3(1.0,4.0,0.0)});

                scene_context.eventSystem.add_event({object: scene_context.camera, duration:2}, {attribute:"lookat", to: new THREE.Vector3(0.0,0,8.0)}); */


                



                //scene_context.eventSystem.add_event({object: scene_context.camera, duration:1}, {attribute:"lookat", to: new THREE.Vector3(0,0,0)});
                
                //scene_context.eventSystem.add_event({object: scene_context.camera, duration:1}, {attribute:"lookat", to: new THREE.Vector3(0,4.0,0)});
            }

            context_edit++;

            handle_scene_context(scene, scene_context);
            
            scene_context.eventSystem.paused = false;
            
            // Animation loop
            const animate = () => {
                
                //controls.update(); // Update controls

                // Rotate the cube
 //               cube.rotation.x += 0.01;
 //               cube.rotation.y += 0.01;
                // Render the scene
                

                //clock.getDelta());
                scene_context.eventSystem.update(clock.getDelta());
                

                renderer.render(scene, camera);
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
            <h1>dfa</h1>
            <h1>dfasdf</h1>
            <div>
                <canvas id="myThreeJsCanvas"  />
            </div>
        </div>;
}

export default OriginalThree;
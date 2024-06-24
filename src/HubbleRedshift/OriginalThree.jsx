
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



import './HubbleRedshift.css'
import LamesTheorem from '../../Videos/Scenes/LamesTheorem.jsx';
import EuclideanElectric from '../../Videos/Scenes/EuclideanElectric.jsx';
function create_scene_context(scene, renderer)
{
    //may to need to create reference to scene and return it
    let instanceMachine = new InstanceMachine();
    // set up reusable text object
    let reusable_text = new ReusableText();
    // Set up math parser
    let math_parser = new MathParser({reusable_text, scene, renderer});
    // Set up the event animation system
    let eventSystem = new EventSystem({instanceMachine, reusable_text, math_parser});
    // Set up the OnAnimate system
    let onAnimate = new OnAnimate();

    
    // Setup the FUI Parser
    let fui_parser = new FUIParser();
    
    return {instanceMachine, eventSystem, reusable_text, onAnimate, math_parser, fui_parser, scene, renderer};
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
            const material = new THREE.MeshBasicMaterial({ color: 0x00ffff });

            const cube = new THREE.Mesh(geometry, material);
            cube.position.set(0,0,1);

            const cube2 = new THREE.Mesh(geometry, material);
            cube2.position.set(20,0,0);

            scene.add(cube);
            scene.add(cube2);

            //scene context
            let scene_context = create_scene_context(scene, renderer);
            // Set up ref to the camera
            scene_context.camera = camera;

            let electric = new EuclideanElectric(scene_context);
            electric.test_stage0();


            handle_scene_context(scene, scene_context);
            
            // Animation loop   
            const animate = () => {

                if ( Math.floor(clock.elapsedTime*10) % 10  == 0)
                {
                    //fui.parse("Hello");
                }
                
                // Update the on animate settings
                scene_context.onAnimate.update();

                renderer.render(scene, camera);
                
                renderer.setClearColor(new THREE.Color(0x202020));
                
                //Fire animation subroutines
                scene_context.eventSystem.update(clock.getDelta());
                

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
                <canvas id="myThreeJsCanvas"/>
            </div>
        </div>;
}

export default OriginalThree;

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';


import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import InstanceMachine from '../../Primitives/InstanceMachine';

//Animation system
import {EventAnimation, EventSystem} from '../EventAnimation/EventAnimation.jsx';

//Importing reuseable text to test its functionality.
import ReusableText from '../../Primitives/ReuseableText.jsx';

// Import my first video into the original three
import RecurrenceRelationVideo from '../../Videos/ReccurenceRelations.jsx';"../../Videos/ReccurenceRelations.jsx";

import CylinderGrid from '../../Primitives/CylinderGrid.jsx';


import './HubbleRedshift.css'



function create_scene_context()
{
    //may to need to create reference to scene and return it
    let instanceMachine = new InstanceMachine();
    // set up reusable text object
    let reusable_text = new ReusableText();
    let eventSystem = new EventSystem({instanceMachine, reusable_text});
    
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
            const material = new THREE.MeshBasicMaterial({ color: 0x00ffff });

            const cube = new THREE.Mesh(geometry, material);
            cube.position.set(0,4,0);
            scene.add(cube);

            //scene context
            let scene_context = create_scene_context();
            // Set up ref to the camera
            scene_context.camera = camera;
            
            scene.add(new CylinderGrid().GenerateGrid())
            // Play a video.
            //let recurrence_relation_video = new RecurrenceRelationVideo(scene_context);

            handle_scene_context(scene, scene_context);
            
            // Animation loop
            const animate = () => {
                  
                renderer.render(scene, camera);
                //controls.update();
                scene_context.eventSystem.update(clock.getDelta());
                //Fire animation subroutines


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
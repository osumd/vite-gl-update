
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

//Font loading
import {Text} from 'troika-three-text';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import InstanceMachine from '../../Primitives/InstanceMachine';

//Mesh Data Structures
import WingedEdgeGraph from '../MeshStructures/WingedEdgeGraph.jsx';

//Animation system
import {EventAnimation, EventSystem} from '../EventAnimation/EventAnimation.jsx';

import './HubbleRedshift.css'

function create_scene_context()
{
    //may to need to create reference to scene and return it

    const instanceMachine = new InstanceMachine();
    instanceMachine.add_xy_sphere(new THREE.Vector3(0.0, 4.0, 0.0), 1.0);

    const eventSystem = new EventSystem({instanceMachine});
    
    return {instanceMachine, eventSystem};
}

function handle_scene_context( scene, scene_context )
{
    scene_context.instanceMachine.render_to_scene(scene);
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
            
            const geometry = new THREE.BoxGeometry();
            const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
            const cube = new THREE.Mesh(geometry, material);

            scene.add(cube);

            //scene context
            let scene_context = create_scene_context();
            scene_context.camera = camera;

            handle_scene_context(scene, scene_context);

            console.log(scene_context.camera)
            
            // mesh data structures
            let wing = new WingedEdgeGraph(scene_context);

            //set up event system
            /* scene_context.eventSystem.add_event({object: scene_context.camera, duration:4},
                        {attribute:"lookat", to: new THREE.Vector3(0,4.0,0.0)}); */
            /* scene_context.eventSystem.add_event({object: scene_context.camera, duration:1},
                {attribute:"position", to: new THREE.Vector3(2,0,3)}); */

            scene_context.eventSystem.paused = false;
            
            // Animation loop
            const animate = () => {
                
                controls.update(); // Update controls

                // Rotate the cube
                cube.rotation.x += 0.01;
                cube.rotation.y += 0.01;
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

            

        });
        return <div>

            <div>
            <canvas id="myThreeJsCanvas"  />
            </div>
            </div>;

        return (
            <div >
                <h1>Welcome to the Hubble Redshift Page</h1>    
                <div ref={sceneRef}></div>
            </div>

            
        );
}

export default OriginalThree;
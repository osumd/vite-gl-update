
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';


import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import InstanceMachine from '../../Primitives/InstanceMachine';

//Animation system
import {EventAnimation, EventSystem} from '../EventAnimation/EventAnimation.jsx';

//Importing reuseable text to test its functionality.
import ReusableText from '../../Primitives/ReuseableText.jsx';

//Import solid object
import SphereSolid from '../../Primitives/SphereSolid.jsx';

import './HubbleRedshift.css'


function create_scene_context()
{
    //may to need to create reference to scene and return it
    const instanceMachine = new InstanceMachine();

    //instanceMachine.add_xy_sphere(new THREE.Vector3(0.0, 4.0, 0.0), 0.0);
    //instanceMachine.add_open_cylinder(new THREE.Vector3(0,0,0), new THREE.Vector3(1,0,0));

    // set up reusable text object
    let reusable_text = new ReusableText();

    const eventSystem = new EventSystem({instanceMachine, reusable_text});
    
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

            
            //scene context
            let scene_context = create_scene_context();

            // Test animation groups
            //scene_context.eventSystem.add_animation_group();
            //scene_context.eventSystem.add_text({text:"hello_world", duration: 1}, {attribute:"scale", from: new THREE.Vector3(0,0,0), to: new THREE.Vector3(1,1,1)} );

            //scene_context.eventSystem.dispose_animation_group();

            //scene_context.instanceMachine.primitive_reference["xy_sphere"].setMatrixAt(0, new THREE.Matrix4().setPosition(0,0,0));

            //scene_context.instanceMachine.instancedXYSphere.setMatrixAt(0, new THREE.Matrix4().setPosition(0,3,0));

            // Set up ref to the camera
            scene_context.camera = camera;

            // Orthoview use.
            //scene_context.eventSystem.add_event({ object: camera, duration: 1 }, { attribute: "orthoview", to:cube.position.clone(), axis:"y", distance:2 });
            
            //scene_context.eventSystem.add_event({object: 0, duration: 1, primitive:"xy_sphere"},{attribute:"position", to: new THREE.Vector3(0,0,0)});  

            
            let sphere_solid = new SphereSolid(scene_context);
            sphere_solid.generate_mesh();

            //Font loading
            
            
            handle_scene_context(scene, scene_context);

            // Animation loop
            const animate = () => {
                  
                renderer.render(scene, camera);
                
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
                <canvas id="myThreeJsCanvas"  />
            </div>
        </div>;
}

export default OriginalThree;
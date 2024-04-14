//react
import React, {useRef} from 'react';

import * as THREE from 'three';
import { Canvas } from 'react-three-fiber';

//Imported cameras
import { PerspectiveCamera } from '@react-three/drei';

// Complete object uses noise to displace surface badly
import ExtragalacticObject from '../../CompleteObjects/ExtragalacticObject.jsx';

import {InstancedCylinder} from '../../Primitives/InstancedCylinder.jsx';
import { XYSphere } from '../../Primitives/PrimitiveSphere.jsx';
import { XYSphereGraph } from '../MeshGraph/SphereGraph';
import { Dequeue } from '../DataStructures/Dequeue.jsx';

//Import animator
import {EventSystem, EventAnimation} from '../EventAnimation/EventAnimation.jsx'

//import instance thing
import InstanceMachine from '../../Primitives/InstanceMachine.jsx';

import './HubbleRedshift.css'


function useRefCollection()
{
  const camera = useRef();
  const eventSystem = useRef();
  const instanceMachine = useRef();
  // Add more refs as needed

  // Return an object containing all the refs
  return {
    camera,
    eventSystem,
    instanceMachine
    // Add more refs as needed
  };
}


function HubbleRedshift ()
{
    
        let scene_context = useRefCollection();

        return (
            <div >
                <h1>Welcome to the Hubble Redshift Page</h1>

                
                    <Canvas style={{width:"600px", height: "600px"}}>
                        
                        <mesh scale={0.5} position={new THREE.Vector3(0.0,0.0,0.0)}><boxGeometry></boxGeometry></mesh>
                        
                        
                        <PerspectiveCamera makeDefault ref={scene_context.camera} position={[0,0,3]} ></PerspectiveCamera>
                        <EventAnimation {...scene_context}></EventAnimation>

                    </Canvas>

                    <EventSystem ref={scene_context.eventSystem}></EventSystem>

                    

                    
            </div>

            
        );
}

export default HubbleRedshift;
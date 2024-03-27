import React from 'react';
import { Canvas } from 'react-three-fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

import ExtragalacticObject from './ExtragalacticObject';
import {InstancedCylinder} from '../Primitives/InstancedCylinder';
import { XYSphere } from '../Primitives/PrimitiveSphere.jsx';
import { XYSphereGraph } from '../MeshGraph/SphereGraph';
import { Dequeue } from '../DataStructures/Dequeue.jsx';


class HubbleRedshift extends React.Component {

    render() {

        let Q = new Dequeue();
        Q.push_front(1);
        Q.pop_front();
        Q.push_front(2);
        Q.push_front(3);
        
        Q.pop_front();
        
        Q.pop_front();
        console.log(Q.empty());
        Q.pop_front();
        Q.pop_front();
        

        return (
            <div>
                <h1>Welcome to the Hubble Redshift Page</h1>
                <p>This is a basic webpage setup in React.</p>
                <Canvas>

                    {/* <ExtragalacticObject></ExtragalacticObject> */}
                    {/* <XYSphere radius={1.0} widthSegments={10} heightSegments={10}></XYSphere> */}
                    {}
                    {/* <InstancedCylinder bottom={new THREE.Vector3(5,0.0,0)} top={new THREE.Vector3(8,3,-10)} divisions={5}></InstancedCylinder> */}
                    {/* <mesh position={new THREE.Vector3(-5,3,-10)}><boxGeometry></boxGeometry></mesh> */}
                    <mesh scale={0.5} position={new THREE.Vector3(0.0,0.0,0.0)}><boxGeometry></boxGeometry></mesh>
                    <OrbitControls></OrbitControls>
                    <XYSphereGraph radius={1.0} widthSegments={10} heightSegments={10}></XYSphereGraph>
                </Canvas>

                {Q.render()}
            </div>
        );
    }
}

export default HubbleRedshift;
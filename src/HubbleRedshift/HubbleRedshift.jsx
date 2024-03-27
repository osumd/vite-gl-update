import React from 'react';
import { Canvas } from 'react-three-fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

import ExtragalacticObject from './ExtragalacticObject';
import {InstancedCylinder} from '../Primitives/InstancedCylinder';
import { XYSphere } from '../Primitives/PrimitiveSphere.jsx';

class HubbleRedshift extends React.Component {

    render() {

        return (
            <div>
                <h1>Welcome to the Hubble Redshift Page</h1>
                <p>This is a basic webpage setup in React.</p>
                <Canvas>

                    <ExtragalacticObject></ExtragalacticObject>
                    {}
                    {/* <InstancedCylinder bottom={new THREE.Vector3(5,0.0,0)} top={new THREE.Vector3(8,3,-10)} divisions={5}></InstancedCylinder> */}
                    {/* <mesh position={new THREE.Vector3(-5,3,-10)}><boxGeometry></boxGeometry></mesh> */}
                    <mesh position={new THREE.Vector3(-1.0,0.0,-1.0)}><boxGeometry></boxGeometry></mesh>
                    <OrbitControls></OrbitControls>
                </Canvas>
            </div>
        );
    }
}

export default HubbleRedshift;
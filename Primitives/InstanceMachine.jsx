import React,{useRef,useEffect} from 'react';
import * as THREE from 'three';
//import react


class InstanceMachine extends React.Component {

    //in here generate the geometry and keep track of the instance counts, if the instance counts exceeds some value then basically redo

    constructor()
    {
        //simply using the xy sphere for reference
        this.instancedXYSphere = undefined;
        this.instances_xy_spheres_capacity = 7;
        this.instances_xy_spheres_size = 0;

    }

    add_xy_sphere(location)
    {

        if(this.instances_xy_sphere_size + 1 > this.instances_xy_spheres_capacity || this.instancedXYSphere == undefined)
        {

            //resize the instance count
            this.instancedXYSphere = new THREE.InstancedMesh(xy_sphere_geometry, new THREE.MeshBasicMaterial({ color: 0xffff00, side: THREE.DoubleSide }), this.instances_xy_spheres_capacity*2);
            this.instances_xy_spheres_capacity = this.instances_xy_spheres_capacity*2;

        }

        //then set the matrix and set it to update etc.
        

    }

    render()
    {
        <group>
            <primitive object={this.instancedXYSphere}></primitive>
        </group>
    }

};


export default InstanceMachine;


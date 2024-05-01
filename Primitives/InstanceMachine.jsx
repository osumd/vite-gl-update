import React,{useRef,useEffect} from 'react';
import * as THREE from 'three';
//import react
import { XYSphere } from '../Primitives/PrimitiveSphere';


class InstanceMachine extends React.Component {

    //in here generate the geometry and keep track of the instance counts, if the instance counts exceeds some value then basically redo

    constructor()
    {
        //simply using the xy sphere for reference
        super();
        
        //seting up geometries
        this.xy_sphere_geometry = XYSphere({radius:1.0, widthSegments:10, heightSegments:10});

        this.instances_xy_spheres_capacity = 0;
        this.instancedXYSphere = new THREE.InstancedMesh(this.xy_sphere_geometry, new THREE.MeshBasicMaterial({ color: 0xffff00, side: THREE.DoubleSide }), this.instances_xy_spheres_capacity);
        
        this.instances_xy_spheres_size = 0;

        /* this.add_xy_sphere(new THREE.Vector3(0,1,0), 0.01);
        this.add_xy_sphere(new THREE.Vector3(1,0,0), 0.02);
        this.add_xy_sphere(new THREE.Vector3(1,1,0), 0.02);
        this.add_xy_sphere(new THREE.Vector3(1,2,0), 0.02);
        this.add_xy_sphere(new THREE.Vector3(1,3,0), 0.02); */
        
        

    }

    add_xy_sphere(location, radius)
    {

        

        if(this.instances_xy_spheres_size == this.instances_xy_spheres_capacity)
        {

        
            this.instances_xy_spheres_capacity = this.instances_xy_spheres_capacity*2;
            var new_mesh = new THREE.InstancedMesh(this.xy_sphere_geometry, new THREE.MeshBasicMaterial({ color: 0xffff00, side: THREE.DoubleSide }), this.instances_xy_spheres_capacity);

            if(this.instancedXYSphere != undefined)
            {

                for(let i = 0; i < this.instances_xy_spheres_size; i++)
                {
                    let matrix = new THREE.Matrix4();

                    this.instancedXYSphere.getMatrixAt(i,matrix);
                    new_mesh.setMatrixAt(i, matrix);
                }

                for(let i = this.instances_xy_spheres_size; i < this.instances_xy_spheres_capacity; i++)
                {
                    new_mesh.setMatrixAt(i,new THREE.Matrix4(0));
                }

            }

            this.instancedXYSphere = new_mesh;
        }

        console.log(location, radius);

        
        let m = new THREE.Matrix4();
        m.setPosition(location);
        m.scale(new THREE.Vector3(radius,radius,radius));

        console.log(this.instances_xy_spheres_size);

        this.instancedXYSphere.setMatrixAt(this.instances_xy_spheres_size, m);
        this.instancedXYSphere.instanceMatrix.needsUpdate= true;
        this.instances_xy_spheres_size++;



    }

    render()
    {
        return(
        <group>
            {/* {this.instancedXYSphere !== undefined && <primitive object={this.instancedXYSphere} />} */}
            <primitive object={this.instancedXYSphere}></primitive>
            
        </group>
        );
    }

};


export default InstanceMachine;


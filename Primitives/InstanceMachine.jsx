import React,{useRef,useEffect} from 'react';
import * as THREE from 'three';
//import react
import { XYSphere } from '../Primitives/PrimitiveSphere';
import { OpenCylinder } from './PrimitiveCylinder';


class InstanceMachine extends React.Component {

    //in here generate the geometry and keep track of the instance counts, if the instance counts exceeds some value then basically redo

    constructor()
    {
        //simply using the xy sphere for reference
        super();
        
        //seting up geometries [Sphere]
        this.xy_sphere_geometry = XYSphere({radius:1.0, widthSegments:10, heightSegments:10});
        //set up cylinder geomtries [Cylinder]
        this.open_cylinder_geometry = OpenCylinder();

        // the capacities for each geometry type and their instance 

        this.instances_xy_spheres_capacity = 10;
        this.instancedXYSphere = new THREE.InstancedMesh(this.xy_sphere_geometry, new THREE.MeshBasicMaterial({ color: 0xffff00, side: THREE.DoubleSide }), this.instances_xy_spheres_capacity);
        
        this.instances_open_cylinder_capacity = 10;
        this.instancedOpenCylinder = new THREE.InstancedMesh(this.open_cylinder_geometry, new THREE.MeshBasicMaterial({ color: 0xffff00, side: THREE.DoubleSide }), this.instance_open_cylinder_capacity  );

        //bitmap font location


        //sizes for the individual vectors
        this.instances_xy_spheres_size = 0;
        this.instances_open_cylinder_size = 0;

        //set up map for instances with id's
        let instanceIDs = {};

        this.nullify_instances();
        

    }

    nullify_instances()
    {

        function nullify_spheres(self)
        {
            for(let i = 0; i < self.instances_xy_spheres_capacity; i++)
            {
                let m = new THREE.Matrix4();
                m.scale(new THREE.Vector3(0,0,0));
                
                self.instancedXYSphere.setMatrixAt(i, m);
            }    
        }

        function nullify_open_cylinders(self)
        {
            for(let i = 0; i < self.instances_open_cylinder_capacity; i++)
            {
                let m = new THREE.Matrix4();
                m.scale(new THREE.Vector3(0,0,0));
                
                self.instancedOpenCylinder.setMatrixAt(i, m);
            }
        }

        nullify_spheres(this);
        nullify_open_cylinders(this);
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

        let m = new THREE.Matrix4();
        m.setPosition(location);
        m.scale(new THREE.Vector3(radius,radius,radius));

        //console.log(this.instances_xy_spheres_size);

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

    render_to_scene(scene)
    {
        scene.add(this.instancedXYSphere);
    }

};


export default InstanceMachine;


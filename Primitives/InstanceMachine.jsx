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
        this.instancedOpenCylinder = new THREE.InstancedMesh(this.open_cylinder_geometry, new THREE.MeshBasicMaterial({ color: 0xffff00, side: THREE.DoubleSide }), this.instances_open_cylinder_capacity  );

        //bitmap font location


        //sizes for the individual vectors
        this.instances_xy_spheres_size = 0;
        this.instances_open_cylinder_size = 0;

        //set up map for instances with id's
        //let instanceIDs = {};

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

    add_open_cylinder(start,end)
    {
        if(this.instances_open_cylinder_size == this.instances_open_cylinder_capacity)
        {
            //console.log("resize");
            this.instances_open_cylinder_capacity = this.instances_open_cylinder_capacity*2;
            
            var new_mesh = new THREE.InstancedMesh(this.open_cylinder_geometry, new THREE.MeshBasicMaterial({ color: 0xffff00, side: THREE.DoubleSide }), this.instances_open_cylinder_capacity);

            if(this.instancedOpenCylinder != undefined)
            {

                for(let i = 0; i < this.instances_open_cylinder_size; i++)
                {
                    let matrix = new THREE.Matrix4();

                    this.instancedOpenCylinder.getMatrixAt(i,matrix);
                    new_mesh.setMatrixAt(i, matrix);
                }

                for(let i = this.instances_open_cylinder_size; i < this.instances_open_cylinder_capacity; i++)
                {
                    new_mesh.setMatrixAt(i,new THREE.Matrix4(0));
                }

            }

            this.instancedOpenCylinder = new_mesh;
        }
        //  Cylinder is pointing up.
        let direction = end.clone().sub(start);
        //new THREE.Vector3().len
        let line_size = direction.length();

        //
        let axis_norm = direction.clone().cross(new THREE.Vector3(0,1,0)).normalize();
        let angle = Math.acos(new THREE.Vector3(0,1,0).dot(direction)/line_size);
        direction.normalize();

        //console.log("angle",angle, direction, axis_norm, line_size);

        //how to compose my scale position and rotation? 
        let quaternion = new THREE.Quaternion().setFromAxisAngle(axis_norm, -angle);

        let mc = new THREE.Matrix4().compose(start, quaternion, new THREE.Vector3(1, line_size, 1));
        
        this.instancedOpenCylinder.setMatrixAt(this.instances_open_cylinder_size++, mc);
    }


    render()
    {
        return(
        <group>
            <primitive object={this.instancedOpenCylinder}></primitive>
            <primitive object={this.instancedXYSphere}></primitive>
        </group>
        );
    }

    render_to_scene(scene)
    {
        scene.add(this.instancedXYSphere);
        scene.add(this.instancedOpenCylinder);
    }

};


export default InstanceMachine;


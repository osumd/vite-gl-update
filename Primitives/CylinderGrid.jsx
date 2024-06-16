
import * as THREE from 'three';
import { ShaderMaterial, SphereGeometry } from 'three';
import React from 'react';
import { useRef } from 'react';

// Import troika text
import { Text } from 'troika-three-text';

// Example of innefficent grid with no instancing, no shader grid generation etc, add text to to label the grid.

class ElementMesh
{
    constructor()
    {
        // Stores the actual arrays
        this.vertices = undefined;
        this.normals = undefined;
        this.uvs = undefined;
        this.elements = undefined;

        // Stores the indexes and two custom index pointers.
        this.vertices_index = 0;
        this.elements_index = 0;
        this.uvs_index = 0;
        this.normals_index = 0;

        // Stores the two custom index pointers
        this.index_slot1 = 0;
        this.index_slot2 = 0;
    }

    allocate_all(number_vertices)
    {
        this.allocate_vertices(number_vertices*3);
        this.allocate_normals(number_vertices*3);
        this.allocate_uvs(number_vertices*2);
        this.allocate_elements(number_vertices);
    }

    allocate_vertices(amount)
    {
        this.vertices = new Float32Array(amount);
    }
    allocate_elements(amount)   
    {
        this.elements = new Uint16Array(amount);
    }
    allocate_uvs(amount)
    {
        this.uvs = new Float32Array(amount);
    }
    allocate_normals(amount)
    {
        this.normals = new Float32Array(amount);
    }

    // Push a vertex
    push_vertex(x0, x1, x2)
    {
        if ( this.vertices == undefined )
        {
            console.log("Undefined");
            return;
        }

        this.vertices[this.vertices_index++] = x0;
        this.vertices[this.vertices_index++] = x1;
        this.vertices[this.vertices_index++] = x2;
    }
    // Push a normal
    push_normal(x0, x1, x2)
    {
        if ( this.normals == undefined )
        {
            console.log("Undefined");
            return;
        }

        this.normals[this.normals_index++] = x0;
        this.normals[this.normals_index++] = x1;
        this.normals[this.normals_index++] = x2;
    }
    // Push a uv
    push_uv(x0, x1)
    {
        if ( this.uvs == undefined )
        {
            console.log("Undefined");
            return;
        }

        this.uvs[this.uvs_index++] = x0;
        this.uvs[this.uvs_index++] = x1;
        
    }
    // Push a element
    push_element(x0)
    {
        if ( this.elements == undefined )
        {
            console.log("Undefined");
            return;
        }

        this.elements[this.elements_index++] = x0;
    }

}

class CylinderGrid {

    constructor( scene )
    {
        this.scene = scene;

        this.volume_bottom = new THREE.Vector3(0,0,0);
        this.volume_top = new THREE.Vector3(5,5,5);

        // Generate element mesh
        this.element_mesh = new ElementMesh();
        
        // Generate buffer geometry
        this.buffer_geometry = new THREE.BufferGeometry();

        // Refactor plan just store the xyz as an integer

        // Define the volume lengths
        this.volume_lengths = [
            this.volume_top.x - this.volume_bottom.x,
            this.volume_top.y - this.volume_bottom.y,
            this.volume_top.z - this.volume_bottom.z
        ]

        // Define the division for each volume vector
        this.volume_divisions = [
            0.5, 0.5, 0.5
        ];

        // The divisions
        this.radius = 0.1-(0.085); 

        // Array of two unit vectors for each face of the cube
        this.volume_unit_vectors = [
            [new THREE.Vector3(1,0,0), new THREE.Vector3(0,1,0)],
            [new THREE.Vector3(0,0,-1), new THREE.Vector3(0,1,0)],
            [new THREE.Vector3(1,0,0), new THREE.Vector3(0,0,-1)],

        ];

        // A map with specific face rendering options
        this.face_map = {
            "front" : { unit_vectors: this.volume_unit_vectors[0], origin: this.volume_bottom.clone(), vector_indices: [0, 1] },
            "back" : { unit_vectors: this.volume_unit_vectors[0], origin: new THREE.Vector3(this.volume_bottom.x, this.volume_bottom.y, -this.volume_top.z), vector_indices: [0, 1] },
            "left" : { unit_vectors: this.volume_unit_vectors[1], origin: new THREE.Vector3(this.volume_bottom.x, this.volume_bottom.y, this.volume_bottom.z), vector_indices: [2, 1] },
            "right" : { unit_vectors: this.volume_unit_vectors[1], origin: new THREE.Vector3(this.volume_top.x, this.volume_bottom.y, this.volume_bottom.z), vector_indices: [2, 1] },
            "bottom" : { unit_vectors: this.volume_unit_vectors[2], origin: this.volume_bottom.clone(), vector_indices: [0, 2] },
            "top" : { unit_vectors: this.volume_unit_vectors[2], origin: new THREE.Vector3(this.volume_bottom.x, this.volume_top.y, this.volume_bottom.z), vector_indices: [0, 2] },
        }

        // Custom offset vectors and orientation vectors for the tick labels, tick labels follow the divisions
        this.tick_offset = [
            new THREE.Vector3( 0, 0, 1 ),
            new THREE.Vector3( -1, 0, 0 ),
            new THREE.Vector3( -1, 0, 0),
        ];

        // Custom orientation or face value [ simple for now the vector could be anything ]
        this.tick_orientation = [
            new THREE.Vector3( 0,1,0 ),
            new THREE.Vector3( 0,0,1 ),
            new THREE.Vector3( 0,1,0 ),
        ]

        // Origin of the axes
        this.axes_origin = new THREE.Vector3(0.5,0,0);

        // List is faces to generate
        this.generate_these_faces = ["left","back","right"]
        
    }

    quaternion_axis_angle(p_in, axis, angle, p_out)
    {

       
        let q = new THREE.Vector4();

        let s = Math.sin(angle/2);
        q.w = Math.cos(angle/2);
        q.x = axis.x * s;
        q.y = axis.y * s;
        q.z = axis.z * s;
        
        // //normalize the quaternion

        let x = p_in.x*((q.w*q.w)+(q.x*q.x) - (q.y*q.y) - (q.z*q.z)) + p_in.y*((2*q.x*q.y) - (2*q.w*q.z)) + p_in.z*((2*q.x*q.z) + (2*q.w*q.y) );
        let y = p_in.x*((2*q.x*q.y) + (2*q.w*q.z)) + p_in.y*((q.w*q.w)-(q.x*q.x) + (q.y*q.y)-(q.z*q.z)) + p_in.z*((2*q.y*q.z) - (2*q.w*q.x)); 
        let z = p_in.x*((2*q.x*q.z) - (2*q.w*q.y)) + p_in.y*((2*q.y*q.y) + (2*q.w*q.x)) + p_in.z*((q.w*q.w)-(q.x*q.x)+(q.y*q.y)+(q.z*q.z));
        // let result = new THREE.Vector3();

        let norm = Math.sqrt(q.w*q.w + q.x*q.x + q.y*q.y + q.z*q.z);
        let qw = q.w / norm;
        let qx = q.x / norm;
        let qy = q.y / norm;
        let qz = q.z / norm;

        // Calculate the rotated point
        //let x = p_in.x * (1 - 2*qy*qy - 2*qz*qz) + p_in.y * (2*qx*qy - 2*qw*qz) + p_in.z * (2*qx*qz + 2*qw*qy);
        //let y = p_in.x * (2*qx*qy + 2*qw*qz) + p_in.y * (1 - 2*qx*qx - 2*qz*qz) + p_in.z * (2*qy*qz - 2*qw*qx);
        //let z = p_in.x * (2*qx*qz - 2*qw*qy) + p_in.y * (2*qy*qz + 2*qw*qx) + p_in.z * (1 - 2*qx*qx - 2*qy*qy);


        // Apply quaternion rotation to the input vector
        //let p_rotated = p_in.clone().applyQuaternion(q);

        //generate quaternion from axis and and an angle


        let p_rotated = new THREE.Quaternion().setFromAxisAngle(axis,angle);
        let thing = p_in.clone().applyQuaternion(p_rotated);
        

        p_out.x = thing.x;
        p_out.y = thing.y;
        p_out.z = thing.z;

    }

    GenerateGrid(){
        
        // Access selected faces to gridify
        // for ( let f = 0 ; f < this.generate_these_faces.length; f ++ )
        // {
        //     this.Gridify_Face(this.generate_these_faces[f]);
        // }

        this.element_mesh.allocate_all( 6000 );
        
        this.GridifyFace("top");
        this.GridifyFace("left");
        this.GridifyFace("right");
        this.GridifyFace("bottom");

        this.GridifyFace("front");
        this.GridifyFace("back");
        
        // Generate the Axes
        this.GenerateAxes();
    
        this.buffer_geometry.setAttribute('position', new THREE.BufferAttribute(this.element_mesh.vertices, 3));
        this.buffer_geometry.setAttribute('normal', new THREE.BufferAttribute(this.element_mesh.normals, 3));
        this.buffer_geometry.setAttribute('uv', new THREE.BufferAttribute(this.element_mesh.uvs, 2));
        // Optional: Add indices to the geometry if you're using indexed geometry
        this.buffer_geometry.setIndex(new THREE.BufferAttribute(this.element_mesh.elements, 1));

        return new THREE.Mesh( this.buffer_geometry , new THREE.MeshBasicMaterial({ color: 0xff0000, side: THREE.DoubleSide }) );


    }

    GridifyFace(face_id)
    {

        // Unpack the face map
        let face = this.face_map[face_id];
        
        let vector_indices = face.vector_indices;
        // Unpack the volume divisions
        let div_i = this.volume_divisions[ vector_indices[0] ];
        let div_j = this.volume_divisions[ vector_indices[1] ];
        // Unpack the volume lengths
        let len_i = this.volume_lengths[ vector_indices[0] ];
        let len_j = this.volume_lengths[ vector_indices[1] ];
        //Normalize the unit vectors to the indexes ratio
        let unit0 = face.unit_vectors[0].clone();
        let unit1 = face.unit_vectors[1].clone();
        // Define the steps needed for the grid
        let steps_i = len_i / div_i;
        let steps_j = len_j / div_j;
        
        //console.log(len_i, len_j, unit0, unit1);

       // console.log(steps_i);

        for( let i = 0; i <= steps_i; i++)
        {
            let iunit = unit0.clone().multiplyScalar(i*div_i);
            let origin = face.origin.clone().add(iunit);

            
            let end = origin.clone().add(unit1.clone().multiplyScalar(len_j));
            
            this.push_cylinder_back( origin, end, this.radius, 5 );
            
        }

        for ( let j = 0; j <= steps_j; j ++ )
        {
            // Get origin
            
            let junit = unit1.clone().multiplyScalar(j*div_j);

            
            let origin = face.origin.clone().add(junit);

            let end = origin.clone().add(unit0.clone().multiplyScalar(len_i));
            
            this.push_cylinder_back( origin, end, this.radius, 5 );

        }
        


        //Get the origin point







    }


    AddText(text, size, position, orientation)
    {
    //    console.log(text,size, position, orientation);
        // Generate axis and angle for the orientation
        let forward = new THREE.Vector3(0,0,1);
        let axis = forward.clone().cross(orientation);
        let angle = Math.acos( (forward.dot(orientation) ) / ( forward.length()*orientation.length() ) );

        //Create the new text
        let txt_obj = new Text();
        txt_obj.text = text;
        txt_obj.fontSize = size;

    
        txt_obj.anchorX = "center";
        txt_obj.anchorY = "middle";
        txt_obj.position.x = position.x;
        txt_obj.position.y = position.y;
        txt_obj.position.z = position.z;
        
        let quat = new THREE.Quaternion().setFromAxisAngle(axis, angle);
        txt_obj.quaternion.x = quat.x;
        txt_obj.quaternion.y = quat.y;
        txt_obj.quaternion.z = quat.z;
        //txt_obj.quaternion.set(  );

        txt_obj.sync();

        this.scene.add(txt_obj);

    }

    GenerateAxes()
    {
        // For each volume unit vector generate cooresponding axes labeling with proportional text size.
        //Lengths
        let len_i = this.volume_lengths[0];
        let len_j = this.volume_lengths[1];
        let len_k = this.volume_lengths[2];
        //Divisions
        let div_i = this.volume_divisions[0];
        let div_j = this.volume_divisions[1];
        let div_k = this.volume_divisions[2];
        //Tick amounts
        let steps_i = Math.floor((len_i)/(div_i));
        let steps_j = Math.floor((len_j)/(div_j));
        let steps_k = Math.floor((len_k)/(div_k));
        // Get unit vectors
        let unit_i = this.volume_unit_vectors[0][0];
        let unit_j = this.volume_unit_vectors[0][1];
        let unit_k = this.volume_unit_vectors[2][1];
        // Get offset vectors
        let offset_i = this.tick_offset[0];
        let offset_j = this.tick_offset[1];
        let offset_k = this.tick_offset[2];
        // Get orientations
        let orientation_i = this.tick_orientation[0];
        let orientation_j = this.tick_orientation[1];
        let orientation_k = this.tick_orientation[2];
        // Define axis text size
        let font_size_i = div_i - (0.5 * div_i);
        let font_size_j = div_j - (0.5 * div_i);
        let font_size_k = div_k - (0.5 * div_i);

        for ( let i = 0; i <= steps_i; i++ )
        {
            let iunit = unit_i.clone().multiplyScalar(i*div_i);
            let origin = this.axes_origin.clone().add( iunit );
            origin.add(offset_i);

            this.AddText( ( i*div_i ).toString(),font_size_i, origin,   orientation_i);
            
        }

        for ( let j = 0 ; j <= steps_j; j++ )
        {
            let junit = unit_j.clone().multiplyScalar(j*div_j);
            let origin = this.axes_origin.clone().add( junit );
            origin.add(offset_j);

            this.AddText( (j*div_j).toString(),font_size_j, origin,   orientation_j);
            

        }

        for ( let k = 0 ; k <= steps_k; k++ )
        {
            let kunit = unit_k.clone().multiplyScalar((k*div_k));
            let origin = this.axes_origin.clone().add( kunit );
            origin.add(offset_k);

            this.AddText( (k*div_k).toString(),font_size_k, origin,   orientation_k);
            

        }

        this.push_back_axis( this.axes_origin.clone(), this.axes_origin.clone().add(unit_i.multiplyScalar(len_i)), 0.1, 5 ); 

        this.push_back_axis( this.axes_origin.clone(), this.axes_origin.clone().add(unit_j.multiplyScalar(len_j)), 0.1, 5 ); 

        this.push_back_axis( this.axes_origin.clone(), this.axes_origin.clone().add(unit_k.multiplyScalar(len_k)), 0.1, 5 ); 


    }

    push_back_axis(start, end, radius, divisions)
    {
        // Clone and test end 
        let clone_end = end.clone().normalize();
    
        // Generate cylinder axis, and axis_norm.
        let axis = end.clone().sub(start).normalize();
        let axis_norm = axis.clone().cross(new THREE.Vector3(axis.x + 0.1 , axis.y + 0.1, axis.z + 0.1)).normalize();

        if ( clone_end.x == clone_end.y && clone_end.y == clone_end.z )
        {
            axis_norm = axis.clone().cross(new THREE.Vector3(axis.x + 0.1 , axis.y + 0.0, axis.z + 0.1)).normalize();
        }

        let dr = (Math.PI*2)/divisions;

        let p0 = new THREE.Vector3(0,0,0);
        let p1 = new THREE.Vector3(0,0,0);
        let p2 = new THREE.Vector3(0,0,0);
        let p3 = new THREE.Vector3(0,0,0);
        
        let temp = new THREE.Vector3(0,0,0);

        let axis_tip_length =  ( end.clone().sub(start).length() )*0.1;

        console.log(axis_tip_length);

        
        end = end.clone().sub( axis.clone().multiplyScalar(axis_tip_length) );

        for(var i = 0; i < divisions; i++)
        {
            // First angle and second angle.
            var a0 = i*dr;
            var a1 = (i+1)*dr;
            
            // Rotate norm vector
            this.quaternion_axis_angle(axis_norm, axis, a0, temp);
            //console.log(temp);
            p0.x = start.x + temp.x*radius;
            p0.y = start.y + temp.y*radius;
            p0.z = start.z + temp.z*radius;

            p1.x = end.x + temp.x*radius;
            p1.y = end.y + temp.y*radius;
            p1.z = end.z + temp.z*radius;
            
            this.quaternion_axis_angle(axis_norm, axis, a1, temp);

            p2.x = end.x + temp.x*radius;
            p2.y = end.y + temp.y*radius;
            p2.z = end.z + temp.z*radius;
            
            p3.x = start.x + temp.x*radius;
            p3.y = start.y + temp.y*radius;
            p3.z = start.z + temp.z*radius;

            //console.log(axis_norm);

            //console.log(p0,p1,p2,p3);

            this.element_mesh.push_vertex(p0.x, p0.y, p0.z);
            this.element_mesh.push_vertex(p1.x, p1.y, p1.z);
            this.element_mesh.push_vertex(p2.x, p2.y, p2.z);
            this.element_mesh.push_vertex(p3.x, p3.y, p3.z);

            this.element_mesh.push_uv(0,0);
            this.element_mesh.push_uv(1,0);
            this.element_mesh.push_uv(1,1);
            this.element_mesh.push_uv(0,1);

            var n = p1.sub(p0).cross(p3.sub(p0)).normalize();

            this.element_mesh.push_normal(n.x, n.y, n.z);
            this.element_mesh.push_normal(n.x, n.y, n.z);
            this.element_mesh.push_normal(n.x, n.y, n.z);
            this.element_mesh.push_normal(n.x, n.y, n.z);

            this.element_mesh.push_element(this.element_mesh.index_slot1);
            this.element_mesh.push_element(this.element_mesh.index_slot1+1);
            this.element_mesh.push_element(this.element_mesh.index_slot1+2);
            this.element_mesh.push_element(this.element_mesh.index_slot1);
            this.element_mesh.push_element(this.element_mesh.index_slot1+2);
            this.element_mesh.push_element(this.element_mesh.index_slot1+3);

            this.element_mesh.index_slot1 += 4;
            
        }

        start = end;
        end = end.clone().add( axis.clone().multiplyScalar(axis_tip_length));

        for(var i = 0; i < divisions; i++)
        {
            // First angle and second angle.
            var a0 = i*dr;
            var a1 = (i+1)*dr;
            
            // Rotate norm vector
            this.quaternion_axis_angle(axis_norm, axis, a0, temp);
            //console.log(temp);
            p0.x = start.x + temp.x*radius*2.0;
            p0.y = start.y + temp.y*radius*2.0;
            p0.z = start.z + temp.z*radius*2.0;

            p1.x = end.x + temp.x*0.001;
            p1.y = end.y + temp.y*0.001;
            p1.z = end.z + temp.z*0.001;
            
            this.quaternion_axis_angle(axis_norm, axis, a1, temp);

            p2.x = end.x + temp.x*0.001;
            p2.y = end.y + temp.y*0.001;
            p2.z = end.z + temp.z*0.001
            
            p3.x = start.x + temp.x*radius*2.0;
            p3.y = start.y + temp.y*radius*2.0;
            p3.z = start.z + temp.z*radius*2.0;

            //console.log(axis_norm);

            //console.log(p0,p1,p2,p3);

            this.element_mesh.push_vertex(p0.x, p0.y, p0.z);
            this.element_mesh.push_vertex(p1.x, p1.y, p1.z);
            this.element_mesh.push_vertex(p2.x, p2.y, p2.z);
            this.element_mesh.push_vertex(p3.x, p3.y, p3.z);

            this.element_mesh.push_uv(0,0);
            this.element_mesh.push_uv(1,0);
            this.element_mesh.push_uv(1,1);
            this.element_mesh.push_uv(0,1);

            var n = p1.sub(p0).cross(p3.sub(p0)).normalize();

            this.element_mesh.push_normal(n.x, n.y, n.z);
            this.element_mesh.push_normal(n.x, n.y, n.z);
            this.element_mesh.push_normal(n.x, n.y, n.z);
            this.element_mesh.push_normal(n.x, n.y, n.z);

            this.element_mesh.push_element(this.element_mesh.index_slot1);
            this.element_mesh.push_element(this.element_mesh.index_slot1+1);
            this.element_mesh.push_element(this.element_mesh.index_slot1+2);
            this.element_mesh.push_element(this.element_mesh.index_slot1);
            this.element_mesh.push_element(this.element_mesh.index_slot1+2);
            this.element_mesh.push_element(this.element_mesh.index_slot1+3);

            this.element_mesh.index_slot1 += 4;
            
        }


    }

    push_cylinder_back(start, end, radius, divisions)
    {
        
        // Clone and test end 
        let clone_end = end.clone().normalize();
    
        // Generate cylinder axis, and axis_norm.
        let axis = end.clone().sub(start).normalize();
        let axis_norm = axis.clone().cross(new THREE.Vector3(axis.x + 0.1 , axis.y + 0.1, axis.z + 0.1)).normalize();

        if ( clone_end.x == clone_end.y && clone_end.y == clone_end.z )
        {
            axis_norm = axis.clone().cross(new THREE.Vector3(axis.x + 0.1 , axis.y + 0.0, axis.z + 0.1)).normalize();
        }

        let dr = (Math.PI*2)/divisions;

        let p0 = new THREE.Vector3(0,0,0);
        let p1 = new THREE.Vector3(0,0,0);
        let p2 = new THREE.Vector3(0,0,0);
        let p3 = new THREE.Vector3(0,0,0);
        
        let temp = new THREE.Vector3(0,0,0);

        for(var i = 0; i < divisions; i++)
        {
            // First angle and second angle.
            var a0 = i*dr;
            var a1 = (i+1)*dr;
            
            // Rotate norm vector
            this.quaternion_axis_angle(axis_norm, axis, a0, temp);
            //console.log(temp);
            p0.x = start.x + temp.x*radius;
            p0.y = start.y + temp.y*radius;
            p0.z = start.z + temp.z*radius;

            p1.x = end.x + temp.x*radius;
            p1.y = end.y + temp.y*radius;
            p1.z = end.z + temp.z*radius;
            
            this.quaternion_axis_angle(axis_norm, axis, a1, temp);

            p2.x = end.x + temp.x*radius;
            p2.y = end.y + temp.y*radius;
            p2.z = end.z + temp.z*radius;
            
            p3.x = start.x + temp.x*radius;
            p3.y = start.y + temp.y*radius;
            p3.z = start.z + temp.z*radius;

            
            //console.log(axis_norm);

            //console.log(p0,p1,p2,p3);

            this.element_mesh.push_vertex(p0.x, p0.y, p0.z);
            this.element_mesh.push_vertex(p1.x, p1.y, p1.z);
            this.element_mesh.push_vertex(p2.x, p2.y, p2.z);
            this.element_mesh.push_vertex(p3.x, p3.y, p3.z);

            this.element_mesh.push_uv(0,0);
            this.element_mesh.push_uv(1,0);
            this.element_mesh.push_uv(1,1);
            this.element_mesh.push_uv(0,1);

            var n = p1.sub(p0).cross(p3.sub(p0)).normalize();

            this.element_mesh.push_normal(n.x, n.y, n.z);
            this.element_mesh.push_normal(n.x, n.y, n.z);
            this.element_mesh.push_normal(n.x, n.y, n.z);
            this.element_mesh.push_normal(n.x, n.y, n.z);

            this.element_mesh.push_element(this.element_mesh.index_slot1);
            this.element_mesh.push_element(this.element_mesh.index_slot1+1);
            this.element_mesh.push_element(this.element_mesh.index_slot1+2);
            this.element_mesh.push_element(this.element_mesh.index_slot1);
            this.element_mesh.push_element(this.element_mesh.index_slot1+2);
            this.element_mesh.push_element(this.element_mesh.index_slot1+3);

            this.element_mesh.index_slot1 += 4;
            
        }
        

    }

};




export default CylinderGrid;

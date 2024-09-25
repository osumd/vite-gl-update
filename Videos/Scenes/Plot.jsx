
import * as THREE from 'three';

// XY Sphere | normal 
import { XYSphere } from '../../Primitives/PrimitiveSphere';
import { ElementSphere } from '../../Primitives/ElementSphere.jsx';
import { OpenCylinder } from '../../Primitives/PrimitiveCylinder.jsx';

// Instanced mesh comment.
import { InstancedMesh } from '../../Primitives/InstancedMesh';

// Import the Chunk Coordinate Plane
import { ChunkCoordinatePlane } from '../../Videos/Scenes/ChunkCoordinatePlane.jsx';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
// Used exclusively for event animation systems. 
class InstanceReference
{


    constructor( instanced_mesh, object_index )
    {
        // Used in the event system to label the type of the instance reference.
        this.tag_type = "instanced_mesh";
        this.instanced_mesh = instanced_mesh;
        this.object_index = object_index;

    }


};

// Plot needs a scene.
class Plot 
{

    // Pass it the global scene context.
    constructor( scene_context, basis_x = new THREE.Vector3(1,0,0), basis_y = new THREE.Vector3(0,1,0), basis_z = new THREE.Vector3(0,0,-1), origin = new THREE.Vector3(0,0,0)  )
    {


        //  Set the basis coordinate system of the plot
        this.origin = origin;
        this.basis_x = basis_x;
        this.basis_y = basis_y;
        this.basis_z = basis_z;

        this.scene_context = scene_context;

        // Default scene
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(90, 1.0, 0.1, 1000);
        this.camera.position.z = 5;
        this.camera.position.y = 2;

        const controls = new OrbitControls(this.camera, this.scene_context.renderer.domElement);
            //controls.target = new THREE.Vector3(0,0,0);

        // Default lights texture vector.

        // Default parameters,  
        this.sphere_mesh = new InstancedMesh ( scene_context, new ElementSphere(3.0) );
        this.line_mesh = new InstancedMesh ( scene_context, new OpenCylinder() );
        this.plane_mesh = new InstancedMesh ( scene_context, new THREE.PlaneGeometry(1,1));

        // Assign the scene of the sphere mesh.
        this.sphere_mesh.assign_scene ( this.scene );
        this.line_mesh.assign_scene ( this.scene );
        this.plane_mesh.assign_scene ( this.scene );


        this.host = undefined;

        // Store some more map type shit
        

    }

    // Converts position to the the coordinate system
    convert_position_to_coordinate ( position )
    {

        let coordinate = new THREE.Vector3(this.origin.x,  this.origin.y, this.origin.z );

        console.log ( this.basis_z );

        coordinate.x += this.basis_x.x * position.x + this.basis_y.x * position.y + this.basis_z.x * position.z;
        coordinate.y += this.basis_x.y * position.x + this.basis_y.y * position.y + this.basis_z.y * position.z;
        coordinate.z += this.basis_x.z * position.x + this.basis_y.z * position.y + this.basis_z.z * position.z;

        return coordinate;


    }

    // adds poin
    add_point ( position = new THREE.Vector3(0,0,0), scale = 0.2 )
    {

        // Convert the position to the coordinate system
        let coordinate = this.convert_position_to_coordinate ( position );

        // Returns an ID of the point, which can be animated
        let point_id = this.sphere_mesh.push ( coordinate, new THREE.Quaternion(0,0,0,0), new THREE.Vector3(scale,scale,scale));

        //console.log ( this.sphere_mesh.InstancedMesh );

        let point_reference = new InstanceReference( this.sphere_mesh.InstancedMesh , point_id );

        return point_reference;

    }

    add_coordinate_plane ( scene )
    {
        let chunk_plane = new ChunkCoordinatePlane ( this.scene_context, this.origin );
        this.scene.add ( chunk_plane.return_mesh() );
    }

    infinity_plane ( )
    {
        let chunk_plane = new ChunkCoordinatePlane ( this.scene_context, this.origin );
        this.scene.add ( chunk_plane.return_mesh() );
    }

    fade_plane ( location, width, height, normal )
    {

        let axis = new THREE.Vector3(0,0,1).cross( normal ).normalize();
        let angle = Math.acos ( new THREE.Vector3(0,0,1).dot ( normal.clone().normalize() ) );

        let plane_id = this.plane_mesh.push ( location, new THREE.Vector3(width, height, 1), new THREE.Quaternion().setFromAxisAngle(axis, angle) );

        let plane_reference = new InstanceReference ( this.plane_mesh.InstancedMesh, plane_id );

        this.scene_context.animate.opacity( plane_reference, 1, 0, 1);
        
    }

    fade_point ( location )
    {

        let point_id = this.sphere_mesh.push ( location, new THREE.Vector3(0.1,0.1,0.1) );

        let point_reference = new InstanceReference ( this.sphere_mesh.InstancedMesh, point_id );

        //this.scene_context.animate.add_event ( {object: point_reference, duration: 1}, { attribute: "opacity", from: 0.0, to: 1.0} );

        this.scene_context.animate.opacity( point_reference, 1, 0, 1);

        return point_reference;

    }

    add_point(location)
    {
        let point_id = this.sphere_mesh.push ( location, new THREE.Vector3(0.1,0.1,0.1) );
        let point_reference = new InstanceReference ( this.sphere_mesh.InstancedMesh, point_id );

        return point_reference;
    }

    add_line ( start, end )
    {
        // Generate the axis
        let axis = end.clone().sub(start).normalize();
        let axis_length = end.clone().sub(start).length();
        let default_axis = new THREE.Vector3(0,1,0);
        let angle = -Math.acos( default_axis.dot(axis) );
        let cross_axis = axis.clone().cross(default_axis).normalize();


        this.line_mesh.push( start, new THREE.Vector3(0.1,axis_length,0.1), new THREE.Quaternion().setFromAxisAngle( cross_axis, angle)  );
    }

    // Register the material of the object hosting the plot
    add_mesh_host ( host )
    {
        this.host = host;
    }



};


export { Plot };
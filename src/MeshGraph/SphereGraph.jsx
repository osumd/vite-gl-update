import { useFrame } from 'react-three-fiber';
import * as THREE from 'three';
import { ShaderMaterial, SphereGeometry } from 'three';
import React from 'react';
import { useRef, useEffect } from 'react';

import { MeshGraph } from './MeshGraph';

function XYSphereGraph({ scene_context, radius, widthSegments, heightSegments})
{
    console.log(scene_context.camera.current);
    let grid_area = 2*(radius);

    let dx = grid_area/widthSegments;
    let dz = grid_area/heightSegments;

    let bufferGeometry = new THREE.BufferGeometry();
    let vertices = new Float32Array((2*4*3*(widthSegments*heightSegments)));
    let normals = new Float32Array((2*4*3*(widthSegments*heightSegments)));
    let uvs = new Float32Array(2*(2*4*(widthSegments*heightSegments)));
    let elements = new Uint16Array(2*(6*(widthSegments*heightSegments)));

    let p0 = new THREE.Vector3(0,0,0);
    let p1 = new THREE.Vector3(0,0,0);
    let p2 = new THREE.Vector3(0,0,0);
    let p3 = new THREE.Vector3(0,0,0);

    var elementPack = [0,0];

    var center = new THREE.Vector3(0,0,0);

    let meshGraph = new MeshGraph();

    for(var i = 0; i < widthSegments; i++)
    {

        let x = i*dx - radius;
        let xp = (i+1)*dx - radius;


        for(var j = 0; j < heightSegments; j++)
        {

            let z = j*dz - radius;
            let zp = (j+1)*dz - radius;
            
            let y = 0.0;
            let yp = 0.0;

            let ypp = 0.0;
            let yppp = 0.0;


            if((x*x + z*z) < (radius))
            {
                y = Math.sqrt(  radius - (x*x) - (z*z) );
            }
            if((xp*xp + zp*zp) < radius)
            {
                yp = Math.sqrt(  radius - (xp*xp) - (zp*zp) );
            }
            if(xp*xp + z*z < radius)
            {
                ypp = Math.sqrt( radius - (xp*xp) - (z*z) );
            }
            if(x*x + zp*zp < radius)
            {
                yppp = Math.sqrt(radius - (x*x) - (zp*zp) );
            }

            let eps = 0.0;
            if(y <= eps && yp <= eps && ypp <= eps && yppp <= eps)
            {
                //continue;
            }
            
            if(y == 0)
            {
                //continue;
            }

            p0.set(-x,y,z);
            p1.set(-xp,ypp,z);
            p2.set(-xp,yp,zp);
            p3.set(-x,yppp,zp);


            var n = p1.clone().sub(p0).cross(p2.clone().sub(p0)).normalize();

            meshGraph.add_node(p0.clone(),n.clone(),new THREE.Vector2(0,0),`{${(i).toString()},${(j).toString()}}`);

            if(i == widthSegments-1)
            {
                meshGraph.add_node(p1.clone(),n.clone(),new THREE.Vector2(0,0),`{${(i+1).toString()},${(j).toString()}}`);
            }

            if(j == heightSegments-1)
            {
                meshGraph.add_node(p3.clone(),n.clone(),new THREE.Vector2(0,0),`{${(i).toString()},${(j+1).toString()}}`);
            }

            if(i == widthSegments-1 && j == heightSegments-1)
            {
                meshGraph.add_node(p2.clone(),n.clone(),new THREE.Vector2(0,0),`{${(i+1).toString()},${(j+1).toString()}}`);
            }
        
            

            p0.set(x,-y,z);
            p1.set(xp,-ypp,z);
            p2.set(xp,-yp,zp);
            p3.set(x,-yppp,zp);

            n = p1.clone().sub(p0).cross(p3.clone().sub(p0)).normalize();


            if( i == 0 || i == widthSegments-1 || j == 0 || j == heightSegments-1)
            {

                //meshGraph.add_edge(`{${(i).toString()},${(j).toString()}}`, "-" + `{${(i).toString()},${(j).toString()}}`);
            }

            meshGraph.add_node(p0.clone(),n.clone(),new THREE.Vector2(0,0),"-"+`{${(i).toString()},${(j).toString()}}`);

            if(i == widthSegments-1)
            {
                meshGraph.add_node(p1.clone(),n.clone(),new THREE.Vector2(0,0),"-"+`{${(i+1).toString()},${(j).toString()}}`);
            }

            if(j == heightSegments-1)
            {
                meshGraph.add_node(p3.clone(),n.clone(),new THREE.Vector2(0,0),"-"+`{${(i).toString()},${(j+1).toString()}}`);
            }

            if(i == widthSegments-1 && j == heightSegments-1)
            {
                meshGraph.add_node(p2.clone(),n.clone(),new THREE.Vector2(0,0),"-"+`{${(i+1).toString()},${(j+1).toString()}}`);
            }
        


        }
    }

    for(var i = 0; i < widthSegments+1; i++)
    {
        for(var j = 0; j < heightSegments+1; j++)
        {
            meshGraph.add_edge(`{${(i).toString()},${(j).toString()}}`, `{${(i).toString()},${(j-1).toString()}}`);
            meshGraph.add_edge(`{${(i).toString()},${(j).toString()}}`, `{${(i+1).toString()},${(j).toString()}}`);
        
            meshGraph.add_edge("-"+`{${(i).toString()},${(j).toString()}}`, "-"+`{${(i).toString()},${(j-1).toString()}}`);
            meshGraph.add_edge("-"+`{${(i).toString()},${(j).toString()}}`, "-"+`{${(i+1).toString()},${(j).toString()}}`);

            if ( i == 0 && j == 0 ) { meshGraph.add_edge(`{${(i).toString()},${(j).toString()}}`, "-"+`{${(i).toString()},${(j).toString()}}`); 
        }

        }
    }


    // operate on the mesh graph
    //meshGraph.fix_bad_neighbors();
    meshGraph.normalize();

    return meshGraph.generate_mesh();



}

export {XYSphereGraph};

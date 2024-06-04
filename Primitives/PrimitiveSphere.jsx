
import * as THREE from 'three';
import { ShaderMaterial, SphereGeometry } from 'three';
import React from 'react';
import { useRef } from 'react';


// Class which returns the geometry but also returns the a simple mesh graph




import {InstancedCylinderAdv} from './InstancedCylinder';

function insert_quad(p0,p1,p2,p3,n,uv,vertices,normals,uvs,elements,current)
{

    let currentVertex = current[0];
    let j = current[1]

    vertices[(currentVertex*12)] = p0.x;
    vertices[(currentVertex*12)+1] = p0.y;
    vertices[(currentVertex*12)+2] = p0.z;

    vertices[(currentVertex*12)+3] = p1.x;
    vertices[(currentVertex*12)+4] = p1.y;
    vertices[(currentVertex*12)+5] = p1.z;

    vertices[(currentVertex*12)+6] = p2.x;
    vertices[(currentVertex*12)+7] = p2.y;
    vertices[(currentVertex*12)+8] = p2.z;

    vertices[(currentVertex*12)+9] = p3.x;
    vertices[(currentVertex*12)+10] = p3.y;
    vertices[(currentVertex*12)+11] = p3.z;

    uvs[(currentVertex*8)] = uv[0];
    uvs[(currentVertex*8)+1] = uv[1];
    
    uvs[(currentVertex*8)+2] = uv[2];
    uvs[(currentVertex*8)+3] = uv[3];

    uvs[(currentVertex*8)+4] = uv[4];
    uvs[(currentVertex*8)+5] = uv[5];

    uvs[(currentVertex*8)+6] = uv[6];
    uvs[(currentVertex*8)+7] = uv[7];

    var n = p1.sub(p0).cross(p3.sub(p0)).normalize();

    normals[(currentVertex*12)] = n.x;
    normals[(currentVertex*12)+1] = n.y;
    normals[(currentVertex*12)+2] = n.z;
    
    normals[(currentVertex*12)+3] = n.x;
    normals[(currentVertex*12)+4] = n.y;
    normals[(currentVertex*12)+5] = n.z;

    normals[(currentVertex*12)+6] = n.x;
    normals[(currentVertex*12)+7] = n.y;
    normals[(currentVertex*12)+8] = n.z;

    normals[(currentVertex*12)+9] = n.x;
    normals[(currentVertex*12)+10] = n.y;
    normals[(currentVertex*12)+11] = n.z;

    elements[(currentVertex*6)] = j;
    elements[(currentVertex*6)+1] = j+1;
    elements[(currentVertex*6)+2] = j+2;

    elements[(currentVertex*6)+3] = j;
    elements[(currentVertex*6)+4] = j+2;
    elements[(currentVertex*6)+5] = j+3

    currentVertex += 1;

    j+=4;

    current[0] = currentVertex;
    current[1] = j;


}

function XYSphere({ radius, widthSegments, heightSegments}){
    
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

            // yppp = Math.sqrt(Math.abs( radius - (x*x) - (zp*zp) ));
            // ypp = Math.sqrt(Math.abs(radius - (xp*xp) - (z*z) ));
            // yp = Math.sqrt( Math.abs( radius - (xp*xp) - (zp*zp) ));
            // y = Math.sqrt( Math.abs( radius - (x*x) - (z*z) ));

            let xtemp = x;

            if((x*x + z*z) < (radius))
            {
                y = Math.sqrt(  radius - (x*x) - (z*z) );

            }
            else
            {

                /* let maxiter = 10000;
                let iter = 0;
                while((x*x + z*z) > radius && iter < maxiter)
                {
                    x += 0.01;
                    y += 0.01;
                    iter += 1;
                } */
                
                
                //y = Math.sqrt(  radius - (x*x) - (z*z) );
            }
            if((xp*xp + zp*zp) < radius)
            {

                yp = Math.sqrt(  radius - (xp*xp) - (zp*zp) );
                
            }
            else{
                yp = 0.0;
            }

            if((xp*xp + z*z) < radius)
            {

                ypp = Math.sqrt( radius - (xp*xp) - (z*z) );
      
                
            }else
            {
                ypp = 0.0;
            }
            if((x*x + zp*zp) < radius)
            {

                yppp = Math.sqrt(radius - (x*x) - (zp*zp) );
                
                
            }else
            {
                yppp = 0.0;
            }



            let eps = 0.0;
            if(y <= eps && yp <= eps && ypp <= eps && yppp <= eps)
            {
                continue;
            }


            





            p0.set(-x,y,z);
            p1.set(-xp,ypp,z);
            p2.set(-xp,yp,zp);
            p3.set(-x,yppp,zp);





            

            //console.log(p0,p1,p2,p3);
            //p2.set(xp,zp,yp);
            //p1.set(xp,zp2,y);
            // p2.set(xp,yp,sn2);
            // p3.set(x,yp,sn);
            // console.log(p0,p1,p2,p3);

            var n = p1.clone().sub(p0).cross(p3.clone().sub(p0)).normalize();

            insert_quad(p0,p1,p2,p3,n,[0,0,1,0,1,1,0,1],vertices,normals,uvs,elements,elementPack)

            p0.set(x,-y,z);
            p1.set(xp,-ypp,z);
            p2.set(xp,-yp,zp);
            p3.set(x,-yppp,zp);

            n = p1.clone().sub(p0).cross(p3.clone().sub(p0)).normalize()

            insert_quad(p0,p1,p2,p3,n,[0,0,1,0,1,1,0,1],vertices,normals,uvs,elements,elementPack)

            x = xtemp;
        }
    }

    bufferGeometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    bufferGeometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
    bufferGeometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
    bufferGeometry.setIndex(new THREE.BufferAttribute(elements, 1));



    return bufferGeometry;

    return (
        <group>
        <mesh geometry={bufferGeometry} material={new THREE.MeshBasicMaterial({ color: 0xff0000, side: THREE.DoubleSide })}>
        </mesh>
        <InstancedCylinderAdv bottom={new THREE.Vector3(-radius,0,-radius)} top={new THREE.Vector3(radius,0,radius)} xdivisions={10} ydivisions={10}></InstancedCylinderAdv>
        </group>
    );



}

function XYSphereAndGraph({ radius, widthSegments, heightSegments}){

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
            if((xp*xp + z*z) < radius)
            {
                ypp = Math.sqrt( radius - (xp*xp) - (z*z) );
            }
            if((x*x + zp*zp) < radius)
            {
                yppp = Math.sqrt(radius - (x*x) - (zp*zp) );
            }

            let eps = 0.0;
            if(y <= eps && yp <= eps && ypp <= eps && yppp <= eps)
            {
                continue;
            }
            

            p0.set(-x,y,z);
            p1.set(-xp,ypp,z);
            p2.set(-xp,yp,zp);
            p3.set(-x,yppp,zp);
            
            var n = p1.clone().sub(p0).cross(p3.clone().sub(p0)).normalize();

            meshGraph.add_node(p0.clone(),n.clone(),new THREE.Vector2(0,0),`{${(i).toString()},${(j).toString()}}`);
            meshGraph.add_node(p1.clone(),n.clone(),new THREE.Vector2(1,0),`{${(i+1).toString()},${(j).toString()}}`);
            meshGraph.add_node(p2.clone(),n.clone(),new THREE.Vector2(1,1),`{${(i+1).toString()},${(j+1).toString()}}`);
            meshGraph.add_node(p3.clone(),n.clone(),new THREE.Vector2(0,1),`{${(i).toString()},${(j+1).toString()}}`);
            
            meshGraph.add_edge(`{${(i).toString()},${(j).toString()}}`,`{${(i+1).toString()},${(j).toString()}}`);
            meshGraph.add_edge(`{${(i).toString()},${(j).toString()}}`,`{${(i).toString()},${(j+1).toString()}}`);

            insert_quad(p0,p1,p2,p3,n,[0,0,1,0,1,1,0,1],vertices,normals,uvs,elements,elementPack)

            p0.set(x,-y,z);
            p1.set(xp,-ypp,z);
            p2.set(xp,-yp,zp);
            p3.set(x,-yppp,zp);

            n = p1.clone().sub(p0).cross(p3.clone().sub(p0)).normalize()

            meshGraph.add_node(p0.clone(),n.clone(),new THREE.Vector2(0,0),   "-" + `{${(i).toString()}, ${(j).toString()}}`   );
            meshGraph.add_node(p1.clone(),n.clone(),new THREE.Vector2(1,0), "-" + `{${(i+1).toString()},${(j).toString()}}`);
            meshGraph.add_node(p2.clone(),n.clone(),new THREE.Vector2(1,1), "-" + `{${(i+1).toString()},${(j+1).toString()}}`);
            meshGraph.add_node(p3.clone(),n.clone(),new THREE.Vector2(0,1), "-" + `{${(i).toString()},${(j+1).toString()}}`);
            
            meshGraph.add_edge( "-"+`{${(i).toString()},${(j).toString()}}`,"-"+`{${(i+1).toString()},${(j).toString()}}`);
            meshGraph.add_edge("-"+`{${(i).toString()},${(j).toString()}}`,"-"+`{${(i).toString()},${(j+1).toString()}}`);

            insert_quad(p0,p1,p2,p3,n,[0,0,1,0,1,1,0,1],vertices,normals,uvs,elements,elementPack)

            

        }
    }

    bufferGeometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    bufferGeometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
    bufferGeometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
    bufferGeometry.setIndex(new THREE.BufferAttribute(elements, 1));




    return bufferGeometry;
}

export {XYSphere};

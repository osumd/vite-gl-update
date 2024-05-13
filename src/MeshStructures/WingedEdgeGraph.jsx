
import React,{useRef,useEffect} from 'react';
import * as THREE from 'three';

class WingedEdge {

    constructor(){




        this.origin = undefined;
        this.destination = undefined;

        this.face_left = undefined;
        this.face_right = undefined;

        this.edge_left_cw = undefined;
        this.edge_right_ccw = undefined;
        this.edge_right_cw = undefined;
        this.edge_right_ccw = undefined;

        this.neighbors = new Array();
    }
}

class WingedNode {

    constructor(position, normal, uv, vertex_id)
    {

        this.vertex_id = vertex_id;
        this.position = position;
        this.normal = normal;
        this.uv = uv;

        this.edge = undefined;
    }
    

}

class Face 
{
    constructor()
    {
        this.incident = undefined;
    }
}

//mesh graph
class WingedEdgeGraph extends React.Component {


    constructor( scene_context ){
        
        super();
        this.scene_context = scene_context;
        this.scene_context.instanceMachine.add_xy_sphere(new THREE.Vector3(1,1,1), 0.5);
        
    }

    

    render() {
    return (
        <div>
        </div>
    );
    }
}




export default WingedEdgeGraph;
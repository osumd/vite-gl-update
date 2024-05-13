import React,{useRef,useEffect} from 'react';
import * as THREE from 'three';


class ReusableText extends React.Component {
    
    constructor()
    {
        //mark a flag if render is neccecary, like on add etc
        //then render to scene with scene context
        super();

        //array of text indexes which are unused
        let useable_text_objects = [];

        let text_objects = [];

    }

    get_new_text_id()
    {
        if ( this.useable_text_objects.length > 0)
        {
            return this.useable_text_objects.pop();
        }else
        {
            this.text_objects.push( new Text() );
            return this.text_objects.length-1;
        }
    }

    add_text({text="", color=0x9966FF, size=0.2, position = new THREE.Vector3(0,0,0), rotation= new THREE.Vector3(0,0,0), quaternion = new THREE.Quaternion(0,0,0,0)})
    {
        let text_id = get_new_text_id();
        
        this.text_objects[text_id].text = text;
        this.text_objects[text_id].size = size;
        this.text_objects[text_id].position = position;
        this.text_objects[text_id].rotation = rotation;
        this.text_objects[text_id].quaternion = quaternion;

        this.text_objects[text_id].sync();
    }

    dispose_text(id)
    {
        this.useable_text_objects.push(id);
    }

    edit_text(id)
    {

    }

    render_to_scene(scene)
    {
        
    }

}
import React,{useRef,useEffect} from 'react';
import * as THREE from 'three';

//Font loading
import {Text} from 'troika-three-text';


class ReusableText extends React.Component {
    
    constructor()
    {
        //mark a flag if render is neccecary, like on add etc
        //then render to scene with scene context
        super();

        //array of text indexes which are unused
        this.useable_text_objects = [];

        this.text_objects = [];

    }

    get_new_text_id()
    {

        if ( this.useable_text_objects.length > 0)
        {
            console.log("REU_TEXT: Found reusable text object!");
            return this.useable_text_objects.pop();
        }else
        {
            this.text_objects.push( new Text() );


            return this.text_objects.length-1;
        }
    }

    add_text({text="", color=0x9966FF, size=1, position = new THREE.Vector3(0,0,0), rotation= new THREE.Vector3(0,0,0), quaternion = new THREE.Quaternion(0,0,0,0)})
    {
        //console.log("buffer?");
        let text_id = this.get_new_text_id();
        
        this.text_objects[text_id].text = text;
        this.text_objects[text_id].fontSize = size;

        

        this.text_objects[text_id].anchorX = "center";
        this.text_objects[text_id].anchorY = "middle";
        this.text_objects[text_id].position.x = position.x;
        this.text_objects[text_id].position.y = position.y;
        this.text_objects[text_id].position.z = position.z;
        //this.text_objects[text_id].rotation = rotation;
        //this.text_objects[text_id].quaternion = quaternion;

        this.text_objects[text_id].sync();


        return text_id;

    }

    dispose_text(id)
    {
        // push the reusable text id onto the text stack
        this.useable_text_objects.push(id);

        // shrink the text object
        this.text_objects[id].text = "";

    }

    // Return text object
    get_text(id)
    {
        return this.text_objects[id];
    }

    edit_text(id)
    {

    }

    render_to_scene(scene)
    {
        // attach all text objects to the scene.

        for ( let i = 0 ; i < this.text_objects.length; i ++)
        {
            scene.add(this.text_objects[i]);
        }

    }

}


export default ReusableText;
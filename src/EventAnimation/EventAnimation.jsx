import React, { useRef } from 'react';
import { useFrame } from 'react-three-fiber';
import * as THREE from 'three';

import {interval_segment_tree, interval_segment_node} from '../DataStructures/interval_segment_tree';


class EventSystem extends React.Component{

    constructor(scene_context)
    {
        super();

        this.paused = true;

        //events
        this.events = [];
        //end point of the last event in events.
        this.events_time_end = 0;

        this.timeline_head = 0;

        this.interval_tree = new interval_segment_tree();
        
        //animateable attributes
        this.animateable_attributes = {"position":this.update_object_position.bind(this), "lookat":this.update_object_lookat.bind(this) };
        
        //get specific attributes from object
        this.retrievable_attributes = {"position": this.get_object_position, "lookat":this.get_object_lookat.bind(this) };
        //interpolation methods
        this.interpolation_methods = { "linear":this.linear_interpolation.bind(this) };
    
    }


    add_event( {object, start="auto", end="auto", duration="auto", isRef=false}, ...args )
    {
        /* console.log("Object: " + object);
        console.log("attributes: " + attributes );
        console.log("start " + start);
        console.log("end " + end);
        console.log("duration " + duration);
        console.log("init" + init);
        console.log("isref" + isRef); */

        //resolve autos
        //if the object is undefined which is the only hard required arg return and die.
        if(object == undefined)
        {
            return;
        }

        // if end is auto and duration is auto ie there is no time topology remove and destroy
        if (end == "auto" && duration == "auto")
        {
            return;
        }

        //set start to the current tail of events added.
        if(start == "auto")
        {
            start = this.events_time_end;
        }

        if(end == "auto")
        {
            end = start+duration;
        }

        //update the timeline end
        //updates the timeline space
        

        //assemble arg array
        let arg_array =  [];
    
        for( let arg of args )
        {

            //filter out bad args
            
            if(arg.to == undefined)
            {
            
                continue;
            }
            
            //
            if(arg.attribute == undefined)
            {
                continue;
            }

            //filter out args withought animateable attributes
            if(this.animateable_attributes[arg.attribute] == undefined )
            {
                continue;
            }

            //let the current value before init be the inital value
            if(arg.from == undefined)
            {
                arg.from = "auto";
            }

            if(arg.easing == undefined)
            {
                arg.easing = "linear";
            }

            if(arg.init == undefined)
            {
                arg.init = false;
            }

            
            //push arg in.
            arg_array.push(arg);


        }

        //if atleast one attribute passed by update and push the event
        if(arg_array.length > 0)
        {
            if(end > this.events_time_end)
            {
                this.events_time_end = end;
            }

            //push the event to the array
            this.events.push({ head: {object,start,end, duration, isRef}, attributes: arg_array });
        }
        
        
    
        
    }

    //methods of interpolation
    linear_interpolation(from, to, t)
    {
        /* console.log(from, to, t); */
        return from + ((to-from)*t);

    }

    //updating objects based on attributes
    get_object_position({head, attribute})
    {
        if(head.isRef == true)
        {
            return head.object.current.position.clone();
        }else
        {
            return head.object.position.clone();
        }
    }

    update_object_position({head, attribute, t})
    {
        
        if(head.isRef == true)
        {  
            
            let x = this.interpolation_methods[easing](attribute.from.x, attribute.to.x, t);
            let y = this.interpolation_methods[easing](attribute.from.y, attribute.to.y, t);
            let z = this.interpolation_methods[easing](attribute.from.z, attribute.to.z, t);


            head.object.current.position.set(x,y,z);

        }else
        {
            let x = this.interpolation_methods[easing](attribute.from.x, attribute.to.x, t);
            let y = this.interpolation_methods[easing](attribute.from.y, attribute.to.y, t);
            let z = this.interpolation_methods[easing](attribute.from.z, attribute.to.z, t);
            
            head.object.position.set(x,y,z);
        }

        
    }

    //subset for the look at position

    get_object_lookat({head, attribute})
    {
        if(head.isRef == true)
        {

            
            
            return head.object.current.quaternion;
        }else
        {
            let forwardVector = new THREE.Vector3(0,0,-1);
            forwardVector.applyQuaternion(head.object.quaternion);

            //get the current location and find the target look at vector
            let current_position = this.get_object_position({head,attribute});
            //console.log(current_position);
            
            attribute.to.sub(current_position);

            let axis = forwardVector.clone().cross(attribute.to).normalize();

            let d = forwardVector.clone().dot(attribute.to.clone());
            let a = Math.acos(d/(forwardVector.length()*attribute.to.length()));
            let q = new THREE.Quaternion().setFromAxisAngle(axis, a);

            attribute.to = q;
            

            return head.object.quaternion;
        }

    }

    update_object_lookat({head, attribute, t})
    {


        if(head.isRef == true)
        {

        }else
        {
            head.object.quaternion.slerpQuaternions(attribute.from,attribute.to, t);
        }
    
    
    }

    update_events()
    {

        for(let i = 0 ; i < this.events.length; i++)
        {

            let event = this.events[i];
            let event_head = this.events[i].head;
            let event_attributes = this.events[i].attributes;


            if ( this.timeline_head > event_head.start && this.timeline_head < event_head.end )
            {
                //measure the distance past start as t
                let t = (this.timeline_head - event_head.start) / event_head.duration;
                
                for(let attribute_index = 0; attribute_index < event_attributes.length; attribute_index++)
                {
                    //attribute_title
                    let attribute_title = event_attributes[attribute_index].attribute;

                    //if this is the first time the event attributes was encountered then set the init
                    if(event_attributes[attribute_index].init == false)
                    {
                        //console.log("updating");
                        event_attributes[attribute_index].from  = this.retrievable_attributes[attribute_title]({head:event_head, attribute:event_attributes[attribute_index]});
                        event_attributes[attribute_index].init = true;
                    }

                    

                    this.animateable_attributes[event_attributes[attribute_index].attribute]({head: event_head, attribute: event_attributes[attribute_index], t:t});


                }  

            }

        }
        

    }

    update(elapsed_time)
    {

        if(this.paused)
        {

        }else
        {
            this.timeline_head += elapsed_time;
            this.update_events();
        }

    }

    componentDidMount()
    {

        let play_button = document.getElementById("play_button");
        play_button.addEventListener("click", () => {
            this.paused = false;
        });

        document.getElementById("pause_button").addEventListener("click", () => {
            this.paused = true;
        });

        


    }

    render()
    {   
        return (
        <p className="sequence_player">
                        <span id="play_button" className="sequence_player_item">Play</span> 
                        <span id="pause_button" >Pause</span>
        </p>
        );
    }
};

function EventAnimation(scene_context)
{

    let old_frame_time = 0;
    let new_frame_time = 0;


    scene_context.eventSystem.current.add_event(
        {object: scene_context.camera, duration:10, isRef:true},
        {attribute:"position", to: new THREE.Vector3(1,0,2)}
    );
    scene_context.eventSystem.current.add_event(
        {object: scene_context.camera, duration:3, isRef:true},
        {attribute:"position", to: new THREE.Vector3(1,-1,2)}
    );

    useFrame((scene) => {

        
        new_frame_time = scene.clock.elapsedTime;
        let elapsed_frame_time = new_frame_time - old_frame_time;


        if(scene_context.eventSystem.current.paused == true)
        {
            //return;
        }else
        {
            scene_context.eventSystem.current.timeline_head += elapsed_frame_time;
            scene_context.eventSystem.current.update_events();
        } 


        
        old_frame_time = new_frame_time;

    });

    return (<group></group>);
}




export {EventAnimation, EventSystem};
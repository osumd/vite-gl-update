import React, { useRef } from 'react';
import { useFrame } from 'react-three-fiber';
import * as THREE from 'three';

import {interval_segment_tree, interval_segment_node} from '../DataStructures/interval_segment_tree';


class EventSystem extends React.Component{

    constructor()
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
        this.animateable_attributes = {"position":this.update_object_position.bind(this) };
        
        //get specific attributes from object
        this.retrievable_attributes = {"position": this.get_object_position};
        //interpolation methods
        this.interpolation_methods = {"linear":this.linear_interpolation.bind(this)};
    
    }


    add_event( {object, start="auto", end="auto", duration, isRef=false}, ...args )
    {
        /* console.log("Object: " + object);
        console.log("attributes: " + attributes );
        console.log("start " + start);
        console.log("end " + end);
        console.log("duration " + duration);
        console.log("init" + init);
        console.log("isref" + isRef); */

        //resolve autos

        if(object == undefined || duration == undefined)
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

        if(end > this.events_time_end)
        {
            this.events_time_end = end;
        }

        //assemble arg array
        let arg_array =  [];
    
        for( let arg of args )
        {

            

            //filter out bad args
            
            if(arg.to == undefined)
            {
            
                continue;
            }

            //filter out args withought animateable attributes
            if(this.animateable_attributes[arg.attribute] == undefined )
            {
                continue;
            }

/*             //filter out args withought duration

            if(arg.duration == undefined)
            {
                continue;
            } */

            

            //set up variables already verifed
            let new_attribute_arg = {};

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
        
        //push the event to the array
        this.events.push({ head: {object,start,end, duration, isRef}, attributes: arg_array });

        /* console.log(this.events); */
        
    }

    //methods of interpolation
    linear_interpolation(from, to, t)
    {
        /* console.log(from, to, t); */
        return from + (to-from)*t;

    }

    //updating objects based on attributes
    get_object_position({object, isRef})
    {
        if(isRef == true)
        {
            return object.current.position;
        }else
        {
            return object.position;
        }
    }

    update_object_position({object, start, end, duration,  isRef}, {attribute, from, to, easing, init}, t)
    {
        
        if(isRef == true)
        {
            
            //console.log(from, to, t);
            
            
            let x = this.interpolation_methods[easing](from.x, to.x, t);
            let y = this.interpolation_methods[easing](from.y, to.y, t);
            let z = this.interpolation_methods[easing](from.z, to.z, t);

            console.log("("+x+ ", " + y + ", " + z + ")"); 


        }else
        {

        }

        
    }

    update_events()
    {

        

        for(let i = 0 ; i < this.events.length; i++)
        {

            let event = this.events[i];
            let event_head = this.events[i].head;
            let event_attributes = this.events[i].attributes;

            //console.log(event);

            if(this.timeline_head > event_head.start && this.timeline_head < event_head.start + event_head.duration)
            {

                let t = (this.timeline_head - event_head.start) / event_head.duration;
                
                
                
                for(let attribute_index = 0; attribute_index < event_attributes.length; attribute_index++)
                {

                    //if this is the first time the event attributes was encountered then set the init
                    if(event_attributes[attribute_index].init == false)
                    {
                        event_attributes[i].from  = this.retrievable_attributes[event_attributes[i].attribute]({object:event_head.object, isRef:event_head.isRef});
                        event_attributes[attribute_index].init = true;
                    }

                    let event_attribute = event_attributes[attribute_index];

                    this.animateable_attributes[event_attribute.attribute](event_head,event_attribute, t);


                }  

            }

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
            scene_context.eventSystem.current.update_events(scene_context.camera);
        } 


        
        old_frame_time = new_frame_time;

    });

    return (<group></group>);
}


export {EventAnimation, EventSystem};
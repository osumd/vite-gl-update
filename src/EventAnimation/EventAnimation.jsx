import React, { useRef } from 'react';
import * as THREE from 'three';

import {interval_segment_tree, interval_segment_node} from '../DataStructures/interval_segment_tree';


class EventSystem extends React.Component{

    constructor(scene_context)
    {
        super();

        // Allow the scene context to propogate
        this.scene_context = scene_context;
        //this.scene_context.instanceMachine.primitive_reference["xy_sphere"].setMatrixAt(0, new THREE.Matrix4().setPosition(0,2, 0));
        this.paused = false;

        //events
        this.events = [];
        //end point of the last event in events.
        this.events_time_end = 0;

        this.timeline_head = 0;

        this.interval_tree = new interval_segment_tree();
        
        //Supported primitive types.
        this.supported_primitive_types = {
            "open_cylinder": 0,
            "xy_sphere": 1
        };

        //animateable attributes
        this.animateable_attributes = {
            "position":this.update_object_position.bind(this),
            "scale":this.update_object_scale.bind(this), 
            "lookat":this.update_object_lookat.bind(this),
            "orthoview":this.update_object_orthoview.bind(this),
        };

        // Setable attributes
        this.settable_attributes = {
            "scale":this.set_object_scale.bind(this), 
        };
        
        //get specific attributes from object
        this.retrievable_attributes = {
            "position": this.get_object_position.bind(this),
            "scale": this.get_object_scale.bind(this), 
            "lookat":this.get_object_lookat.bind(this),
            "orthoview":this.get_object_orthoview.bind(this),
            "dispose":this.get_animation_group_dispose.bind(this),
        };


        //interpolation methods
        this.interpolation_methods = { "linear":this.linear_interpolation.bind(this) };
    

        // Section for animation groups, which stores indices to events which are located inside of a current group currently only supports text
        // Name of current animation group
        this.current_animation_group = "empty";
        // Index of current animation group, used if no name is given.
        this.animation_group_index = 0;
        // Associative array of arrays which have events in them.
        this.animation_groups = {};

    }

    // Adders | Add stuff to this this is a mess
    add_event( {object, start="auto", end="auto", duration="auto", isRef=false, isText=false, primitive=false}, ...args )
    {
        
        /* console.log("Object: " + object);
        console.log("attributes: " + args );
        console.log("start " + start);
        console.log("end " + end);
        console.log("duration " + duration); */
        //console.log(args);
        /* console.log("isref" + isRef); 
        console.log("isText", isText); */

        //resolve autos

        // Condition to solve whether the primitive flag is set, and the primitive is not an available primitive.

        if ( primitive != false && this.supported_primitive_types[primitive] == undefined )
        {
            console.log("EVENT_SYSTEM: Denied primitive type!");
            return;
        }

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
            
            // console.log(`Arg Layout: `);
            // console.log(`To: ${arg.to}`);
            // console.log(`Attribute: ${arg.attribute}`);
            
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

            

            if(arg.easing == undefined)
            {
                arg.easing = "linear";
            }

            //let the current value before init be the inital value
            if(arg.from == undefined)
            {
                arg.from = "auto";
                
            }else
            {
                arg.init = true;

                if ( this.settable_attributes[arg.attribute] != undefined )
                {
                    this.settable_attributes[arg.attribute]({head: {object, start, end, duration, isRef, isText, primitive}, value: arg.from});
                }

            }

            if(arg.init == undefined)
            {
                //console.log('fail');
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

            //console.log("EVENT_SYSTEM: Event added!");
            //push the event to the array
            this.events.push({ head: {object,start,end, duration, isRef, isText, primitive}, attributes: arg_array });

            //console.log("ADD_EVENT: Current animation group! : ", this.current_animation_group);
            // If a current group is active then report its index in the events array, in the future this would be a name from a hash map for easier removal.
            if ( this.current_animation_group != "empty" )
            {
                
                // Push the tail index of the recently pushed event.
                if ( this.animation_groups[this.current_animation_group] != undefined && isText == true)
                {
                    
                    this.animation_groups[this.current_animation_group].push( this.events.length - 1 );
                    //console.log("ADD_EVENT: current animation group: ", this.animation_groups[this.current_animation_group]);
                }
                
            }

            

        }
        
        
    
        
    }
    
    //adds text into the timeline
    add_text( {text="", duration="auto", color=0x9966FF, size=1, position = new THREE.Vector3(0,0,0), rotation= new THREE.Vector3(0,0,0), quaternion = new THREE.Quaternion(0,0,0,0)}, ...args )
    {
        
        // Reach out to the scene context and ask it to generate some friendly text for me
        let id = this.scene_context.reusable_text.add_text({text, color, size, position, rotation, quaternion});

        //console.log("Event System: Text Function", this.scene_context.reusable_text.get_text(id))
        // for (let arg of args)
        // {
        //     console.log(arg.to);
        // } 
        //console.log("ADD_TEXT: Arg TO " + args[0].to)

        //add_event({id})
        this.add_event({object: id, duration:duration, isText:true}, ...args);

    }

    // Add animation group for easy to disposal
    add_animation_group(group_name = "empty")
    {
        if  ( group_name == "empty" )
        {
            // Set to string value
            group_name = this.animation_group_index.toString();
            //console.log("ADD_ANIMATION_GROUP: Add group", group_name);
            this.animation_group_index++;
            
        }

        // Otherwise push a new array to the animation group
        this.animation_groups[group_name] = []
        //console.log("ADD_ANIMATION_GROUP: animation groups", this.animation_groups[group_name]);
        this.current_animation_group = group_name;

        //console.log("ADD_ANIMATION_GROUP: current animation group: ", group_name, this.animation_groups[group_name]);
    }

    // Creates a dispose event compatible with the current update events cycle.
    dispose_animation_group(group_name = "empty")
    {
        if ( this.current_animation_group == "empty" )
        {
            return;
        }

        if  ( group_name == "empty" )
        {
            // Set to string value
            group_name = this.current_animation_group;
        }

        

        // Create event 
        let event = { head: {object: group_name, start: this.events_time_end, end: this.events_time_end+1, duration: 1, isRef: false, isText: false, primitive: false}, attributes: [{ attribute: "dispose", init:false }] }
        if(event.end > this.events_time_end)
        {
            this.events_time_end = event.end;
        }
//        console.log("DISPOE_ANIMATION_GROUP: event", event);

        // Then push the event
        this.events.push(event);

        return event;


    }

    // Dispose of animation group using the attribute
    get_animation_group_dispose({head, attribute})
    {
        
        //console.log("f");
        // Group name is the head object.
        let group_name = head.object;
    
        // If the group name is zero then dispose the current animation group
        if ( group_name == 0 )
        {
            group_name = this.current_animation_group;
        }

        // Else we loop through the array in the hash map and depending on if the underlying type has a disposal method then we dispose of it.
        let group = this.animation_groups[group_name];
        
        for ( let e = 0; e < group.length; e++ )
        {
            //Group index
            let event_index = group[e];
            // For simplicity we will just consider text
            let event = this.events[event_index];

            //console.log(event, event_index);
            // For example if it is a disposable object then dispose of it.
            if ( event.head.isText == true )
            {

                // Access the reusable_text from the scene context, and dispose of it.
                this.scene_context.reusable_text.dispose_text(event.head.object);

                // Then pop it from the event array
                //this.events.splice(event_index, event_index);

            }

        }

        // Add support for also removing this disposition event.

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
        //console.log("UPDATE_OBJECT: this" + this.scene_context);
        if(head.isRef == true)
        {
            return head.object.current.position.clone();
        }else if (head.isText == true )
        {
            let object = this.scene_context.reusable_text.get_text(head.object);
            
            return object.position.clone();
        }
        else if ( head.primitive != false )
        {
            // Uses the get world functionality by indexing by primitive type.
            let position = new THREE.Vector3();
            let quaternion = new THREE.Quaternion();
            let scale = new THREE.Vector3();

            let primitive_instanced = this.scene_context.instanceMachine.primitive_reference[head.primitive];

            console.log("EVENT_SYSTEM: primitive instanced : ", primitive_instanced);

            let instanceMatrix = new THREE.Matrix4();
            primitive_instanced.getMatrixAt(head.object, instanceMatrix);
            console.log("EVENT_SYSTEM: primtive matrix", primitive_instanced);

            instanceMatrix.decompose(position, quaternion, scale);
            console.log("EVENT_SYSTEM: decomposition: ", position, quaternion, scale);

            return position;

        }else
        {
            return head.object.position.clone();
        }
    }

    update_object_position({head, attribute, t})
    {
            
        if(head.isRef == true)
        {  
            //set easing from attribute arg
            let easing = attribute.easing;

            let x = this.interpolation_methods[easing](attribute.from.x, attribute.to.x, t);
            let y = this.interpolation_methods[easing](attribute.from.y, attribute.to.y, t);
            let z = this.interpolation_methods[easing](attribute.from.z, attribute.to.z, t);


            head.object.current.position.set(x,y,z);

        }else if ( head.isText == true)
        {
            let easing = attribute.easing;

            let x = this.interpolation_methods[easing](attribute.from.x, attribute.to.x, t);
            let y = this.interpolation_methods[easing](attribute.from.y, attribute.to.y, t);
            let z = this.interpolation_methods[easing](attribute.from.z, attribute.to.z, t);
            
            let object = this.scene_context.reusable_text.get_text(head.object);
            

            object.position.set(x,y,z);
            
        }
        else if ( head.primitive != false )
        {
            
            let easing = attribute.easing;

            let x = this.interpolation_methods[easing](attribute.from.x, attribute.to.x, t);
            let y = this.interpolation_methods[easing](attribute.from.y, attribute.to.y, t);
            let z = this.interpolation_methods[easing](attribute.from.z, attribute.to.z, t);

            let instance_matrix = new THREE.Matrix4();

            this.scene_context.instanceMachine.primitive_reference[head.primitive].getMatrixAt(head.object, instance_matrix);
            
            let position = new THREE.Vector3();
            let quaternion = new THREE.Quaternion();
            let scale = new THREE.Vector3();
            
            instance_matrix.decompose(position, quaternion, scale);

            position.set(x,y,z);
            instance_matrix.compose(position, quaternion, scale);

            this.scene_context.instanceMachine.primitive_reference[head.primitive].setMatrixAt(head.object, instance_matrix);

            this.scene_context.instanceMachine.primitive_reference[head.primitive].instanceMatrix.needsUpdate = true;

        }else
        {
            //set easing from attribute arg
            let easing = attribute.easing;

            let x = this.interpolation_methods[easing](attribute.from.x, attribute.to.x, t);
            let y = this.interpolation_methods[easing](attribute.from.y, attribute.to.y, t);
            let z = this.interpolation_methods[easing](attribute.from.z, attribute.to.z, t);
            
            head.object.position.set(x,y,z);
        }

        
    }

    get_object_scale({head, attribute})
    {
        //console.log("UPDATE_OBJECT: this" + this.scene_context);
        if(head.isRef == true)
        {
            
            return head.object.current.scale.clone();
        }else if (head.isText == true )
        {
            let object = this.scene_context.reusable_text.get_text(head.object);
            
            return object.fontSize;
        }
        else if ( head.primitive != false )
        {
            // Uses the get world functionality by indexing by primitive type.
            let position = new THREE.Vector3();
            let quaternion = new THREE.Quaternion();
            let scale = new THREE.Vector3();

            let primitive_instanced = this.scene_context.instanceMachine.primitive_reference[head.primitive];

            console.log("EVENT_SYSTEM: primitive instanced : ", primitive_instanced);

            let instanceMatrix = new THREE.Matrix4();
            primitive_instanced.getMatrixAt(head.object, instanceMatrix);
            console.log("EVENT_SYSTEM: primtive matrix", primitive_instanced);

            instanceMatrix.decompose(position, quaternion, scale);
            //console.log("EVENT_SYSTEM: decomposition: ", position, quaternion, scale);

            return scale;

        }else
        {
            return head.object.scale.clone();
        }
    }

    set_object_scale({head, value})
    {
        if(head.isRef == true)
        {  

            head.object.current.scale.set(value.x, value.y, value.z);

        }else if ( head.isText == true)
        {

            let object = this.scene_context.reusable_text.get_text(head.object);
            

            object.scale.set(value.x, value.y, value.z);
            
        }
        else if ( head.primitive != false )
        {
            
            let easing = attribute.easing;

            let x = this.interpolation_methods[easing](attribute.from.x, attribute.to.x, t);
            let y = this.interpolation_methods[easing](attribute.from.y, attribute.to.y, t);
            let z = this.interpolation_methods[easing](attribute.from.z, attribute.to.z, t);

            let instance_matrix = new THREE.Matrix4();

            this.scene_context.instanceMachine.primitive_reference[head.primitive].getMatrixAt(head.object, instance_matrix);
            
            let position = new THREE.Vector3();
            let quaternion = new THREE.Quaternion();
            let scale = new THREE.Vector3();
            
            instance_matrix.decompose(position, quaternion, scale);

            scale.set(value.x, value.y, value.z);
            instance_matrix.compose(position, quaternion, scale);

            this.scene_context.instanceMachine.primitive_reference[head.primitive].setMatrixAt(head.object, instance_matrix);

            this.scene_context.instanceMachine.primitive_reference[head.primitive].instanceMatrix.needsUpdate = true;

        }else
        {            
            head.object.scale.set(value.x, value.y, value.z);
        }
    }

    update_object_scale({head, attribute, t})
    {
            
        if(head.isRef == true)
        {  
            //set easing from attribute arg
            let easing = attribute.easing;

            let x = this.interpolation_methods[easing](attribute.from.x, attribute.to.x, t);
            let y = this.interpolation_methods[easing](attribute.from.y, attribute.to.y, t);
            let z = this.interpolation_methods[easing](attribute.from.z, attribute.to.z, t);


            head.object.current.scale.set(x,y,z);

        }else if ( head.isText == true)
        {
            //console.log("okay");
            let easing = attribute.easing;

            let x = this.interpolation_methods[easing](attribute.from.x, attribute.to.x, t);
            let y = this.interpolation_methods[easing](attribute.from.y, attribute.to.y, t);
            let z = this.interpolation_methods[easing](attribute.from.z, attribute.to.z, t);
            
            let object = this.scene_context.reusable_text.text_objects[head.object];
            object.scale.set(x,y,z);
            
            
        }
        else if ( head.primitive != false )
        {
            
            let easing = attribute.easing;

            let x = this.interpolation_methods[easing](attribute.from.x, attribute.to.x, t);
            let y = this.interpolation_methods[easing](attribute.from.y, attribute.to.y, t);
            let z = this.interpolation_methods[easing](attribute.from.z, attribute.to.z, t);

            let instance_matrix = new THREE.Matrix4();

            this.scene_context.instanceMachine.primitive_reference[head.primitive].getMatrixAt(head.object, instance_matrix);
            
            let position = new THREE.Vector3();
            let quaternion = new THREE.Quaternion();
            let scale = new THREE.Vector3();
            
            instance_matrix.decompose(position, quaternion, scale);

            scale.set(x,y,z);
            instance_matrix.compose(position, quaternion, scale);

            this.scene_context.instanceMachine.primitive_reference[head.primitive].setMatrixAt(head.object, instance_matrix);

            this.scene_context.instanceMachine.primitive_reference[head.primitive].instanceMatrix.needsUpdate = true;

        }else
        {
            //set easing from attribute arg
            let easing = attribute.easing;

            let x = this.interpolation_methods[easing](attribute.from.x, attribute.to.x, t);
            let y = this.interpolation_methods[easing](attribute.from.y, attribute.to.y, t);
            let z = this.interpolation_methods[easing](attribute.from.z, attribute.to.z, t);
            
            head.object.scale.set(x,y,z);
        }

        
    }

    //subset for the look at position
    get_object_lookat({head, attribute})
    {
        if(head.isRef == true)
        {
        
            return head.object.current.quaternion.clone();
        }else
        {

            
            let forwardVector = new THREE.Vector3(0, 0, -1);
            forwardVector.applyQuaternion(head.object.quaternion.clone()).normalize();

            let current_position = this.get_object_position({ head, attribute });

            // Ensure current_position and attribute.to are Vector3 objects
            current_position = new THREE.Vector3(current_position.x, current_position.y, current_position.z);
            attribute.to = new THREE.Vector3(attribute.to.x, attribute.to.y, attribute.to.z);

            let look = attribute.to.clone().sub(current_position).normalize();

            // If the vectors are very similar, just return the current quaternion
            if (forwardVector.dot(look) > 0.9999) {
                return head.object.quaternion.clone();
            }

            let euler = new THREE.Euler();
            euler.setFromQuaternion(head.object.quaternion, 'YXZ'); // Adjust order if necessary

            // Calculate rotation angles
            let pitch = Math.atan2(look.y, Math.sqrt(look.x * look.x + look.z * look.z));
            let yaw = Math.atan2(-look.x, -look.z);

            // Set Euler angles
            euler.set(pitch, yaw, 0, 'YXZ'); // Adjust order if necessary

            // Convert Euler angles back to quaternion
            let q = new THREE.Quaternion().setFromEuler(euler);

            attribute.to = q.clone();

            return head.object.quaternion.clone();


        }

    }

    update_object_lookat({head, attribute, t})
    {


        if(head.isRef == true)
        {

        }else
        {
            ///let sQ = attribute.from.clone().slerp(attribute.to.clone(), t);
            
            // Assign the slerped quaternion to the object's quaternion
            //head.object.quaternion.copy(sQ);
            //head.object.quaternion.slerp(attribute.to, t);

            //console.log(t);

            /* head.object.rotation.copy(new THREE.Euler().setFromQuaternion(sQ)); */
            head.object.quaternion.slerpQuaternions(attribute.from.clone(),attribute.to.clone(), t);
        }
    
    
    }

    // Sets attribute toQuat to rotate to ortho plane, and position to distance about object.
    get_object_orthoview({head,attribute})
    {
        if(head.isRef == true)
        {
            return head.object.current.quaternion.clone();
        }else
        {

            let forwardVector = new THREE.Vector3(0, 0, -1);
            forwardVector.applyQuaternion(head.object.quaternion.clone()).normalize();

            let orthoaxis;
            if ( attribute.axis == "x" )
            {
                
                orthoaxis = new THREE.Vector3(-1,0,0);
            }
            else if ( attribute.axis == "y" )
            {
                orthoaxis = new THREE.Vector3(0,-1,0);
            }
            else if ( attribute.axis == "z" )
            {
                orthoaxis = new THREE.Vector3(0,0,-1);
            } else
            {
                console.log("EVENT_SYSTEM: Died no axis defined.");
                return;
            }
            
            //Get object current postion
            let object_position = attribute.to;

            // Fix the cross axis between forward and ortho
            let cross_axis = orthoaxis.clone().cross( forwardVector );

            // Find the dot product between the the forward and ortho.
            let dot = forwardVector.dot(cross_axis);

            // Define euler
            let euler = new THREE.Euler();
            euler.setFromQuaternion(head.object.quaternion, 'YXZ');

            // Calculate rotation angles
            let pitch = Math.atan2(orthoaxis.y, Math.sqrt(orthoaxis.x * orthoaxis.x + orthoaxis.z * orthoaxis.z));
            let yaw = Math.atan2(-orthoaxis.x, -orthoaxis.z);

            // Set Euler angles
            euler.set(pitch, yaw, 0, 'YXZ'); // Adjust order if necessary

            // Convert Euler angles back to quaternion
            let q = new THREE.Quaternion().setFromEuler(euler);

            let normo_axis = orthoaxis.clone().multiplyScalar(-1);
            let new_position = object_position.clone().add(normo_axis.multiplyScalar(attribute.distance));            

            attribute.fromQuat = head.object.quaternion.clone();
            attribute.toQuat = q.clone();
            attribute.fromPos = head.object.position.clone();
            attribute.toPos = new_position;

            return head.object.quaternion.clone();
        }
    }

    // Updates.
    update_object_orthoview({head,attribute,t})
    {
        if(head.isRef == true)
        {

        }else
        {

            //set easing from attribute arg
            let easing = attribute.easing;

            let x = this.interpolation_methods[easing](attribute.fromPos.x, attribute.toPos.x, t);
            let y = this.interpolation_methods[easing](attribute.fromPos.y, attribute.toPos.y, t);
            let z = this.interpolation_methods[easing](attribute.fromPos.z, attribute.toPos.z, t);
            
            head.object.position.set(x,y,z);

            head.object.quaternion.slerpQuaternions(attribute.fromQuat.clone(),attribute.toQuat.clone(), t);
        }
    }

    update_events()
    {

        //console.log("UPDATE_EVENTS: length", this.events.length);
        for(let i = 0 ; i < this.events.length; i++)
        {
                        
            let event = this.events[i];
            let event_head = this.events[i].head;
            let event_attributes = this.events[i].attributes;

           

            if ( this.timeline_head >= event_head.start && this.timeline_head <= event_head.end )
            {
                //measure the distance past start as t
                let t = (this.timeline_head - event_head.start) / event_head.duration;
                //console.log("UPDATE_EVENTS: attribute", event_attributes);

              //console.log(`i: ${i} head: ${this.timeline_head} start: ${event_head.start} end: ${event_head.duration} t: ${t}`);

                for(let attribute_index = 0; attribute_index < event_attributes.length; attribute_index++)
                {
                    
                    //attribute_title
                    let attribute_title = event_attributes[attribute_index].attribute;

                    //console.log(event_attributes[attribute_index].init)

                    //if this is the first time the event attributes was encountered then set the init
                    if(event_attributes[attribute_index].init == false && this.retrievable_attributes[attribute_title] != undefined)
                    {
                        event_attributes[attribute_index].from  = this.retrievable_attributes[attribute_title]({head:event_head, attribute:event_attributes[attribute_index]});

                        event_attributes[attribute_index].init = true;
                    }

                    
                    if ( this.animateable_attributes[attribute_title] != undefined )
                    {
                        this.animateable_attributes[attribute_title]({head: event_head, attribute: event_attributes[attribute_index], t:t});
                    }
                    


                }  

            }

        }
        

    }

    update(elapsed_time)
    {

        if(this.paused)
        {
            //console.log("EVENT_SYSTEM: Paused");
        }else
        {
            //console.log(`EVENT_ANIM: ${elapsed_time}`);
            //console.log(`EVENT_ANIM: Pre time ${this.timeline_head}`);
            this.timeline_head += elapsed_time;
            //console.log(`EVENT_ANIM: Post time ${this.timeline_head}`);

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
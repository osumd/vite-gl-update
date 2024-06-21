import { Dequeue } from "../DataStructures/Dequeue";
import * as THREE from 'three';

export class FUIDoc
{

    constructor( scene_context )
    {
        this.scene_context = scene_context;

        // Store the components of the frustrum plane.
        this.camera_up = new THREE.Vector3(0,1,0);
        this.camera_right = new THREE.Vector3(1,0,0);
        this.camera_center = new THREE.Vector3(0,0,0);
        this.camera_origin = new THREE.Vector3(0,0,0);

        // Store a map to the nodes neccecary
        this.document_map = {

        };

        // Store the standard bounding container
        this.standard_bounding = [0,1,1,0];

        // Store relative block placement transform within the parent.
        this.relative_transform = new THREE.Vector3(0,0,0);
    }

    // Update the plane details
    update_camera_far_plane()
    {
        let frustrumPlaneDistance = 6;

        let camera_rotation = this.scene_context.camera.quaternion.clone();
        let camera_forward  = new THREE.Vector3(0,0,-1).applyQuaternion(camera_rotation);

        this.camera_up = this.scene_context.camera.up.clone();
        this.camera_right = camera_forward.clone().cross(this.camera_up).normalize();

        let camera_fov = this.scene_context.camera.fov;

        let camera_far_half_distance = frustrumPlaneDistance*Math.tan(((camera_fov)*(3.14159265359/180))/2);

        this.camera_center = this.scene_context.camera.position.clone().add(camera_forward.multiplyScalar(5));
        //console.log(this.camera_center);
        this.camera_origin = this.camera_center.clone().sub(this.camera_right.clone().multiplyScalar(4)).sub(this.camera_up.clone().multiplyScalar(4));

        this.camera_up.multiplyScalar(8);
        this.camera_right.multiplyScalar(8);
        //console.log(this.camera_origin);
        
        // Update the standard bounding
        


    }
    
    parse(ui_string)
    {

        // Build the root of the ui string
        let root = this.scene_context.fui_parser.parse_ui(ui_string);
        
        // Render the fui tree from the root
        this.render_fui_tree(root);

    }

    update_position(node)
    {
        if ( node.position_set == true )
        {
            // Then its assumed the node is absolute, this position.

            let parent_container;

            if ( node.parent != undefined )
            {
                parent_container = node.parent;

            }else
            {
                parent_container = this.standard_bounding;
                // Use the standard bounding container.
            }

            // Use the parents bounding container and absolute coordinates to choose the position
            let x = parent_container[0];
            let y = parent_container[1];

            let z = parent_container[2];
            let w = parent_container[3];

            // Use the parent bounding to calculate position.
            // If the nodes position is relative to the top left corner then.
            node.calculated_position[0] = x + (node.position[0] * (z-x));
            node.calculated_position[1] = y + (node.position[1] * (w-y));

            return;

        }

        // If the parent does not exist use the standard bounding container for position.
        if( node.parent != undefined )
        {
            node.calculated_position[0] = node.parent.calculated_position[0] + (this.relative_transform.x * this.camera_right.x) + (this.relative_transform.y * this.camera_up.x);
            node.calculated_position[1] = node.parent.calculated_position[1] + (this.relative_transform.x * this.camera_right.y) + (this.relative_transform.y * this.camera_up.y);
            node.calculated_position[2] = node.parent.calculated_position[2] + (this.relative_transform.x * this.camera_right.z) + (this.relative_transform.y * this.camera_up.z);

        }else
        {
            // Calculate the position along the axis vectors of the camera plane.
            
            node.calculated_position[0] = parseFloat(this.camera_origin.x.toFixed(3)) + (this.standard_bounding[0] * this.camera_right.x) + (this.standard_bounding[1] * this.camera_up.x);

            node.calculated_position[1] = parseFloat(this.camera_origin.y.toFixed(3)) + (this.standard_bounding[0] * this.camera_right.y) + (this.standard_bounding[1] * this.camera_up.y);

            node.calculated_position[2] = parseFloat(this.camera_origin.z.toFixed(3)) + (this.standard_bounding[0] * this.camera_right.z) + (this.standard_bounding[1] * this.camera_up.z);

            console.log("updated", node.calculated_position);
        }
    }

    // Estimates size of the text content
    estimate_size(node)
    {
        let estimated_width = node.textContent.length * node.fontSize;
        let estimated_height = node.fontSize*1.2;
        return [estimated_width, estimated_height];
    }

    update_dimension(node)
    {
        // Estimate the size of the content (later).
        let estimated_content_size = this.estimate_size(node); 

        // Find the parent container.
        let parent_container;

        if ( node.parent != undefined )
        {
            parent_container = node.parent;

        }else
        {
            parent_container = this.standard_bounding;
            // Use the standard bounding container.
        }

        // Use the parents bounding container and absolute coordinates to choose the position
        let x = parent_container[0];
        let y = parent_container[1];

        let z = parent_container[2];
        let w = parent_container[3];

        node.calculated_bounding[0] = node.calculated_position[0];
        node.calculated_bounding[1] = node.calculated_position[1];
        node.calculated_bounding[2] = node.calculated_position[0] + (node.width*(z-x));
        node.calculated_bounding[3] = node.calculated_position[1] + (node.height*(w-y));

        

    }

    render_text(node)
    {
        
        
        let pos = `position=[${node.calculated_position[0]},${node.calculated_position[1]},${node.calculated_position[2]}]`;
        
        this.scene_context.math_parser.parse_math(`<${pos}>${node.textContent}</>`);

    }

    render_fui_tree(root)
    {

        this.update_camera_far_plane();

        // Generate a node map where the nodes are linked in the map, and I change a node, this change needs to also call render_fui_tree from this object
        // Could have multiple frustrum uis and contact the id's through the frustrum uis
        
        // Generate queue
        let Q = new Dequeue();

        // Push the root
        Q.push_back(root);

        // While the queue is not empty
        while( Q.empty() == false )
        {

            // Get the current node
            let current_node = Q.pop_front();

            // Iterate through the children
            for( let c = 0; c < current_node.children.length; c++)
            {
                Q.push_back( current_node.children[c] );
            }

            // If the current nodes id is available, then submit the node into the lookup map for animation.
            if ( current_node.id != "" )
            {
                this.document_map[current_node.id] = current_node;
            }

            //Update the position of this node.
            this.update_position(current_node);
            // Update the dimenions of the node, going down the tree.
            this.update_dimension(current_node);
            // Render the text content
            this.render_text(current_node);
            
        }
        

    }

};

class FUINode
{
    constructor()
    {

        // Store the children of this node. 
        this.children = [];
        this.parent = undefined;
        
        // Store the text content
        this.textContent = ""

        // Store the id of the FUINode
        this.id = "";

        this.display = "block";
        this.relation = "relative";

        // Store the position of the block relative to the center
        this.position = [0,0,0];
        // Indicator for whether the position has been set
        this.position_set = false;
        // Bounding container
        this.bounding = [0,0,0,0];
        // Indicator for whether the bounding has been set
        this.bounding_set = false;

        // Store intermediate calculated bounding and positions
        this.calculated_position = [0,0,0];
        this.calculated_bounding = [0,0,0,0];

        // Expand the width and height.
        this.width = 0;
        this.height = 0;

    }

    empty()
    {
        return ( this.children.length == 0 && this.textContent == "" );

    }

    copy_attributes(node)
    {
        this.display = node.display;
        this.position = node.position;
        
    }
}

export class FUIParser
{
    // Parser, generates the node

    constructor()
    {

        // Store node currently being assembled in terms of its attributes
        this.current_assemble_node = new FUINode();

        // Store the current token index of what is being parsed.
        this.token_index = 0;

        // Store the current iteration of the string being parsed.
        this.ui_string = "";

        // Store table of token indicators
        this.token_indicators = {
            '<':this.expand_attributes.bind(this),
        };

        // Store the attribute decodes
        this.attribute_indicators = {
            "width" : this.expand_width.bind(this),
            "height" : this.expand_height.bind(this),
            "relation" : this.expand_relation.bind(this),
            "display" : this.expand_display.bind(this),
            "bounding" : this.expand_bounding.bind(this),
            "id" : this.expand_id.bind(this),
        };

    }

    // Skips white space excluding last index of string
    skip_space()
    {
        while ( this.token_index < this.ui_string.length && this.ui_string[this.token_index] == ' ')
        {
            this.token_index++;
        }
    }

    // Encountered an opening attribute tag.
    expand_attributes()
    {
        // Skip the inital opening tag
        this.token_index++;

        this.skip_space();

        // If this is a closing tag then move up the tree.
        if ( this.ui_string[this.token_index] == '/' )
        {
            
            if ( this.current_assemble_node.parent != undefined )
            {
                this.current_assemble_node = this.current_assemble_node.parent;
            }
            this.token_index+=2;
           
            return;
        }

        // If the current node is not empty
        if ( this.current_assemble_node.empty() == false )
        {
            // Create a new node copy the attributes of the current.
            let new_node = new FUINode();
            new_node.copy_attributes(this.current_assemble_node);
            // Push the current node as a child of the preivous and set the parent of the new_node as the previous
            this.current_assemble_node.children.push(new_node);
            new_node.parent = this.current_assemble_node;
            this.current_assemble_node = new_node;
        }

        

        //While inside of the attributes tag
        while ( this.token_index < this.ui_string.length && this.ui_string[this.token_index] != '>' && this.ui_string[this.token_index] != '/' )
        {
            // Skip space
            this.skip_space();

            // Create a new attribute tag name
            let attribute_name = ""
            

            // Up until the equal sign or space
            while ( this.token_index < this.ui_string.length && this.ui_string[this.token_index] != '=' && this.ui_string[this.token_index] != ' ' )
            {
                attribute_name += this.ui_string[this.token_index];
                this.token_index++;
            }
            
            // Skip the equals
            this.token_index++;

            // Skip space
            this.skip_space();

            //Up until the end quotation mark, if there exists one otherwise up until the space.
            let termination_token = ' ';
            let quote_enclosed = this.ui_string[this.token_index] == '\'';
            if ( quote_enclosed == true )
            {
                this.token_index++;
                termination_token = '\'';
            }

            // Store the attribute value
            let attribute_value = "";

            while ( this.token_index < this.ui_string.length && this.ui_string[this.token_index] != termination_token )
            {
                attribute_value += this.ui_string[this.token_index];
                this.token_index++;
            }

            // If quote enclosed then skip past the quote
            if ( quote_enclosed == true )
            {
                this.token_index++;
            }

            // At this point handle the attribute.

        }

        // Assuming the tag is now closing we skip the last index
        this.token_index++;

    }

    // Parser for arrays
    parse_array(value)
    {
        let current_value = "";
        let array = [];
        for(let i = 0; i < value.length; i++)
        {
            if ( value[i] == ',' )
            {
                array.push( parseFloat(current_value) );
                current_value = "";
            }else if ( (value.charCodeAt(i) >= 48 && value.charCodeAt(i) <= 57) ||  value[i] == "." ){
                current_value += value[i];
            }   
        }

        return array;

    }

    expand_width(value)
    {
        this.current_assemble_node.width = parseFloat(value);
    }
    expand_height(value)
    {
        this.current_assemble_node.height = parseFloat(value);
    }
    expand_relation(value)
    {
        this.current_assemble_node.relation = value.trim();
    }
    expand_display(value)
    {
        this.current_assemble_node.position = value.trim();
    }
    expand_bounding(value)
    {
        this.current_assemble_node.bounding = parse_array(value);
        this.current_assemble_node.bounding_set = true;
    }
    expand_id(value)
    {
        this.current_assemble_node.id = value;
    }
    parse_ui(ui_string)
    {
        // Store the ui string
        this.ui_string = ui_string;
        // Reset the parsing index
        this.token_index = 0;
        // Reset the fui node
        this.current_assemble_node = new FUINode();
        let root = this.current_assemble_node;

        // Generate the document tree to easily keep track of the hierarchy.
        while ( this.token_index < this.ui_string.length )
        {
            // Same two lane system one for plane text or math ui material
            let token = this.ui_string[this.token_index]
            // If the token at the current index meets a token respondance token 
            if ( this.token_indicators[token] != undefined )
            {
                // Then run the cooresponding operation
                this.token_indicators[token]();

            }else
            {
                // Absorb text into the textContnet
                this.current_assemble_node.textContent += token;
                 this.token_index++;
            }

           
        }

        return root;
        
    }

};

let ui_parse = new FUIParser();

ui_parse.parse_ui("<position='relish'> hello <>world</> </> ")
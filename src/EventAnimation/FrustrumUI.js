import { Dequeue } from "../DataStructures/Dequeue";

import { RenderTargetPlane } from "../../Videos/Scenes/RenderTargetPlane";
import * as THREE from 'three';


export class FUIDoc
{

    constructor( scene_context )
    {
        this.scene_context = scene_context;

        // Store the components of the frustrum plane. [verify]
        this.camera_up = new THREE.Vector3(0,1,0);
        this.camera_right = new THREE.Vector3(1,0,0);
        this.camera_center = new THREE.Vector3(0,0,0);
        this.camera_origin = new THREE.Vector3(0,0,0);

        // Store the plane normal.
        this.plane_normal;

        // Store a map to the nodes neccecary, needed.
        this.document_map = {

        };

        // Store a last node processed.
        this.last_node = undefined;

        // Store an index to the node count
        this.node_count = 0;

        // Store the standard bounding container
        this.standard_bounding = [0,0,1,1];

        // Store relative block placement transform within the parent.
        this.relative_transform = new THREE.Vector3(0,0,0);

        // Store the root, of the tree that this object represents.
        this.root = undefined;

        
        
    }

    // Update the plane details
    update_camera_far_plane()
    {
        // Describe the distance on the plane, where the items go again. [verify]
        let frustrumPlaneDistance = 12;

        // Get the camera rotation, this should be stored for the orientation plane with normal facing -camera_forward.
        let camera_rotation = this.scene_context.camera.quaternion.clone().normalize();
        let camera_forward  = new THREE.Vector3(0,0,-1).applyQuaternion(camera_rotation);
        
        // Get the plane normal from camera foward rotation. [verify]
        this.plane_normal = camera_forward.clone().multiplyScalar(-1);

        this.camera_up = this.scene_context.camera.up.clone().applyQuaternion(camera_rotation).normalize();
        
        this.camera_right = camera_forward.clone().cross(this.camera_up).normalize();

        let camera_fov = this.scene_context.camera.fov;

        let camera_far_half_distance = frustrumPlaneDistance*Math.tan(((camera_fov)*(3.14159265359/180))/2);

        this.camera_center = this.scene_context.camera.position.clone().add(camera_forward.multiplyScalar(frustrumPlaneDistance));
        
        this.camera_origin = this.camera_center.clone().sub(this.camera_right.clone().multiplyScalar(camera_far_half_distance)).sub(this.camera_up.clone().multiplyScalar(camera_far_half_distance));

        this.camera_right.multiplyScalar(camera_far_half_distance*2.0);
        this.camera_up.multiplyScalar(camera_far_half_distance*2.0);

    }
    
    parse(ui_string)
    {
        this.update_camera_far_plane();
        // Set the baseline vectors
        this.scene_context.math_parser.set_base_line_vectors(this.camera_right.clone().normalize(), this.camera_up.clone().normalize(), this.scene_context.camera.quaternion.clone().normalize());

        // Build the root of the ui string
        let root = this.scene_context.fui_parser.parse_ui(ui_string);
        
        // Render the fui tree from the root
        this.render_fui_tree(root);

        this.root = root;
        return root;
    }

    // Series of add functions which allow for adding nodes to the tree.
    // Update to stack based functions which allow to add a different layers of the tree.
    add_equation( equation_string )
    {
        if ( this.root == undefined )
        {
            return;
        }
        // Generate the singular node from the node parser.
        let equation_node = this.scene_context.fui_parser.parse_single_node( equation_string );

        // Set the parent of the equation node.
        equation_node.parent = this.root;

        // Add the equation of the child of the root.
        this.root.children.push ( equation_node );

        // Simply render the at the node.
        this.render_fui_tree_dfs ( equation_node );
    }

    update_content_size(node)
    {
        // We first get information about the current node
        let estimated_content_width = this.scene_context.math_parser.get_text_meta_data( node.textContent );

        //Update the height of the node
        let estimated_content_height = this.estimate_height(node);

//        console.log("UPDATE_CONTENT_SIZE ESTIMATED WIDTH&HEIGHT: ", estimated_content_width, estimated_content_height );

        if(node.god_tag == "main")
        {
            node.width = 1.0;
            node.height = 1.0;
        }

    //    console.log("UPDATE_CONTENT_SIZE WIDTH&HEIGHT: ", node.width, node.height);

        // Get the parent bounding container.
        let parent_bounding = [0,0,0,0];
        if ( node.parent == undefined )
        {
            parent_bounding[0] = this.standard_bounding[0]*this.camera_right.length();
            parent_bounding[1] = this.standard_bounding[1]*this.camera_up.length();
            parent_bounding[2] = this.standard_bounding[2]*this.camera_right.length();
            parent_bounding[3] = this.standard_bounding[3]*this.camera_up.length();;
        }else
        {
            parent_bounding = node.parent.calculated_bounding;
        }

        // Use the parents bounding container and absolute coordinates to choose the position
        let x = parent_bounding[0];
        let y = parent_bounding[1];

        let z = parent_bounding[2];
        let w = parent_bounding[3];

   //     console.log("PARENT_CONTAINER", parent_bounding);

        if ( node.height != 0 )
        {
            node.calculated_height = node.height * (w-y);
        }else
        {
            // Update the nodes height and width.
            node.calculated_height = estimated_content_height;
        }

        if (node.width != 0)
        {
            
            node.calculated_width = node.width * ( z-x );
            
        }else
        {
            node.calculated_width = estimated_content_width;
        }

    }

    update_position(node)
    {

        // Then its assumed the node is absolute, this position.
        let parent_container;

        if ( node.parent != undefined )
        {
            parent_container = node.parent.calculated_bounding;

        }else
        {
            parent_container = this.standard_bounding;
            // Use the standard bounding container.
        }

        // Use the parents bounding container and absolute coordinates to choose the position
        let x = parent_container[0];
        let y = -parent_container[1];

        let z = parent_container[2];
        let w = -parent_container[3];

        // Use the parent bounding to calculate position.
        // If the nodes position is relative to the top left corner then.
        // node.calculated_position[0] = x + (node.position[0] * (z-x));
        // node.calculated_position[1] = y + (node.position[1] * (w-y));

        // If the parent does not exist use the standard bounding container for position.
        if( node.parent != undefined )
        {
            //console.log(node.parent.calculated_offset);
            // Unpack the parents calculated bounding container.
            node.calculated_position[0] = node.parent.calculated_position[0] + node.parent.calculated_offset[0];
            node.calculated_position[1] = node.parent.calculated_position[1] - node.parent.calculated_offset[1];
            node.calculated_position[2] = node.parent.calculated_position[2];

        }else
        {
            // Calculate the position along the axis vectors of the camera plane.
            node.calculated_position[0] = parseFloat(this.camera_origin.x.toFixed(3));
            node.calculated_position[1] = -parseFloat(this.camera_origin.y.toFixed(3));
            node.calculated_position[2] = parseFloat(this.camera_origin.z.toFixed(3));
        }
    }

    update_dimension(node)
    {
        // Find the parent container.
        let parent_container = [0,0,0,0];

        if ( node.parent != undefined )
        {
            parent_container = node.parent.calculated_bounding;

        }else
        {
            parent_container[0] = this.standard_bounding[0];
            parent_container[1] = this.standard_bounding[1];
            parent_container[2] = this.standard_bounding[2];
            parent_container[3] = this.standard_bounding[3];
            // Use the standard bounding container.
        }

        // Use the parents bounding container and absolute coordinates to choose the position
        let x = parent_container[0];
        let y = parent_container[1];

        let z = parent_container[2];
        let w = parent_container[3];

        node.calculated_bounding[0] = node.calculated_position[0];
        node.calculated_bounding[1] = node.calculated_position[1];
        node.calculated_bounding[2] = node.calculated_position[0] + (node.calculated_width);
        node.calculated_bounding[3] = node.calculated_position[1] + (node.calculated_height);
    }
    // Update the local offset of the parent base on its nodal display, introduces a postfix translation, which is undesireable.
    update_offset(node, build_info)
    {
        
        // Then calculate the parents offset.
        if(node.parent == undefined)
        {
            // if ( node.display == "block" )
            // {
            //     node.calculated_offset[0] = 0;
            //     node.calculated_offset[1] += node.height;
                
            // }else if (node.display == "inline")
            // {
            //     node.calculated_offset[0] += node.width;
            // }

        }else
        {
            

            if ( node.display == "block" )
            {
                node.parent.calculated_offset[0] = 0;
                node.parent.calculated_offset[1] += node.calculated_height;
                
            }else if (node.display == "inline")
            {
                node.parent.calculated_offset[0] += (node.calculated_width*node.fontSize*1.0);


                if ( node.parent.display != "inline" )
                {
                    node.parent.calculated_offset[1] += build_info[1];
                }

            }

        }

    }

    update_padding_prefix(node)
    {

        node.parent.calculated_offset[0] += node.padding[0]*(node.parent.calculated_bounding[2] - node.parent.calculated_bounding[0]);
        node.parent.calculated_offset[1] += node.padding[1]*(node.parent.calculated_bounding[3] - node.parent.calculated_bounding[1]);

    }

    update_padding_postfix(node)
    {

        node.parent.calculated_offset[0] += node.padding[2]*(node.parent.calculated_bounding[2] - node.parent.calculated_bounding[0]);
        node.parent.calculated_offset[1] += node.padding[3]*(node.parent.calculated_bounding[3] - node.parent.calculated_bounding[1]);

    }
    
    // Estimates size of the text content
    estimate_height(node)
    {
        if ( node.textContent == "")
        {
            return 0;
        }
        
        let estimated_height = (node.fontSize*0.8);

        if ( node.last_node != undefined && node.last_node.fontSize > node.fontSize ) 
        {
            //estimated_height = (node.last_node.fontSize*0.9);
            
        }

        return estimated_height;
    }

    // Render functions 
    render_math ( node )
    {
        // if the desired content is empty return.
        if ( node.textContent == "" )
        {
            return;
        } 

        // Generate a internal baseline offset.
        let baseline_offset = 0;

        // Adjust for if the last node had a larger size in terms of fonts only.
        if ( this.last_node != undefined )
        {
            if ( this.last_node.fontSize > node.fontSize)
            {
                baseline_offset = (this.last_node.fontSize - node.fontSize)*0.9;
            } else if ( this.last_node.fontSize < node.fontSize )
            {
                baseline_offset = -(node.fontSize - this.last_node.fontSize)*0.9;
            }
        }

        // String components of the node.

        let pos = `position=[${node.calculated_position[0]},${ node.calculated_position[1] -baseline_offset },${node.calculated_position[2]}]`;
        let fontSize = `size=${node.fontSize}`;

        let node_context = `<${pos} ${fontSize}>${node.textContent}</>`;
        // If the node was previously rendered and has a current object associated with it, then use that.
        if ( node.previously_rendered != undefined  )
        {
            
            // If the content has not changed then just return
            if ( node.previously_rendered == node_context )
            {
                return;
            }

            // Then dispose of the content or reuse depending on the type.
            this.scene_context.math_parser.dispose ( node.text_ids );

        }


        // Then parse and render the math text.
        let text_ids = this.scene_context.math_parser.parse_math( node_context );

        // Set this as the previous node
        this.last_node = node;

        // Populate node with previous render
        node.text_ids = text_ids;
        node.previously_rendered = `<${pos}>${node.textContent}</>`;

        if ( node.god_tag != "main")
        {
            // Divided into camera right units.
            node.calculated_width = text_ids.total_length/this.camera_right.length();
        }
    }

    render_text(node)
    {
        
        
        // if the desired content is empty return.
        if ( node.textContent == "" )
        {
            return;
        } 

        console.log ( "text", node );

        // Generate a internal baseline offset.
        let baseline_offset = 0;

        // Adjust for if the last node had a larger size in terms of fonts only.
        if ( this.last_node != undefined )
        {
            if ( this.last_node.fontSize > node.fontSize)
            {
                baseline_offset = (this.last_node.fontSize - node.fontSize)*0.9;
            } else if ( this.last_node.fontSize < node.fontSize )
            {
                baseline_offset = -(node.fontSize - this.last_node.fontSize)*0.9;
            }
        }

        // String components of the node.

        let pos = `position=[${node.calculated_position[0]},${ node.calculated_position[1] -baseline_offset },${node.calculated_position[2]}]`;
        let fontSize = `size=${node.fontSize}`;

        let node_context = `<${pos} ${fontSize}>${node.textContent}</>`;
        // If the node was previously rendered and has a current object associated with it, then use that.
        if ( node.previously_rendered != undefined  )
        {
            
            // If the content has not changed then just return
            if ( node.previously_rendered == node_context )
            {
                return;
            }

            // Then dispose of the content or reuse depending on the type.
            this.scene_context.math_parser.dispose ( node.text_ids );

        }

        // Then parse and render the math text.
        let text_ids = this.scene_context.math_parser.parse_math( node_context );

        // Set this as the previous node
        this.last_node = node;

        // Populate node with previous render
        node.text_ids = text_ids;
        node.previously_rendered = `<${pos}>${node.textContent}</>`;

        if ( node.god_tag != "main")
        {
            // Divided into camera right units.
            node.calculated_width = text_ids.total_length/this.camera_right.length();
        }
        
        //this.update_dimension(node);

    }

    render_fui_tree_dfs(node)
    {
        // Get the content size of the node | relies on their being an approximation of content size.
        this.update_content_size(node);

        // Check if this nodes direct predecessor is the god node, then if so it gets priority over the offset?
        if ( node.display == "block" && node.parent.god_tag == "main")
        {
            // Then prefix offset
            //this.update_offset(node);
        }

        // Update the dimenions of the node, going down the tree, relies of a pre approximation of content size.
        this.update_dimension(node);

        // Get the updated dimension.
        let build_info = [ node.calculated_width, node.calculated_height, node.parent.calculated_offset[1] ];

        // Update the padding for prefix
        //this.update_padding_prefix(node);

        //Update the position of this node, doesn't really make any sense.
        this.update_position(node);

        
        for(let c = 0; c < node.children.length; c++)
        {
            // Depth first search all children.
            let child_build_info = this.render_fui_tree_dfs( node.children[c] );

            build_info[0] = Math.max ( child_build_info[0], build_info[0] );
            build_info[1] = Math.max ( child_build_info[1], build_info[1] );

            // Work around
            build_info[2] = Math.max ( child_build_info[2], build_info[2] + node.calculated_height );

        }

        // If the parent has more than one children then its parent needs to inherit its calculated offset
        if (  node.parent != undefined  )
        {

            //console.log ( node.calculated_offset );
            //node.parent.calculated_offset[1] += node.calculated_offset[1];

    
        }
    
        // Update the padding for postfix
        //this.update_padding_postfix(node);

        // Updates offset of the parent is postfix if the node is inline.
        if ( node.display == "inline" || node.display == "block" && node.parent.god_tag != "main")
        {
            this.update_offset(node, build_info);
        }
        
        // Render the text content
        this.render_text(node);


        return build_info;
        

    }

    render_fui_tree(root)
    {
        // First initalize the main god root.
        this.update_content_size(root);

        //Update the position of this node. | need to fix doesn't make any sense.
        this.update_position(root);

        // Update the dimenions of the node, going down the tree.
        this.update_dimension(root);
        
        // Export the tokens, and retrieve offset information.
        this.update_offset(root);

        // Render the text content | change this to rendered content.
        this.render_text(root);

        //Iterate through the children of the main god root.
        for( let c = 0; c < root.children.length; c++ )
        {
            let build_info = this.render_fui_tree_dfs(root.children[c]);

            console.log ( build_info ) ;

            root.calculated_offset[1] += build_info[2];
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
        this.textContent = "";

        // Store whether the text content is math
        this.isMath = false;

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

        this.calculated_offset = [0,0,0];

        // Store padding
        this.padding = [0,0,0,0];

        // Store the font size
        this.fontSize = 1.0;

        // Expand the width and height.
        this.width = 0;
        this.height = 0;

        this.calculated_width = 0;
        this.calculated_height = 0;

        // Node index in a document map.
        this.node_index = 0;
        
        //Designated god tag
        this.god_tag = "";

        // Designated to show what was rendered here before.
        this.previously_rendered = undefined;
        this.text_ids = undefined;

        

        // A module slot in case the node inherits from some alternative module rendering object.
        this.module = undefined;
    }

    empty()
    {
        return ( this.children.length == 0 && this.textContent == ""  && this.god_tag == "" && this.width == 0 && this.height == 0 && this.display == "");
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
            "fontSize": this.expand_font_size.bind(this),
            "padding": this.expand_padding.bind(this),
            "width" : this.expand_width.bind(this),
            "height" : this.expand_height.bind(this),
            "relation" : this.expand_relation.bind(this),
            "display" : this.expand_display.bind(this),
            "bounding" : this.expand_bounding.bind(this),
            "id" : this.expand_id.bind(this),
            "RenderTargetPlane" : this.expand_render_target_plane.bind(this),
        };


        // To automatically strip left space and right space
        // If no text has been encountered yet don't add space. [prefix space ]
        // Count the number of consecutive spaces, and reset, then once the tag is closed, the remaining space can be shuffed out.

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

        // SKip white space.
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

        // Else create a new node and set the new node as a child of the current node, then switch to the child.
        if ( 1  && this.current_assemble_node.god_tag != "singular" )
        {
            // Create a new node copy the attributes of the current.
            let new_node = new FUINode();
            new_node.copy_attributes(this.current_assemble_node);
            // Push the current node as a child of the preivous and set the parent of the new_node as the previous
            this.current_assemble_node.children.push(new_node);
            new_node.parent = this.current_assemble_node;
            this.current_assemble_node = new_node;

        }


        //While inside of the attributes tag, attain the attributes and link the currently attributing token.
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
            
            // Skip space
            this.skip_space();

            // After skipping the space if there is no equals sign then the attribute has no parameters.
            if ( this.ui_string[this.token_index] != '=' )
            {
                // At this point handle the attribute.
                if ( this.attribute_indicators[attribute_name] != undefined )
                {
                    this.attribute_indicators[attribute_name]("no value");
                }

                // Then continue the loop
                continue;
            }
        
            // Skip the equals
            this.token_index++;

            // Skip space if any.
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
            if ( this.attribute_indicators[attribute_name] != undefined )
            {
                this.attribute_indicators[attribute_name](attribute_value);
            }

            this.skip_space();

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

        array.push( parseFloat(current_value));

        return array;

    }

    // For special attribute objects expand them and set the specified tag.
    expand_render_target_plane( value )
    {

        console.log("Expansion failed due to equals sign!");

        this.current_assemble_node.module = new RenderTargetPlane (  );

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
        
        this.current_assemble_node.display = value.trim();
    }
    expand_bounding(value)
    {
        this.current_assemble_node.bounding = this.parse_array(value);
        this.current_assemble_node.bounding_set = true;
    }
    expand_padding(value)
    {
         this.current_assemble_node.padding = this.parse_array(value);
    }
    expand_font_size(value)
    {
        this.current_assemble_node.fontSize = parseFloat(value);
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
        root.god_tag = "main";

        // Generate the document tree to easily keep track of the hierarchy.
        while ( this.token_index < this.ui_string.length )
        {
            // Skip the newlines and tab space.
            if ( this.ui_string[this.token_index] == '\n' || this.ui_string[this.token_index] == '\t')
            {
                // Skip the white space after.
                this.token_index++;
                this.skip_space();
                continue;
            }

            // Same two lane system one for plane text or math ui material
            let token = this.ui_string[this.token_index]
            // If the token at the current index meets a token respondance token 
            if ( this.token_indicators[token] != undefined )
            {
                // Then run the cooresponding operation
                this.token_indicators[token]();

            }else
            {

                // If the token is a space.
                if ( token == ' ')
                {

                    if ( this.current_assemble_node.textContent.length > 0 )
                    {
                        this.current_assemble_node.textContent += token;
                    }

                    // advance token
                    this.token_index++;
                    
                }else{
                    
                    // Absorb text into the textContnet
                    this.current_assemble_node.textContent += token;
                    this.token_index++;
                }

                
            }

            

           
        }
        //console.log(root);

        return root;
        
    }

    // Function meant to return a single node
    parse_single_node( node_string )
    {
        this.token_index = 0;
        this.ui_string = node_string;

        this.current_assemble_node = new FUINode();
        this.current_assemble_node.god_tag = "singular";

        while ( this.token_index < this.ui_string.length )
        {
            // Skip the newlines and tab space.
            if ( this.ui_string[this.token_index] == '\n' || this.ui_string[this.token_index] == '\t')
            {
                // Skip the white space after.
                this.token_index++;
                this.skip_space();
                continue;
            }

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

        return this.current_assemble_node;

    }

};



// let p = new FUIParser();

// p.parse_ui(`

//             <>
//                 < display='inline' >
//                     <> okay </>
//                     <> goodbyte </>
//                 </>

//                 <> wow </>
//             </>

//             <> wow </>
            
//             `);
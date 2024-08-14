# Event System

## Requirements

  requirement0
  supports ever expanding series of object types eg
    instanced_references, custom_functional_parameter,
  
  solution:
    instanced_reference : has unique chunk of code required to retrieve base parameters
    custom_functional_parameter : calls a function with a updated parameter value

    for future problems:
      all objects either contain a tag which specifies their type
      then there must exist a getter/setter function for that specific type

  requirement1 : unique numeral text_ids, text_id_maps, including equation maps

    the event system should be able to accept any of these three id types for text
    and coorespondingly handle that type.

  ## Animation Modules :  
     example 
    
      let eventSystem = new EventSystem ( );
      let fibonacci map = new FibonacciMap( );



## Features: Data visualization grid.
  usage:


## Features: Math Parser Utility


  function newlines:
    " new lines now break lines "
    " multisized sentences work but with a caviate, that no fontsize may be larger than it previously was on a previous line "

  uses case:
    as a user I want to use a math parser tool to generate and add text to the animation group that listens to latex symbols 
      way 1 : event animation system.add_math("math text", dfasdfas, from, to);
      way 2 : let id = math_parse(); event animation system.add_math();
      way 3 : let id_map = fui.make_ui(); event_animation system.id
    usage (later): 
      let text_id = math_parser.parse( (-1.0, -1.0) "|frac{a}{b}{c}" );
      eventSystem.position_to(text_id.frac0, duration: 1, (1.0, -1.0));

    micro
    when a equals sign is encountered the equals sign flag is set, and when a space is encountered with the equals sign flag
    set the entire node is registered as equationx
    macro

      "register character"
      "register name"
      "end character"

    usage ( global equations )
      let text_id = math_parser.parse ( " a = b " );
      eventSystem.position_to ( text_id.equation0, )

## Features: Frustrum UI

  Function : Standard Grid

    usage:
      " < grid col=[50 %, 50%] row=[50%, 50%] >
      " </>
    
    doesn't support auto

    algorithm:
      calculate the width based on indexing by modulo column count
      then upon overshooting offset by the current_rows height
    
    Function : Auto Grid

      usage:
        " < grid col=[auto %, 50%] row=[50%, 50%] >
        " </>
      algorithm
        
        collect all known columns with set width subtract that from available space
        then calculate each space to divide evenly by the available space
        exluding the boundary cells which extend the remainder. 



  Function: Prefix space stripping
    will strip any prefix space on elements.


  TO-DO:
    
    Build plot system


       

    Add the accurate size/dimensions of the output of the math parser
      when new line breaks update total length to max height of line
      set total length to max
    Add token extinguishers for the new line character to help estimate the height of a text object 
    Add the id registry to math parser

      equations id registry to the math parser:
        seperate each equals sign or seperator into its own node ( neccecary )

        accumulate all text_id tags that are mean't for the external map
        into the "active equation", which the equation + { equation_tail }
        the equals flag is manipulated in order to change which side of the equation the text and operator tags are placed. 

        the equals sign must not be placed into either the lefthand side or the righthand side of equation
        it would be cumbersome to place a check for an equals sign in each operator decoding function to ensure that the
        id is not placed.

        but it may be neccecary

        workaround:

          store two seperator operator function one which doesn't add ids [ cumbersome ]


      macro idea:
        " named subsection : eg ( equation ) "
        " relation : prefix, postfix, symmetrical eg ( symmetrical) " rhs, lhs, lhs \ rhs
        " trigger_token " eg ( = )
        " terminal_token " eg ( \n )
        


      usage

        

        external usage
        text_ids.equation0.frac0.text0 etc



    [ Side quests ]
      set up optional animation chain so that upon changing position, the coorseponding node is re-rendered in its respective tree.
      Redesign UI generation withougth content size guarentees


  TO-DO:
    pull in frustrum details to build the original bounding container, and axis system.
    math parser should return length details for the total expression as well as the micro expressions.
    

  as a user I want frustrum UI to have reset the transforms on nodes
  as a user I want frustrum UI to have an inital render capabilites and a render update capabilites or a switch between the two states upon render.
    way 1 : the nodes store their render status/group ids, then in the render text their positions are essentially just changed to the newly calculated position stores the render status.
    way 2 : a parameter is passed to the function suggesting re-render, then it just changes the underlying 
  as a user I want to either reuse or dispose of text ids if they were previously rendered
    way 1 : if previously rendered then all the of text_ids are disposed of through reusable text, then render text takes place.

    
    
## Features: Creation and deletion system.
an event must also consititute creation events rather than manipulations.
and if no inital state or to state is given, then it is spawned where ever the cursor is in this case its 0,0,0
stores cursor in scene_context
set attribute to from value set event system to run before adding to scene

## Features: disposal
refactor events array into hashmap so that events can be taken out of the event pool including disposal events.

## Feature: usage revamp
    improve usage syntax, allow for standard arrays that convert to three vectors

## Feature: RenderTargetPlane

  ### Methods
    .render ( planar parameters )
    .estimate_height

  usage:
    let render_target_plane = new RenderTargetPlane( scene_context );
    render_target_plane.attach_mesh ( mesh() );

  test:

    add chunk axis, and chunk grid to target plane then render the plane

# PLOT

  fix the settings for the chunk primitive count breaking the chunk coordinate plane
  
  the plot needs to simply be a collection of meshes that can be used in terms of a scene
  

## InstanceMachine

  Problem 1 : Resize during animate function, 
    the new instancedmesh is not added to the scene

  Solution : Ask for a update or rerender, when neccecary!?

# REFACTORS
Allow object to be defined before all switch states in get, and update less confusing.

## Feature: use animation groups to define start points for the animation group.
  when the user adds an animation group, the animation groups stores meta information about the group.

  When there is an active group or a "current" animation group disposable events are posted to the group and disposed of when the group is disposed of.

  Likewise there should be metadata using the start location from the first event added to the group, whether is disposable or not.

  If there are nested animation groups then, when disposed the current animation group should be set the previous if it exists otherwise empty.

  But should it be automatic that each object is added to the group if its inside of a group, otherwise delays would be specified explicitly for each value.

  Instead there is a option which is the start, and for a value of "still" will

  for a stagger effect, a group could hold a value which is the current stagger


If there is an active animation group store the start position of the group and use it.

# VSCODE Shortcuts
ctrl-p search for file
ctrl-shift-o search for symbol
ctrl-g line number
ctrl-tab tab back and forth
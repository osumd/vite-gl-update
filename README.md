# Event System
# Solid uv plane to sphere geometry.
Divide a plane into n sections, use a ratio to place a vertex in each section.
Transform the uv onto the surface of the sphere.

Face connection from each vertex to adjacent subdivded faces.

Algorithm
first divides the x space or radius plane by n
and divides the y space or radius plane by n
these section dimensions or spaces are denoted, and based
on the number a point will be placed in the section for a simple
algorithm just use a center for the first implementation.

Then also denote the adjacency of the sections, so that edges in their respective section can be connected to form the faces.


## Features: Data visualization grid.
  features of a data visualization grid, accurate scaling for different data circumstances
  easy to see the different measurement markers.
  Next is labels

## Features: Math Parser Utility
  uses case:
    as a user I want to use a math parser tool to generate and add text to the animation group that listens to latex symbols
    as a user I want the math parser tool to add the text to the scene, but also have an option in the event system
    to talk to the math parser, and also the math parser needs to talk to the reusable text engine to dispose of the text.
    as a user blocks of text will be given ids and operators and their parts will also be given ids for animation.
    
    add space count adjustment from text level operations in the parsing effect

    check for a cooresponding dual

    usage (later): 
      let text_id = math_parser.parse( (-1.0, -1.0) "|frac{a}{b}{c}" );
      eventSystem.position_to(text_id.frac0, duration: 1, (1.0, -1.0));

## Features: Frustrum UI
  TO-DO:
    pull in frustrum details to build the original bounding container, and axis system.
    math parser should return length details for the total expression as well as the micro expressions.
    
    

  

  
   
## Features: Creation and deletion system.
an event must also consititute creation events rather than manipulations.
and if no inital state or to state is given, then it is spawned where ever the cursor is in this case its 0,0,0
stores cursor in scene_context
set attribute to from value set event system to run before adding to scene

## Features: disposal
refactor events array into hashmap so that events can be taken out of the event pool including disposal events.

## Feature: usage revamp
    improve usage syntax, allow for standard arrays that convert to three vectors

## Event system refactor
    make virtual class to hold object reference, and just call to get their position
    change events array to map instead

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
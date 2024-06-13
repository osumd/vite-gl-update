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


# VSCODE Shortcuts
ctrl-p search for file
ctrl-shift-o search for symbol
ctrl-g line number
ctrl-tab tab back and forth
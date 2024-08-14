// Class that can register functions to be called directly on animate, or on camera changed, etc.
// Finish later.
export default class OnAnimate{

    constructor()
    {

        this.on_animate_events = [];

        // Like a stack but the events popped off after they are called, and it is called backwards.
        this.one_time_events = [];

        // Like a stack of events 

    }

    // Add one time update event
    add_one_time_event ( event )
    {

        this.one_time_events.push ( event );

    }


    // Add event


    add_event(event_function)
    {
        
        this.on_animate_events.push(event_function);

    }

    // On handle scene_context

    update()
    {

        for ( let i = 0; i < this.one_time_events.length; i ++ )
        {

            this.one_time_events[i]();


        }

        this.one_time_events = [];

        for ( let i = 0; i < this.on_animate_events.length; i++)
        {
            this.on_animate_events[i]();

        }

    }




}
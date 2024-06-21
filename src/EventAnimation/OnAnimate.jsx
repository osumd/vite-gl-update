// Class that can register functions to be called directly on animate, or on camera changed, etc.
// Finish later.
export default class OnAnimate{

    constructor()
    {

        this.on_animate_events = [];

    }

    add_event(event_function)
    {
        
        this.on_animate_events.push(event_function);

    }

    update()
    {

        for ( let i = 0; i < this.on_animate_events.length; i++)
        {
            this.on_animate_events[i]();

        }

    }




}
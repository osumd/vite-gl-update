
import LamesTheorem from "./Scenes/LamesTheorem";

export default class RecurrenceRelationVideo
{
    constructor(scene_context)
    {
        // First scene of the video
        let lames_theorem = new LamesTheorem( scene_context );
        lames_theorem.play();
    }


    

}
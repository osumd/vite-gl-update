
import LamesTheorem from "./Scenes/LamesTheorem";
import FibbonaciMap from "./Scenes/FibbonaciMap";

export default class RecurrenceRelationVideo
{
    constructor(scene_context)
    {
        // Store this as the scene context.
        this.scene_context = scene_context;
        // First scene of the video
        let fibbonacci_map = new FibbonaciMap(scene_context);
        fibbonacci_map.play();
        //let lames_theorem = new LamesTheorem( scene_context );
        //lames_theorem.play();
    }


    

}
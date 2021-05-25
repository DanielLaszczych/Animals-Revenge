import StateMachineAI from "../../../Wolfie2D/AI/StateMachineAI";
import AnimatedSprite from "../../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import { AR_Events } from "../../animalrevenge_enums";
import Walk from "./Walk";

export default class EnemyAI extends StateMachineAI{
    protected owner: AnimatedSprite;

    protected speed: number = 30;

    public isPaused: boolean = false;
    public levelSpeed: number;

    initializeAI(owner: AnimatedSprite, options: Record<string, any>){
        this.owner = owner;
        this.levelSpeed = options.levelSpeed;
        
        this.addState("default", new Walk(this, owner, options.navigation, options.speed));
        
        this.initialize("default");
        this.receiver.subscribe(AR_Events.ENEMY_CONFUSED);
        this.receiver.subscribe(AR_Events.PAUSE_RESUME_GAME);
        this.receiver.subscribe(AR_Events.LEVEL_SPEED_CHANGE);
        this.receiver.subscribe(AR_Events.ENEMY_SLOWED);
        this.receiver.subscribe(AR_Events.ENEMY_DIED);
    }

    activate(options: Record<string, any>): void {
    }
}
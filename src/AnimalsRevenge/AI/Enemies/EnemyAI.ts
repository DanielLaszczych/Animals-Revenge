import StateMachineAI from "../../../Wolfie2D/AI/StateMachineAI";
import Vec2 from "../../../Wolfie2D/DataTypes/Vec2";
import AnimatedSprite from "../../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import { AR_Events } from "../../animalrevenge_enums";
import Walk from "./Walk";

export default class EnemyAI extends StateMachineAI{
    protected owner: AnimatedSprite;

    protected speed: number = 30;

    initializeAI(owner: AnimatedSprite, options: Record<string, any>){
        this.owner = owner;
        
        this.addState("default", new Walk(this, owner, options.navigation, options.speed));

        this.initialize("default");
        this.receiver.subscribe(AR_Events.ENEMY_CONFUSED);
    }

    activate(options: Record<string, any>): void {
    }
}
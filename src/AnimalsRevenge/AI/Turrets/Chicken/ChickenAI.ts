import StateMachineAI from "../../../../Wolfie2D/AI/StateMachineAI";
import Vec2 from "../../../../Wolfie2D/DataTypes/Vec2";
import AnimatedSprite from "../../../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import Sprite from "../../../../Wolfie2D/Nodes/Sprites/Sprite";
import { AR_Events } from "../../../animalrevenge_enums";
import Combat from "./Combat";
import Idle from "./Idle";

export default class ChickenAI extends StateMachineAI {
    
    protected owner: AnimatedSprite;

    protected stats: Record<string, any>;
    public target: number;
    public projectiles: Array<{sprite: Sprite, dir: Vec2}>;
    
    initializeAI(owner: AnimatedSprite, stats: Record<string, any>) {
        this.owner = owner;
        this.stats = stats;
        this.projectiles = new Array();

        this.addState("idle", new Idle(this, owner));
        this.addState("combat", new Combat(this, owner, this.stats));

        this.receiver.subscribe(AR_Events.ENEMY_ENTERED_TOWER_RANGE);
        this.receiver.subscribe(AR_Events.ENEMY_DIED);

        this.initialize("idle");
    }

    activate(stats: Record<string, any>) {
        this.stats = stats;
        this.addState("idle", new Idle(this, this.owner));
        this.addState("combat", new Combat(this, this.owner, this.stats));
    }
}
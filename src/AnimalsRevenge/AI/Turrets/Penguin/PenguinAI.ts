import StateMachineAI from "../../../../Wolfie2D/AI/StateMachineAI";
import Vec2 from "../../../../Wolfie2D/DataTypes/Vec2";
import GameNode from "../../../../Wolfie2D/Nodes/GameNode";
import AnimatedSprite from "../../../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import Sprite from "../../../../Wolfie2D/Nodes/Sprites/Sprite";
import { AR_Events } from "../../../animalrevenge_enums";
import Combat from "./Combat";
import Idle from "./Idle";

export default class PenguinAI extends StateMachineAI {
    
    protected owner: AnimatedSprite;

    protected stats: Record<string, any>;
    public target: number;
    public projectiles: Array<{sprite: Sprite, dir: Vec2, target: number}>;
    public isPaused: boolean = false;
    public levelSpeed: number;
    public predictionMultiplier: Map<number, number>;
    
    initializeAI(owner: AnimatedSprite, stats: Record<string, any>) {
        this.owner = owner;
        this.stats = stats;
        this.projectiles = new Array();
        this.levelSpeed = 1;
        this.predictionMultiplier = new Map([
            [1, 24],
            [2, 35],
            [4, 45]
        ]);

        this.addState("idle", new Idle(this, owner));
        this.addState("combat", new Combat(this, owner, this.stats));

        this.receiver.subscribe(AR_Events.ENEMY_ENTERED_TOWER_RANGE);
        this.receiver.subscribe(AR_Events.ENEMY_DIED);
        this.receiver.subscribe(AR_Events.PAUSE_RESUME_GAME);
        this.receiver.subscribe(AR_Events.LEVEL_SPEED_CHANGE);

        this.initialize("idle");
    }

    activate(stats: Record<string, any>) {
        this.stats = stats;
        this.addState("idle", new Idle(this, this.owner));
        this.addState("combat", new Combat(this, this.owner, this.stats));
    }
}
import StateMachineAI from "../../../../Wolfie2D/AI/StateMachineAI";
import Vec2 from "../../../../Wolfie2D/DataTypes/Vec2";
import AnimatedSprite from "../../../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import Sprite from "../../../../Wolfie2D/Nodes/Sprites/Sprite";
import { AR_Events } from "../../../animalrevenge_enums";
import Combat from "./Combat";
import Idle from "./Idle";

export default class EagleAI extends StateMachineAI {
    
    protected owner: AnimatedSprite;

    protected stats: Record<string, any>;
    public target: number;
    public projectiles: Array<{sprite: Sprite, target: number, dir: Vec2}>;
    public isPaused: boolean = false;
    public levelSpeed: number;
    
    initializeAI(owner: AnimatedSprite, stats: Record<string, any>) {
        this.owner = owner;
        this.stats = stats;
        this.projectiles = new Array();
        this.levelSpeed = 1;

        this.addState("idle", new Idle(this, owner, this.stats));
        this.addState("combat", new Combat(this, owner, this.stats));

        this.receiver.subscribe(AR_Events.ENEMY_ENTERED_TOWER_RANGE);
        this.receiver.subscribe(AR_Events.ENEMY_DIED);
        this.receiver.subscribe(AR_Events.PAUSE_RESUME_GAME);
        this.receiver.subscribe(AR_Events.LEVEL_SPEED_CHANGE);

        this.initialize("idle");
    }

    activate(newStats: Record<string, any>) {
        if (newStats.type === "attackSpeed") {
            this.stats.attackSpeed = newStats.attackSpeed;
        } else if (newStats.type === "damage") {
            this.stats.damage = newStats.damage;
        } else if (newStats.type === "range") {
            this.stats.range = newStats.range;
        } else if (newStats.type === "hasDamageAura") {
            this.stats.hasDamageAura = newStats.hasDamageAura;
        }
        this.addState("idle", new Idle(this, this.owner, this.stats));
        this.addState("combat", new Combat(this, this.owner, this.stats));
    }
}
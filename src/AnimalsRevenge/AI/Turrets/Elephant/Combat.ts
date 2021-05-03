import AABB from "../../../../Wolfie2D/DataTypes/Shapes/AABB";
import Circle from "../../../../Wolfie2D/DataTypes/Shapes/Circle";
import State from "../../../../Wolfie2D/DataTypes/State/State";
import Vec2 from "../../../../Wolfie2D/DataTypes/Vec2";
import GameEvent from "../../../../Wolfie2D/Events/GameEvent";
import AnimatedSprite from "../../../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import Timer from "../../../../Wolfie2D/Timing/Timer";
import { AR_Events } from "../../../animalrevenge_enums";
import ElephantAI from "./ElephantAI";

export default class Combat extends State {
    
    protected owner: AnimatedSprite;
    protected parent: ElephantAI;

    protected damage: number;
    protected attackSpeed: number;
    protected range: number;

    protected cooldownTimer: Timer;

    constructor(parent: ElephantAI, owner: AnimatedSprite, stats: Record<string, any>) {
        super(parent);
        this.owner = owner;
        this.damage = stats.damage;
        this.attackSpeed = stats.attackSpeed;
        this.range = stats.range;
        this.cooldownTimer = new Timer((1.0 / this.attackSpeed) * 1000);
        this.cooldownTimer.levelSpeed = this.parent.levelSpeed;
    }
    
    onEnter(options: Record<string, any>): void {
        this.cooldownTimer.levelSpeed = this.parent.levelSpeed;
    }

    handleInput(event: GameEvent): void {
        if (event.type === AR_Events.WAVE_START_END) {
            if (!event.data.get("isWaveInProgress")) {
                this.finished("idle");
            }
        }
        if (event.type === AR_Events.LEVEL_SPEED_CHANGE) {
            this.parent.levelSpeed = event.data.get("levelSpeed");
            this.cooldownTimer.levelSpeed = this.parent.levelSpeed;
        }
        if (event.type === AR_Events.PAUSE_RESUME_GAME) {
            if (event.data.get("pausing")) {
                this.parent.isPaused = true;
                this.owner.animation.pause();
                if (this.cooldownTimer.isRunning()) this.cooldownTimer.pause();
                return;
            } else {
                this.parent.isPaused = false;
                this.owner.animation.resume();
                if (this.cooldownTimer.isPaused()) this.cooldownTimer.resume();
                return;
            }
        }
        if (this.parent.isPaused) {
            return;
        }
        if (event.type === AR_Events.NEW_TARGET_LOCATION) {
            if (event.data.get("id") === this.owner.id) {
                this.parent.target = event.data.get("target");
            }
        } 
        // else if (event.type === AR_Events.ENEMY_DIED) {
        //     if (this.parent.target === event.data.get("id")) {
        //         this.finished("idle");
        //     }
        // }
    }
    
    update(deltaT: number): void {
        if (this.parent.isPaused) {
            return;
        }
        if (this.cooldownTimer.isStopped() && !this.parent.target.equals(new Vec2(-100, -100))) {
            let dir = this.parent.target.clone().sub(this.owner.position).normalize();
            let start = this.owner.position.clone().add(dir.scaled(40));

            let projectile = this.owner.getScene().add.sprite("waterBomb", "UI");
            projectile.scale.set(0.8, 0.8);
            projectile.position.set(start.x, start.y);
            projectile.addPhysics(new AABB(Vec2.ZERO, new Vec2(5, 5)), undefined, false, false);
            projectile.setGroup("projectile");

            let midPoint = new Vec2((this.parent.target.x + projectile.position.x)/2, (this.parent.target.y + projectile.position.y)/2);
            let distance = this.parent.target.distanceTo(projectile.position);
            let speed = distance * 0.4;

            this.parent.projectiles.push({sprite: projectile, dir: dir, midPoint: midPoint, target: this.parent.target, speed: speed});
            this.owner.rotation = Vec2.UP.angleToCCW(dir);
            this.owner.animation.play("Firing", false);
            this.cooldownTimer.start();
        }
        this.parent.updateProjectiles(deltaT);
    }

    onExit(): Record<string, any> {
        return null;
    }
}

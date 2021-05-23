import State from "../../../../Wolfie2D/DataTypes/State/State";
import GameEvent from "../../../../Wolfie2D/Events/GameEvent";
import AnimatedSprite from "../../../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import Timer from "../../../../Wolfie2D/Timing/Timer";
import { AR_Events } from "../../../animalrevenge_enums";
import CowAI from "./CowAI";

export default class Idle extends State {

    protected owner: AnimatedSprite;
    protected parent: CowAI;
    protected idleTimer: Timer;
    protected damage: number;

    constructor(parent: CowAI, owner: AnimatedSprite, stats: Record<string, any>) {
        super(parent);
        this.owner = owner;
        this.damage = stats.damage;
    }

    onEnter(options: Record<string, any>): void {
        this.owner.animation.play("IDLE"); //this is a temporary fix to a bug that forces us to play an animation
        this.owner.animation.stop();
        this.idleTimer = new Timer(1000 * (Math.random() * (8 - 3) + 3));
        this.idleTimer.levelSpeed = this.parent.levelSpeed;
        this.idleTimer.start();
        this.parent.attackDuration.levelSpeed = this.parent.levelSpeed;
    }

    handleInput(event: GameEvent): void {
        if (event.type === AR_Events.LEVEL_SPEED_CHANGE) {
            this.parent.levelSpeed = event.data.get("levelSpeed");
            this.idleTimer.levelSpeed = this.parent.levelSpeed;
            this.parent.attackDuration.levelSpeed = this.parent.levelSpeed;
            if (this.parent.areaofEffect.visible) {
                this.parent.trigger.setTrigger("enemy", AR_Events.ENEMY_HIT, null, {damage: this.damage * this.parent.damageMultiplier.get(this.parent.levelSpeed)});
            }
        }
        if (event.type === AR_Events.PAUSE_RESUME_GAME) {
            if (event.data.get("pausing")) {
                this.parent.isPaused = true;
                this.owner.animation.pause();
                if (this.idleTimer.isRunning()) this.idleTimer.pause();
                if (this.parent.attackDuration.isRunning()) this.parent.attackDuration.pause();
                return;
            } else {
                this.parent.isPaused = false;
                this.owner.animation.resume();
                if (this.idleTimer.isPaused()) this.idleTimer.resume();
                if (this.parent.attackDuration.isPaused()) this.parent.attackDuration.resume();
                return;
            }
        }
        if (this.parent.isPaused) {
            return;
        }
        if (event.type === AR_Events.ENEMY_ENTERED_TOWER_RANGE) {
            let target = this.owner.getScene().getSceneGraph().getNode(event.data.get("target"));
            let turret = this.owner.getScene().getSceneGraph().getNode(event.data.get("turret"));
            if (target === undefined || turret.id !== this.owner.id) {
                return;
            }
            this.parent.target = event.data.get("target");
            this.finished("combat");
        }
        if (event.type === AR_Events.SELL_TOWER) {
            if (event.data.get("id") === this.owner.id) {
                this.parent.areaofEffect.destroy();
                this.parent.trigger.destroy();
                this.owner.destroy();
            }
        } 
    }

    update(deltaT: number): void {
        if (this.parent.isPaused) {
            return;
        }
        if (this.idleTimer.isStopped()) {
            this.owner.animation.play("IDLE");
            this.idleTimer = new Timer(1000 * (Math.random() * (8 - 3) + 3));
            this.idleTimer.start();
        }
        if(this.parent.attackDuration.isStopped() && this.parent.areaofEffect.visible) {
            this.parent.areaofEffect.visible = false;
            this.parent.trigger.setTrigger("enemy", null, null, {damage: 0});
        }
    }

    onExit(): Record<string, any> {
        return null;
    }
}
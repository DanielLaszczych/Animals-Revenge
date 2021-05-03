import State from "../../../../Wolfie2D/DataTypes/State/State";
import Vec2 from "../../../../Wolfie2D/DataTypes/Vec2";
import GameEvent from "../../../../Wolfie2D/Events/GameEvent";
import AnimatedSprite from "../../../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import Timer from "../../../../Wolfie2D/Timing/Timer";
import { AR_Events } from "../../../animalrevenge_enums";
import ElephantAI from "./ElephantAI";

export default class Idle extends State {
    
    protected owner: AnimatedSprite;
    protected parent: ElephantAI;
    protected idleTimer: Timer;
    protected damage: number;

    constructor(parent: ElephantAI, owner: AnimatedSprite) {
        super(parent);
        this.owner = owner;
    }
    
    onEnter(options: Record<string, any>): void {
        this.owner.animation.play("IDLE"); //this is a temporary fix to a bug that forces us to play an animation
        this.owner.animation.stop();
        this.idleTimer = new Timer(1000 * (Math.random() * (8 - 3) + 3));
        this.idleTimer.levelSpeed = this.parent.levelSpeed;
        this.idleTimer.start();
    }

    handleInput(event: GameEvent): void {
        if (event.type === AR_Events.WAVE_START_END) {
            if (event.data.get("isWaveInProgress")) {
                this.finished("combat");
            }
        }
        if (event.type === AR_Events.LEVEL_SPEED_CHANGE) {
            this.parent.levelSpeed = event.data.get("levelSpeed");
            this.idleTimer.levelSpeed = this.parent.levelSpeed;
        }
        if (event.type === AR_Events.PAUSE_RESUME_GAME) {
            if (event.data.get("pausing")) {
                this.parent.isPaused = true;
                this.owner.animation.pause();
                if (this.idleTimer.isRunning()) this.idleTimer.pause();
                return;
            } else {
                this.parent.isPaused = false;
                this.owner.animation.resume();
                if (this.idleTimer.isPaused()) this.idleTimer.resume();
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
    }
    
    update(deltaT: number): void {
        if (this.parent.isPaused) {
            return;
        }
        if (this.idleTimer.isStopped()) {
            this.owner.animation.play("IDLE");
            this.idleTimer = new Timer(1000 * (Math.random() * (8 - 3) + 3));
            this.idleTimer.levelSpeed = this.parent.levelSpeed;
            this.idleTimer.start();
        }
        this.parent.updateProjectiles(deltaT);
    }

    onExit(): Record<string, any> {
        return null;
    }
}
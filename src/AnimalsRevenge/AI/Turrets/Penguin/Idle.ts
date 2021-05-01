import State from "../../../../Wolfie2D/DataTypes/State/State";
import GameEvent from "../../../../Wolfie2D/Events/GameEvent";
import AnimatedSprite from "../../../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import Timer from "../../../../Wolfie2D/Timing/Timer";
import { AR_Events } from "../../../animalrevenge_enums";
import PenguinAI from "./PenguinAI";

export default class Idle extends State {
    
    protected owner: AnimatedSprite;
    protected parent: PenguinAI;
    protected idleTimer: Timer;

    constructor(parent: PenguinAI, owner: AnimatedSprite) {
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
        if (event.type === AR_Events.ENEMY_ENTERED_TOWER_RANGE) {
            let target = this.owner.getScene().getSceneGraph().getNode(event.data.get("target"));
            let turret = this.owner.getScene().getSceneGraph().getNode(event.data.get("turret"));
            if (target === undefined || turret.id !== this.owner.id) {
                return;
            }
            this.parent.target = event.data.get("target");
            this.finished("combat");
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
        for (let i = 0; i < this.parent.projectiles.length;) {
            let projectile = this.parent.projectiles[i].sprite;
            if (projectile.position.x === -1) { //this means they projectile collided and its position was set to -1
                this.parent.projectiles.splice(i, 1)[0];
                projectile.destroy();
                continue;
            }
            let target = this.parent.projectiles[i].target;
            let targetNode = this.owner.getScene().getSceneGraph().getNode(target);
            if (targetNode !== undefined) {
                this.parent.projectiles[i].dir = targetNode.position.clone().sub(projectile.position).normalize();
                projectile.position.add(this.parent.projectiles[i].dir.scaled(800 * deltaT * this.parent.levelSpeed));
            } else {
                projectile.position.add(this.parent.projectiles[i].dir.scaled(800 * deltaT * this.parent.levelSpeed));
            }
            if (projectile.position.x > 1200 || projectile.position.x < 0 || projectile.position.y > 800 || projectile.position.y < 0) {
                this.parent.projectiles.splice(i, 1)[0];
                projectile.destroy();
                continue;
            }
            i++;
        }
    }

    onExit(): Record<string, any> {
        return null;
    }
}
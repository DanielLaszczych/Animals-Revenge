import AABB from "../../../../Wolfie2D/DataTypes/Shapes/AABB";
import Circle from "../../../../Wolfie2D/DataTypes/Shapes/Circle";
import State from "../../../../Wolfie2D/DataTypes/State/State";
import Vec2 from "../../../../Wolfie2D/DataTypes/Vec2";
import GameEvent from "../../../../Wolfie2D/Events/GameEvent";
import AnimatedSprite from "../../../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import Timer from "../../../../Wolfie2D/Timing/Timer";
import { AR_Events } from "../../../animalrevenge_enums";
import EagleAI from "./EagleAI";

export default class Combat extends State {
    
    protected owner: AnimatedSprite;
    protected parent: EagleAI;

    protected damage: number;
    protected attackSpeed: number;
    protected range: number;
    protected hasStrongSlow: boolean;

    protected cooldownTimer: Timer;

    constructor(parent: EagleAI, owner: AnimatedSprite, stats: Record<string, any>) {
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
        if (event.type === AR_Events.ENEMY_ENTERED_TOWER_RANGE) {
           return;
        } 
        if (event.type === AR_Events.SELL_TOWER) {
            if (event.data.get("id") === this.owner.id) {
                for (let i = 0; i < this.parent.projectiles.length;) {
                    let projectile = this.parent.projectiles[i].sprite;
                    this.parent.projectiles.splice(i, 1)[0];
                    projectile.destroy();
                }
                this.owner.destroy();
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
        let targetNode = this.owner.getScene().getSceneGraph().getNode(this.parent.target);
        let isTargetInRange;
        try {
            isTargetInRange = this.checkAABBtoCircleCollision(targetNode.collisionShape.getBoundingRect(), this.owner.collisionShape.getBoundingCircle())
        } catch {
            isTargetInRange = false;
        }
        if (targetNode === undefined || !isTargetInRange) {
            this.finished("idle");
        } else {
            if (this.cooldownTimer.isStopped()) {
                try {
                    let dir = targetNode.position.clone().sub(this.owner.position).normalize();
    
                    let projectile = this.owner.getScene().add.animatedSprite("lightingBolt", "primary");
                    projectile.animation.play("Falling");
                    projectile.scale.set(2.6, 2.6);
                    projectile.position.set(targetNode.position.x - 300, targetNode.position.y - 800);
                    projectile.addPhysics(new AABB(Vec2.ZERO, new Vec2(4, 4)), undefined, false, false);
                    projectile.setGroup("projectile");
                    projectile.setTrigger("enemy", AR_Events.ENEMY_HIT, null, {damage: this.damage, target: this.parent.target, electricAttack: true});
                    let projectileDir = targetNode.position.clone().sub(projectile.position).normalize();
    
                    this.parent.projectiles.push({sprite: projectile, target: this.parent.target, dir: projectileDir});
                    this.owner.rotation = Vec2.UP.angleToCCW(dir);
                    this.owner.animation.play("Firing", false);
                    this.cooldownTimer.start();
                } catch {
                    return;
                }
            }
        }
        this.parent.updateProjectiles(deltaT);
    }

    onExit(): Record<string, any> {
        return null;
    }

    checkAABBtoCircleCollision(aabb: AABB, circle: Circle): boolean {
        // Your code goes here:
        let pointX = circle.x;
        let pointY = circle.y;

        if (circle.x < aabb.left) {
            pointX = aabb.left
        } else if (circle.x > aabb.right) {
            pointX = aabb.right;
        }

        if (circle.y < aabb.top) {
            pointY = aabb.top
        } else if (circle.y > aabb.bottom) {
            pointY = aabb.bottom;
        }

        let distX = circle.x - pointX;
        let distY = circle.y - pointY;
        let distance = Math.sqrt((distX * distX) + (distY * distY));

        if (distance <= circle.r) {
            return true;
        }
        return false;
	}

}

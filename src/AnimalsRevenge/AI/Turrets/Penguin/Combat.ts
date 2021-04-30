
import AABB from "../../../../Wolfie2D/DataTypes/Shapes/AABB";
import Circle from "../../../../Wolfie2D/DataTypes/Shapes/Circle";
import State from "../../../../Wolfie2D/DataTypes/State/State";
import Vec2 from "../../../../Wolfie2D/DataTypes/Vec2";
import GameEvent from "../../../../Wolfie2D/Events/GameEvent";
import AnimatedSprite from "../../../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import Sprite from "../../../../Wolfie2D/Nodes/Sprites/Sprite";
import Timer from "../../../../Wolfie2D/Timing/Timer";
import { AR_Events } from "../../../animalrevenge_enums";
import PengiuinAI from "./PenguinAI";

export default class Combat extends State {
    
    protected owner: AnimatedSprite;
    protected parent: PengiuinAI;

    protected damage: number;
    protected attackSpeed: number;
    protected range: number;
    protected hasStrongSlow: boolean;

    protected cooldownTimer: Timer;

    constructor(parent: PengiuinAI, owner: AnimatedSprite, stats: Record<string, any>) {
        super(parent);
        this.owner = owner;
        this.damage = stats.damage;
        this.attackSpeed = stats.attackSpeed;
        this.hasStrongSlow = stats.hasStrongSlow;
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
                    let targetPath = targetNode.mostRecentPath;
                    let targetDirection = targetPath.getMoveDirection(targetNode);
                    let preditictedTargetPosition = targetNode.position.clone().add(targetDirection.scaled(this.parent.predictionMultiplier.get(this.parent.levelSpeed)));
                    let dir = preditictedTargetPosition.clone().sub(this.owner.position).normalize();
                    let start = this.owner.position.clone();
    
                    let projectile = this.owner.getScene().add.sprite("snowball", "primary");
                    projectile.scale.set(1.5, 1.5);
                    projectile.position.set(start.x, start.y);
                    projectile.addPhysics(new AABB(Vec2.ZERO, new Vec2(5, 5)), undefined, false, false);
                    projectile.setGroup("projectile");
                    let slowAmount = this.hasStrongSlow ? 25 : 15;
                    projectile.setTrigger("enemy", AR_Events.ENEMY_HIT, null, {damage: this.damage, slowAmount: slowAmount});
    
                    this.parent.projectiles.push({sprite: projectile, dir: dir, target: this.parent.target});
                    this.owner.rotation = Vec2.UP.angleToCCW(dir);
                    this.owner.animation.play("Firing", false);
                    this.cooldownTimer.start();
                } catch {
                    return;
                }
            }
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
            if (projectile.position.x > 1200 || projectile.position.x < 0) {
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

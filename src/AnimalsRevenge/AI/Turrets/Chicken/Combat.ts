import AABB from "../../../../Wolfie2D/DataTypes/Shapes/AABB";
import Circle from "../../../../Wolfie2D/DataTypes/Shapes/Circle";
import State from "../../../../Wolfie2D/DataTypes/State/State";
import Vec2 from "../../../../Wolfie2D/DataTypes/Vec2";
import GameEvent from "../../../../Wolfie2D/Events/GameEvent";
import { GameEventType } from "../../../../Wolfie2D/Events/GameEventType";
import AnimatedSprite from "../../../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import Timer from "../../../../Wolfie2D/Timing/Timer";
import { AR_Events } from "../../../animalrevenge_enums";
import ChickenAI from "./ChickenAI";

export default class Combat extends State {
    
    protected owner: AnimatedSprite;
    protected parent: ChickenAI;

    protected damage: number;
    protected attackSpeed: number;
    protected range: number;

    protected cooldownTimer: Timer;

    constructor(parent: ChickenAI, owner: AnimatedSprite, stats: Record<string, any>) {
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
        else if (event.type === AR_Events.PAUSE_RESUME_GAME) {
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
        else if (event.type === AR_Events.ENEMY_ENTERED_TOWER_RANGE) {
           return;
        } 
        else if (event.type === AR_Events.SELL_TOWER) {
            if (event.data.get("id") === this.owner.id) {
                for (let i = 0; i < this.parent.projectiles.length;) {
                    let projectile = this.parent.projectiles[i].sprite;
                    this.parent.projectiles.splice(i, 1)[0];
                    projectile.destroy();
                }
                this.owner.destroy();
            }
        } 
        else if (event.type === AR_Events.ENEMY_DIED) {
            for (let i = 0; i < this.parent.projectiles.length; i++) {
                if (this.parent.projectiles[i].target === event.data.get("id")) {
                    this.parent.projectiles[i].target = null;
                }
            }
            if (this.parent.target === event.data.get("id")) {
                this.finished("idle");
            }
        }
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
    
                    let projectile = this.owner.getScene().add.sprite("egg", "primary");
                    projectile.scale.set(1.5, 1.5);
                    projectile.position.set(start.x, start.y);
                    projectile.addPhysics(new AABB(Vec2.ZERO, new Vec2(5, 5)), undefined, false, false);
                    projectile.setGroup("projectile");
                    projectile.setTrigger("enemy", AR_Events.ENEMY_HIT, null, {damage: this.damage, target: this.parent.target});
    
                    this.parent.projectiles.push({sprite: projectile, dir: dir, target: this.parent.target});
                    this.owner.rotation = Vec2.UP.angleToCCW(dir);
                    this.owner.animation.play("Firing", false);
                    this.emitter.fireEvent(GameEventType.PLAY_SOUND, {key: "chickenFire", loop: false});
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

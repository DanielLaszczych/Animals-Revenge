import AABB from "../../../../Wolfie2D/DataTypes/Shapes/AABB";
import State from "../../../../Wolfie2D/DataTypes/State/State";
import GameEvent from "../../../../Wolfie2D/Events/GameEvent";
import CircleShape from "../../../../Wolfie2D/DataTypes/Shapes/Circle";
import AnimatedSprite from "../../../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import Timer from "../../../../Wolfie2D/Timing/Timer";
import { AR_Events } from "../../../animalrevenge_enums";
import CowAI from "./CowAI";
import Vec2 from "../../../../Wolfie2D/DataTypes/Vec2";
import { GameEventType } from "../../../../Wolfie2D/Events/GameEventType";

export default class Combat extends State {

    protected owner: AnimatedSprite;
    protected parent: CowAI;

    protected damage: number;
    protected attackSpeed: number;
    protected range: number;
    protected targetDirection: Vec2;

    protected cooldownTimer: Timer;
    protected doOnce: boolean;
    protected dir: Vec2;
    protected end: Vec2;

    constructor(parent: CowAI, owner: AnimatedSprite, stats: Record<string, any>) {
        super(parent);
        this.owner = owner;
        this.damage = stats.damage;
        this.attackSpeed = stats.attackSpeed;
        this.range = stats.range;
        this.cooldownTimer = new Timer((1.0 / this.attackSpeed) * 1000);
        this.parent.attackDuration = new Timer(4000);
    }

    onEnter(options: Record<string, any>): void {
        this.cooldownTimer.levelSpeed = this.parent.levelSpeed;
        this.parent.attackDuration.levelSpeed = this.parent.levelSpeed;
    }

    handleInput(event: GameEvent): void {
        if (event.type === AR_Events.LEVEL_SPEED_CHANGE) {
            this.parent.levelSpeed = event.data.get("levelSpeed");
            this.cooldownTimer.levelSpeed = this.parent.levelSpeed;
            this.parent.attackDuration.levelSpeed = this.parent.levelSpeed;
            if (this.parent.areaofEffect.visible) {
                this.parent.trigger.setTrigger("enemy", AR_Events.ENEMY_HIT, null, {damage: this.damage * this.parent.damageMultiplier.get(this.parent.levelSpeed)});
            }
        }
        if (event.type === AR_Events.PAUSE_RESUME_GAME) {
            if (event.data.get("pausing")) {
                this.parent.isPaused = true;
                this.owner.animation.pause();
                if (this.cooldownTimer.isRunning()) this.cooldownTimer.pause();
                if (this.parent.attackDuration.isRunning()) this.parent.attackDuration.pause();
                return;
            } else {
                this.parent.isPaused = false;
                this.owner.animation.resume();
                if (this.cooldownTimer.isPaused()) this.cooldownTimer.resume();
                if (this.parent.attackDuration.isPaused()) this.parent.attackDuration.resume();
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
                this.parent.areaofEffect.destroy();
                this.parent.trigger.destroy();
                this.owner.destroy();
            }
        } 
        else if (event.type === AR_Events.ENEMY_DIED) {
            if (this.parent.target === event.data.get("id")) {
                let isBurpNotInMotion = (this.parent.areaofEffect.visible && this.doOnce) || !this.parent.areaofEffect.visible;
                if (isBurpNotInMotion) {
                    this.finished("idle");
                }
            }
        }
    }

    update(deltaT: number): void {
        if (this.parent.isPaused) {
            return;
        }
        let targetNode = this.owner.getScene().getSceneGraph().getNode(this.parent.target);
        let isBurpNotInMotion = (this.parent.areaofEffect.visible && this.doOnce) || !this.parent.areaofEffect.visible;
        let isTargetInRange;
        try {
            isTargetInRange = this.checkAABBtoCircleCollision(targetNode.collisionShape.getBoundingRect(), this.owner.collisionShape.getBoundingCircle());
        } catch {
            isTargetInRange = false;
        }
        if ((targetNode === undefined && isBurpNotInMotion) || (!isTargetInRange && isBurpNotInMotion)) {
                this.finished("idle");
        } else {
            if (this.cooldownTimer.isStopped()) {
                try {
                    let targetPath = targetNode.mostRecentPath;
                    this.targetDirection = targetPath.getMoveDirection(targetNode);
                    let preditictedTargetPosition = targetNode.position.clone().add(this.targetDirection.scaled(this.parent.predictionMultiplier.get(this.parent.levelSpeed)));
                    this.dir = preditictedTargetPosition.clone().sub(this.owner.position).normalize();
                    this.owner.rotation = Vec2.UP.angleToCCW(this.dir);
    
                    this.parent.areaofEffect.position.set(targetNode.position.x, targetNode.position.y);
                    this.parent.areaofEffect.scale.set(0, 0);
                    this.parent.areaofEffect.visible = true;
                    this.owner.animation.play("Burping", false);
                    this.emitter.fireEvent(GameEventType.PLAY_SOUND, {key: "cowBurp", loop: false});
                    this.cooldownTimer.start();
                    this.doOnce = false;
                } catch {
                    return;
                }
            }
            if (this.parent.areaofEffect.scale.x >= 4.5 && !this.doOnce) {
                this.parent.trigger.position.set(this.parent.areaofEffect.position.x, this.parent.areaofEffect.position.y);
                this.parent.trigger.removePhysics();
                this.parent.trigger.addPhysics(new AABB(Vec2.ZERO, this.parent.areaofEffect.sizeWithZoom), undefined, false, false);
                this.parent.trigger.setTrigger("enemy", AR_Events.ENEMY_HIT, null, {damage: this.damage * this.parent.damageMultiplier.get(this.parent.levelSpeed)});
                this.parent.attackDuration.start();
                this.doOnce = true;
            } else if (!this.doOnce) {
                try {
                    let targetPath = targetNode.mostRecentPath;
                    this.targetDirection = targetPath.getMoveDirection(targetNode);
                    let preditictedTargetPosition = targetNode.position.clone().add(this.targetDirection.scaled(this.parent.predictionMultiplier.get(this.parent.levelSpeed)));
                    this.dir = preditictedTargetPosition.clone().sub(this.owner.position).normalize();
                    this.owner.rotation = Vec2.UP.angleToCCW(this.dir);
                    this.parent.areaofEffect.position.set(targetNode.position.x + (this.targetDirection.x * this.parent.levelSpeed), targetNode.position.y + (this.targetDirection.y * this.parent.levelSpeed));
                } catch {}
                this.parent.areaofEffect.scale.add(new Vec2(6 * deltaT * this.parent.levelSpeed, 6 * deltaT * this.parent.levelSpeed));  
            }
            if(this.parent.attackDuration.isStopped() && this.doOnce) {
                this.parent.areaofEffect.visible = false;
                this.parent.trigger.setTrigger("enemy", null, null, {damage: 0});
            }
        }
    }

    onExit(): Record<string, any> {
        return null;
    }

    checkAABBtoCircleCollision(aabb: AABB, circle: CircleShape): boolean {
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
        if (circle.r - distance >= 10) {
            return true;
        }
        return false;
	}
}


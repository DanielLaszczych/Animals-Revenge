import AABB from "../../../../Wolfie2D/DataTypes/Shapes/AABB";
import State from "../../../../Wolfie2D/DataTypes/State/State";
import GameEvent from "../../../../Wolfie2D/Events/GameEvent";
import Circle from "../../../../Wolfie2D/Nodes/Graphics/Circle";
import CircleShape from "../../../../Wolfie2D/DataTypes/Shapes/Circle";
import { GraphicType } from "../../../../Wolfie2D/Nodes/Graphics/GraphicTypes";
import AnimatedSprite from "../../../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import Timer from "../../../../Wolfie2D/Timing/Timer";
import { AR_Events } from "../../../animalrevenge_enums";
import CowAI from "./CowAI";
import Color from "../../../../Wolfie2D/Utils/Color";
import Vec2 from "../../../../Wolfie2D/DataTypes/Vec2";

export default class Combat extends State {

    protected owner: AnimatedSprite;
    protected parent: CowAI;

    protected damage: number;
    protected attackSpeed: number;
    protected range: number;
    protected hasConfusion: boolean;

    protected cooldownTimer: Timer;
    protected doOnce: boolean;
    protected dir: Vec2;
    protected end: Vec2;

    constructor(parent: CowAI, owner: AnimatedSprite, stats: Record<string, any>) {
        super(parent);
        this.owner = owner;
        this.damage = stats.damage;
        this.attackSpeed = stats.attackSpeed;
        this.hasConfusion = stats.hasConfusion;
        this.range = stats.range;
        this.cooldownTimer = new Timer((1.0 / this.attackSpeed) * 1000);
        this.parent.attackDuration = new Timer(5000);
    }

    onEnter(options: Record<string, any>): void {
    }

    handleInput(event: GameEvent): void {
        if (event.type === AR_Events.ENEMY_ENTERED_TOWER_RANGE) {
            return;
        } else if (event.type === AR_Events.ENEMY_DIED) {
            if (this.parent.target === event.data.get("id")) {
                console.log("our target has died");
                let isBurpNotInMotion = (this.parent.areaofEffect.visible && this.doOnce) || !this.parent.areaofEffect.visible;
                if (isBurpNotInMotion) {
                    this.finished("idle");
                }
            }
        }
    }

    update(deltaT: number): void {
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
                    let targetDirection;
                    let targetPath = targetNode.mostRecentPath;
                    targetDirection = targetPath.getMoveDirection(targetNode);
                    let preditictedTargetPosition = targetNode.position.clone().add(targetDirection.scaled(80));
                    this.dir = preditictedTargetPosition.clone().sub(this.owner.position).normalize();
                    let start = this.owner.position.clone().add(this.dir.scaled(30));
                    this.end = preditictedTargetPosition;
                    console.log("End:" + this.end.toString())
                    this.owner.rotation = Vec2.UP.angleToCCW(this.dir);
    
                    this.parent.areaofEffect.position.set(start.x, start.y);
                    this.parent.areaofEffect.radius = 0;
                    this.parent.areaofEffect.visible = true;
                    this.owner.animation.play("Burping", false);
                    this.cooldownTimer.start();
                    this.doOnce = false;
                } catch {
                    return;
                }
            }
            let reachedTargetY = (this.parent.areaofEffect.position.y > this.end.y && this.dir.y > 0) || (this.parent.areaofEffect.position.y < this.end.y && this.dir.y < 0); 
            let reachedTargetX = (this.parent.areaofEffect.position.x > this.end.x && this.dir.x > 0) || (this.parent.areaofEffect.position.x < this.end.x && this.dir.x < 0); 
            if (this.parent.areaofEffect.radius === 80 && (reachedTargetX || reachedTargetY) && !this.doOnce) {
                this.parent.trigger.position.set(this.parent.areaofEffect.position.x, this.parent.areaofEffect.position.y);
                this.parent.attackDuration.start();
                this.parent.trigger.removePhysics();
                this.parent.trigger.addPhysics(new AABB(Vec2.ZERO, new Vec2(this.parent.areaofEffect.radius, this.parent.areaofEffect.radius)), undefined, false, false);
                this.parent.trigger.setTrigger("enemy", AR_Events.ENEMY_HIT, null, {damage: this.damage, confuseEnemy: this.hasConfusion});
                this.doOnce = true;
            } else {
                if (this.parent.areaofEffect.radius !== 80) {
                    this.parent.areaofEffect.radius += 1;   
                }
                if (!(reachedTargetY || reachedTargetX)) {
                    console.log("pushing");
                    this.parent.areaofEffect.position.add(this.dir.scaled(2));
                }
            }
            if(this.parent.attackDuration.isStopped() && this.doOnce) {
                this.parent.areaofEffect.visible = false;
                this.doOnce = false;
                this.parent.trigger.setTrigger("enemy", null, null, {damage: this.damage});
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

        if (distance <= circle.r) {
            return true;
        }
        return false;
	}
}


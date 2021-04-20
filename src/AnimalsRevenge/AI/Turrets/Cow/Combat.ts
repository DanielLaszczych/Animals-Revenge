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
    protected radiusofAOE: number;

    protected cooldownTimer: Timer;

    constructor(parent: CowAI, owner: AnimatedSprite, stats: Record<string, any>) {
        super(parent);
        this.owner = owner;
        this.damage = stats.damage;
        this.attackSpeed = stats.attackSpeed;
        this.range = stats.range;
        this.cooldownTimer = new Timer((1.0 / this.attackSpeed) * 1000);
        this.radiusofAOE = 0;
    }

    onEnter(options: Record<string, any>): void {
    }

    handleInput(event: GameEvent): void {
        if (event.type === AR_Events.ENEMY_DIED) {
            if (this.parent.target === event.data.get("id")) {
                this.finished("idle");
            }
        }
    }

    update(deltaT: number): void {
        let targetNode = this.owner.getScene().getSceneGraph().getNode(this.parent.target);
        if (targetNode === undefined || !this.checkAABBtoCircleCollision(targetNode.collisionShape.getBoundingRect(), this.owner.collisionShape.getBoundingCircle())) {
            this.finished("idle");
        } else {
            if (this.cooldownTimer.isStopped()) {
                this.parent.areaofEffect = <Circle>this.owner.getScene().add.graphic(GraphicType.CIRCLE, "primary", {position: this.owner.position, radius: new Number(this.radiusofAOE)});
                this.parent.areaofEffect.color = new Color(0, 255, 0, 0.3);
                this.parent.areaofEffect.borderColor = Color.TRANSPARENT;
                this.parent.trigger.setGroup("projectile");
                this.parent.trigger.setTrigger("enemy", AR_Events.ENEMY_HIT, null, {damage: this.damage});

                this.owner.animation.play("Firing", false);
                this.cooldownTimer.start();
                }
            }
            if (this.parent.areaofEffect.radius === 300) {
                this.parent.trigger.addPhysics(new AABB(Vec2.ZERO, new Vec2(this.parent.areaofEffect.radius, this.parent.areaofEffect.radius)), undefined, true, false);
            } else {
                this.parent.trigger.addPhysics(new AABB(Vec2.ZERO, new Vec2(this.parent.areaofEffect.radius, this.parent.areaofEffect.radius)), undefined, true, false);
                this.parent.areaofEffect.radius += 2;   
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


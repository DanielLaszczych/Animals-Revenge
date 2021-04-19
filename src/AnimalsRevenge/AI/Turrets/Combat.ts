import AABB from "../../../Wolfie2D/DataTypes/Shapes/AABB";
import Circle from "../../../Wolfie2D/DataTypes/Shapes/Circle";
import State from "../../../Wolfie2D/DataTypes/State/State";
import Vec2 from "../../../Wolfie2D/DataTypes/Vec2";
import GameEvent from "../../../Wolfie2D/Events/GameEvent";
import GameNode, { TweenableProperties } from "../../../Wolfie2D/Nodes/GameNode";
import { GraphicType } from "../../../Wolfie2D/Nodes/Graphics/GraphicTypes";
import Line from "../../../Wolfie2D/Nodes/Graphics/Line";
import AnimatedSprite from "../../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import Sprite from "../../../Wolfie2D/Nodes/Sprites/Sprite";
import Timer from "../../../Wolfie2D/Timing/Timer";
import Color from "../../../Wolfie2D/Utils/Color";
import { EaseFunctionType } from "../../../Wolfie2D/Utils/EaseFunctions";
import { AR_Events } from "../../animalrevenge_enums";
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
                let targetPath = targetNode.mostRecentPath;
                if (targetPath !== null) {
                    let targetDirection = targetPath.getMoveDirection(targetNode);
                    let preditictedTargetPosition = targetNode.position.clone().add(targetDirection.scaled(20));
                    let dir = preditictedTargetPosition.clone().sub(this.owner.position).normalize();
                    let start = this.owner.position.clone();

                    let projectile = this.owner.getScene().add.sprite("egg", "primary");
                    projectile.scale.set(0.35, 0.35);
                    projectile.position.set(start.x, start.y);
                    projectile.addPhysics(new AABB(Vec2.ZERO, new Vec2(5, 5)));
                    projectile.setGroup("projectile");
                    projectile.setTrigger("enemy", AR_Events.ENEMY_HIT, null, {damage: this.damage});

                    this.parent.projectiles.push({sprite: projectile, dir: dir});
                    this.owner.rotation = Vec2.UP.angleToCCW(dir);
                    this.owner.animation.play("Firing", false);
                    this.cooldownTimer.start();
                }
            }
        }
        for (let i = 0; i < this.parent.projectiles.length;) {
            if (this.parent.projectiles[i].sprite.position.x === -1) { //this means they projectile collided and its position was set to -1
                let projectile = this.parent.projectiles.splice(i, 1)[0].sprite;
                projectile.destroy();
                continue;
            }
            let newPosition = this.parent.projectiles[i].sprite.position.add(this.parent.projectiles[i].dir.scaled(15));
            this.parent.projectiles[i].sprite.position.set(newPosition.x, newPosition.y);
            if (this.parent.projectiles[i].sprite.position.x > 1200 || this.parent.projectiles[i].sprite.position.x < 0) {
                let projectile = this.parent.projectiles.splice(i, 1)[0].sprite;
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
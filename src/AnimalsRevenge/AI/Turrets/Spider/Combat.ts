import AABB from "../../../../Wolfie2D/DataTypes/Shapes/AABB";
import Circle from "../../../../Wolfie2D/DataTypes/Shapes/Circle";
import State from "../../../../Wolfie2D/DataTypes/State/State";
import Vec2 from "../../../../Wolfie2D/DataTypes/Vec2";
import GameEvent from "../../../../Wolfie2D/Events/GameEvent";
import AnimatedSprite from "../../../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import Timer from "../../../../Wolfie2D/Timing/Timer";
import { AR_Events } from "../../../animalrevenge_enums";
import SpiderAI from "./SpiderAI";

export default class Combat extends State{
    
    protected owner: AnimatedSprite;
    protected parent: SpiderAI;

    protected damage: number;
    protected attackSpeed: number;
    protected range: number;
    protected canAttack: boolean;
    protected slowUpgrade: boolean;
    protected targetDirection: Vec2;

    protected webTimer: Timer;
    protected attackTimer: Timer;
    protected dir: Vec2;
    protected end: Vec2;
    protected webOnScene: boolean;

    constructor(parent: SpiderAI, owner: AnimatedSprite, stats: Record<string, any>){
        super(parent);
        this.owner = owner;
        this.damage = stats.damage;
        this.attackSpeed = stats.attackSpeed;
        this.canAttack = stats.canAttack;
        this.slowUpgrade = stats.slowUpgrade;
        this.webOnScene = false;
        this.range = stats.range;
        this.webTimer = new Timer(5000);
        this.attackTimer = new Timer(2000);
    }

    onEnter(options: Record<string, any>){
        this.webTimer.levelSpeed = this.parent.levelSpeed;
    }

    handleInput(event: GameEvent): void{
        if (event.type === AR_Events.LEVEL_SPEED_CHANGE) {
            this.parent.levelSpeed = event.data.get("levelSpeed");
            this.webTimer.levelSpeed = this.parent.levelSpeed;
            if (this.parent.areaofEffect.visible) {
                this.parent.trigger.setTrigger("enemy", AR_Events.ENEMY_HIT, null, {damage: 0});
            }
        }
        if (event.type === AR_Events.PAUSE_RESUME_GAME) {
            if (event.data.get("pausing")) {
                this.parent.isPaused = true;
                this.owner.animation.pause();
                if (this.webTimer.isRunning()) this.webTimer.pause();
                return;
            } else {
                this.parent.isPaused = false;
                this.owner.animation.resume();
                if (this.webTimer.isPaused()) this.webTimer.resume();
                return;
            }
        }
        if (this.parent.isPaused) {
            return;
        }
        if (event.type === AR_Events.ENEMY_ENTERED_TOWER_RANGE) {
            return;
        } 
    }

    update(deltaT: number): void{
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
            let slowAmount = this.slowUpgrade ? 35 : 20
            
            if(this.webTimer.isStopped()){
                let targetPath = targetNode.mostRecentPath;
                this.targetDirection = targetPath.getMoveDirection(targetNode);
                let preditictedTargetPosition = targetNode.position.clone().add(this.targetDirection.scaled(this.parent.predictionMultiplier.get(this.parent.levelSpeed)));
                this.dir = preditictedTargetPosition.clone().sub(this.owner.position).normalize();
                this.owner.rotation = Vec2.UP.angleToCCW(this.dir);
                this.parent.areaofEffect.position.set(targetNode.position.x, targetNode.position.y);
                this.parent.areaofEffect.scale.set(5, 5);
                this.parent.areaofEffect.visible = true;
                this.owner.animation.play("ATTACKING", false);
                this.webOnScene = true;
                console.log(this.canAttack);
                console.log(this.slowUpgrade);
                this.webTimer.start();
            }else{
                if(!this.webTimer.isRunning()){
                    this.webTimer.start()
                }
            }
            if(this.webOnScene){
                this.parent.trigger.position.set(this.parent.areaofEffect.position.x, this.parent.areaofEffect.position.y);
                this.parent.trigger.removePhysics();
                this.parent.trigger.addPhysics(new AABB(Vec2.ZERO, this.parent.areaofEffect.sizeWithZoom), undefined, false, false);
                this.parent.trigger.setTrigger("enemy", AR_Events.ENEMY_HIT, null, {damage: 0, slowAmount: slowAmount});
                this.webOnScene = false;
            }
            if(this.canAttack && this.attackTimer.isStopped()){
                let targetPath = targetNode.mostRecentPath;
                this.targetDirection = targetPath.getMoveDirection(targetNode);
                let preditictedTargetPosition = targetNode.position.clone().add(this.targetDirection.scaled(this.parent.predictionMultiplier.get(this.parent.levelSpeed)));
                this.dir = preditictedTargetPosition.clone().sub(this.owner.position).normalize();
                this.owner.rotation = Vec2.UP.angleToCCW(this.dir);
                this.owner.animation.play("ATTACKING", false);
                this.attackTimer.start();

            }else if(!this.attackTimer.isRunning()){
                this.attackTimer.start();
            }
        }
    }

    onExit(): Record<string, any>{
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
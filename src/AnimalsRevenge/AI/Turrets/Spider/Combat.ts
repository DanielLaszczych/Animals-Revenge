// import AABB from "../../../../Wolfie2D/DataTypes/Shapes/AABB";
// import State from "../../../../Wolfie2D/DataTypes/State/State";
// import Vec2 from "../../../../Wolfie2D/DataTypes/Vec2";
// import GameEvent from "../../../../Wolfie2D/Events/GameEvent";
// import CircleShape from "../../../../Wolfie2D/DataTypes/Shapes/Circle";
// import AnimatedSprite from "../../../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
// import Timer from "../../../../Wolfie2D/Timing/Timer";
// import { AR_Events } from "../../../animalrevenge_enums";
// import SpiderAi from "./SpiderAi";

// export default class Combat extends State {

//     protected owner: AnimatedSprite;
//     protected parent: SpiderAi;

//     protected damage: number;
//     protected attackSpeed: number;
//     protected range: number;
//     protected canAttack: boolean;

//     protected cooldownTimer: Timer;
//     protected doOnce: boolean;
//     protected dir: Vec2;
//     protected end: Vec2;

//     constructor(parent: SpiderAi, owner: AnimatedSprite, stats: Record<string, any>) {
//         super(parent);
//         this.owner = owner;
//         this.damage = stats.damage;
//         this.attackSpeed = stats.attackSpeed;
//         this.canAttack = stats.canAttack;
//         this.range = stats.range;
//         this.cooldownTimer = new Timer((1.0 / this.attackSpeed) * 1000);
//         this.parent.slowDuration = new Timer(4000);
//     }

//     onEnter(options: Record<string, any>): void {
//         this.cooldownTimer.levelSpeed = this.parent.levelSpeed;
//         this.parent.slowDuration.levelSpeed = this.parent.levelSpeed;
//     }

//     handleInput(event: GameEvent): void {
//         if (event.type === AR_Events.LEVEL_SPEED_CHANGE) {
//             this.parent.levelSpeed = event.data.get("levelSpeed");
//             this.cooldownTimer.levelSpeed = this.parent.levelSpeed;
//             this.parent.slowDuration.levelSpeed = this.parent.levelSpeed;
//         }
//         if (event.type === AR_Events.PAUSE_RESUME_GAME) {
//             if (event.data.get("pausing")) {
//                 this.parent.isPaused = true;
//                 this.owner.animation.pause();
//                 if (this.cooldownTimer.isRunning()) this.cooldownTimer.pause();
//                 if (this.parent.slowDuration.isRunning()) this.parent.slowDuration.pause();
//                 return;
//             } else {
//                 this.parent.isPaused = false;
//                 this.owner.animation.resume();
//                 if (this.cooldownTimer.isPaused()) this.cooldownTimer.resume();
//                 if (this.parent.slowDuration.isPaused()) this.parent.slowDuration.resume();
//                 return;
//             }
//         }
//         if (this.parent.isPaused) {
//             return;
//         }
//         if (event.type === AR_Events.ENEMY_ENTERED_TOWER_RANGE) {
//             return;
//         } 
//     }

//     update(deltaT: number): void {
//         if (this.parent.isPaused) {
//             return;
//         }
//         let targetNode = this.owner.getScene().getSceneGraph().getNode(this.parent.target);
//         let isBurpNotInMotion = (this.parent.areaofEffect.visible && this.doOnce) || !this.parent.areaofEffect.visible;
//         let isTargetInRange;
//         try {
//             isTargetInRange = this.checkAABBtoCircleCollision(targetNode.collisionShape.getBoundingRect(), this.owner.collisionShape.getBoundingCircle());
//         } catch {
//             isTargetInRange = false;
//         }
//         if ((targetNode === undefined && isBurpNotInMotion) || (!isTargetInRange && isBurpNotInMotion)) {
//                 this.finished("idle");
//         } else {
//             if (this.cooldownTimer.isStopped()) {
//                 try {
//                     let targetPath = targetNode.mostRecentPath;
//                     let targetDirection = targetPath.getMoveDirection(targetNode);
//                     let preditictedTargetPosition = targetNode.position.clone().add(targetDirection.scaled(this.parent.predictionMultiplier.get(this.parent.levelSpeed)));
//                     this.dir = preditictedTargetPosition.clone().sub(this.owner.position).normalize();
//                     let start = this.owner.position.clone().add(this.dir.scaled(25));
//                     this.end = preditictedTargetPosition;
//                     this.owner.rotation = Vec2.UP.angleToCCW(this.dir);
    
//                     this.parent.areaofEffect.position.set(start.x, start.y);
//                     this.parent.areaofEffect.scale.set(0, 0);
//                     this.parent.areaofEffect.visible = true;
//                     this.owner.animation.play("Burping", false);
//                     this.cooldownTimer.start();
//                     this.doOnce = false;
//                 } catch {
//                     return;
//                 }
//             }
//             let reachedTargetY = (this.parent.areaofEffect.position.y > this.end.y && this.dir.y > 0) || (this.parent.areaofEffect.position.y < this.end.y && this.dir.y < 0); 
//             let reachedTargetX = (this.parent.areaofEffect.position.x > this.end.x && this.dir.x > 0) || (this.parent.areaofEffect.position.x < this.end.x && this.dir.x < 0); 
//             if (this.parent.areaofEffect.scale.x >= 4.5 && (reachedTargetX || reachedTargetY) && !this.doOnce) {
//                 this.parent.trigger.position.set(this.parent.areaofEffect.position.x, this.parent.areaofEffect.position.y);
//                 this.parent.slowDuration.start();
//                 this.parent.trigger.removePhysics();
//                 this.parent.trigger.addPhysics(new AABB(Vec2.ZERO, this.parent.areaofEffect.sizeWithZoom), undefined, false, false);
//                 this.parent.trigger.setTrigger("enemy", AR_Events.ENEMY_HIT, null, {damage: this.damage * this.parent.damageMultiplier.get(this.parent.levelSpeed), confuseEnemy: this.hasConfusion});
//                 this.doOnce = true;
//             } else {
//                 if (this.parent.areaofEffect.scale.x < 4.5) {
//                     this.parent.areaofEffect.scale.add(new Vec2(0.07 * this.parent.levelSpeed, 0.07 * this.parent.levelSpeed));   
//                 }
//                 if (!(reachedTargetY || reachedTargetX)) {
//                     this.parent.areaofEffect.position.add(this.dir.scaled(2 * this.parent.levelSpeed));
//                 }
//             }
//             if(this.parent.slowDuration.isStopped() && this.doOnce) {
//                 this.parent.areaofEffect.visible = false;
//                 this.doOnce = false;
//                 this.parent.trigger.setTrigger("enemy", null, null, {damage: this.damage});
//             }
//         }
//     }

//     onExit(): Record<string, any> {
//         return null;
//     }

//     checkAABBtoCircleCollision(aabb: AABB, circle: CircleShape): boolean {
//         // Your code goes here:
//         let pointX = circle.x;
//         let pointY = circle.y;

//         if (circle.x < aabb.left) {
//             pointX = aabb.left
//         } else if (circle.x > aabb.right) {
//             pointX = aabb.right;
//         }

//         if (circle.y < aabb.top) {
//             pointY = aabb.top
//         } else if (circle.y > aabb.bottom) {
//             pointY = aabb.bottom;
//         }

//         let distX = circle.x - pointX;
//         let distY = circle.y - pointY;
//         let distance = Math.sqrt((distX * distX) + (distY * distY));

//         if (distance <= circle.r) {
//             return true;
//         }
//         return false;
// 	}
// }

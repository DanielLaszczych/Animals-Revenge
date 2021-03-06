import AABB from "../../../../Wolfie2D/DataTypes/Shapes/AABB";
import Circle from "../../../../Wolfie2D/DataTypes/Shapes/Circle";
import State from "../../../../Wolfie2D/DataTypes/State/State";
import Vec2 from "../../../../Wolfie2D/DataTypes/Vec2";
import GameEvent from "../../../../Wolfie2D/Events/GameEvent";
import { GameEventType } from "../../../../Wolfie2D/Events/GameEventType";
import AnimatedSprite from "../../../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import Timer from "../../../../Wolfie2D/Timing/Timer";
import { AR_Events } from "../../../animalrevenge_enums";
import SpiderAI from "./SpiderAI";

export default class Combat extends State {

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

    constructor(parent: SpiderAI, owner: AnimatedSprite, stats: Record<string, any>) {
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

    onEnter(options: Record<string, any>) {
        this.webTimer.levelSpeed = this.parent.levelSpeed;
        this.attackTimer.levelSpeed = this.parent.levelSpeed;
    }

    handleInput(event: GameEvent): void {
        if (event.type === AR_Events.LEVEL_SPEED_CHANGE) {
            this.parent.levelSpeed = event.data.get("levelSpeed");
            this.webTimer.levelSpeed = this.parent.levelSpeed;
            if (this.parent.areaofEffect.visible) {
                this.parent.trigger.setTrigger("enemy", AR_Events.ENEMY_HIT, null, { damage: 0 });
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
                this.parent.areaofEffect.destroy();
                this.parent.trigger.destroy();
                this.owner.destroy();
            }
        } 
        else if (event.type === AR_Events.ENEMY_DIED) {
            for (let i = 0; i < this.parent.projectiles.length; i++) {
                if (this.parent.projectiles[i].target === event.data.get("id")) {
                    this.parent.projectiles[i].target = null;
                }
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

            if (this.webTimer.isStopped() && !this.owner.animation.isPlaying("ATTACKING")) {
                try {
                    let targetPath = targetNode.mostRecentPath;
                    this.targetDirection = targetPath.getMoveDirection(targetNode);
                    let preditictedTargetPosition = targetNode.position.clone().add(this.targetDirection.scaled(this.parent.predictionMultiplier.get(this.parent.levelSpeed)));
                    this.dir = preditictedTargetPosition.clone().sub(this.owner.position).normalize();
                    this.owner.rotation = Vec2.UP.angleToCCW(this.dir);
                    this.parent.areaofEffect.position.set(targetNode.position.x, targetNode.position.y);
                    this.parent.areaofEffect.scale.set(6, 6);
                    this.parent.areaofEffect.visible = true;
                    this.owner.animation.play("ATTACKING", false);
                    this.emitter.fireEvent(GameEventType.PLAY_SOUND, { key: "spiderWeb", loop: false });
                    this.webOnScene = true;
                    this.webTimer.start();

                } catch {}
            } else {
                if (!this.webTimer.isRunning()) {
                    this.webTimer.start()
                }
            }
            if (this.webOnScene) {
                let slowAmount = this.slowUpgrade ? 40 : 25
                this.parent.trigger.position.set(this.parent.areaofEffect.position.x, this.parent.areaofEffect.position.y);
                this.parent.trigger.removePhysics();
                this.parent.trigger.addPhysics(new AABB(Vec2.ZERO, this.parent.areaofEffect.sizeWithZoom), undefined, false, false);
                this.parent.trigger.setTrigger("enemy", AR_Events.ENEMY_HIT, null, { damage: 0, slowAmount: slowAmount });
                this.webOnScene = false;
            }
            if (this.canAttack && this.attackTimer.isStopped() && !this.owner.animation.isPlaying("ATTACKING")) {
                try {
                    let targetPath = targetNode.mostRecentPath;
                    this.targetDirection = targetPath.getMoveDirection(targetNode);
                    let preditictedTargetPosition = targetNode.position.clone().add(this.targetDirection.scaled(this.parent.predictionMultiplier.get(this.parent.levelSpeed)));
                    this.dir = preditictedTargetPosition.clone().sub(this.owner.position).normalize();

                    let projectile = this.owner.getScene().add.animatedSprite("poison", "primary");
                    projectile.animation.play("Flying");
                    projectile.scale.set(1.5, 1.5);
                    projectile.position.set(this.owner.position.x, this.owner.position.y);
                    projectile.addPhysics(new AABB(Vec2.ZERO, new Vec2(5, 5)), undefined, false, false);
                    projectile.setGroup("projectile");
                    projectile.setTrigger("enemy", AR_Events.ENEMY_HIT, null, { damage: 5, target: this.parent.target, poison: true });

                    this.parent.projectiles.push({ sprite: projectile, target: this.parent.target, dir: this.dir });
                    this.owner.rotation = Vec2.UP.angleToCCW(this.dir);
                    this.owner.animation.play("ATTACKING", false);
                    this.emitter.fireEvent(GameEventType.PLAY_SOUND, { key: "spiderPoison", loop: false });
                    this.attackTimer.start();
                } catch {

                }

            } else if (!this.attackTimer.isRunning()) {
                this.attackTimer.start();
            }
            this.parent.updateProjectiles(deltaT);
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
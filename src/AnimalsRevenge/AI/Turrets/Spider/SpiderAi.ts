import StateMachineAI from "../../../../Wolfie2D/AI/StateMachineAI";
import AABB from "../../../../Wolfie2D/DataTypes/Shapes/AABB";
import Vec2 from "../../../../Wolfie2D/DataTypes/Vec2";
import { GraphicType } from "../../../../Wolfie2D/Nodes/Graphics/GraphicTypes";
import Point from "../../../../Wolfie2D/Nodes/Graphics/Point";
import AnimatedSprite from "../../../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import Sprite from "../../../../Wolfie2D/Nodes/Sprites/Sprite";
import Color from "../../../../Wolfie2D/Utils/Color";
import { AR_Events } from "../../../animalrevenge_enums";
import Combat from "./Combat";
import Idle from "./Idle";

export default class SpiderAI extends StateMachineAI {
    
    protected owner: AnimatedSprite;
    public levelSpeed: number;
    protected stats: Record<string, any>;
    public areaofEffect: Sprite;
    public trigger: Point;
    public isPaused: boolean = false;
    public target: number;
    public predictionMultiplier: Map<number, number>;
    public projectiles: Array<{sprite: Sprite, target: number, dir: Vec2}>;

    initializeAI(owner: AnimatedSprite, stats: Record<string, any>) {
        this.owner = owner;
        this.stats = stats;
        this.levelSpeed = 1;
        this.projectiles = new Array();
        this.addState("idle", new Idle(this, owner, this.stats));
        this.addState("combat", new Combat(this, owner, this.stats));

        this.predictionMultiplier = new Map([
            [1, 10],
            [2, 20],
            [4, 40]
        ]);

        this.trigger = this.owner.getScene().add.graphic(GraphicType.POINT, "primary", {position: new Vec2(-100, -100)});
        this.trigger.color = Color.TRANSPARENT;
        this.trigger.addPhysics(new AABB(Vec2.ZERO, new Vec2(0, 0)), undefined, false, false);

        this.areaofEffect = this.owner.getScene().add.sprite("cobweb", "UI");
        this.areaofEffect.position.set(-100, -100);
        this.areaofEffect.visible = false;
        this.areaofEffect.alpha = 1;

        this.receiver.subscribe(AR_Events.ENEMY_ENTERED_TOWER_RANGE);
        this.receiver.subscribe(AR_Events.ENEMY_DIED);
        this.receiver.subscribe(AR_Events.PAUSE_RESUME_GAME);
        this.receiver.subscribe(AR_Events.LEVEL_SPEED_CHANGE);
        this.receiver.subscribe(AR_Events.SELL_TOWER);

        this.initialize("idle");
    }
    activate(newStats: Record<string, any>) {
        if (newStats.type === "attackSpeed") {
            this.stats.attackSpeed = newStats.attackSpeed;
        } else if (newStats.type === "damage") {
            this.stats.damage = newStats.damage;
        } else if (newStats.type === "range") {
            this.stats.range = newStats.range;
        } else if (newStats.type === "hasAura") {
            this.stats.hasAura = newStats.hasAura;
        } else if (newStats.type === "canAttack") {
            this.stats.canAttack = newStats.canAttack;
        } else if (newStats.type === "slowUpgrade"){
            this.stats.slowUpgrade = newStats.slowUpgrade;
        }
        this.addState("idle", new Idle(this, this.owner, this.stats));
        this.addState("combat", new Combat(this, this.owner, this.stats));
    }

    updateProjectiles(deltaT: number): void {
        for (let i = 0; i < this.projectiles.length; i++) {
            let projectile = this.projectiles[i].sprite;
            if (projectile.position.x === -1) { //this means they projectile collided and its position was set to -1
                this.projectiles.splice(i, 1)[0];
                projectile.destroy();
                continue;
            }
            let target = this.projectiles[i].target;
            let targetNode = this.owner.getScene().getSceneGraph().getNode(target);
            if (targetNode !== undefined) {
                this.projectiles[i].dir = targetNode.position.clone().sub(projectile.position).normalize();
                projectile.position.add(this.projectiles[i].dir.scaled(800 * deltaT * this.levelSpeed));
            } else {
                projectile.setTrigger("enemy", AR_Events.ENEMY_HIT, null, {damage: 0, poison: true});
                projectile.position.add(this.projectiles[i].dir.scaled(800 * deltaT * this.levelSpeed));
            }
            if (projectile.position.x > 1200) {
                this.projectiles.splice(i, 1)[0];
                projectile.destroy();
                continue;
            }
        }
    }
}
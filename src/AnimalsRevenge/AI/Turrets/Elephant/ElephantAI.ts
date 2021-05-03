import StateMachineAI from "../../../../Wolfie2D/AI/StateMachineAI";
import AABB from "../../../../Wolfie2D/DataTypes/Shapes/AABB";
import Vec2 from "../../../../Wolfie2D/DataTypes/Vec2";
import { GraphicType } from "../../../../Wolfie2D/Nodes/Graphics/GraphicTypes";
import AnimatedSprite from "../../../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import Sprite from "../../../../Wolfie2D/Nodes/Sprites/Sprite";
import Color from "../../../../Wolfie2D/Utils/Color";
import { AR_Events } from "../../../animalrevenge_enums";
import Combat from "./Combat";
import Idle from "./Idle";

export default class ElephantAI extends StateMachineAI {
    
    protected owner: AnimatedSprite;

    public target: Vec2;
    protected stats: Record<string, any>;
    public projectiles: Array<{sprite: Sprite, dir: Vec2, midPoint: Vec2, target: Vec2, speed: number}>;
    public isPaused: boolean = false;
    public levelSpeed: number;
    
    initializeAI(owner: AnimatedSprite, stats: Record<string, any>) {
        this.owner = owner;
        this.stats = stats;
        this.projectiles = new Array();
        this.levelSpeed = 1;
        this.target = new Vec2(-100, -100);

        this.addState("idle", new Idle(this, owner));
        this.addState("combat", new Combat(this, owner, this.stats));

        this.receiver.subscribe(AR_Events.ENEMY_ENTERED_TOWER_RANGE);
        this.receiver.subscribe(AR_Events.ENEMY_DIED);
        this.receiver.subscribe(AR_Events.PAUSE_RESUME_GAME);
        this.receiver.subscribe(AR_Events.LEVEL_SPEED_CHANGE);
        this.receiver.subscribe(AR_Events.WAVE_START_END);
        this.receiver.subscribe(AR_Events.NEW_TARGET_LOCATION);

        this.initialize("idle");
    }

    activate(newStats: Record<string, any>) {
        if (newStats.type === "attackSpeed") {
            this.stats.attackSpeed = newStats.attackSpeed;
        } else if (newStats.type === "damage") {
            this.stats.damage = newStats.damage;
        } else if (newStats.type === "range") {
            this.stats.range = newStats.range;
        } else if (newStats.type === "accuracy") {
            this.stats.accuracy = newStats.accuracy;
        }
        this.addState("idle", new Idle(this, this.owner));
        this.addState("combat", new Combat(this, this.owner, this.stats));
    }

    updateProjectiles(deltaT: number): void {
        for (let i = 0; i < this.projectiles.length;) {
            let projectile = this.projectiles[i].sprite;
            if (projectile.position.x === -1) { //this means they projectile collided and its position was set to -1
                this.projectiles.splice(i, 1)[0];
                projectile.destroy();
                continue;
            }

            let dir = this.projectiles[i].dir;
            let midPoint = this.projectiles[i].midPoint;
            let target = this.projectiles[i].target;
            let speed = this.projectiles[i].speed;

            projectile.position.add(dir.scaled(speed * deltaT * this.levelSpeed));
            if ((dir.x > 0 && projectile.position.x > midPoint.x) || (dir.x < 0 && projectile.position.x < midPoint.x)) {
                projectile.scale.add(new Vec2(-0.05 * this.levelSpeed, -0.05 * this.levelSpeed));
            } else {
                projectile.scale.add(new Vec2(0.05 * this.levelSpeed, 0.05 * this.levelSpeed));
            }
            if ((dir.x > 0 && projectile.position.x >= target.x) || (dir.x < 0 && projectile.position.x <= target.x)) {
                this.projectiles.splice(i, 1)[0];
                projectile.destroy();
                let splash = this.owner.getScene().add.animatedSprite("splash", "UI");
                splash.scale.scale(8, 8);
                splash.position.set(target.x, target.y);
                splash.animation.play("Splashing");
                let trigger = this.owner.getScene().add.graphic(GraphicType.POINT, "primary", {position: target});
                trigger.color = Color.TRANSPARENT;
                setTimeout(() => {
                    trigger.addPhysics(new AABB(Vec2.ZERO, new Vec2(60, 62)), undefined, false, false);
                    trigger.setTrigger("enemy", AR_Events.ENEMY_HIT, null, {damage: this.stats.damage, explosionId: trigger.id});
                }, 200);
                setTimeout(() => {
                    splash.destroy();
                    trigger.destroy();
                }, 500);
                continue;
            }
            if (projectile.position.x > 1200 || projectile.position.x < 0 || projectile.position.y > 800 || projectile.position.y < 0) {
                this.projectiles.splice(i, 1)[0];
                projectile.destroy();
                continue;
            }
            let futurePosition = projectile.position.clone().add(dir.scaled(speed * deltaT * this.levelSpeed));
            if ((dir.x > 0 && futurePosition.x > target.x) || (dir.x < 0 && futurePosition.x < target.x)) {
                this.projectiles[i].speed = (target.x - projectile.position.x) / (dir.x * deltaT * this.levelSpeed);
            }
            i++;
        }
    }
}
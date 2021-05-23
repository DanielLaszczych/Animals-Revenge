import StateMachineAI from "../../../../Wolfie2D/AI/StateMachineAI";
import Vec2 from "../../../../Wolfie2D/DataTypes/Vec2";
import AnimatedSprite from "../../../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import Sprite from "../../../../Wolfie2D/Nodes/Sprites/Sprite";
import { AR_Events } from "../../../animalrevenge_enums";
import Combat from "./Combat";
import Idle from "./Idle";

export default class PenguinAI extends StateMachineAI {
    
    protected owner: AnimatedSprite;

    protected stats: Record<string, any>;
    public target: number;
    public projectiles: Array<{sprite: Sprite, dir: Vec2, target: number}>;
    public isPaused: boolean = false;
    public levelSpeed: number;
    public predictionMultiplier: Map<number, number>;
    
    initializeAI(owner: AnimatedSprite, stats: Record<string, any>) {
        this.owner = owner;
        this.stats = stats;
        this.projectiles = new Array();
        this.levelSpeed = 1;
        this.predictionMultiplier = new Map([
            [1, 24],
            [2, 35],
            [4, 45]
        ]);

        this.addState("idle", new Idle(this, owner, this.stats));
        this.addState("combat", new Combat(this, owner, this.stats));

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
        } else if (newStats.type === "hasStrongSlow") {
            this.stats.hasStrongSlow = newStats.hasStrongSlow;
        }
        this.addState("idle", new Idle(this, this.owner, this.stats));
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
            let target = this.projectiles[i].target;
            let targetNode = this.owner.getScene().getSceneGraph().getNode(target);
            if (targetNode !== undefined) {
                this.projectiles[i].dir = targetNode.position.clone().sub(projectile.position).normalize();
                projectile.position.add(this.projectiles[i].dir.scaled(800 * deltaT * this.levelSpeed));
            } else {
                let slowAmount = this.stats.hasStrongSlow ? 25 : 15;
                projectile.setTrigger("enemy", AR_Events.ENEMY_HIT, null, {damage: this.stats.damage, slowAmount: slowAmount});
                projectile.position.add(this.projectiles[i].dir.scaled(800 * deltaT * this.levelSpeed));
            }
            if (projectile.position.x > 1200 || projectile.position.x < 0 || projectile.position.y > 800 || projectile.position.y < 0) {
                this.projectiles.splice(i, 1)[0];
                projectile.destroy();
                continue;
            }
            i++;
        }
    }
}
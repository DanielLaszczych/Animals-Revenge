import State from "../../../Wolfie2D/DataTypes/State/State";
import GameEvent from "../../../Wolfie2D/Events/GameEvent";
import GameNode from "../../../Wolfie2D/Nodes/GameNode";
import AnimatedSprite from "../../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import NavigationPath from "../../../Wolfie2D/Pathfinding/NavigationPath";
import Scene from "../../../Wolfie2D/Scene/Scene";
import Timer from "../../../Wolfie2D/Timing/Timer";
import { AR_Events } from "../../animalrevenge_enums";
import ChickenAI from "./ChickenAI";

export default class Idle extends State {
    
    protected owner: AnimatedSprite;
    protected parent: ChickenAI;
    protected idleTimer: Timer;

    constructor(parent: ChickenAI, owner: AnimatedSprite) {
        super(parent);
        this.owner = owner;
    }
    
    onEnter(options: Record<string, any>): void {
        this.owner.animation.play("IDLE"); //this is a temporary fix to a bug that forces us to play an animation
        this.owner.animation.stop();
        this.idleTimer = new Timer(1000 * (Math.random() * (8 - 3) + 3));
        this.idleTimer.start();
    }

    handleInput(event: GameEvent): void {
        if (event.type === AR_Events.ENEMY_ENTERED_TOWER_RANGE) {
            let target = this.owner.getScene().getSceneGraph().getNode(event.data.get("target"));
            if (target === undefined) {
                return;
            }
            this.parent.target = event.data.get("target");
            this.finished("combat");
        }
    }
    
    update(deltaT: number): void {
        if (this.idleTimer.isStopped()) {
            this.owner.animation.play("IDLE");
            this.idleTimer = new Timer(1000 * (Math.random() * (8 - 3) + 3));
            this.idleTimer.start();
        }
        for (let i = 0; i < this.parent.projectiles.length;) {
            if (this.parent.projectiles[i].sprite.position.x === -1) { //this means they projectile collided and its position was set to -1
                let projectile = this.parent.projectiles.splice(i, 1)[0].sprite;
                projectile.destroy();
                continue;
            }
            let newPosition = this.parent.projectiles[i].sprite.position.add(this.parent.projectiles[i].dir.scaled(10));
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

}
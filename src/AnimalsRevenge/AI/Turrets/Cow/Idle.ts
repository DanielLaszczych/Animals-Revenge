import State from "../../../../Wolfie2D/DataTypes/State/State";
import GameEvent from "../../../../Wolfie2D/Events/GameEvent";
import AnimatedSprite from "../../../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import Timer from "../../../../Wolfie2D/Timing/Timer";
import { AR_Events } from "../../../animalrevenge_enums";
import CowAI from "./CowAI";

export default class Idle extends State {

    protected owner: AnimatedSprite;
    protected parent: CowAI;
    protected idleTimer: Timer;

    constructor(parent: CowAI, owner: AnimatedSprite) {
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
            let turret = this.owner.getScene().getSceneGraph().getNode(event.data.get("turret"));
            if (target === undefined || turret.id !== this.owner.id) {
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
        if(this.parent.attackDuration.isStopped() && this.parent.areaofEffect.visible) {
            this.parent.areaofEffect.visible = false;
            this.parent.trigger.setTrigger("enemy", null, null, {damage: 0});
        }
    }

    onExit(): Record<string, any> {
        return null;
    }
}
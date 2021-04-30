import State from "../../../Wolfie2D/DataTypes/State/State";
import Vec2 from "../../../Wolfie2D/DataTypes/Vec2";
import GameEvent from "../../../Wolfie2D/Events/GameEvent";
import GameNode from "../../../Wolfie2D/Nodes/GameNode";
import AnimatedSprite from "../../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import NavigationPath from "../../../Wolfie2D/Pathfinding/NavigationPath";
import Timer from "../../../Wolfie2D/Timing/Timer";
import { AR_Events } from "../../animalrevenge_enums";
import EnemyAI from "./EnemyAI";

export default class Walk extends State {

    protected owner: AnimatedSprite;

    protected parent: EnemyAI;

    protected route: Array<Vec2>;

    protected currentPath: NavigationPath;

    protected routeIndex: number;

    protected speed: number;
    protected slowAmount: number;
    protected originalSpeed: number;

    protected confusedStacks: number;
    protected freezeTimer: Timer;
    protected slowTimer: Timer;
    protected confuseImmunity: Timer;

    constructor(parent: EnemyAI, owner: AnimatedSprite, path: Array<Vec2>, speed: number) {
        super(parent);
        this.owner = owner;
        this.route = path;
        this.routeIndex = 0;
        this.speed = speed;
        this.freezeTimer = new Timer(1000);
        this.freezeTimer.levelSpeed = this.parent.levelSpeed;
        this.slowTimer = new Timer(500);
        this.slowTimer.levelSpeed = this.parent.levelSpeed;
        this.confuseImmunity = new Timer(6000);
        this.confuseImmunity.levelSpeed = this.parent.levelSpeed;
        this.confusedStacks = 0;
    }

    onEnter() {
        if (this.currentPath == null) {
            this.currentPath = this.getNextPath();
        }
        this.originalSpeed = this.speed;
        this.slowAmount = 0;
    }

    handleInput(event: GameEvent): void {
        if (event.type === AR_Events.LEVEL_SPEED_CHANGE) {
            this.parent.levelSpeed = event.data.get("levelSpeed");
            this.freezeTimer.levelSpeed = this.parent.levelSpeed;
            this.slowTimer.levelSpeed = this.parent.levelSpeed;
            this.confuseImmunity.levelSpeed = this.parent.levelSpeed
        } else if (event.type === AR_Events.PAUSE_RESUME_GAME) {
            if (event.data.get("pausing")) {
                if (this.freezeTimer.isRunning()) this.freezeTimer.pause();
                if (this.confuseImmunity.isRunning()) this.confuseImmunity.pause();
                if (this.slowTimer.isRunning()) this.slowTimer.pause();
                this.owner.freeze();
                this.owner.animation.pause();
                this.parent.isPaused = true;
                return;
            } else {
                if (this.freezeTimer.isPaused()) this.freezeTimer.resume();
                if (this.confuseImmunity.isPaused()) this.confuseImmunity.resume();
                if (this.slowTimer.isPaused()) this.slowTimer.resume();
                this.owner.unfreeze();
                this.owner.animation.resume();
                this.parent.isPaused = false;
                return;
            }
        } 
        if (this.parent.isPaused) {
            return;
        } else {
            if (event.type === AR_Events.ENEMY_CONFUSED) {
                if (this.owner.id === event.data.get("id") && this.confuseImmunity.isStopped() && !this.owner.frozen) {
                    this.confusedStacks++;
                    if (this.confusedStacks > (60 / this.parent.levelSpeed)) {
                        this.owner.freeze();
                        this.owner.animation.stop();
                        this.freezeTimer.start();
                        this.confusedStacks = 0;
                    }
                }
            } else if (event.type === AR_Events.ENEMY_SLOWED) {
                if (this.owner.id === event.data.get("id")) {
                    if (this.slowAmount === 0 || event.data.get("slowAmount") > this.slowAmount) {
                        this.speed = this.originalSpeed;
                        this.speed -= event.data.get("slowAmount");
                        this.slowTimer.start();
                    }
                }
            }
        }
    }

    update(deltaT: number): void {
        if (this.parent.isPaused) {
            return;
        }
        if (this.slowTimer.isStopped()) {
            this.speed = this.originalSpeed;
            this.slowAmount = 0;
        }
        if (this.freezeTimer.isStopped()) {
            if (this.owner.frozen) {
                this.owner.unfreeze();
                this.owner.animation.play("WALK");
                this.confuseImmunity.start();
            }
            if (this.currentPath.isDone()){
                this.currentPath = this.getNextPath();
            }
            this.owner.moveOnPath((this.speed - this.slowAmount) * deltaT * this.parent.levelSpeed, this.currentPath);
            this.owner.rotation = Vec2.RIGHT.angleToCCW(this.currentPath.getMoveDirection(this.owner));
        }
    }

    onExit(): Record<string, any> {
        return null;
    }

    getNextPath(): NavigationPath {
        let path = this.owner.getScene().getNavigationManager().getPath("navmesh", this.owner.position, this.route[this.routeIndex]);
        this.routeIndex++;
        return path;
    }


}
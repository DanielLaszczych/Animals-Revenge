import State from "../../../Wolfie2D/DataTypes/State/State";
import Vec2 from "../../../Wolfie2D/DataTypes/Vec2";
import GameEvent from "../../../Wolfie2D/Events/GameEvent";
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
    protected slowTimer: Timer;

    protected isDied: boolean;

    constructor(parent: EnemyAI, owner: AnimatedSprite, path: Array<Vec2>, speed: number) {
        super(parent);
        this.owner = owner;
        this.route = path;
        this.routeIndex = 0;
        this.speed = speed;
        this.slowTimer = new Timer(500);
        this.slowTimer.levelSpeed = this.parent.levelSpeed;
        this.isDied = false;
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
            this.slowTimer.levelSpeed = this.parent.levelSpeed;
        } else if (event.type === AR_Events.PAUSE_RESUME_GAME) {
            if (event.data.get("pausing")) {
                if (this.slowTimer.isRunning()) this.slowTimer.pause();
                this.owner.freeze();
                this.owner.animation.pause();
                this.parent.isPaused = true;
                return;
            } else {
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
            if (event.type === AR_Events.ENEMY_SLOWED) {
                if (this.owner.id === event.data.get("id")) {
                    if (this.slowAmount === 0 || event.data.get("slowAmount") > this.slowAmount) {
                        this.speed = this.originalSpeed;
                        this.slowAmount = event.data.get("slowAmount");
                        this.slowTimer.start();
                    }
                }
            }
            if (event.type === AR_Events.ENEMY_DIED) {
                if (this.owner.id === event.data.get("id") && this.owner.imageId === "drone") {
                    this.isDied = true;
                    this.speed = this.originalSpeed * 0.6;
                }
            }
        }
    }

    update(deltaT: number): void {
        if (this.parent.isPaused) {
            return;
        }
        if (this.slowTimer.isStopped() && !this.isDied) {
            this.speed = this.originalSpeed;
            this.slowAmount = 0;
        }
        if (this.currentPath.isDone()){
            this.currentPath = this.getNextPath();
        }
        this.owner.moveOnPath((this.speed - this.slowAmount) * deltaT * this.parent.levelSpeed, this.currentPath);
        if (this.owner.imageId === "drone" || this.owner.imageId === "superSoldier" || this.owner.imageId === "president" || this.owner.imageId === "robot_dog") {
            this.owner.rotation = Vec2.UP.angleToCCW(this.currentPath.getMoveDirection(this.owner))
        } else {
            let addTurn = 0;
            if (this.owner.imageId === "soldier") {
                addTurn = 0.9;
            }
            this.owner.rotation = Vec2.RIGHT.angleToCCW(this.currentPath.getMoveDirection(this.owner)) + addTurn;
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
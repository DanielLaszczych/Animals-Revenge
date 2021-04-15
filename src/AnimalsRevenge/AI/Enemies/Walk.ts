import State from "../../../Wolfie2D/DataTypes/State/State";
import Vec2 from "../../../Wolfie2D/DataTypes/Vec2";
import GameEvent from "../../../Wolfie2D/Events/GameEvent";
import GameNode from "../../../Wolfie2D/Nodes/GameNode";
import NavigationPath from "../../../Wolfie2D/Pathfinding/NavigationPath";
import EnemyAI from "./EnemyAI";

export default class Walk extends State {

    protected owner: GameNode;

    protected route: Array<Vec2>;

    protected currentPath: NavigationPath;

    protected routeIndex: number;

    protected speed: number;

    constructor(parent: EnemyAI, owner: GameNode, path: Array<Vec2>, speed: number) {
        super(parent);
        this.owner = owner;
        this.route = path;
        this.routeIndex = 0;
        this.speed = speed;
    }

    onEnter() {
        if (this.currentPath == null) {
            this.currentPath = this.getNextPath();
        }

    }

    handleInput(event: GameEvent): void {

    }

    update(deltaT: number): void {
        if (this.currentPath.isDone()){
            this.currentPath = this.getNextPath();
        }
        this.owner.moveOnPath(this.speed * deltaT, this.currentPath);
        this.owner.rotation = Vec2.RIGHT.angleToCCW(this.currentPath.getMoveDirection(this.owner));

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
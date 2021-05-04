import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import GameLevel from "./GameLevel";


export default class Level1 extends GameLevel {

    initScene(init: Record<string, any>) {
        super.initScene(init);
    }

    loadScene(): void {
        super.loadScene();

        // Loading the TileMap
        this.load.tilemap("level1", "assets/tilemaps/Farm.json");

        // Loading the navmesh
        this.load.object("navmesh", "assets/data/farm_navmesh.json");

        // Loading the wave data
        this.load.object("waveData", "assets/data/farm_waves.json");

        // Loading enemy spritesheets
        this.load.spritesheet("farmer", "assets/spritesheets/enemy_farmer.json")
        this.load.spritesheet("soldier", "assets/spritesheets/soldier.json")
        this.load.spritesheet("robot_dog", "assets/spritesheets/robot_dog.json")
        this.load.spritesheet("drone", "assets/spritesheets/drone.json")
    }

    startScene(): void {
        this.add.tilemap("level1", new Vec2(2, 2));
        super.startScene();

        this.addLevelStart(new Vec2(0, 656));
        this.addLevelEnd(new Vec2(784, -90), new Vec2(100, 100));
    }

    updateScene(deltaT: number): void {
        super.updateScene(deltaT);
    }
}
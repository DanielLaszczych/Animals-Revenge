import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import GameLevel from "./GameLevel";


export default class Level5 extends GameLevel {

    initScene(init: Record<string, any>) {
        super.initScene(init);
    }

    loadScene(): void {
        super.loadScene();

        // Loading the TileMap
        this.load.tilemap("level5", "assets/tilemaps/ParkingLot.json");

        // Loading the navmesh
        this.load.object("navmesh", "assets/data/parkinglot_navmesh.json");

        // Loading the wave data
        this.load.object("waveData", "assets/data/parkinglot_waves.json");

        // Loading enemy spritesheets
        this.load.spritesheet("farmer", "assets/spritesheets/enemy_farmer.json")
        this.load.spritesheet("soldier", "assets/spritesheets/soldier.json")
        this.load.spritesheet("robot_dog", "assets/spritesheets/robot_dog.json")
        this.load.spritesheet("drone", "assets/spritesheets/drone.json")

    }

    startScene(): void {
        this.add.tilemap("level5", new Vec2(2, 2));
        this.setSpawnArrow(new Vec2(50, 752), Vec2.RIGHT);

        super.startScene();

        this.addLevelStart(new Vec2(0, 752));
        this.addLevelEnd(new Vec2(688, -90), new Vec2(100, 100));
    }

    updateScene(deltaT: number): void {
        super.updateScene(deltaT);
    }
}
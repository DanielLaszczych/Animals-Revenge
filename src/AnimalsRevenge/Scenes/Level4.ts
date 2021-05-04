import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import GameLevel from "./GameLevel";


export default class Level4 extends GameLevel {

    initScene(init: Record<string, any>) {
        super.initScene(init);
    }

    loadScene(): void {
        super.loadScene();

        // Loading the TileMap
        this.load.tilemap("level4", "assets/tilemaps/SafariZoo.json");

        // Loading the navmesh
        this.load.object("navmesh", "assets/data/safarizoo_navmesh.json");

        // Loading the wave data
        this.load.object("waveData", "assets/data/safarizoo_waves.json");

        // Loading enemy spritesheets
        this.load.spritesheet("farmer", "assets/spritesheets/enemy_farmer.json")
        this.load.spritesheet("soldier", "assets/spritesheets/soldier.json")
        this.load.spritesheet("robot_dog", "assets/spritesheets/robot_dog.json")
        this.load.spritesheet("drone", "assets/spritesheets/drone.json")

    }

    startScene(): void {
        this.add.tilemap("level4", new Vec2(2, 2));
        super.startScene();

        this.addLevelStart(new Vec2(48, 784));
        this.addLevelEnd(new Vec2(560, 490), new Vec2(100, 70));
    }

    updateScene(deltaT: number): void {
        super.updateScene(deltaT);
    }
}
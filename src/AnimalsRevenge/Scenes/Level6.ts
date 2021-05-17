import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import GameLevel from "./GameLevel";


export default class Level6 extends GameLevel {

    initScene(init: Record<string, any>) {
        super.initScene(init);
    }

    loadScene(): void {
        super.loadScene();

        // Loading the TileMap
        this.load.tilemap("level6", "assets/tilemaps/WhiteHouseLawn.json");

        // Loading the navmesh
        this.load.object("navmesh", "assets/data/whitehouse_navmesh.json");

        // Loading the wave data
        this.load.object("waveData", "assets/data/whitehouse_waves.json");

        // Loading enemy spritesheets
        this.load.spritesheet("farmer", "assets/spritesheets/enemy_farmer.json");
        this.load.spritesheet("soldier", "assets/spritesheets/soldier.json");
        this.load.spritesheet("robot_dog", "assets/spritesheets/robot_dog.json");
        this.load.spritesheet("drone", "assets/spritesheets/drone.json");
        this.load.spritesheet("superSoldier", "assets/spritesheets/supersoldier.json");
        this.load.spritesheet("president", "assets/spritesheets/president.json")

    }

    startScene(): void {
        this.add.tilemap("level6", new Vec2(2, 2));
        this.setSpawnArrow(new Vec2(896, 416), Vec2.LEFT);

        super.startScene();

        this.addLevelStart(new Vec2(896, 416));
        this.addLevelEnd(new Vec2(-64, 384), new Vec2(100, 100));
    }

    updateScene(deltaT: number): void {
        super.updateScene(deltaT);
    }
}

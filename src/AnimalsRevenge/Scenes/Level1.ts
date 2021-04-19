import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import GameLevel from "./GameLevel";


export default class Level1 extends GameLevel {

    initScene(init: Record<string, any>) {
        super.initScene(init);
    }

    loadScene(): void {
        super.loadScene();

        // Loading the TileMap
        this.load.tilemap("level1", "assets/tilemaps/Test_Level_MK2.json");

        // Loading the navmesh
        this.load.object("navmesh", "assets/data/level1_navmesh.json");

        // Loading the wave data
        this.load.object("waveData", "assets/data/level1_waves.json");

        // Loading enemy spritesheets
        this.load.spritesheet("farmer", "assets/spritesheets/enemy_farmer.json")
        
    }

    startScene(): void {
        this.add.tilemap("level1", new Vec2(2, 2));
        super.startScene();

        this.addLevelEnd(new Vec2(688, -90), new Vec2(100, 100));
    }

    updateScene(deltaT: number): void {
        super.updateScene(deltaT);
    }
}
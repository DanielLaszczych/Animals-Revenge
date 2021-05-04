import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import GameLevel from "./GameLevel";


export default class Level3 extends GameLevel {

    initScene(init: Record<string, any>) {
        super.initScene(init);
    }

    loadScene(): void {
        super.loadScene();
    
        this.load.tilemap("level3", "assets/tilemaps/PenguinExhibit.json");

        // Loading the navmesh
        this.load.object("navmesh", "assets/data/penguinzoo_navmesh.json");

        // Loading the wave data
        this.load.object("waveData", "assets/data/penguinzoo_waves.json");

        this.load.spritesheet("farmer", "assets/spritesheets/enemy_farmer.json");
        this.load.spritesheet("superSoldier", "assets/spritesheets/supersoldier.json");
        this.load.spritesheet("robot_dog", "assets/spritesheets/robot_dog.json");
        this.load.spritesheet("drone", "assets/spritesheets/drone.json");

    }

    startScene(): void {
        this.add.tilemap("level3", new Vec2(2, 2));
        this.setSpawnArrow(new Vec2(368, 50), Vec2.DOWN);
        
        super.startScene();

        this.addLevelStart(new Vec2(368, 0));
        this.addLevelEnd(new Vec2(384, 960), new Vec2(100, 100));
        this.addLevelEnd(new Vec2(-108, 448), new Vec2(100, 100));
    }

    updateScene(deltaT: number): void {
        super.updateScene(deltaT);
    }
}

import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import GameLevel from "./GameLevel";


export default class Level1 extends GameLevel {

    initScene(init: Record<string, any>) {
        super.initScene(init);
    }

    loadScene(): void {
        super.loadScene();
        this.load.tilemap("level1", "assets/tilemaps/Test_Level_MK2.json");
    }

    startScene(): void {
        this.add.tilemap("level1", new Vec2(2, 2));
        super.startScene();
    }
}
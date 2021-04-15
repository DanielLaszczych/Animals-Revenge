import PositionGraph from "../../Wolfie2D/DataTypes/Graphs/PositionGraph";
import Physical from "../../Wolfie2D/DataTypes/Interfaces/Physical";
import AABB from "../../Wolfie2D/DataTypes/Shapes/AABB";
import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import Input, { BUTTON } from "../../Wolfie2D/Input/Input";
import Circle from "../../Wolfie2D/Nodes/Graphics/Circle";
import { GraphicType } from "../../Wolfie2D/Nodes/Graphics/GraphicTypes";
import Rect from "../../Wolfie2D/Nodes/Graphics/Rect";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import Sprite from "../../Wolfie2D/Nodes/Sprites/Sprite";
import OrthogonalTilemap from "../../Wolfie2D/Nodes/Tilemaps/OrthogonalTilemap";
import Button from "../../Wolfie2D/Nodes/UIElements/Button";
import Label from "../../Wolfie2D/Nodes/UIElements/Label";
import { UIElementType } from "../../Wolfie2D/Nodes/UIElements/UIElementTypes";
import Navmesh from "../../Wolfie2D/Pathfinding/Navmesh";
import Scene from "../../Wolfie2D/Scene/Scene"
import Color from "../../Wolfie2D/Utils/Color";
import EnemyAI from "../AI/Enemies/EnemyAI";
import { AR_Events } from "../animalrevenge_enums";

export default class GameLevel extends Scene {

    //Labels for the UI
    protected healthCount: number = 0;
    protected healthCountLabel: Label;
    protected moneyCount: number = 0;
    protected moneyCountLabel: Label;
    protected totalWaves: number = 0;
    protected currentWave: number = 0;
    protected waveCountLabel: Label;

    protected towersUnlocked: number = 0;

    protected size: Vec2;
    protected selectedTower: Sprite = null;
    protected selectedTowerRange: Circle = null;

    protected graph: PositionGraph;

    protected waves: Array<Record<string, any>>;
    protected executeWave: Record<string, any> = null;
    protected timeNow: number = Date.now();
    protected enemies: Array<AnimatedSprite>;
    protected enemyNumber: number;

    protected levelEndArea: Rect;
    protected firstEndAreaSetUp: boolean = true;

    protected tilemap: OrthogonalTilemap;

    protected placedTurrets: Array<Sprite>;

    protected doOnce: boolean = true;

    initScene(init: Record<string, any>) {
        this.healthCount = init.startHealth;
        this.moneyCount = init.startMoney;
        this.currentWave = 1;
        this.totalWaves = init.totalWaves;
        this.towersUnlocked = init.towersUnlocked;
    }

    loadScene(): void {
        this.load.image("heart", "assets/images/heart_temp.png");
        this.load.image("coin", "assets/images/coin_temp.png");
    }

    startScene(): void {
        this.initLayers();
        this.initViewPort();
        this.subscribeToEvents();
        this.addUI();
        this.createNavmesh();
        this.intializeWaves();

        this.placedTurrets = new Array();
        this.tilemap = this.getTilemap("EnemyArea") as OrthogonalTilemap;
    }

    protected initLayers(): void {
        let UI = this.addUILayer("UI");
        UI.setDepth(2);
        this.addLayer("primary", 1);
    }

    protected initViewPort(): void {
        this.size = this.viewport.getHalfSize();
        this.viewport.setZoomLevel(1);
    }

    protected subscribeToEvents(): void {
        this.receiver.subscribe([
            AR_Events.ENEMY_ENTERED_LEVEL_END,
            AR_Events.TOWER_ENTERED_ENEMY_PATH,
            AR_Events.TOWER_EXITED_ENEMY_PATH
        ]);
    }

    protected addUI(): void {
        let heart = this.add.sprite("heart", "UI");
        heart.scale.set(0.2, 0.2);
        heart.position.set(30, 30);

        this.healthCountLabel = <Label>this.add.uiElement(UIElementType.LABEL, "UI", {position: new Vec2(90, 30), text: this.healthCount.toString()});
        this.healthCountLabel.textColor = Color.WHITE
        this.healthCountLabel.font = "PixelSimple";

        let coin = this.add.sprite("coin", "UI");
        coin.scale.set(0.1, 0.1);
        coin.position.set(180, 30);

        this.moneyCountLabel = <Label>this.add.uiElement(UIElementType.LABEL, "UI", {position: new Vec2(240, 30), text: this.moneyCount.toString()});
        this.moneyCountLabel.textColor = Color.WHITE
        this.moneyCountLabel.font = "PixelSimple";

        this.waveCountLabel = <Label>this.add.uiElement(UIElementType.LABEL, "UI", {position: new Vec2(810, 30), text: "Wave " + this.currentWave + "/" + this.totalWaves});
        this.waveCountLabel.textColor = Color.WHITE
        this.waveCountLabel.font = "PixelSimple";

        let sidePanel = <Rect>this.add.graphic(GraphicType.RECT, "UI", {position: new Vec2(1050, this.size.y), size: new Vec2(300, 800)});
        sidePanel.color = new Color(186, 104, 30, 1);

        let shopLabel = <Label>this.add.uiElement(UIElementType.LABEL, "UI", {position: new Vec2(1050, 30), text: "Shop"});
        shopLabel.textColor = Color.WHITE;
        shopLabel.font = "PixelSimple";
        shopLabel.fontSize = 60;

        if (this.towersUnlocked >= 1) {
            let chickenTowerBtn = <Button>this.add.uiElement(UIElementType.BUTTON, "UI", {position: new Vec2(975, 125), text: "1"});
            chickenTowerBtn.backgroundColor = Color.TRANSPARENT;
            chickenTowerBtn.textColor = Color.BLACK;
            chickenTowerBtn.borderColor = Color.BLACK;
            chickenTowerBtn.borderRadius = 0;
            chickenTowerBtn.setPadding(new Vec2(50, 25));

            chickenTowerBtn.onClick = () => {
                if (Input.getMousePressButton() == BUTTON.LEFTCLICK && this.selectedTower == null && this.selectedTowerRange == null) {
                    this.selectedTower = this.add.sprite("heart", "UI");
                    this.selectedTower.position.set(Input.getMousePosition().x, Input.getMousePosition().y);
                    this.selectedTower.scale.set(0.2, 0.2);
                    this.selectedTower.addPhysics();
                    
                    this.selectedTowerRange = <Circle>this.add.graphic(GraphicType.CIRCLE, "UI", {position: Input.getMousePosition(), radius: new Number(350)});
                    this.selectedTowerRange.color = Color.GREEN;
                    this.selectedTowerRange.alpha = 0.3;
                    this.selectedTowerRange.borderWidth = 3;
                }
            }
        }

        if (this.towersUnlocked >= 2) {
            let cowTowerBtn = <Button>this.add.uiElement(UIElementType.BUTTON, "UI", {position: new Vec2(1125, 125), text: "2"});
            cowTowerBtn.backgroundColor = Color.TRANSPARENT;
            cowTowerBtn.textColor = Color.BLACK;
            cowTowerBtn.borderColor = Color.BLACK;
            cowTowerBtn.borderRadius = 0;
            cowTowerBtn.setPadding(new Vec2(50, 25));
        }

        if (this.towersUnlocked >= 3) {
            let spiderTowerBtn = <Button>this.add.uiElement(UIElementType.BUTTON, "UI", {position: new Vec2(975, 250), text: "3"});
            spiderTowerBtn.backgroundColor = Color.TRANSPARENT;
            spiderTowerBtn.textColor = Color.BLACK;
            spiderTowerBtn.borderColor = Color.BLACK;
            spiderTowerBtn.borderRadius = 0;
            spiderTowerBtn.setPadding(new Vec2(50, 25));
        }

        if (this.towersUnlocked >= 4) {
            let eagleTowerBtn = <Button>this.add.uiElement(UIElementType.BUTTON, "UI", {position: new Vec2(1125, 250), text: "4"});
            eagleTowerBtn.backgroundColor = Color.TRANSPARENT;
            eagleTowerBtn.textColor = Color.BLACK;
            eagleTowerBtn.borderColor = Color.BLACK;
            eagleTowerBtn.borderRadius = 0;
            eagleTowerBtn.setPadding(new Vec2(50, 25));
        }

        if (this.towersUnlocked >= 5) {
            let elephantTowerBtn = <Button>this.add.uiElement(UIElementType.BUTTON, "UI", {position: new Vec2(975, 375), text: "5"});
            elephantTowerBtn.backgroundColor = Color.TRANSPARENT;
            elephantTowerBtn.textColor = Color.BLACK;
            elephantTowerBtn.borderColor = Color.BLACK;
            elephantTowerBtn.borderRadius = 0;
            elephantTowerBtn.setPadding(new Vec2(50, 25));
        }

        if (this.towersUnlocked >= 6) {
            let penguinTowerBtn = <Button>this.add.uiElement(UIElementType.BUTTON, "UI", {position: new Vec2(1125, 375), text: "6"});
            penguinTowerBtn.backgroundColor = Color.TRANSPARENT;
            penguinTowerBtn.textColor = Color.BLACK;
            penguinTowerBtn.borderColor = Color.BLACK;
            penguinTowerBtn.borderRadius = 0;
            penguinTowerBtn.setPadding(new Vec2(50, 25));
        }

        let deselectTowerBtn = <Button>this.add.uiElement(UIElementType.BUTTON, "UI", {position: new Vec2(1050, 500), text: "Deselect"});
        deselectTowerBtn.backgroundColor = Color.TRANSPARENT;
        deselectTowerBtn.textColor = Color.BLACK;
        deselectTowerBtn.borderColor = Color.RED;
        deselectTowerBtn.borderRadius = 0;
        deselectTowerBtn.font = "PixelSimple";
        deselectTowerBtn.setPadding(new Vec2(10, 15));

        deselectTowerBtn.onClick = () => {
            if (Input.getMousePressButton() == BUTTON.LEFTCLICK && this.selectedTower !== null && this.selectedTowerRange !== null) {
                this.selectedTower.destroy();
                this.selectedTower = null;
                this.selectedTowerRange.destroy();
                this.selectedTowerRange = null;
            }
        }
    }

    protected incHealth(amt: number): void {
        this.healthCount += amt;
        this.healthCountLabel.text = this.healthCount.toString();
    }

    protected incMoney(amt: number): void {
        this.moneyCount += amt;
        this.moneyCountLabel.text = this.moneyCount.toString();
    }

    protected createNavmesh(): void{
        let graphLayer = this.addLayer("graph");
        graphLayer.setHidden(true)

        let navmesh = this.load.getObject("navmesh");

        this.graph = new PositionGraph();

        for(let node of navmesh.nodes){
            this.graph.addPositionedNode(new Vec2(node[0], node[1]));
            this.add.graphic(GraphicType.POINT, "graph", {position: new Vec2(node[0], node[1])})
        }

        for(let edge of navmesh.edges){
            this.graph.addEdge(edge[0], edge[1]);
            this.add.graphic(GraphicType.LINE, "graph", {start: this.graph.getNodePosition(edge[0]), end: this.graph.getNodePosition(edge[1])})
        }

        // Set this graph as a navigable entity
        let navmeshData = new Navmesh(this.graph);
        this.navManager.addNavigableEntity("navmesh", navmeshData);
    }

    protected intializeWaves(): void{
        const data = this.load.getObject("waveData");

        this.waves = new Array(data.numWaves);
        for(let i = 0; i < data.numWaves; i++){
            let value = data.waveData[i];
            this.waves[i] = {"wave": value}; 
        }
    }

    protected spawnEnemy(): void{
        if(this.executeWave == null){
            this.executeWave = this.waves.shift();
            this.enemies = new Array(this.executeWave.wave.totalEnemies);
            this.enemyNumber = 0;
        }
        if(Date.now() - this.timeNow >= 1500){
            this.timeNow = Date.now();
            if(this.executeWave.wave.enemies[0] === "farmer"){
                this.enemies[this.enemyNumber] = this.add.animatedSprite("farmer", "primary");
            }

            this.enemies[this.enemyNumber].position.set(0, 432);
            this.enemies[this.enemyNumber].scale.set(3, 3);
            this.enemies[this.enemyNumber].animation.play("WALK");
            this.enemies[this.enemyNumber].addPhysics(new AABB(Vec2.ZERO, new Vec2(5, 5)));
            let path = this.executeWave.wave.route.map((index: number) => this.graph.getNodePosition(index));
            this.enemies[this.enemyNumber].addAI(EnemyAI, path);
            
            this.enemies[this.enemyNumber].setGroup("enemy");
            if (this.firstEndAreaSetUp) {
                this.levelEndArea.setTrigger("enemy", AR_Events.ENEMY_ENTERED_LEVEL_END, null);
                this.firstEndAreaSetUp = false;
            }

            this.executeWave.wave.numberEnemies[0] -= 1;
            if(this.executeWave.wave.numberEnemies[0] == 0){
                this.executeWave.wave.enemies.shift();
                this.executeWave.wave.numberEnemies.shift();
                
            }
            
            this.enemyNumber++;
            if(this.enemyNumber == this.enemies.length){
                this.executeWave = null;
                this.doOnce = false;
                // TO BE IMPLEMENTED
                // Set a global variable to show that wave has ended.
            }


            
        }
    }

    /**
     * Initializes the level end area
     */
    protected addLevelEnd(startingTile: Vec2, size: Vec2): void {
        this.levelEndArea = <Rect>this.add.graphic(GraphicType.RECT, "primary", {position: startingTile, size: size});
        this.levelEndArea.addPhysics(undefined, undefined, false, true);
        this.levelEndArea.color = new Color(0, 0, 0, 1);
    }

    /**
	 * Handles a collision between this node and an orthogonal tilemap
	 * @param node The node
	 * @param tilemap The tilemap the node may be colliding with
	 * @param overlaps The list of overlaps
	 */
	protected collideWithOrthogonalTilemap(node: Physical, tilemap: OrthogonalTilemap): boolean {
		// Get the min and max x and y coordinates of the moving node
		let min = new Vec2(node.sweptRect.left, node.sweptRect.top);
		let max = new Vec2(node.sweptRect.right, node.sweptRect.bottom);

		// Convert the min/max x/y to the min and max row/col in the tilemap array
		let minIndex = tilemap.getColRowAt(min);
		let maxIndex = tilemap.getColRowAt(max);

		let tileSize = tilemap.getTileSize();

		// Loop over all possible tiles (which isn't many in the scope of the velocity per frame)
		for(let col = minIndex.x; col <= maxIndex.x; col++){
			for(let row = minIndex.y; row <= maxIndex.y; row++){
				if(tilemap.isTileCollidable(col, row)){
					// Get the position of this tile
					let tilePos = new Vec2(col * tileSize.x + tileSize.x/2, row * tileSize.y + tileSize.y/2);

					// Create a new collider for this tile
					let collider = new AABB(tilePos, tileSize.scaled(1/2));

					// Calculate collision area between the node and the tile
					let area = node.sweptRect.overlapArea(collider);
					if(area > 0){
						// We had a collision
						return true;
					} 
				}
			}
		}
	}

    /**
     * Calculates the area of the overlap between this AABB and another
     * @param main The main AABB
     * @param other The other AABB
     * @returns The area of the overlap between the AABBs
     */
     overlaps(main: AABB, other: AABB): boolean {
        let leftx = Math.max(main.x - main.hw, other.x - other.hw);
        let rightx = Math.min(main.x + main.hw, other.x + other.hw);
        let dx = rightx - leftx;

        let lefty = Math.max(main.y - main.hh, other.y - other.hh);
        let righty = Math.min(main.y + main.hh, other.y + other.hh);
        let dy = righty - lefty;

        if(dx < 0 || dy < 0) return false;
        if (dx * dy > 0) return true;
    }

    updateScene(deltaT: number): void {
        while (this.receiver.hasNextEvent()) {
            let event = this.receiver.getNextEvent();

            switch(event.type) {
                case AR_Events.ENEMY_ENTERED_LEVEL_END:
                    {
                        let node = this.sceneGraph.getNode(event.data.get("node"));
                        node.destroy();
                        this.incHealth(-1);
                    }
                    break;

                case AR_Events.TOWER_ENTERED_ENEMY_PATH:
                    {
                        this.selectedTowerRange.color = Color.RED;
                        this.selectedTowerRange.alpha = 0.3;
                    }
                    break;

                case AR_Events.TOWER_EXITED_ENEMY_PATH:
                    {
                        this.selectedTowerRange.color = Color.GREEN;
                        this.selectedTowerRange.alpha = 0.3;
                    }
                    break;
            }
        }

        if (this.selectedTower !== null && this.selectedTowerRange !== null) {

            let overlapsAnotherTurret = false;
            for (let i = 0; i < this.placedTurrets.length; i++) {
                if (this.overlaps(this.selectedTower.sweptRect, this.placedTurrets[i].collisionShape.getBoundingRect())) {
                    overlapsAnotherTurret = true;
                    break;
                }
            }

            let isEnemyArea = this.collideWithOrthogonalTilemap(this.selectedTower, this.tilemap);

            if (isEnemyArea || overlapsAnotherTurret || Input.getMousePosition().x >= (900 - this.selectedTower.sweptRect.halfSize.x)) {
                if (this.selectedTowerRange.color.toStringRGB() !== Color.RED.toStringRGB()) {
                    this.emitter.fireEvent(AR_Events.TOWER_ENTERED_ENEMY_PATH);
                }
                this.selectedTower.moving = true;
                this.selectedTower.position.set(Input.getMousePosition().x, Input.getMousePosition().y);
                this.selectedTowerRange.position.set(Input.getMousePosition().x, Input.getMousePosition().y);
            } else {
                if (this.selectedTowerRange.color.toStringRGB() !== Color.GREEN.toStringRGB()) {
                    this.emitter.fireEvent(AR_Events.TOWER_EXITED_ENEMY_PATH);
                }
                if (Input.isMouseJustPressed() && Input.getMousePressButton() === BUTTON.LEFTCLICK) {
                    let newTurret = this.add.sprite(this.selectedTower.imageId, "UI");
                    newTurret.position.set(Input.getMousePosition().x, Input.getMousePosition().y);
                    newTurret.scale.set(0.2, 0.2);
                    newTurret.addPhysics(undefined, undefined, true, true);
                    this.placedTurrets.push(newTurret);

                    this.selectedTower.destroy();
                    this.selectedTower = null;
                    this.selectedTowerRange.destroy();
                    this.selectedTowerRange = null;
                } else {
                    this.selectedTower.moving = true;
                    this.selectedTower.position.set(Input.getMousePosition().x, Input.getMousePosition().y);
                    this.selectedTowerRange.position.set(Input.getMousePosition().x, Input.getMousePosition().y);
                }
            }
        }

        // Display the navmesh of the current level
        if(Input.isKeyJustPressed("f")){
            this.getLayer("graph").setHidden(!this.getLayer("graph").isHidden());
        }

        // if(this.doOnce){
        //     this.spawnEnemy();
        // }



    }
}
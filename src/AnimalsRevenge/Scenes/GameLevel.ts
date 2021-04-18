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
import { EaseFunctionType } from "../../Wolfie2D/Utils/EaseFunctions";
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

    protected isTowerSelectedFromShop: boolean = false;
    protected selectedTowerShopName: string;
    protected selectedTowerShopSprite: Sprite = null;
    protected selectedTowerRange: Circle = null;
    protected deselectTowerShopBtn: Button = null;
    
    //UI Elements for Tower Information
    protected selectedTowerNameLabel: Label;
    protected selectedTowerCostLabel: Label;
    protected selectedTowerDamageLabel: Label;
    protected selectedTowerSpeedLabel: Label;
    protected selectedTowerRangeLabel: Label;
    protected selectedTowerUpgrade1Label: Button;
    protected selectedTowerUpgrade2Label: Button;
    protected selectedTowerSellBtn: Button;

    protected isPlacedTowerSelected: boolean = false;
    protected selectedTowerId: number;

    protected graph: PositionGraph;

    protected waves: Array<Record<string, any>>;
    protected executeWave: Record<string, any> = null;
    protected timeNow: number = Date.now();
    protected enemies: Array<AnimatedSprite>;
    protected enemyNumber: number;

    protected levelEndArea: Rect;

    protected tilemap: OrthogonalTilemap;

    protected defaultTowerValues: Map<string, 
    {name: string, cost: number, damage: number, attackSpeed: number, range: number, upgrade1: string, upgrade1Cost: number, upgrade2: string, upgrade2Cost: number}>;
    protected placedTowers: Map<number, 
    {sprite: Sprite, name: string, button: Button, damage: number, attackSpeed: number, range: number, upgrade1: string, upgrade1Cost: number, upgrade2: string, upgrade2Cost: number, totalValue: number}>;

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
        this.load.image("chickenTower", "assets/images/heart_temp.png"); //TODO - Change to this chicken sprite when avaiable
        this.load.image("cowTower", "assets/images/heart_temp.png"); //TODO - Change to this cow sprite when avaiable
        this.load.image("spiderTower", "assets/images/heart_temp.png"); //TODO - Change to this spider sprite when avaiable
        this.load.image("eagleTower", "assets/images/heart_temp.png"); //TODO - Change to this eagle sprite when avaiable
        this.load.image("elephantTower", "assets/images/heart_temp.png"); //TODO - Change to this elephant sprite when avaiable
        this.load.image("penguinTower", "assets/images/heart_temp.png"); //TODO - Change to this penguin sprite when avaiable
        this.load.image("coin", "assets/images/coin_temp.png");
    }

    startScene(): void {
        this.initLayers();
        this.initViewPort();
        this.subscribeToEvents();
        this.initDefaultTowerValues();
        this.addUI();
        this.createNavmesh();
        this.intializeWaves();

        this.placedTowers = new Map();
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

    protected initDefaultTowerValues(): void {
        this.defaultTowerValues = new Map();
        this.defaultTowerValues.set("chickenTower", {name: "Chicken Tower", cost: 100, damage: 10, attackSpeed: 3, range: 250, upgrade1: "+ Attack Speed", upgrade1Cost: 100, upgrade2: "+ Range", upgrade2Cost: 100});
        this.defaultTowerValues.set("cowTower", {name: "Cow Tower", cost: 100, damage: 10, attackSpeed: 3, range: 250, upgrade1: "+ Attack Speed", upgrade1Cost: 100, upgrade2: "+ Range", upgrade2Cost: 100});
        this.defaultTowerValues.set("spiderTower", {name: "Spider Tower", cost: 100, damage: 10, attackSpeed: 3, range: 250, upgrade1: "+ Attack Speed", upgrade1Cost: 100, upgrade2: "+ Range", upgrade2Cost: 100});
        this.defaultTowerValues.set("eagleTower", {name: "Eagle Tower", cost: 100, damage: 10, attackSpeed: 3, range: 250, upgrade1: "+ Attack Speed", upgrade1Cost: 100, upgrade2: "+ Range", upgrade2Cost: 100});
        this.defaultTowerValues.set("elephantTower", {name: "Elephant Tower", cost: 100, damage: 10, attackSpeed: 3, range: 250, upgrade1: "+ Attack Speed", upgrade1Cost: 100, upgrade2: "+ Range", upgrade2Cost: 100});
        this.defaultTowerValues.set("penguinTower", {name: "Penguin Tower", cost: 100, damage: 10, attackSpeed: 3, range: 250, upgrade1: "+ Attack Speed", upgrade1Cost: 100, upgrade2: "+ Range", upgrade2Cost: 100});
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

        let shopLabel = <Label>this.add.uiElement(UIElementType.LABEL, "UI", {position: new Vec2(1050, 40), text: "Shop"});
        shopLabel.textColor = Color.WHITE;
        shopLabel.font = "PixelSimple";
        shopLabel.fontSize = 60;

        if (this.towersUnlocked >= 1) {
            let chickenTowerBtn = <Button>this.add.uiElement(UIElementType.BUTTON, "UI", {position: new Vec2(975, 125), text: "1"});
            chickenTowerBtn.backgroundColor = Color.TRANSPARENT;
            chickenTowerBtn.textColor = Color.BLACK;
            chickenTowerBtn.borderColor = Color.BLACK;
            chickenTowerBtn.borderRadius = 0;
            chickenTowerBtn.setPadding(new Vec2(50, 15));

            
            chickenTowerBtn.onClick = () => {
                this.createTowerFromShop("chickenTower");
            }
            chickenTowerBtn.onEnter = () => {
                this.displayTowerInfoFromShop("chickenTower");
            }
            chickenTowerBtn.onLeave = () => {
                this.hideTowerInfoFromShop();
            }
        }

        if (this.towersUnlocked >= 2) {
            let cowTowerBtn = <Button>this.add.uiElement(UIElementType.BUTTON, "UI", {position: new Vec2(1125, 125), text: "2"});
            cowTowerBtn.backgroundColor = Color.TRANSPARENT;
            cowTowerBtn.textColor = Color.BLACK;
            cowTowerBtn.borderColor = Color.BLACK;
            cowTowerBtn.borderRadius = 0;
            cowTowerBtn.setPadding(new Vec2(50, 15));

            cowTowerBtn.onClick = () => {
                this.createTowerFromShop("cowTower");
            }
            cowTowerBtn.onEnter = () => {
                this.displayTowerInfoFromShop("cowTower");
            }
            cowTowerBtn.onLeave = () => {
               this.hideTowerInfoFromShop();
            }
        }

        if (this.towersUnlocked >= 3) {
            let spiderTowerBtn = <Button>this.add.uiElement(UIElementType.BUTTON, "UI", {position: new Vec2(975, 200), text: "3"});
            spiderTowerBtn.backgroundColor = Color.TRANSPARENT;
            spiderTowerBtn.textColor = Color.BLACK;
            spiderTowerBtn.borderColor = Color.BLACK;
            spiderTowerBtn.borderRadius = 0;
            spiderTowerBtn.setPadding(new Vec2(50, 15));

            spiderTowerBtn.onClick = () => {
                this.createTowerFromShop("spiderTower");
            }
            spiderTowerBtn.onEnter = () => {
                this.displayTowerInfoFromShop("spiderTower");
            }
            spiderTowerBtn.onLeave = () => {
                this.hideTowerInfoFromShop();
            }
        }

        if (this.towersUnlocked >= 4) {
            let eagleTowerBtn = <Button>this.add.uiElement(UIElementType.BUTTON, "UI", {position: new Vec2(1125, 200), text: "4"});
            eagleTowerBtn.backgroundColor = Color.TRANSPARENT;
            eagleTowerBtn.textColor = Color.BLACK;
            eagleTowerBtn.borderColor = Color.BLACK;
            eagleTowerBtn.borderRadius = 0;
            eagleTowerBtn.setPadding(new Vec2(50, 15));

            eagleTowerBtn.onClick = () => {
                this.createTowerFromShop("eagleTower");
            }
            eagleTowerBtn.onEnter = () => {
                this.displayTowerInfoFromShop("eagleTower");
            }
            eagleTowerBtn.onLeave = () => {
                this.hideTowerInfoFromShop();
            }
        }

        if (this.towersUnlocked >= 5) {
            let elephantTowerBtn = <Button>this.add.uiElement(UIElementType.BUTTON, "UI", {position: new Vec2(975, 275), text: "5"});
            elephantTowerBtn.backgroundColor = Color.TRANSPARENT;
            elephantTowerBtn.textColor = Color.BLACK;
            elephantTowerBtn.borderColor = Color.BLACK;
            elephantTowerBtn.borderRadius = 0;
            elephantTowerBtn.setPadding(new Vec2(50, 15));

            elephantTowerBtn.onClick = () => {
                this.createTowerFromShop("elephantTower");
            }
            elephantTowerBtn.onEnter = () => {
                this.displayTowerInfoFromShop("elephantTower");
            }
            elephantTowerBtn.onLeave = () => {
                this.hideTowerInfoFromShop();
            }
        }

        if (this.towersUnlocked >= 6) {
            let penguinTowerBtn = <Button>this.add.uiElement(UIElementType.BUTTON, "UI", {position: new Vec2(1125, 275), text: "6"});
            penguinTowerBtn.backgroundColor = Color.TRANSPARENT;
            penguinTowerBtn.textColor = Color.BLACK;
            penguinTowerBtn.borderColor = Color.BLACK;
            penguinTowerBtn.borderRadius = 0;
            penguinTowerBtn.setPadding(new Vec2(50, 15));

            penguinTowerBtn.onClick = () => {
                this.createTowerFromShop("penguinTower");
            }
            penguinTowerBtn.onEnter = () => {
                this.displayTowerInfoFromShop("penguinTower");
            }
            penguinTowerBtn.onLeave = () => {
                this.hideTowerInfoFromShop();
            }
        }

        this.selectedTowerNameLabel = <Label>this.add.uiElement(UIElementType.LABEL, "UI", {position: new Vec2(1050, 350), text: ""});
        this.selectedTowerNameLabel.textColor = Color.WHITE
        this.selectedTowerNameLabel.font = "PixelSimple";
        this.selectedTowerNameLabel.fontSize = 40;
        this.selectedTowerNameLabel.visible = false;

        this.selectedTowerDamageLabel = <Label>this.add.uiElement(UIElementType.LABEL, "UI", {position: new Vec2(1050, 400), text: ""});
        this.selectedTowerDamageLabel.textColor = Color.WHITE
        this.selectedTowerDamageLabel.font = "PixelSimple";
        this.selectedTowerDamageLabel.fontSize = 30;
        this.selectedTowerDamageLabel.visible = false;

        this.selectedTowerSpeedLabel = <Label>this.add.uiElement(UIElementType.LABEL, "UI", {position: new Vec2(1050, 430), text: ""});
        this.selectedTowerSpeedLabel.textColor = Color.WHITE
        this.selectedTowerSpeedLabel.font = "PixelSimple";
        this.selectedTowerSpeedLabel.fontSize = 30;
        this.selectedTowerSpeedLabel.visible = false;

        this.selectedTowerRangeLabel = <Label>this.add.uiElement(UIElementType.LABEL, "UI", {position: new Vec2(1050, 460), text: ""});
        this.selectedTowerRangeLabel.textColor = Color.WHITE
        this.selectedTowerRangeLabel.font = "PixelSimple";
        this.selectedTowerRangeLabel.fontSize = 30;
        this.selectedTowerRangeLabel.visible = false;

        this.selectedTowerCostLabel = <Label>this.add.uiElement(UIElementType.LABEL, "UI", {position: new Vec2(1050, 520), text: ""});
        this.selectedTowerCostLabel.textColor = Color.WHITE
        this.selectedTowerCostLabel.font = "PixelSimple";
        this.selectedTowerCostLabel.fontSize = 30;
        this.selectedTowerCostLabel.visible = false;

        this.deselectTowerShopBtn = <Button>this.add.uiElement(UIElementType.BUTTON, "UI", {position: new Vec2(1050, 600), text: "Deselect"});
        this.deselectTowerShopBtn.backgroundColor = Color.TRANSPARENT;
        this.deselectTowerShopBtn.textColor = Color.BLACK;
        this.deselectTowerShopBtn.borderColor = Color.RED;
        this.deselectTowerShopBtn.borderRadius = 0;
        this.deselectTowerShopBtn.font = "PixelSimple";
        this.deselectTowerShopBtn.setPadding(new Vec2(10, 15));
        this.deselectTowerShopBtn.visible = false;
        
        this.deselectTowerShopBtn.onClick = () => {
            if (Input.getMousePressButton() == BUTTON.LEFTCLICK && this.isTowerSelectedFromShop) {
                this.selectedTowerShopSprite.destroy();
                this.selectedTowerShopSprite = null;
                this.selectedTowerRange.destroy();
                this.selectedTowerRange = null;
                this.isTowerSelectedFromShop = false;

                this.deselectTowerShopBtn.visible = false;
                this.selectedTowerNameLabel.visible = false;
                this.selectedTowerCostLabel.visible = false;
                this.selectedTowerDamageLabel.visible = false;
                this.selectedTowerSpeedLabel.visible = false;
                this.selectedTowerRangeLabel.visible = false;
            }
        }
        this.deselectTowerShopBtn.onEnter = () => {
            this.deselectTowerShopBtn.textColor = Color.WHITE;
        }
        this.deselectTowerShopBtn.onLeave = () => {
            this.deselectTowerShopBtn.textColor = Color.BLACK;
        }

        this.selectedTowerUpgrade1Label = <Button>this.add.uiElement(UIElementType.BUTTON, "UI", {position: new Vec2(1050, 540), text: ""});
        this.selectedTowerUpgrade1Label.backgroundColor = Color.TRANSPARENT;
        this.selectedTowerUpgrade1Label.textColor = Color.BLACK;
        this.selectedTowerUpgrade1Label.borderColor = Color.BLACK;
        this.selectedTowerUpgrade1Label.borderRadius = 0;
        this.selectedTowerUpgrade1Label.font = "PixelSimple";
        this.selectedTowerUpgrade1Label.fontSize = 30;
        this.selectedTowerUpgrade1Label.setPadding(new Vec2(10, 15));
        this.selectedTowerUpgrade1Label.visible = false;

        this.selectedTowerUpgrade1Label.onEnter = () => {
            this.selectedTowerUpgrade1Label.textColor = Color.WHITE;
        }
        this.selectedTowerUpgrade1Label.onLeave = () => {
            this.selectedTowerUpgrade1Label.textColor = Color.BLACK;
        }

        this.selectedTowerUpgrade2Label = <Button>this.add.uiElement(UIElementType.BUTTON, "UI", {position: new Vec2(1050, 640), text: ""});
        this.selectedTowerUpgrade2Label.backgroundColor = Color.TRANSPARENT;
        this.selectedTowerUpgrade2Label.textColor = Color.BLACK;
        this.selectedTowerUpgrade2Label.borderColor = Color.BLACK;;
        this.selectedTowerUpgrade2Label.borderRadius = 0;
        this.selectedTowerUpgrade2Label.font = "PixelSimple";
        this.selectedTowerUpgrade2Label.fontSize = 30;
        this.selectedTowerUpgrade2Label.setPadding(new Vec2(10, 15));
        this.selectedTowerUpgrade2Label.visible = false;

        this.selectedTowerUpgrade2Label.onEnter = () => {
            this.selectedTowerUpgrade2Label.textColor = Color.WHITE;
        }
        this.selectedTowerUpgrade2Label.onLeave = () => {
            this.selectedTowerUpgrade2Label.textColor = Color.BLACK;
        }

        this.selectedTowerSellBtn = <Button>this.add.uiElement(UIElementType.BUTTON, "UI", {position: new Vec2(1050, 750), text: "Sell"});
        this.selectedTowerSellBtn.backgroundColor = Color.TRANSPARENT;
        this.selectedTowerSellBtn.textColor = Color.BLACK;
        this.selectedTowerSellBtn.borderColor = Color.RED;
        this.selectedTowerSellBtn.borderRadius = 0;
        this.selectedTowerSellBtn.font = "PixelSimple";
        this.selectedTowerSellBtn.fontSize = 35;
        this.selectedTowerSellBtn.setPadding(new Vec2(30, 10));
        this.selectedTowerSellBtn.visible = false;

        this.selectedTowerSellBtn.onEnter = () => {
            this.selectedTowerSellBtn.textColor = Color.WHITE;
        }
        this.selectedTowerSellBtn.onLeave = () => {
            this.selectedTowerSellBtn.textColor = Color.BLACK;
        }
        
    }

    protected createTowerFromShop(tower: string): void {
        if (Input.getMousePressButton() == BUTTON.LEFTCLICK && !this.isTowerSelectedFromShop) {
            
            let towerData = this.defaultTowerValues.get(tower);
            if (towerData.cost > this.moneyCount) {
                this.selectedTowerCostLabel.textColor = Color.RED;
                setTimeout(() => {
                    this.selectedTowerCostLabel.textColor = Color.WHITE;
                }, 150);
                return;
            }

            if (this.isPlacedTowerSelected) {
                this.selectedTowerUpgrade1Label.visible = false;
                this.selectedTowerUpgrade2Label.visible = false;
                this.selectedTowerSellBtn.visible = false;
                this.isPlacedTowerSelected = false;
                this.selectedTowerRange.destroy();
                this.selectedTowerRange = null;
            }
            this.selectedTowerShopSprite = this.add.sprite(tower, "UI");
            this.selectedTowerShopSprite.position.set(Input.getMousePosition().x, Input.getMousePosition().y);
            this.selectedTowerShopSprite.scale.set(0.2, 0.2);
            this.selectedTowerShopSprite.addPhysics();
            
            this.selectedTowerRange = <Circle>this.add.graphic(GraphicType.CIRCLE, "UI", {position: Input.getMousePosition(), radius: new Number(250)});
            this.selectedTowerRange.color = Color.WHITE;
            this.selectedTowerRange.alpha = 0.3;
            this.selectedTowerRange.borderColor = Color.TRANSPARENT;

            this.selectedTowerRange.tweens.add("expand", {
                startDelay: 0,
                duration: 400,
                effects: [
                    {
                        property: "radius",
                        resetOnComplete: true,
                        start: 250,
                        end: 260,
                        ease: EaseFunctionType.IN_OUT_SINE
                    },
                ],
                reverseOnComplete: true
            });

            this.isTowerSelectedFromShop = true;
            this.selectedTowerShopName = tower;

            this.deselectTowerShopBtn.visible = true;
        }
    }

    protected displayTowerInfoFromShop(tower: string): void {
        if (this.isPlacedTowerSelected) {
            this.selectedTowerUpgrade1Label.visible = false;
            this.selectedTowerUpgrade2Label.visible = false;
            this.selectedTowerSellBtn.visible = false;
        }
        let towerData = this.defaultTowerValues.get(tower);
        this.selectedTowerNameLabel.text = towerData.name;
        this.selectedTowerNameLabel.visible = true;
        this.selectedTowerCostLabel.text = "Cost: " + towerData.cost;
        this.selectedTowerCostLabel.visible = true;
        this.selectedTowerDamageLabel.text = "Damage: " + towerData.damage;
        this.selectedTowerDamageLabel.visible = true;
        this.selectedTowerSpeedLabel.text = "Attack Speed: " + towerData.attackSpeed;
        this.selectedTowerSpeedLabel.visible = true;
        this.selectedTowerRangeLabel.text = "Range: " + towerData.range;
        this.selectedTowerRangeLabel.visible = true;
    }

    protected hideTowerInfoFromShop(): void {
        if (this.isPlacedTowerSelected) {
            this.selectedTowerCostLabel.visible = false;
            this.displayTowerInfoFromId(this.selectedTowerId);
        } else if (this.isTowerSelectedFromShop) {
            this.displayTowerInfoFromShop(this.selectedTowerShopName);
        } else {
            this.selectedTowerNameLabel.visible = false;
            this.selectedTowerCostLabel.visible = false;
            this.selectedTowerDamageLabel.visible = false;
            this.selectedTowerSpeedLabel.visible = false;
            this.selectedTowerRangeLabel.visible = false;
        }
    }

    protected displayTowerInfoFromId(towerId: number): void {
        let towerData = this.placedTowers.get(towerId);
        this.selectedTowerNameLabel.text = towerData.name;
        this.selectedTowerNameLabel.visible = true;
        this.selectedTowerDamageLabel.text = "Damage: " + towerData.damage;
        this.selectedTowerDamageLabel.visible = true;
        this.selectedTowerSpeedLabel.text = "Attack Speed: " + towerData.attackSpeed;
        this.selectedTowerSpeedLabel.visible = true;
        this.selectedTowerRangeLabel.text = "Range: " + towerData.range;
        this.selectedTowerRangeLabel.visible = true;
        this.selectedTowerUpgrade1Label.text = towerData.upgrade1 + "\nCost: " + towerData.upgrade1Cost;
        this.selectedTowerUpgrade1Label.visible = true;
        this.selectedTowerUpgrade2Label.text = towerData.upgrade2 + "\nCost: " + towerData.upgrade2Cost;
        this.selectedTowerUpgrade2Label.visible = true;
        this.selectedTowerSellBtn.text = "Sell: " + (towerData.totalValue * 0.75);
        this.selectedTowerSellBtn.visible = true;

        if (this.selectedTowerRange === null) {
            this.selectedTowerRange = <Circle>this.add.graphic(GraphicType.CIRCLE, "UI", {position: towerData.sprite.position, radius: new Number(towerData.range)});
            this.selectedTowerRange.color = Color.WHITE;
            this.selectedTowerRange.alpha = 0.3;
            this.selectedTowerRange.borderColor = Color.TRANSPARENT;
        }

        this.selectedTowerSellBtn.onClick = () => {
            this.moneyCount += towerData.totalValue * 0.75;
            this.moneyCountLabel.text = this.moneyCount.toString();
            towerData.sprite.destroy();
            towerData.button.destroy();
            this.selectedTowerRange.destroy();
            this.selectedTowerRange = null;
            this.placedTowers.delete(towerId);
            this.isPlacedTowerSelected = false;
            this.selectedTowerUpgrade1Label.visible = false;
            this.selectedTowerUpgrade2Label.visible = false;
            this.selectedTowerSellBtn.visible = false;
            this.hideTowerInfoFromShop();
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
            this.enemies[this.enemyNumber].scale.set(4, 4);
            this.enemies[this.enemyNumber].animation.play("WALK");
            this.enemies[this.enemyNumber].addPhysics(new AABB(Vec2.ZERO, new Vec2(5, 5)));
            let path = this.executeWave.wave.route.map((index: number) => this.graph.getNodePosition(index));
            this.enemies[this.enemyNumber].addAI(EnemyAI, path);        
            this.enemies[this.enemyNumber].setGroup("enemy");
    
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
        this.levelEndArea.setTrigger("enemy", AR_Events.ENEMY_ENTERED_LEVEL_END, null);
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
                        this.selectedTowerRange.tweens.play("expand", true);
                    }
                    break;

                case AR_Events.TOWER_EXITED_ENEMY_PATH:
                    {
                        this.selectedTowerRange.color = Color.WHITE;
                        this.selectedTowerRange.alpha = 0.3;
                        this.selectedTowerRange.tweens.stop("expand");
                    }
                    break;
            }
        }

        if (this.isTowerSelectedFromShop) {
            let overlapsAnotherTower = false;
            for (let value of Array.from(this.placedTowers.values())) {
                if (this.overlaps(this.selectedTowerShopSprite.sweptRect, value.sprite.collisionShape.getBoundingRect())) {
                    overlapsAnotherTower = true;
                    break;
                }
            }

            let isEnemyArea = this.collideWithOrthogonalTilemap(this.selectedTowerShopSprite, this.tilemap);

            if (isEnemyArea || overlapsAnotherTower || Input.getMousePosition().x >= (900 - this.selectedTowerShopSprite.sweptRect.halfSize.x)) {
                if (this.selectedTowerRange.color.toStringRGB() !== Color.RED.toStringRGB()) {
                    this.emitter.fireEvent(AR_Events.TOWER_ENTERED_ENEMY_PATH);
                }
                this.selectedTowerShopSprite.moving = true;
                this.selectedTowerShopSprite.position.set(Input.getMousePosition().x, Input.getMousePosition().y);
                this.selectedTowerRange.position.set(Input.getMousePosition().x, Input.getMousePosition().y);
            } else {
                if (this.selectedTowerRange.color.toStringRGB() !== Color.WHITE.toStringRGB()) {
                    this.emitter.fireEvent(AR_Events.TOWER_EXITED_ENEMY_PATH);
                }
                if (Input.isMouseJustPressed() && Input.getMousePressButton() === BUTTON.LEFTCLICK) {
                    let newTower = this.add.sprite(this.selectedTowerShopSprite.imageId, "primary");
                    newTower.position.set(this.selectedTowerShopSprite.position.x, this.selectedTowerShopSprite.position.y);
                    newTower.scale.set(0.2, 0.2);
                    newTower.addPhysics(undefined, undefined, true, true);

                    let newTowerBtn = <Button>this.add.uiElement(UIElementType.BUTTON, "primary", {position: newTower.position, text: ""});
                    newTowerBtn.backgroundColor = Color.TRANSPARENT;
                    newTowerBtn.borderColor = Color.TRANSPARENT;
                    newTowerBtn.borderRadius = 0;
                    newTowerBtn.fontSize = 0;
                    newTowerBtn.setPadding(newTower.sizeWithZoom);

                    let defaultTowerData = this.defaultTowerValues.get(this.selectedTowerShopSprite.imageId);
                   
                    this.selectedTowerShopSprite.destroy();
                    this.selectedTowerShopSprite = null;
                    this.selectedTowerRange.destroy();
                    this.selectedTowerRange = null;
                   
                    let newTowerData = {sprite: newTower, button: newTowerBtn, name: defaultTowerData.name, damage: defaultTowerData.damage, 
                        attackSpeed: defaultTowerData.attackSpeed, range: defaultTowerData.range, 
                        upgrade1: defaultTowerData.upgrade1, upgrade1Cost: defaultTowerData.upgrade1Cost, 
                        upgrade2: defaultTowerData.upgrade2, upgrade2Cost: defaultTowerData.upgrade2Cost, totalValue: defaultTowerData.cost};
                    let towerId = this.placedTowers.size;
                    this.placedTowers.set(towerId, newTowerData);
                    this.moneyCount += -defaultTowerData.cost;
                    this.moneyCountLabel.text = this.moneyCount.toString();

                    newTowerBtn.onClick = () => {
                        if (Input.getMousePressButton() == BUTTON.LEFTCLICK && !this.isTowerSelectedFromShop) {
                            if (this.isPlacedTowerSelected) {
                                this.selectedTowerRange.destroy();
                                this.selectedTowerRange = null;
                            }
                            this.isPlacedTowerSelected = true;
                            this.selectedTowerId = towerId;
                            this.displayTowerInfoFromId(this.selectedTowerId);
                        }
                    }

                    this.isPlacedTowerSelected = true;
                    this.selectedTowerId = towerId;
                    this.deselectTowerShopBtn.visible = false;
                    this.isTowerSelectedFromShop = false;
                    this.hideTowerInfoFromShop();
                } else {
                    this.selectedTowerShopSprite.moving = true;
                    this.selectedTowerShopSprite.position.set(Input.getMousePosition().x, Input.getMousePosition().y);
                    this.selectedTowerRange.position.set(Input.getMousePosition().x, Input.getMousePosition().y);
                }
            }
        }

        if (this.isPlacedTowerSelected && Input.getMousePosition().x < 900) {
            if (Input.isMouseJustPressed() && Input.getMousePressButton() === BUTTON.LEFTCLICK) {
                if (!(this.selectedTowerRange.position.distanceSqTo(Input.getMousePosition()) <= Math.pow(this.selectedTowerRange.radius, 2))) {
                    this.isPlacedTowerSelected = false;
                    this.selectedTowerRange.destroy();
                    this.selectedTowerRange = null;

                    this.selectedTowerNameLabel.visible= false;
                    this.selectedTowerDamageLabel.visible = false;
                    this.selectedTowerSpeedLabel.visible = false;
                    this.selectedTowerRangeLabel.visible = false;
                    this.selectedTowerUpgrade1Label.visible = false;
                    this.selectedTowerUpgrade2Label.visible = false;
                    this.selectedTowerSellBtn.visible = false;
                }
            }
        }

        // Display the navmesh of the current level
        if(Input.isKeyJustPressed("f")){
            this.getLayer("graph").setHidden(!this.getLayer("graph").isHidden());
        }

        if(this.doOnce){
            this.spawnEnemy();
        }



    }
}
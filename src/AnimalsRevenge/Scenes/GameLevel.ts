import PositionGraph from "../../Wolfie2D/DataTypes/Graphs/PositionGraph";
import Physical from "../../Wolfie2D/DataTypes/Interfaces/Physical";
import CircleShape from "../../Wolfie2D/DataTypes/Shapes/Circle";
import AABB from "../../Wolfie2D/DataTypes/Shapes/AABB";
import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import Input, { BUTTON } from "../../Wolfie2D/Input/Input";
import Circle from "../../Wolfie2D/Nodes/Graphics/Circle";
import { GraphicType } from "../../Wolfie2D/Nodes/Graphics/GraphicTypes";
import Rect from "../../Wolfie2D/Nodes/Graphics/Rect";
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
import ChickenAI from "../AI/Turrets/ChickenAI";
import GameNode from "../../Wolfie2D/Nodes/GameNode";
import LevelSelection from "./LevelSelection";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";

export default class GameLevel extends Scene {

    //Labels for the UI
    protected healthCount: number = 0;
    protected healthCountLabel: Label;
    protected moneyCount: number = 0;
    protected moneyCountLabel: Label;
    protected totalWaves: number = 0;
    protected currentWave: number = 0;
    protected waveCountLabel: Label;
    protected startWaveBtn: Button;
    protected waveInProgress: boolean = false;
    protected victoryLabel: Label;

    protected towersUnlocked: number = 0;

    protected size: Vec2;

    protected isTowerSelectedFromShop: boolean = false;
    protected selectedTowerShopName: string;
    protected selectedTowerShopSprite: AnimatedSprite = null;
    protected selectedTowerRange: Circle = null;
    protected deselectTowerShopBtn: Button = null;
    
    //UI Elements for Tower Information
    protected selectedTowerNameLabel: Label;
    protected selectedTowerCostLabel: Label;
    protected selectedTowerDamageLabel: Label;
    protected selectedTowerSpeedLabel: Label;
    protected selectedTowerRangeLabel: Label;
    protected selectedTowerUpgrade1Btn: Button;
    protected selectedTowerUpgrade2Btn: Button;
    protected selectedTowerSellBtn: Button;

    protected isPlacedTowerSelected: boolean = false;
    protected selectedTowerId: number;

    protected graph: PositionGraph;

    protected waves: Array<Record<string, any>>;
    protected currentWaveData: Record<string, any> = null;
    protected timeNow: number = Date.now();
    protected enemies: Map<GameNode, number>;
    protected enemyNumber: number;

    protected levelEndArea: Rect;

    protected tilemap: OrthogonalTilemap;

    protected defaultTowerValues: Map<string, any>;
    protected placedTowers: Map<number, 
    {sprite: AnimatedSprite, name: string, button: Button, damage: number, attackSpeed: number, range: number, upgrade1: string, upgrade1Cost: number, upgrade2: string, upgrade2Cost: number, totalValue: number}>;

    protected spawningEnemies: boolean = false;

    initScene(init: Record<string, any>) {
        this.healthCount = init.startHealth;
        this.moneyCount = init.startMoney;
        this.currentWave = 1;
        this.totalWaves = init.totalWaves;
        this.towersUnlocked = init.towersUnlocked;
    }

    loadScene(): void {
        this.load.image("heart", "assets/images/heart_temp.png");
        // this.load.image("chickenTower", "assets/spritesheets/Chicken1.png");
        this.load.spritesheet("chickenTower", "assets/spritesheets/chicken.json");
        this.load.image("cowTower", "assets/images/heart_temp.png"); //TODO - Change to this cow sprite when avaiable
        this.load.image("spiderTower", "assets/images/heart_temp.png"); //TODO - Change to this spider sprite when avaiable
        this.load.image("eagleTower", "assets/images/heart_temp.png"); //TODO - Change to this eagle sprite when avaiable
        this.load.image("elephantTower", "assets/images/heart_temp.png"); //TODO - Change to this elephant sprite when avaiable
        this.load.image("penguinTower", "assets/images/heart_temp.png"); //TODO - Change to this penguin sprite when avaiable
        this.load.image("coin", "assets/images/coin_temp.png");
        this.load.image("egg", "assets/images/egg.png")
        this.load.object("towerData", "assets/data/default_tower_values.json");
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
            AR_Events.TOWER_EXITED_ENEMY_PATH,
            AR_Events.ENEMY_HIT
        ]);
    }

    protected initDefaultTowerValues(): void {
        this.defaultTowerValues = new Map();
        const data = this.load.getObject("towerData");

        for(let i = 0; i < data.numTowers; i++){
            let key = data.towerMapKeys[i];
            let value = data.towers[i];
            this.defaultTowerValues.set(key, value); 
        }
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

        this.startWaveBtn = <Button>this.add.uiElement(UIElementType.BUTTON, "UI", {position: new Vec2(810, 80), text: "Start Wave"});
        this.startWaveBtn.backgroundColor = Color.TRANSPARENT;
        this.startWaveBtn.textColor = Color.BLACK;
        this.startWaveBtn.borderColor = Color.BLACK;
        this.startWaveBtn.borderRadius = 0;
        this.startWaveBtn.fontSize = 25;
        this.startWaveBtn.font = "PixelSimple";
        this.startWaveBtn.setPadding(new Vec2(10, 10));

        this.startWaveBtn.onClick = () => {
            if (Input.getMousePressButton() === BUTTON.LEFTCLICK && !this.isPlacedTowerSelected) {
                this.spawningEnemies = true;
                this.waveInProgress = true;
            }
        }
        this.startWaveBtn.onEnter = () => {
            this.startWaveBtn.textColor = Color.WHITE;
        }
        this.startWaveBtn.onLeave = () => {
            this.startWaveBtn.textColor = Color.BLACK;
        }

        this.waveCountLabel = <Label>this.add.uiElement(UIElementType.LABEL, "UI", {position: new Vec2(810, 30), text: "Wave " + this.currentWave + "/" + this.totalWaves});
        this.waveCountLabel.textColor = Color.WHITE
        this.waveCountLabel.font = "PixelSimple";

        this.victoryLabel = <Label>this.add.uiElement(UIElementType.LABEL, "UI", {position: this.size, text: ""});
        this.victoryLabel.textColor = Color.WHITE
        this.victoryLabel.font = "PixelSimple";
        this.victoryLabel.fontSize = 50;
        this.victoryLabel.visible = false;

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
            chickenTowerBtn.font = "PixelSimple";
            chickenTowerBtn.setPadding(new Vec2(50, 15));

            
            chickenTowerBtn.onClick = () => {
                this.createTowerFromShop("chickenTower");
            }
            chickenTowerBtn.onEnter = () => {
                chickenTowerBtn.textColor = Color.WHITE;
                this.displayTowerInfoFromShop("chickenTower");
            }
            chickenTowerBtn.onLeave = () => {
                chickenTowerBtn.textColor = Color.BLACK;
                this.hideTowerInfoFromShop();
            }
        }

        if (this.towersUnlocked >= 2) {
            let cowTowerBtn = <Button>this.add.uiElement(UIElementType.BUTTON, "UI", {position: new Vec2(1125, 125), text: "2"});
            cowTowerBtn.backgroundColor = Color.TRANSPARENT;
            cowTowerBtn.textColor = Color.BLACK;
            cowTowerBtn.borderColor = Color.BLACK;
            cowTowerBtn.borderRadius = 0;
            cowTowerBtn.font = "PixelSimple";
            cowTowerBtn.setPadding(new Vec2(50, 15));

            cowTowerBtn.onClick = () => {
                this.createTowerFromShop("cowTower");
            }
            cowTowerBtn.onEnter = () => {
                cowTowerBtn.textColor = Color.WHITE;
                this.displayTowerInfoFromShop("cowTower");
            }
            cowTowerBtn.onLeave = () => {
                cowTowerBtn.textColor = Color.BLACK;
                this.hideTowerInfoFromShop();
            }
        }

        if (this.towersUnlocked >= 3) {
            let spiderTowerBtn = <Button>this.add.uiElement(UIElementType.BUTTON, "UI", {position: new Vec2(975, 200), text: "3"});
            spiderTowerBtn.backgroundColor = Color.TRANSPARENT;
            spiderTowerBtn.textColor = Color.BLACK;
            spiderTowerBtn.borderColor = Color.BLACK;
            spiderTowerBtn.borderRadius = 0;
            spiderTowerBtn.font = "PixelSimple";
            spiderTowerBtn.setPadding(new Vec2(50, 15));

            spiderTowerBtn.onClick = () => {
                this.createTowerFromShop("spiderTower");
            }
            spiderTowerBtn.onEnter = () => {
                spiderTowerBtn.textColor = Color.WHITE;
                this.displayTowerInfoFromShop("spiderTower");
            }
            spiderTowerBtn.onLeave = () => {
                spiderTowerBtn.textColor = Color.BLACK;
                this.hideTowerInfoFromShop();
            }
        }

        if (this.towersUnlocked >= 4) {
            let eagleTowerBtn = <Button>this.add.uiElement(UIElementType.BUTTON, "UI", {position: new Vec2(1125, 200), text: "4"});
            eagleTowerBtn.backgroundColor = Color.TRANSPARENT;
            eagleTowerBtn.textColor = Color.BLACK;
            eagleTowerBtn.borderColor = Color.BLACK;
            eagleTowerBtn.borderRadius = 0;
            eagleTowerBtn.font = "PixelSimple";
            eagleTowerBtn.setPadding(new Vec2(50, 15));

            eagleTowerBtn.onClick = () => {
                this.createTowerFromShop("eagleTower");
            }
            eagleTowerBtn.onEnter = () => {
                eagleTowerBtn.textColor = Color.WHITE;
                this.displayTowerInfoFromShop("eagleTower");
            }
            eagleTowerBtn.onLeave = () => {
                eagleTowerBtn.textColor = Color.BLACK;
                this.hideTowerInfoFromShop();
            }
        }

        if (this.towersUnlocked >= 5) {
            let elephantTowerBtn = <Button>this.add.uiElement(UIElementType.BUTTON, "UI", {position: new Vec2(975, 275), text: "5"});
            elephantTowerBtn.backgroundColor = Color.TRANSPARENT;
            elephantTowerBtn.textColor = Color.BLACK;
            elephantTowerBtn.borderColor = Color.BLACK;
            elephantTowerBtn.borderRadius = 0;
            elephantTowerBtn.font = "PixelSimple";
            elephantTowerBtn.setPadding(new Vec2(50, 15));

            elephantTowerBtn.onClick = () => {
                this.createTowerFromShop("elephantTower");
            }
            elephantTowerBtn.onEnter = () => {
                elephantTowerBtn.textColor = Color.WHITE;
                this.displayTowerInfoFromShop("elephantTower");
            }
            elephantTowerBtn.onLeave = () => {
                elephantTowerBtn.textColor = Color.BLACK;
                this.hideTowerInfoFromShop();
            }
        }

        if (this.towersUnlocked >= 6) {
            let penguinTowerBtn = <Button>this.add.uiElement(UIElementType.BUTTON, "UI", {position: new Vec2(1125, 275), text: "6"});
            penguinTowerBtn.backgroundColor = Color.TRANSPARENT;
            penguinTowerBtn.textColor = Color.BLACK;
            penguinTowerBtn.borderColor = Color.BLACK;
            penguinTowerBtn.borderRadius = 0;
            penguinTowerBtn.font = "PixelSimple";
            penguinTowerBtn.setPadding(new Vec2(50, 15));

            penguinTowerBtn.onClick = () => {
                this.createTowerFromShop("penguinTower");
            }
            penguinTowerBtn.onEnter = () => {
                penguinTowerBtn.textColor = Color.WHITE;
                this.displayTowerInfoFromShop("penguinTower");
            }
            penguinTowerBtn.onLeave = () => {
                penguinTowerBtn.textColor = Color.BLACK;
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

        this.selectedTowerUpgrade1Btn = <Button>this.add.uiElement(UIElementType.BUTTON, "UI", {position: new Vec2(1050, 540), text: ""});
        this.selectedTowerUpgrade1Btn.backgroundColor = Color.TRANSPARENT;
        this.selectedTowerUpgrade1Btn.textColor = Color.BLACK;
        this.selectedTowerUpgrade1Btn.borderColor = Color.BLACK;
        this.selectedTowerUpgrade1Btn.borderRadius = 0;
        this.selectedTowerUpgrade1Btn.font = "PixelSimple";
        this.selectedTowerUpgrade1Btn.fontSize = 30;
        this.selectedTowerUpgrade1Btn.setPadding(new Vec2(10, 15));
        this.selectedTowerUpgrade1Btn.visible = false;

        this.selectedTowerUpgrade1Btn.onEnter = () => {
            this.selectedTowerUpgrade1Btn.textColor = Color.WHITE;
        }
        this.selectedTowerUpgrade1Btn.onLeave = () => {
            this.selectedTowerUpgrade1Btn.textColor = Color.BLACK;
        }

        this.selectedTowerUpgrade2Btn = <Button>this.add.uiElement(UIElementType.BUTTON, "UI", {position: new Vec2(1050, 640), text: ""});
        this.selectedTowerUpgrade2Btn.backgroundColor = Color.TRANSPARENT;
        this.selectedTowerUpgrade2Btn.textColor = Color.BLACK;
        this.selectedTowerUpgrade2Btn.borderColor = Color.BLACK;;
        this.selectedTowerUpgrade2Btn.borderRadius = 0;
        this.selectedTowerUpgrade2Btn.font = "PixelSimple";
        this.selectedTowerUpgrade2Btn.fontSize = 30;
        this.selectedTowerUpgrade2Btn.setPadding(new Vec2(10, 15));
        this.selectedTowerUpgrade2Btn.visible = false;

        this.selectedTowerUpgrade2Btn.onEnter = () => {
            this.selectedTowerUpgrade2Btn.textColor = Color.WHITE;
        }
        this.selectedTowerUpgrade2Btn.onLeave = () => {
            this.selectedTowerUpgrade2Btn.textColor = Color.BLACK;
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
        if (Input.getMousePressButton() == BUTTON.LEFTCLICK && !this.isTowerSelectedFromShop && !this.waveInProgress) {
            
            let towerData = this.defaultTowerValues.get(tower);
            if (towerData.cost > this.moneyCount) {
                this.moneyCountLabel.textColor = Color.RED;
                this.selectedTowerCostLabel.textColor = Color.RED;
                setTimeout(() => {
                    this.moneyCountLabel.textColor = Color.WHITE;
                    this.selectedTowerCostLabel.textColor = Color.WHITE;
                }, 150);
                return;
            }

            if (this.isPlacedTowerSelected) {
                this.selectedTowerUpgrade1Btn.visible = false;
                this.selectedTowerUpgrade2Btn.visible = false;
                this.selectedTowerSellBtn.visible = false;
                this.isPlacedTowerSelected = false;
                this.selectedTowerRange.destroy();
                this.selectedTowerRange = null;
            }
            this.selectedTowerShopSprite = this.add.animatedSprite(tower, "UI");
            this.selectedTowerShopSprite.animation.play("IDLE");
            this.selectedTowerShopSprite.position.set(Input.getMousePosition().x, Input.getMousePosition().y);
            this.selectedTowerShopSprite.scale.set(3.2, 3.2);
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
            this.selectedTowerUpgrade1Btn.visible = false;
            this.selectedTowerUpgrade2Btn.visible = false;
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
        this.selectedTowerUpgrade1Btn.text = towerData.upgrade1 + "\nCost: " + towerData.upgrade1Cost;
        this.selectedTowerUpgrade1Btn.visible = true;
        this.selectedTowerUpgrade2Btn.text = towerData.upgrade2 + "\nCost: " + towerData.upgrade2Cost;
        this.selectedTowerUpgrade2Btn.visible = true;
        this.selectedTowerSellBtn.text = "Sell: " + (towerData.totalValue * 0.75);
        this.selectedTowerSellBtn.visible = true;

        if (this.selectedTowerRange === null) {
            this.selectedTowerRange = <Circle>this.add.graphic(GraphicType.CIRCLE, "UI", {position: towerData.sprite.position, radius: new Number(towerData.range)});
            this.selectedTowerRange.color = Color.WHITE;
            this.selectedTowerRange.alpha = 0.3;
            this.selectedTowerRange.borderColor = Color.TRANSPARENT;
        }

        this.selectedTowerSellBtn.onClick = () => {
            if (!this.waveInProgress && Input.getMousePressButton() === BUTTON.LEFTCLICK) {
                this.moneyCount += towerData.totalValue * 0.75;
                this.moneyCountLabel.text = this.moneyCount.toString();
                towerData.sprite.destroy();
                towerData.button.destroy();
                this.selectedTowerRange.destroy();
                this.selectedTowerRange = null;
                this.placedTowers.delete(towerId);
                this.isPlacedTowerSelected = false;
                this.selectedTowerUpgrade1Btn.visible = false;
                this.selectedTowerUpgrade2Btn.visible = false;
                this.selectedTowerSellBtn.visible = false;
                this.hideTowerInfoFromShop();
            }
        }

        this.selectedTowerUpgrade1Btn.onClick = () => {
            if (!this.waveInProgress && Input.getMousePressButton() === BUTTON.LEFTCLICK) {
                if (towerData.upgrade1Cost > this.moneyCount) {
                    this.moneyCountLabel.textColor = Color.RED;
                    setTimeout(() => {
                        this.moneyCountLabel.textColor = Color.WHITE;
                    }, 150);
                } else {
                    towerData.attackSpeed += 2;
                    this.selectedTowerSpeedLabel.text = "Attack Speed: " + towerData.attackSpeed;
                    this.moneyCount += -towerData.upgrade1Cost;
                    this.moneyCountLabel.text = this.moneyCount.toString();
                    towerData.totalValue += towerData.upgrade1Cost;
                    this.selectedTowerSellBtn.text = "Sell: " + (towerData.totalValue * 0.75);
                    towerData.sprite.setAIActive(true, {damage: towerData.damage, attackSpeed: towerData.attackSpeed, range: towerData.range});
                }
            }
        }

        this.selectedTowerUpgrade2Btn.onClick = () => {
            if (!this.waveInProgress && Input.getMousePressButton() === BUTTON.LEFTCLICK) {
                if (towerData.upgrade2Cost > this.moneyCount) {
                    this.moneyCountLabel.textColor = Color.RED;
                    setTimeout(() => {
                        this.moneyCountLabel.textColor = Color.WHITE;
                    }, 150);
                } else {
                    towerData.range += 25;
                    this.selectedTowerRangeLabel.text = "Range: " + towerData.range;
                    this.moneyCount += -towerData.upgrade2Cost;
                    this.moneyCountLabel.text = this.moneyCount.toString();
                    towerData.totalValue += towerData.upgrade2Cost;
                    this.selectedTowerSellBtn.text = "Sell: " + (towerData.totalValue * 0.75);
                    towerData.sprite.setAIActive(true, {damage: towerData.damage, attackSpeed: towerData.attackSpeed, range: towerData.range});
                    towerData.sprite.addPhysics(new CircleShape(Vec2.ZERO, towerData.range), undefined, true, false);
                    this.selectedTowerRange.radius = towerData.range;
                }
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
        this.totalWaves = data.numWaves;
        this.waveCountLabel.text = "Wave " + this.currentWave + "/" + this.totalWaves;
        this.waves = new Array();
        for(let i = 0; i < data.numWaves; i++){
            let value = data.waveData[i];
            this.waves.push(value);
        }
    }

    protected spawnEnemy(): void{
        if(this.currentWaveData == null){
            this.currentWaveData = this.waves.shift();
            this.enemies = new Map();
            this.enemyNumber = 0;
        }
        if(Date.now() - this.timeNow >= 1500){
            this.timeNow = Date.now();
            let enemySprite;
            let enemyHealth;
            if(this.currentWaveData.enemies[0] === "farmer"){
                enemySprite = this.add.animatedSprite("farmer", "primary");
                enemyHealth = 20;
            }

            enemySprite.position.set(0, 432);
            enemySprite.scale.set(5, 5);
            enemySprite.animation.play("WALK");
            enemySprite.addPhysics(new AABB(Vec2.ZERO, new Vec2(25, 25)));
            let path = this.currentWaveData.route.map((index: number) => this.graph.getNodePosition(index));
            enemySprite.addAI(EnemyAI, path);        
            enemySprite.setGroup("enemy");

            this.enemies.set(enemySprite, enemyHealth);
    
            this.currentWaveData.numberEnemies[0] -= 1;
            if(this.currentWaveData.numberEnemies[0] == 0){
                this.currentWaveData.enemies.shift();
                this.currentWaveData.numberEnemies.shift();
                
            }
            
            this.enemyNumber++;
            if(this.enemyNumber == this.currentWaveData.totalEnemies){
                this.currentWaveData = null;
                this.spawningEnemies = false;
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
        this.levelEndArea.setTrigger("enemy", AR_Events.ENEMY_ENTERED_LEVEL_END, null, null);
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

    checkAABBtoCircleCollision(aabb: AABB, circle: CircleShape): boolean {
        // Your code goes here:
        let pointX = circle.x;
        let pointY = circle.y;

        if (circle.x < aabb.left) {
            pointX = aabb.left
        } else if (circle.x > aabb.right) {
            pointX = aabb.right;
        }

        if (circle.y < aabb.top) {
            pointY = aabb.top
        } else if (circle.y > aabb.bottom) {
            pointY = aabb.bottom;
        }

        let distX = circle.x - pointX;
        let distY = circle.y - pointY;
        let distance = Math.sqrt((distX * distX) + (distY * distY));

        if (distance <= circle.r) {
            return true;
        }
        return false;
	}

    updateScene(deltaT: number): void {
        while (this.receiver.hasNextEvent()) {
            let event = this.receiver.getNextEvent();

            switch(event.type) {
                case AR_Events.ENEMY_ENTERED_LEVEL_END:
                    {
                        let node = this.sceneGraph.getNode(event.data.get("node"));
                        this.enemies.delete(node);
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

                case AR_Events.ENEMY_HIT:
                    {
                        let node = this.sceneGraph.getNode(event.data.get("node"));
                        let other = this.sceneGraph.getNode(event.data.get("other"));
                        let enemy;
                        let projectile;
                        if (node === undefined || other === undefined) {
                            break;
                        }
                        if(node.group === 1){
                            enemy = node;
                            projectile = other;
                        } else {
                            enemy = other;
                            projectile = node;
                        }
                        projectile.position.set(-1, -1);
                        let newHealth = this.enemies.get(enemy) - event.data.get("data").damage;
                        if (newHealth <= 0) {
                            let id = enemy.id;
                            this.enemies.delete(enemy);
                            enemy.destroy();
                            this.emitter.fireEvent(AR_Events.ENEMY_DIED, {id: id});
                        } else {
                            this.enemies.set(enemy, newHealth);
                        }
                    }
                    break;
            }
        }

        if (this.isTowerSelectedFromShop) {
            let overlapsAnotherTower = false;
            for (let value of Array.from(this.placedTowers.values())) {
                if (this.overlaps(this.selectedTowerShopSprite.sweptRect, value.button.collisionShape.getBoundingRect())) {
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
                    console.log(this.selectedTowerShopSprite.imageId);
                    let newTower = this.add.animatedSprite(this.selectedTowerShopSprite.imageId + "Tower", "primary");
                    newTower.position.set(this.selectedTowerShopSprite.position.x, this.selectedTowerShopSprite.position.y);
                    newTower.scale.set(3.2, 3.2);

                    let newTowerBtn = <Button>this.add.uiElement(UIElementType.BUTTON, "primary", {position: newTower.position, text: ""});
                    newTowerBtn.backgroundColor = Color.TRANSPARENT;
                    newTowerBtn.borderColor = Color.TRANSPARENT;
                    newTowerBtn.borderRadius = 0;
                    newTowerBtn.fontSize = 0;
                    newTowerBtn.setPadding(newTower.sizeWithZoom);
                    newTowerBtn.addPhysics(new AABB(Vec2.ZERO, new Vec2(newTower.sizeWithZoom.x, newTower.sizeWithZoom.y)), undefined, true, true);

                    let defaultTowerData = this.defaultTowerValues.get(this.selectedTowerShopSprite.imageId + "Tower");
                    newTower.addPhysics(new CircleShape(Vec2.ZERO, defaultTowerData.range), undefined, true, false);
                    newTower.addAI(ChickenAI, {damage: defaultTowerData.damage, attackSpeed: defaultTowerData.attackSpeed, range: defaultTowerData.range});

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
        } else if (this.isPlacedTowerSelected && Input.getMousePosition().x < 900) {
            if (Input.isMouseJustPressed() && Input.getMousePressButton() === BUTTON.LEFTCLICK) {
                if (!(this.selectedTowerRange.position.distanceSqTo(Input.getMousePosition()) <= Math.pow(this.selectedTowerRange.radius, 2))) {
                    this.isPlacedTowerSelected = false;
                    this.selectedTowerRange.destroy();
                    this.selectedTowerRange = null;

                    this.selectedTowerNameLabel.visible= false;
                    this.selectedTowerDamageLabel.visible = false;
                    this.selectedTowerSpeedLabel.visible = false;
                    this.selectedTowerRangeLabel.visible = false;
                    this.selectedTowerUpgrade1Btn.visible = false;
                    this.selectedTowerUpgrade2Btn.visible = false;
                    this.selectedTowerSellBtn.visible = false;
                }
            }
        }

        if(this.spawningEnemies){
            this.spawnEnemy();
        }

        if (this.waveInProgress) {
            if (this.enemies.size === 0 && !this.spawningEnemies) {
                this.waveInProgress = false;
                if (this.currentWave === this.totalWaves) {
                    this.victoryLabel.visible = true;
                    this.victoryLabel.text = "Victory!";
                    setTimeout(() => {
                          this.sceneManager.changeToScene(LevelSelection, {}, {});
                    }, 3000);
                } else {
                    this.victoryLabel.visible = true;
                    this.victoryLabel.text = "Wave Complete!";
                    setTimeout(() => {
                        this.victoryLabel.visible = false;
                    }, 3000);
                    this.moneyCount += 200;
                    this.moneyCountLabel.text = this.moneyCount.toString();
                    this.currentWave++;
                    this.waveCountLabel.text = "Wave " + this.currentWave + "/" + this.totalWaves;
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
                        this.selectedTowerUpgrade1Btn.visible = false;
                        this.selectedTowerUpgrade2Btn.visible = false;
                        this.selectedTowerSellBtn.visible = false;
                    }
                }
            }

            for (let towerValue of Array.from(this.placedTowers.values())) {
                for (let enemySprite of Array.from(this.enemies.keys())) {
                    if (this.checkAABBtoCircleCollision(enemySprite.collisionShape.getBoundingRect(), towerValue.sprite.collisionShape.getBoundingCircle())) {
                        this.emitter.fireEvent(AR_Events.ENEMY_ENTERED_TOWER_RANGE, {target: (<GameNode>enemySprite).id,})
                    }
                }
            }
        }

        // Display the navmesh of the current level
        if(Input.isKeyJustPressed("f")){
            this.getLayer("graph").setHidden(!this.getLayer("graph").isHidden());
        }
    }
}
import PositionGraph from "../../Wolfie2D/DataTypes/Graphs/PositionGraph";
import Physical from "../../Wolfie2D/DataTypes/Interfaces/Physical";
import CircleShape from "../../Wolfie2D/DataTypes/Shapes/Circle";
import AABB from "../../Wolfie2D/DataTypes/Shapes/AABB";
import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import Input, { BUTTON } from "../../Wolfie2D/Input/Input";
import Circle from "../../Wolfie2D/Nodes/Graphics/Circle";
import { GraphicType } from "../../Wolfie2D/Nodes/Graphics/GraphicTypes";
import Rect from "../../Wolfie2D/Nodes/Graphics/Rect";
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
import ChickenAI from "../AI/Turrets/Chicken/ChickenAI";
import GameNode, { TweenableProperties } from "../../Wolfie2D/Nodes/GameNode";
import LevelSelection from "./LevelSelection";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import CowAI from "../AI/Turrets/Cow/CowAI";
import Timer from "../../Wolfie2D/Timing/Timer";

import Help from "./Help";
import Layer from "../../Wolfie2D/Scene/Layer";
import PenguinAI from "../AI/Turrets/Penguin/PenguinAI";
import EagleAI from "../AI/Turrets/Eagle/EagleAI";
import Line from "../../Wolfie2D/Nodes/Graphics/Line";
import ElephantAI from "../AI/Turrets/Elephant/ElephantAI";
import Sprite from "../../Wolfie2D/Nodes/Sprites/Sprite";
import { GameEventType } from "../../Wolfie2D/Events/GameEventType";
import Slider from "../../Wolfie2D/Nodes/UIElements/Slider";
import AudioManager, { AudioChannelType } from "../../Wolfie2D/Sound/AudioManager";
import SpiderAI from "../AI/Turrets/Spider/SpiderAI";
import MainMenu from "./MainMenu";
import EndingStory from "./EndingStory";

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
    protected levelSpeedBtn: Button;
    protected waveInProgress: boolean = false;
    protected victoryLabel: Label;
    protected pauseLabel: Label;
    protected isGamePaused: boolean = false;
    protected pauseLayer: Layer;
    protected UILayer: Layer;

    protected towersUnlocked: number = 0;
    protected currentLevel: number;

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
    protected selectedTowerInfoLabel: Label;
    protected selectedTowerUpgrade1Btn: Button;
    protected selectedTowerUpgrade2Btn: Button;
    protected selectedTowerSellBtn: Button;
    protected selectedTowerTarget: Sprite;

    protected isPlacedTowerSelected: boolean = false;
    protected selectedTowerId: number;

    protected graph: PositionGraph;

    protected waves: Array<Record<string, any>>;
    protected currentWaveData: Record<string, any> = null;
    protected enemies: Map<GameNode, any>;
    protected enemyNumber: number;
    protected levelSpeed: number;

    protected levelEndArea: Rect;
    protected levelStart: Vec2;
    protected spawnArrow: Sprite;
    protected spawnArrowPosition: Vec2;
    protected spawnArrowDirection: Vec2;

    protected tilemap: OrthogonalTilemap;

    protected defaultTowerValues: Map<string, any>;
    protected placedTowers: Map<number, any>;

    protected spawningEnemies: boolean = false;
    protected timeBetweenSpawn: number = 1000;
    protected spawnTimer: Timer;

    initScene(init: Record<string, any>) {
        if (Help.infHealth) {
            this.healthCount = Infinity;
        } else {
            this.healthCount = init.startHealth;
        }
        if (Help.infMoney) {
            this.moneyCount = Infinity;
        } else {
            this.moneyCount = init.startMoney; 
        }
        this.currentWave = 1;
        this.levelSpeed = 1;
        this.towersUnlocked = init.towersUnlocked;
        this.currentLevel = init.currentLevel;
    }

    loadScene(): void {
        this.load.image("heart", "assets/images/Heart.png");
        this.load.image("chickenTowerSprite", "assets/sprites/Chicken.png");
        this.load.image("cowTowerSprite", "assets/sprites/Cow.png");
        this.load.image("penguinTowerSprite", "assets/sprites/Penguin.png");
        this.load.image("eagleTowerSprite", "assets/sprites/Eagle.png");
        this.load.image("spiderTowerSprite", "assets/sprites/Spider.png");
        this.load.image("elephantTowerSprite", "assets/sprites/Elephant.png");
        this.load.spritesheet("chickenTower", "assets/spritesheets/chicken.json");
        this.load.spritesheet("cowTower", "assets/spritesheets/cow.json");
        this.load.spritesheet("spiderTower", "assets/spritesheets/spider.json");
        this.load.spritesheet("eagleTower", "assets/spritesheets/eagle.json");
        this.load.spritesheet("elephantTower", "assets/spritesheets/elephant.json");
        this.load.spritesheet("penguinTower", "assets/spritesheets/penguin.json");
        this.load.image("coin", "assets/images/Coin.png");
        this.load.image("egg", "assets/images/Egg.png")
        this.load.image("fart", "assets/images/Fart.png")
        this.load.image("snowball", "assets/images/Snowball.png");
        this.load.image("cobweb", "assets/images/Cobweb.png");
        this.load.spritesheet("lightingBolt", "assets/spritesheets/lightingBolt.json");
        this.load.spritesheet("poison", "assets/spritesheets/poison.json");
        this.load.image("waterBomb", "assets/images/WaterBomb.png");
        this.load.spritesheet("splash", "assets/spritesheets/splash.json");
        this.load.image("target", "assets/images/Target.png");
        this.load.object("towerData", "assets/data/default_tower_values.json");
        this.load.image("backgroundImage", "assets/images/Background_Lighter.png");
        this.load.image("arrow", "assets/images/Arrow.png");
        this.load.audio("chickenFire", "assets/sounds/chickenFire.wav");
        this.load.audio("penguinFire", "assets/sounds/penguinFire.wav");
        this.load.audio("lightingStrike", "assets/sounds/lightingStrike.wav");
        this.load.audio("cowBurp", "assets/sounds/cowBurp.wav");
        this.load.audio("elephantFire", "assets/sounds/elephantFire.wav");
        this.load.audio("enemyDeath", "assets/sounds/enemyDeath.wav");
        this.load.audio("waterExplosion", "assets/sounds/waterExplosion.wav");
        this.load.audio("spiderWeb", "assets/sounds/SpiderWeb.wav");
        this.load.audio("spiderPoison", "assets/sounds/SpiderPoisonSpitting.wav");

    }

    startScene(): void {
        if (!MainMenu.lowerMusicOnce) {
            MainMenu.musicVolume = 0.5;
            MainMenu.lowerMusicOnce = true;
        }
        AudioManager.setVolume(AudioChannelType.MUSIC, MainMenu.musicVolume);
        AudioManager.setVolume(AudioChannelType.SFX, MainMenu.sfxVolume);
        this.initLayers();
        this.initViewPort();
        this.subscribeToEvents();
        this.initDefaultTowerValues();
        this.addUI();
        this.addPauseUI();
        this.createNavmesh();
        this.intializeWaves();

        this.placedTowers = new Map();
        this.tilemap = this.getTilemap("EnemyArea") as OrthogonalTilemap;
    }

    protected initLayers(): void {
        this.UILayer = this.addUILayer("UI");
        this.UILayer.setDepth(2);
        this.addLayer("primary", 1);
        this.pauseLayer = this.addUILayer("pauseLayer");
        this.pauseLayer.setDepth(3);
        this.pauseLayer.disable();
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

    protected addPauseUI(): void {
        let background = this.add.sprite("backgroundImage", "pauseLayer");
        background.position.set(this.size.x, this.size.y);

        this.pauseLabel = <Label>this.add.uiElement(UIElementType.LABEL, "pauseLayer", {position: new Vec2(this.size.x, this.size.y - 300), text: "Paused"});
        this.pauseLabel.textColor = Color.BLACK;
        this.pauseLabel.font = "PixelSimple";
        this.pauseLabel.fontSize = 60;

        let line = <Line>this.add.graphic(GraphicType.LINE, "pauseLayer", {start: new Vec2(this.size.x - 130, this.size.y - 275), end: new Vec2(this.size.x + 130, this.size.y - 275)});
        line.color = Color.BLACK;
        line.thickness = 5;

        let exitLevelBtn = <Button>this.add.uiElement(UIElementType.BUTTON, "pauseLayer", {position: new Vec2(this.size.x, this.size.y - 100), text: "Exit Level"});
        exitLevelBtn.backgroundColor = Color.TRANSPARENT;
        exitLevelBtn.textColor = Color.BLACK;
        exitLevelBtn.borderColor = Color.BLACK;
        exitLevelBtn.borderRadius = 0;
        exitLevelBtn.borderWidth = 3;
        exitLevelBtn.fontSize = 30;
        exitLevelBtn.font = "PixelSimple";
        exitLevelBtn.setPadding(new Vec2(10, 10));

        exitLevelBtn.onEnter = () => {
            exitLevelBtn.textColor = Color.ORANGE;
        }
        exitLevelBtn.onLeave = () => {
            exitLevelBtn.textColor = Color.BLACK;
        }
        exitLevelBtn.onClick = () => {
            if (Input.getMousePressButton() == BUTTON.LEFTCLICK) {
                this.sceneManager.changeToScene(LevelSelection, {}, {});
            }
        }

        let musicLabel = <Label>this.add.uiElement(UIElementType.LABEL, "pauseLayer", {position: new Vec2(this.size.x, this.size.y - 10), text: "Music"});
        musicLabel.textColor = Color.BLACK;
        musicLabel.font = "PixelSimple";
        musicLabel.fontSize = 30;

        let slider = <Slider>this.add.uiElement(UIElementType.SLIDER, "pauseLayer", {position: new Vec2(this.size.x, this.size.y + 25), value: MainMenu.musicVolume});
        
        // UI Stuff
        slider.size = new Vec2(200, 50);
        slider.nibSize = new Vec2(30, 30);
        slider.borderRadius = 15;
        slider.nibColor = Color.ORANGE;
        slider.sliderColor = Color.BLACK;

        slider.onValueChange = (value: number) => {
            // Use a non-linear value->volume function, since sound is wack
            MainMenu.musicVolume = value;
            AudioManager.setVolume(AudioChannelType.MUSIC, value);
        }

        let sfxLabel = <Label>this.add.uiElement(UIElementType.LABEL, "pauseLayer", {position: new Vec2(this.size.x, this.size.y + 70), text: "Sound Effects"});
        sfxLabel.textColor = Color.BLACK;
        sfxLabel.font = "PixelSimple";
        sfxLabel.fontSize = 30;

        // Initialize value to 1 (music is at max)
        let sfxslider = <Slider>this.add.uiElement(UIElementType.SLIDER, "pauseLayer", {position: new Vec2(this.size.x, this.size.y + 105), value: MainMenu.sfxVolume});

        // UI Stuff
        sfxslider.size = new Vec2(200, 50);
        sfxslider.nibSize = new Vec2(30, 30);
        sfxslider.borderRadius = 15;
        sfxslider.nibColor = Color.ORANGE;
        sfxslider.sliderColor = Color.BLACK;

        sfxslider.onValueChange = (value: number) => {
            // Use a non-linear value->volume function, since sound is wack
            MainMenu.sfxVolume = value;
            AudioManager.setVolume(AudioChannelType.SFX, value);
        }
    }

    protected addUI(): void {
        this.spawnArrow = this.add.sprite("arrow", "UI");
        this.spawnArrow.rotation = Vec2.DOWN.angleToCCW(this.spawnArrowDirection);
        this.spawnArrow.position.set(this.spawnArrowPosition.x, this.spawnArrowPosition.y);
        this.spawnArrow.scale.set(4, 4);

        let heart = this.add.sprite("heart", "UI");
        heart.scale.set(2.5, 2.5);
        heart.position.set(30, 30);

        this.healthCountLabel = <Label>this.add.uiElement(UIElementType.LABEL, "UI", {position: new Vec2(90, 30), text: this.healthCount.toString()});
        if (this.healthCount == Infinity) {
            this.healthCountLabel.text = '\u221E';
            this.healthCountLabel.position.set(70, 30);
        }
        this.healthCountLabel.textColor = Color.WHITE
        this.healthCountLabel.font = "PixelSimple";

        let coin = this.add.sprite("coin", "UI");
        coin.scale.set(2.5, 2.5);
        coin.position.set(180, 30);

        this.moneyCountLabel = <Label>this.add.uiElement(UIElementType.LABEL, "UI", {position: new Vec2(240, 30), text: this.moneyCount.toString()});
        if (this.moneyCount === Infinity) {
            this.moneyCountLabel.text = '\u221E';
            this.moneyCountLabel.position.set(220, 30)
        }
        this.moneyCountLabel.textColor = Color.WHITE
        this.moneyCountLabel.font = "PixelSimple";

        this.waveCountLabel = <Label>this.add.uiElement(UIElementType.LABEL, "UI", {position: new Vec2(810, 30), text: "Wave " + this.currentWave + "/" + this.totalWaves});
        this.waveCountLabel.textColor = Color.WHITE
        this.waveCountLabel.font = "PixelSimple";

        this.victoryLabel = <Label>this.add.uiElement(UIElementType.LABEL, "UI", {position: this.size, text: ""});
        this.victoryLabel.textColor = Color.WHITE
        this.victoryLabel.font = "PixelSimple";
        this.victoryLabel.fontSize = 50;
        this.victoryLabel.visible = false;

        let sidePanel = <Rect>this.add.graphic(GraphicType.RECT, "UI", {position: new Vec2(1050, this.size.y), size: new Vec2(300, 800)});
        sidePanel.color = new Color(186, 104, 30, 0.9);

        let shopLabel = <Label>this.add.uiElement(UIElementType.LABEL, "UI", {position: new Vec2(1050, 40), text: "Shop"});
        shopLabel.textColor = Color.WHITE;
        shopLabel.font = "PixelSimple";
        shopLabel.fontSize = 60;

        let line = <Line>this.add.graphic(GraphicType.LINE, "UI", {start: new Vec2(900, 725), end: new Vec2(1200, 725)});
        line.color = Color.BLACK;
        line.thickness = 2;
        
        this.startWaveBtn = <Button>this.add.uiElement(UIElementType.BUTTON, "UI", {position: new Vec2(1050, 760), text: "Start Wave"});
        this.startWaveBtn.backgroundColor = Color.TRANSPARENT;
        this.startWaveBtn.textColor = Color.BLACK;
        this.startWaveBtn.borderColor = Color.BLACK;
        this.startWaveBtn.borderRadius = 0;
        this.startWaveBtn.fontSize = 25;
        this.startWaveBtn.font = "PixelSimple";
        this.startWaveBtn.setPadding(new Vec2(10, 10));

        this.startWaveBtn.onClick = () => {
            if (Input.getMousePressButton() === BUTTON.LEFTCLICK) {
                this.startWaveBtn.visible = false;
                if (this.currentWave >= 2 && this.timeBetweenSpawn >= 500) {
                    this.timeBetweenSpawn -= 100;
                }
                this.spawnArrow.visible = false;
                this.spawnTimer = new Timer(this.timeBetweenSpawn);
                this.levelSpeed = 1;
                this.emitter.fireEvent(AR_Events.LEVEL_SPEED_CHANGE, {levelSpeed: this.levelSpeed});
                this.levelSpeedBtn.text = "Speed: " + this.levelSpeed + "x";
                this.spawningEnemies = true;
                this.waveInProgress = true;
                this.emitter.fireEvent(AR_Events.WAVE_START_END, {isWaveInProgress: true});
                setTimeout(() => {
                    this.levelSpeedBtn.visible = true;
                }, 100);
            }
        }
        this.startWaveBtn.onEnter = () => {
            this.startWaveBtn.textColor = Color.WHITE;
        }
        this.startWaveBtn.onLeave = () => {
            this.startWaveBtn.textColor = Color.BLACK;
        }

        this.levelSpeedBtn = <Button>this.add.uiElement(UIElementType.BUTTON, "UI", {position: new Vec2(1050, 760), text: "Speed: " + this.levelSpeed + "x"});
        this.levelSpeedBtn.backgroundColor = Color.TRANSPARENT;
        this.levelSpeedBtn.textColor = Color.BLACK;
        this.levelSpeedBtn.borderColor = Color.BLACK;
        this.levelSpeedBtn.borderRadius = 0;
        this.levelSpeedBtn.fontSize = 25;
        this.levelSpeedBtn.font = "PixelSimple";
        this.levelSpeedBtn.visible = false;
        this.levelSpeedBtn.setPadding(new Vec2(10, 10));

        this.levelSpeedBtn.onClick = () => {
            if (Input.getMousePressButton() === BUTTON.LEFTCLICK) {
                if (this.levelSpeed !== 4) {
                    this.levelSpeed *= 2;
                    this.spawnTimer.levelSpeed = this.levelSpeed;
                    this.levelSpeedBtn.text = "Speed: " + this.levelSpeed + "x";
                    this.emitter.fireEvent(AR_Events.LEVEL_SPEED_CHANGE, {levelSpeed: this.levelSpeed});
                }
            } else if (Input.getMousePressButton() === BUTTON.RIGHTCLICK) {
                if (this.levelSpeed !== 1) {
                    this.levelSpeed /= 2;
                    this.spawnTimer.levelSpeed = this.levelSpeed;
                    this.levelSpeedBtn.text = "Speed: " + this.levelSpeed + "x";
                    this.emitter.fireEvent(AR_Events.LEVEL_SPEED_CHANGE, {levelSpeed: this.levelSpeed});
                }
            }
        }
        this.levelSpeedBtn.onEnter = () => {
            this.levelSpeedBtn.textColor = Color.WHITE;
        }
        this.levelSpeedBtn.onLeave = () => {
            this.levelSpeedBtn.textColor = Color.BLACK;
        }

        if (this.towersUnlocked >= 1 || Help.allTowers) {
            let chickenTowerImg = this.add.sprite("chickenTowerSprite", "UI");
            chickenTowerImg.position.set(975, 125);
            chickenTowerImg.scale.set(4, 4);

            let chickenTowerBtn = <Button>this.add.uiElement(UIElementType.BUTTON, "UI", {position: new Vec2(975, 125), text: ""});
            chickenTowerBtn.backgroundColor = Color.TRANSPARENT;
            chickenTowerBtn.borderColor = Color.TRANSPARENT;
            chickenTowerBtn.borderRadius = 0;
            chickenTowerBtn.fontSize = 0;
            chickenTowerBtn.setPadding(chickenTowerImg.sizeWithZoom);

            
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

        if (this.towersUnlocked >= 2 || Help.allTowers) {
            let cowTowerImg = this.add.sprite("cowTowerSprite", "UI");
            cowTowerImg.position.set(1125, 125);
            cowTowerImg.scale.set(2, 2);

            let cowTowerBtn = <Button>this.add.uiElement(UIElementType.BUTTON, "UI", {position: new Vec2(1125, 125), text: ""});
            cowTowerBtn.backgroundColor = Color.TRANSPARENT;
            cowTowerBtn.borderColor = Color.TRANSPARENT;
            cowTowerBtn.borderRadius = 0;
            cowTowerBtn.fontSize = 0;
            cowTowerBtn.setPadding(cowTowerImg.sizeWithZoom);

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

        if (this.towersUnlocked >= 3 || Help.allTowers) {
            let spiderTowerImg = this.add.sprite("spiderTowerSprite", "UI");
            spiderTowerImg.position.set(975, 200);
            spiderTowerImg.scale.set(2, 2);

            let spiderTowerBtn = <Button>this.add.uiElement(UIElementType.BUTTON, "UI", {position: new Vec2(975, 200), text: ""});
            spiderTowerBtn.backgroundColor = Color.TRANSPARENT;
            spiderTowerBtn.textColor = Color.BLACK;
            spiderTowerBtn.borderColor = Color.TRANSPARENT;
            spiderTowerBtn.borderRadius = 0;
            spiderTowerBtn.font = "PixelSimple";
            spiderTowerBtn.setPadding(new Vec2(30, 15));

            spiderTowerBtn.onClick = () => {
                this.createTowerFromShop("spiderTower");
            }
            spiderTowerBtn.onEnter = () => {
                spiderTowerBtn.textColor = Color.WHITE;
                this.displayTowerInfoFromShop("spiderTower");
            }
            spiderTowerBtn.onLeave = () => {
                this.hideTowerInfoFromShop();
            }
        }

        if (this.towersUnlocked >= 4 || Help.allTowers) {
            let eagleTowerImg = this.add.sprite("eagleTowerSprite", "UI");
            eagleTowerImg.position.set(1125, 200);
            eagleTowerImg.scale.set(2, 2);

            let eagleTowerBtn = <Button>this.add.uiElement(UIElementType.BUTTON, "UI", {position: new Vec2(1125, 200), text: ""});
            eagleTowerBtn.backgroundColor = Color.TRANSPARENT;
            eagleTowerBtn.borderColor = Color.TRANSPARENT;
            eagleTowerBtn.borderRadius = 0;
            eagleTowerBtn.fontSize = 0;
            eagleTowerBtn.setPadding(eagleTowerImg.sizeWithZoom);

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

        if (this.towersUnlocked >= 5 || Help.allTowers) {
            let penguinTowerImg = this.add.sprite("penguinTowerSprite", "UI");
            penguinTowerImg.position.set(975, 275);
            penguinTowerImg.scale.set(4, 4);

            let penguinTowerBtn = <Button>this.add.uiElement(UIElementType.BUTTON, "UI", {position: new Vec2(975, 275), text: ""});
            penguinTowerBtn.backgroundColor = Color.TRANSPARENT;
            penguinTowerBtn.borderColor = Color.TRANSPARENT;
            penguinTowerBtn.borderRadius = 0;
            penguinTowerBtn.fontSize = 0;
            penguinTowerBtn.setPadding(penguinTowerImg.sizeWithZoom);

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

        if (this.towersUnlocked >= 6 || Help.allTowers) {
            let elephantTowerImg = this.add.sprite("elephantTowerSprite", "UI");
            elephantTowerImg.position.set(1125, 275);
            elephantTowerImg.scale.set(3.5, 3.36);

            let elephantTowerBtn = <Button>this.add.uiElement(UIElementType.BUTTON, "UI", {position: new Vec2(1125, 275), text: ""});
            elephantTowerBtn.backgroundColor = Color.TRANSPARENT;
            elephantTowerBtn.borderColor = Color.TRANSPARENT;
            elephantTowerBtn.borderRadius = 0;
            elephantTowerBtn.fontSize = 0;
            elephantTowerBtn.setPadding(elephantTowerImg.sizeWithZoom);

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

        this.selectedTowerNameLabel = <Label>this.add.uiElement(UIElementType.LABEL, "UI", {position: new Vec2(1050, 340), text: ""});
        this.selectedTowerNameLabel.textColor = Color.WHITE
        this.selectedTowerNameLabel.font = "PixelSimple";
        this.selectedTowerNameLabel.fontSize = 35;
        this.selectedTowerNameLabel.visible = false;

        this.selectedTowerDamageLabel = <Label>this.add.uiElement(UIElementType.LABEL, "UI", {position: new Vec2(1050, 380), text: ""});
        this.selectedTowerDamageLabel.textColor = Color.WHITE
        this.selectedTowerDamageLabel.font = "PixelSimple";
        this.selectedTowerDamageLabel.fontSize = 25;
        this.selectedTowerDamageLabel.visible = false;

        this.selectedTowerSpeedLabel = <Label>this.add.uiElement(UIElementType.LABEL, "UI", {position: new Vec2(1050, 410), text: ""});
        this.selectedTowerSpeedLabel.textColor = Color.WHITE
        this.selectedTowerSpeedLabel.font = "PixelSimple";
        this.selectedTowerSpeedLabel.fontSize = 25;
        this.selectedTowerSpeedLabel.visible = false;

        this.selectedTowerRangeLabel = <Label>this.add.uiElement(UIElementType.LABEL, "UI", {position: new Vec2(1050, 440), text: ""});
        this.selectedTowerRangeLabel.textColor = Color.WHITE
        this.selectedTowerRangeLabel.font = "PixelSimple";
        this.selectedTowerRangeLabel.fontSize = 25;
        this.selectedTowerRangeLabel.visible = false;

        this.selectedTowerCostLabel = <Label>this.add.uiElement(UIElementType.LABEL, "UI", {position: new Vec2(1050, 480), text: ""});
        this.selectedTowerCostLabel.textColor = Color.WHITE
        this.selectedTowerCostLabel.font = "PixelSimple";
        this.selectedTowerCostLabel.fontSize = 25;
        this.selectedTowerCostLabel.visible = false;

        this.selectedTowerInfoLabel = <Label>this.add.uiElement(UIElementType.LABEL, "UI", {position: new Vec2(1050, 520), text: ""});
        this.selectedTowerInfoLabel.textColor = Color.WHITE
        this.selectedTowerInfoLabel.font = "PixelSimple";
        this.selectedTowerInfoLabel.fontSize = 20;
        this.selectedTowerInfoLabel.visible = false;

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

        this.selectedTowerUpgrade1Btn = <Button>this.add.uiElement(UIElementType.BUTTON, "UI", {position: new Vec2(1050, 510), text: ""});
        this.selectedTowerUpgrade1Btn.backgroundColor = Color.TRANSPARENT;
        this.selectedTowerUpgrade1Btn.textColor = Color.BLACK;
        this.selectedTowerUpgrade1Btn.borderColor = Color.BLACK;
        this.selectedTowerUpgrade1Btn.borderRadius = 0;
        this.selectedTowerUpgrade1Btn.font = "PixelSimple";
        this.selectedTowerUpgrade1Btn.fontSize = 23;
        this.selectedTowerUpgrade1Btn.setPadding(new Vec2(10, 15));
        this.selectedTowerUpgrade1Btn.visible = false;

        this.selectedTowerUpgrade1Btn.onEnter = () => {
            this.selectedTowerUpgrade1Btn.textColor = Color.WHITE;
        }
        this.selectedTowerUpgrade1Btn.onLeave = () => {
            this.selectedTowerUpgrade1Btn.textColor = Color.BLACK;
        }

        this.selectedTowerUpgrade2Btn = <Button>this.add.uiElement(UIElementType.BUTTON, "UI", {position: new Vec2(1050, 590), text: ""});
        this.selectedTowerUpgrade2Btn.backgroundColor = Color.TRANSPARENT;
        this.selectedTowerUpgrade2Btn.textColor = Color.BLACK;
        this.selectedTowerUpgrade2Btn.borderColor = Color.BLACK;;
        this.selectedTowerUpgrade2Btn.borderRadius = 0;
        this.selectedTowerUpgrade2Btn.font = "PixelSimple";
        this.selectedTowerUpgrade2Btn.fontSize = 23;
        this.selectedTowerUpgrade2Btn.setPadding(new Vec2(10, 15));
        this.selectedTowerUpgrade2Btn.visible = false;

        this.selectedTowerUpgrade2Btn.onEnter = () => {
            this.selectedTowerUpgrade2Btn.textColor = Color.WHITE;
        }
        this.selectedTowerUpgrade2Btn.onLeave = () => {
            this.selectedTowerUpgrade2Btn.textColor = Color.BLACK;
        }

        this.selectedTowerSellBtn = <Button>this.add.uiElement(UIElementType.BUTTON, "UI", {position: new Vec2(1050, 680), text: "Sell"});
        this.selectedTowerSellBtn.backgroundColor = Color.TRANSPARENT;
        this.selectedTowerSellBtn.textColor = Color.BLACK;
        this.selectedTowerSellBtn.borderColor = Color.RED;
        this.selectedTowerSellBtn.borderRadius = 0;
        this.selectedTowerSellBtn.font = "PixelSimple";
        this.selectedTowerSellBtn.fontSize = 25;
        this.selectedTowerSellBtn.setPadding(new Vec2(30, 10));
        this.selectedTowerSellBtn.visible = false;

        this.selectedTowerSellBtn.onEnter = () => {
            this.selectedTowerSellBtn.textColor = Color.WHITE;
        }
        this.selectedTowerSellBtn.onLeave = () => {
            this.selectedTowerSellBtn.textColor = Color.BLACK;
        }
        
        this.selectedTowerTarget = this.add.sprite("target", "UI");
        this.selectedTowerTarget.scale.set(4, 4);
        this.selectedTowerTarget.visible = false;
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
                this.selectedTowerTarget.visible = false;
            }
            this.selectedTowerShopSprite = this.add.animatedSprite(tower, "UI");
            this.selectedTowerShopSprite.animation.play("IDLE", true);
            this.selectedTowerShopSprite.position.set(Input.getMousePosition().x, Input.getMousePosition().y);
            switch (tower) {
                case "chickenTower":
                    {
                        this.selectedTowerShopSprite.scale.set(3.8, 3.8);
                    }
                    break;
                case "cowTower":
                    {
                        this.selectedTowerShopSprite.scale.set(3, 3);
                    }   
                    break;
                case "penguinTower":
                    {
                        this.selectedTowerShopSprite.scale.set(3.8, 3.8);
                    }   
                    break;
                case "eagleTower":
                    {
                        this.selectedTowerShopSprite.scale.set(3.3, 3.3);
                    }   
                    break;
                case "elephantTower":
                    {
                        this.selectedTowerShopSprite.scale.set(5.5, 5.5);
                    }   
                    break;
                case "spiderTower":
                    {
                        this.selectedTowerShopSprite.scale.set(2.5, 2.5);
                    }
                    break;
            }
            this.selectedTowerShopSprite.addPhysics();
            
            let radius = towerData.range !== "User Input" ? towerData.range : 100;
            this.selectedTowerRange = <Circle>this.add.graphic(GraphicType.CIRCLE, "UI", {position: Input.getMousePosition(), radius: new Number(radius)});
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
                        start: radius,
                        end: radius + 10,
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
        if (!this.isTowerSelectedFromShop) {
            this.selectedTowerInfoLabel.text = towerData.description;
            this.selectedTowerDamageLabel.sizeAssigned = false;
            this.selectedTowerInfoLabel.visible = true;
        } else {
            this.selectedTowerInfoLabel.visible = false;
        }
        this.selectedTowerNameLabel.text = towerData.name;
        this.selectedTowerNameLabel.visible = true;
        this.selectedTowerCostLabel.text = "Cost: " + towerData.cost;
        this.selectedTowerCostLabel.visible = true;
        let damage = towerData.damage;
        this.selectedTowerDamageLabel.text = "Damage: " + (Number(towerData.damage).toFixed(2));
        this.selectedTowerDamageLabel.visible = true;
        this.selectedTowerSpeedLabel.text = "Attack Speed: " + towerData.attackSpeed;
        this.selectedTowerSpeedLabel.visible = true;
        this.selectedTowerRangeLabel.text = "Range: " + towerData.range;
        this.selectedTowerRangeLabel.visible = true;
    }

    protected hideTowerInfoFromShop(): void {
        if (this.isPlacedTowerSelected) {
            this.selectedTowerInfoLabel.visible = false;
            this.selectedTowerCostLabel.visible = false;
            this.displayTowerInfoFromId(this.selectedTowerId);
        } else if (this.isTowerSelectedFromShop) {
            this.displayTowerInfoFromShop(this.selectedTowerShopName);
        } else {
            this.selectedTowerInfoLabel.visible = false;
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
        this.selectedTowerDamageLabel.text = "Damage: " + (Number(towerData.damage).toFixed(2));
        this.selectedTowerDamageLabel.visible = true;
        this.selectedTowerSpeedLabel.text = "Attack Speed: " + towerData.attackSpeed;
        this.selectedTowerSpeedLabel.visible = true;
        this.selectedTowerRangeLabel.text = "Range: " + towerData.range;
        this.selectedTowerRangeLabel.visible = true;
        this.selectedTowerSellBtn.text = "Sell: " + (towerData.totalValue * 0.75);
        this.selectedTowerSellBtn.visible = true;
        this.selectedTowerTarget.visible = false;

        if (this.selectedTowerRange === null) {
            let radius = towerData.range !== "User Input" ? towerData.range : 100;
            this.selectedTowerRange = <Circle>this.add.graphic(GraphicType.CIRCLE, "UI", {position: towerData.button.position, radius: new Number(radius)});
            this.selectedTowerRange.color = Color.WHITE;
            this.selectedTowerRange.alpha = 0.3;
            this.selectedTowerRange.borderColor = Color.TRANSPARENT;
        }

        this.selectedTowerSellBtn.onClick = () => {
            if (!this.waveInProgress && Input.getMousePressButton() === BUTTON.LEFTCLICK) {
                this.incMoney(towerData.totalValue * 0.75);
                this.emitter.fireEvent(AR_Events.SELL_TOWER, {id: towerData.sprite.id});
                // towerData.sprite.destroy();
                towerData.button.destroy();
                this.selectedTowerTarget.visible = false;
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

        let ugprade1Text = towerData.upgrade1 + "\nCost: " + towerData.upgrade1Cost;
        let upgrade2Text = towerData.upgrade2 + "\nCost: " + towerData.upgrade2Cost;
        switch (towerData.sprite.imageId) {
            case "chicken":
                {
                    if (towerData.attackSpeedUpgradesRemaining === 0) {
                        ugprade1Text = towerData.upgrade1 + "\nMaxed Out";
                    }
                    if (towerData.range >= towerData.maxRange) {
                        upgrade2Text =  towerData.upgrade2 + "\nMaxed Out";
                    }
                }
                break;
            case "cow":
                {
                    if (towerData.damageUpgradesRemaining === 0) {
                        ugprade1Text =  towerData.upgrade1 + "\nMaxed Out";
                    }
                    if (towerData.hasAura) {
                        upgrade2Text = towerData.upgrade2 + "\nMaxed Out";
                    }
                }
                break;
            case "penguin":
                {
                    if (towerData.attackSpeedUpgradesRemaining === 0) {
                        ugprade1Text = towerData.upgrade1 + "\nMaxed Out";
                    }
                    if (towerData.hasStrongSlow) {
                        upgrade2Text =  towerData.upgrade2 + "\nMaxed Out";
                    }
                }
                break;
            case "eagle":
                {
                    if (towerData.damageUpgradesRemaining === 0) {
                        ugprade1Text = towerData.upgrade1 + "\nMaxed Out";
                    }
                    if (towerData.hasDamageAura) {
                        upgrade2Text =  towerData.upgrade2 + "\nMaxed Out";
                    }
                }
                break;
            case "elephant":
                {
                    if (towerData.accuracyUpgradesRemaining === 0) {
                        ugprade1Text = towerData.upgrade1 + "\nMaxed Out";
                    }
                    if (towerData.damageUpgradesRemaining === 0) {
                        upgrade2Text =  towerData.upgrade2 + "\nMaxed Out";
                    }
                    this.selectedTowerTarget.position.set(towerData.target.x, towerData.target.y);
                    this.selectedTowerTarget.visible = true;
                }
                break;
            case "spider":
                {
                    if (towerData.slowUpgrade){
                        ugprade1Text = towerData.upgrade1 + "\nMaxed Out";
                    }
                    if (towerData.canAttack){
                        upgrade2Text = towerData.upgrade2 + "\nMaxed Out";
                    }
                }
        }
        
        this.selectedTowerUpgrade1Btn.setText(ugprade1Text);
        this.selectedTowerUpgrade1Btn.sizeAssigned = false;
        this.selectedTowerUpgrade1Btn.visible = true;
        this.selectedTowerUpgrade2Btn.setText(upgrade2Text);
        this.selectedTowerUpgrade2Btn.sizeAssigned = false;
        this.selectedTowerUpgrade2Btn.visible = true;

        this.selectedTowerUpgrade1Btn.onClick = () => {
            if (!this.waveInProgress && Input.getMousePressButton() === BUTTON.LEFTCLICK) {
                if (towerData.upgrade1Cost > this.moneyCount) {
                    this.moneyCountLabel.textColor = Color.RED;
                    setTimeout(() => {
                        this.moneyCountLabel.textColor = Color.WHITE;
                    }, 150);
                } else {
                    let purchased = false;
                    let purchaseCost = 0;
                    switch (towerData.sprite.imageId) {
                        case "chicken":
                        case "penguin":
                            {
                                if (towerData.attackSpeedUpgradesRemaining !== 0) {
                                    purchaseCost = towerData.upgrade1Cost;
                                    towerData.attackSpeedUpgradesRemaining--;
                                    towerData.upgrade1Cost += 50;
                                    if (towerData.attackSpeedUpgradesRemaining === 0) {
                                        this.selectedTowerUpgrade1Btn.setText(towerData.upgrade1 + "\nMaxed Out");
                                        this.selectedTowerUpgrade1Btn.sizeAssigned = false;
                                    } else {
                                        this.selectedTowerUpgrade1Btn.setText(towerData.upgrade1 + "\nCost: " + towerData.upgrade1Cost);
                                    }
                                    towerData.attackSpeed += 1;
                                    this.selectedTowerSpeedLabel.text = "Attack Speed: " + towerData.attackSpeed;
                                    towerData.sprite.setAIActive(true, {type: "attackSpeed", attackSpeed: towerData.attackSpeed});
                                    purchased = true;
                                }
                            }
                            break;
                        case "eagle":
                        case "cow": 
                            {   
                                if (towerData.damageUpgradesRemaining !== 0) {
                                    purchaseCost = towerData.upgrade1Cost;
                                    towerData.damageUpgradesRemaining--;
                                    towerData.upgrade1Cost += 50;
                                    if (towerData.damageUpgradesRemaining === 0) {
                                        this.selectedTowerUpgrade1Btn.setText(towerData.upgrade1 + "\nMaxed Out");
                                        this.selectedTowerUpgrade1Btn.sizeAssigned = false;
                                    } else {
                                        this.selectedTowerUpgrade1Btn.setText(towerData.upgrade1 + "\nCost: " + towerData.upgrade1Cost);
                                    }
                                    if (towerData.sprite.imageId === "eagle") {
                                        towerData.damage += 4;
                                    } else if (towerData.sprite.imageId === "cow") {
                                        towerData.damage += 0.10;
                                    }
                                    this.selectedTowerDamageLabel.text = "Damage: " + (Number(towerData.damage).toFixed(2));
                                    towerData.sprite.setAIActive(true, {type: "damage", damage: towerData.damage});
                                    purchased = true;
                                }
                            }
                            break;
                        case "elephant": 
                                {
                                    if (towerData.accuracyUpgradesRemaining !== 0) {
                                        purchaseCost = towerData.upgrade1Cost;
                                        towerData.accuracyUpgradesRemaining--;
                                        towerData.upgrade1Cost += 50;
                                        if (towerData.accuracyUpgradesRemaining === 0) {
                                            this.selectedTowerUpgrade1Btn.setText(towerData.upgrade1 + "\nMaxed Out");
                                            this.selectedTowerUpgrade1Btn.sizeAssigned = false;
                                        } else {
                                            this.selectedTowerUpgrade1Btn.setText(towerData.upgrade1 + "\nCost: " + towerData.upgrade1Cost);
                                        }
                                        towerData.accuracy += 0.25
                                        towerData.sprite.setAIActive(true, {type: "accuracy", accuracy: towerData.accuracy});
                                        purchased = true;
                                    }
                                }
                                break;
                        case "spider":
                            {
                                if(!towerData.slowUpgrade){
                                    purchaseCost = towerData.upgrade1Cost;
                                    towerData.slowUpgrade = true;
                                    this.selectedTowerUpgrade1Btn.setText(towerData.upgrade1 + "\nMaxed Out");
                                    this.selectedTowerUpgrade1Btn.sizeAssigned = false;
                                    towerData.sprite.setAIActive(true, {type: "slowUpgrade", slowUpgrade: towerData.slowUpgrade});
                                    purchased = true;
                                }
                            }
                            break;
                    }
                    if (purchased) {
                        this.incMoney(-purchaseCost);
                        towerData.totalValue += purchaseCost;
                        this.selectedTowerSellBtn.text = "Sell: " + (towerData.totalValue * 0.75);
                    }
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
                    let purchased = false;
                    let purchaseCost = 0;
                    switch (towerData.sprite.imageId) {
                        case "chicken": 
                            {
                                if (!(towerData.range >= towerData.maxRange)) {
                                    towerData.range += 50;
                                    purchaseCost = towerData.upgrade2Cost;
                                    this.selectedTowerRange.radius = towerData.range;
                                    towerData.upgrade2Cost += 50;
                                    towerData.sprite.addPhysics(new CircleShape(Vec2.ZERO, towerData.range), undefined, true, false);
                                    if (towerData.range >= towerData.maxRange) {
                                        this.selectedTowerUpgrade2Btn.setText(towerData.upgrade2 + "\nMaxed Out");
                                        this.selectedTowerUpgrade2Btn.sizeAssigned = false;
                                    } else {
                                        this.selectedTowerUpgrade2Btn.setText(towerData.upgrade2 + "\nCost: " + towerData.upgrade2Cost);
                                    }
                                    this.selectedTowerRangeLabel.text = "Range: " + towerData.range;
                                    towerData.sprite.setAIActive(true, {type: "range", range: towerData.range});
                                    purchased = true;
                                }
                            }
                            break;
                        case "cow": 
                            {
                                if (!towerData.hasAura) {
                                    purchaseCost = towerData.upgrade2Cost;
                                    towerData.hasAura = true;
                                    this.selectedTowerUpgrade2Btn.setText(towerData.upgrade2 + "\nMaxed Out");
                                    this.selectedTowerUpgrade2Btn.sizeAssigned = false;
                                    towerData.sprite.setAIActive(true, {type: "hasAura", hasAura: towerData.hasAura});
                                    purchased = true;
                                    for (let key of Array.from(this.placedTowers.keys())) {
                                        if (key !== towerId) {
                                            let value = this.placedTowers.get(key);
                                            if (value.name !== "Cow Tower" && !value.receivedAttackSpeedAura && this.checkAABBtoCircleCollision(value.button.collisionShape.getBoundingRect(), towerData.sprite.collisionShape.getBoundingCircle())) {
                                                if (value.name === "Eagle Tower") {
                                                    value.attackSpeed += 0.5;
                                                } else {
                                                    value.attackSpeed += 2;
                                                }
                                                value.receivedAttackSpeedAura = true;
                                                value.sprite.setAIActive(true, {type: "attackSpeed", attackSpeed: value.attackSpeed});
                                            }
                                        }   
                                    }
                                }
                            }
                            break;
                        case "penguin":
                            {
                                if (!towerData.hasStrongSlow) {
                                    purchaseCost = towerData.upgrade2Cost;
                                    towerData.hasStrongSlow = true;
                                    this.selectedTowerUpgrade2Btn.setText(towerData.upgrade2 + "\nMaxed Out");
                                    this.selectedTowerUpgrade2Btn.sizeAssigned = false;
                                    towerData.sprite.setAIActive(true, {type: "hasStrongSlow", hasStrongSlow: towerData.hasStrongSlow});
                                    purchased = true;
                                }
                            }
                            break;
                        case "eagle":
                            {
                                if (!towerData.hasDamageAura) {
                                    purchaseCost = towerData.upgrade2Cost;
                                    towerData.hasDamageAura = true;
                                    this.selectedTowerUpgrade2Btn.setText(towerData.upgrade2 + "\nMaxed Out");
                                    this.selectedTowerUpgrade2Btn.sizeAssigned = false;
                                    towerData.sprite.setAIActive(true, {type: "hasDamageAura", hasDamageAura: towerData.hasDamageAura});
                                    purchased = true;
                                    for (let key of Array.from(this.placedTowers.keys())) {
                                        if (key !== towerId) {
                                            let value = this.placedTowers.get(key);
                                            if (!value.receivedDamageAura && this.checkAABBtoCircleCollision(value.button.collisionShape.getBoundingRect(), towerData.sprite.collisionShape.getBoundingCircle())) {
                                                if (value.name === "Cow Tower") {
                                                    value.damage += 0.2;
                                                } else {
                                                    value.damage += 2;
                                                }
                                                value.receivedDamageAura = true;
                                                value.sprite.setAIActive(true, {type: "damage", damage: value.damage});
                                            }
                                        }   
                                    }
                                }
                            }
                            break;
                        case "elephant": 
                            {   
                                if (towerData.damageUpgradesRemaining !== 0) {
                                    purchaseCost = towerData.upgrade2Cost;
                                    towerData.damageUpgradesRemaining--;
                                    towerData.upgrade2Cost += 50;
                                    if (towerData.damageUpgradesRemaining === 0) {
                                        this.selectedTowerUpgrade2Btn.setText(towerData.upgrade2 + "\nMaxed Out");
                                        this.selectedTowerUpgrade2Btn.sizeAssigned = false;
                                    } else {
                                        this.selectedTowerUpgrade2Btn.setText(towerData.upgrade2 + "\nCost: " + towerData.upgrade2Cost);
                                    }
                                    towerData.damage += 1;
                                    this.selectedTowerDamageLabel.text = "Damage: " + (Number(towerData.damage).toFixed(2));
                                    towerData.sprite.setAIActive(true, {type: "damage", damage: towerData.damage});
                                    purchased = true;
                                }
                            }
                            break;
                        case "spider":
                            {
                                if (!towerData.canAttack){
                                    purchaseCost = towerData.upgrade2Cost;
                                    towerData.canAttack = true;
                                    this.selectedTowerUpgrade2Btn.setText(towerData.upgrade2 + "\nMaxed Out");
                                    this.selectedTowerUpgrade2Btn.sizeAssigned = false;
                                    towerData.sprite.setAIActive(true, {type: "canAttack", canAttack: towerData.canAttack});
                                    purchased = true;
                                }
                            }
                            break;
                    }
                    if (purchased) {
                        this.incMoney(-purchaseCost);
                        towerData.totalValue += purchaseCost;
                        this.selectedTowerSellBtn.text = "Sell: " + (towerData.totalValue * 0.75);
                    }
                }
            }
        }
    }

    protected incHealth(amt: number): void {
        if (this.healthCount > 0 && !Help.infHealth) {
            this.healthCount += amt;
            this.healthCountLabel.text = this.healthCount.toString();
            if (this.healthCount === 0) {
                this.waveInProgress = false;
                this.levelSpeedBtn.visible = false;
                this.victoryLabel.visible = true;
                this.victoryLabel.text = "Defeat";
                this.startWaveBtn.visible = false;
                this.emitter.fireEvent(AR_Events.WAVE_START_END, {isWaveInProgress: false});
                setTimeout(() => {
                        this.sceneManager.changeToScene(LevelSelection, {}, {});
                }, 3000);
            }
        }
    }

    protected incMoney(amt: number): void {
        if (!Help.infMoney) {
            this.moneyCount += amt;
            this.moneyCountLabel.text = this.moneyCount.toString();
        }
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
        if(this.spawnTimer.isStopped()){
            this.spawnTimer.start();
            let enemySprite;
            let enemyHealth;
            let enemyDefense;
            let speed;
            if(this.currentWaveData.enemies[0] === "farmer"){
                enemySprite = this.add.animatedSprite("farmer", "primary");
                enemySprite.scale.set(4, 4);
                enemySprite.addPhysics(new AABB(Vec2.ZERO, new Vec2(20, 24)));
                enemyHealth = 35;
                enemyDefense = 0;
                speed = 100;
            }
            if(this.currentWaveData.enemies[0] === "soldier"){
                enemySprite = this.add.animatedSprite("soldier", "primary");
                enemySprite.scale.set(4, 4);
                enemySprite.addPhysics(new AABB(Vec2.ZERO, new Vec2(30, 35)));
                enemyHealth = 75;
                enemyDefense = 0.25;
                speed = 75;
            }
            if(this.currentWaveData.enemies[0] === "robot_dog"){
                enemySprite = this.add.animatedSprite("robot_dog", "primary");
                enemySprite.scale.set(2, 2);
                enemySprite.addPhysics(new AABB(Vec2.ZERO, new Vec2(24, 24)));
                enemyHealth = 35;
                enemyDefense = 0.4;
                speed = 130;
            }
            if(this.currentWaveData.enemies[0] === "drone"){
                enemySprite = this.add.animatedSprite("drone", "primary");
                enemySprite.scale.set(2, 2);
                enemySprite.addPhysics(new AABB(Vec2.ZERO, new Vec2(18, 18)));
                enemyHealth = 40;
                enemyDefense = 0.3;
                speed = 125;
            }
            if(this.currentWaveData.enemies[0] === "superSoldier"){
                enemySprite = this.add.animatedSprite("superSoldier", "primary");
                enemySprite.scale.set(3.5, 3.5);
                enemySprite.addPhysics(new AABB(Vec2.ZERO, new Vec2(20, 24)));
                enemyHealth = 40;
                enemyDefense = 0.2;
                speed = 100;
            }
            if(this.currentWaveData.enemies[0] === "president"){
                enemySprite = this.add.animatedSprite("president", "primary");
                enemySprite.scale.set(4, 4);
                enemySprite.addPhysics(new AABB(Vec2.ZERO, new Vec2(20, 24)));
                enemyHealth = 100;
                enemyDefense = 0.3;
                speed = 80;
            }
            enemySprite.position.set(this.levelStart.x, this.levelStart.y);
            enemySprite.animation.play("WALK");
            let path = this.currentWaveData.route.map((index: number) => this.graph.getNodePosition(index));
            enemySprite.addAI(EnemyAI, {navigation: path, speed: speed, levelSpeed: this.levelSpeed});        
            enemySprite.setGroup("enemy");

            let enemyWidth = enemySprite.sizeWithZoom.x * 2;
            let healthBarWidth = enemyWidth - (enemyWidth * 0.2);
            let healthBar = <Rect>this.add.graphic(GraphicType.RECT, "UI", {position: new Vec2(enemySprite.position.x, enemySprite.position.y - 50), size: new Vec2(healthBarWidth, 10)});
            healthBar.borderColor = Color.BLACK;
            healthBar.borderWidth = 3;
            healthBar.lineJoin = 'round';
            healthBar.color = Color.RED;

            this.enemies.set(enemySprite, {health: enemyHealth, maxHP: enemyHealth, defense: enemyDefense, healthBar: healthBar, lastExplosion: -1});
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

    protected addLevelStart(start: Vec2) {
        this.levelStart = start;
    }

    protected setSpawnArrow(position: Vec2, direction: Vec2) {
        this.spawnArrowPosition = position;
        this.spawnArrowDirection = direction;
    }

    /**
     * Initializes the level end area
     */
    protected addLevelEnd(startingTile: Vec2, size: Vec2): void {
        this.levelEndArea = <Rect>this.add.graphic(GraphicType.RECT, "primary", {position: startingTile, size: size});
        this.levelEndArea.addPhysics(undefined, undefined, false, true);
        this.levelEndArea.color = Color.TRANSPARENT;
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
					if(area > 250){
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
                        try {
                            let node = this.sceneGraph.getNode(event.data.get("node"));
                            this.enemies.get(node).healthBar.destroy();
                            this.enemies.delete(node);
                            node.destroy();
                        } catch {}
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
                        if (!this.enemies.has(enemy)) {
                            break;
                        }
                        if (event.data.get("data").target !== undefined && event.data.get("data").target !== enemy.id) {
                            break;
                        }
                        if (event.data.get("data").explosionId !== undefined && event.data.get("data").explosionId === this.enemies.get(enemy).lastExplosion) {
                            break;
                        } else {
                            this.enemies.get(enemy).lastExplosion = event.data.get("data").explosionId;
                        }
                        if (projectile.group !== -1) {
                            projectile.position.set(-1, -1);
                        }
                        let defense = this.enemies.get(enemy).defense;
                        if (event.data.get("data").electricAttack !== undefined){
                            this.emitter.fireEvent(GameEventType.PLAY_SOUND, {key: "lightingStrike", loop: false});
                            this.enemies.get(enemy).defense = defense / 3;
                        }
                        if (event.data.get("data").poison !== undefined){
                            this.enemies.get(enemy).defense = defense / 2;
                        }
                        let newHealth;
                        if (Help.oneShot) {
                            newHealth = 0;
                        } else {
                            newHealth = this.enemies.get(enemy).health - (event.data.get("data").damage * (1 - defense));
                        }
                        let healthBar = <Rect>this.enemies.get(enemy).healthBar;
                        let enemyWidth = enemy.sizeWithZoom.x * 2;
                        let healthBarWidth = enemyWidth - (enemyWidth * 0.2);
                        healthBar.fillWidth = (newHealth / this.enemies.get(enemy).maxHP) * healthBarWidth; //100 px is a max hp bar
                        let id = enemy.id;
                        if (event.data.get("data").slowAmount !== undefined) {
                            this.emitter.fireEvent(AR_Events.ENEMY_SLOWED, {id: id, slowAmount: event.data.get("data").slowAmount});
                        }

                        if (newHealth <= 0) {
                            this.emitter.fireEvent(AR_Events.ENEMY_DIED, {id: enemy.id});
                            // this.emitter.fireEvent(GameEventType.PLAY_SOUND, {key: "enemyDeath", loop: false});
                            healthBar.destroy();
                            this.enemies.delete(enemy);
                            if ((<AnimatedSprite>enemy).imageId === "drone") {
                                enemy.tweens.add("shrink", {
                                    startDelay: 0,
                                    duration: 1000,
                                    effects: [
                                        {
                                            property: TweenableProperties.scaleX,
                                            resetOnComplete: false,
                                            start: 2,
                                            end: 0.8,
                                            ease: EaseFunctionType.IN_OUT_SINE
                                        },
                                        {
                                            property: TweenableProperties.scaleY,
                                            resetOnComplete: false,
                                            start: 2,
                                            end: 0.8,
                                            ease: EaseFunctionType.IN_OUT_SINE
                                        },
                                    ],
                                    reverseOnComplete: false
                                });
                                (<AnimatedSprite>enemy).animation.stop();
                                enemy.tweens.play("shrink");
                                setTimeout(() => {
                                    (<AnimatedSprite>enemy).scale.set(4, 4);
                                    (<AnimatedSprite>enemy).animation.play("Explode");
                                }, 1000);
                                setTimeout(() => {
                                    enemy.destroy();
                                }, 2000);
                            } else if ((<AnimatedSprite>enemy).imageId === "president") {
                                (<AnimatedSprite>enemy).freeze();
                                (<AnimatedSprite>enemy).animation.stop();
                                (<AnimatedSprite>enemy).animation.play("Dying");
                                (<AnimatedSprite>enemy).animation.queue("Dead");
                                setTimeout(() => {
                                    enemy.destroy();
                                }, 1000);
                            } else if ((<AnimatedSprite>enemy).imageId === "soldier") {
                                (<AnimatedSprite>enemy).freeze();
                                (<AnimatedSprite>enemy).animation.stop();
                                (<AnimatedSprite>enemy).animation.play("Dying");
                                (<AnimatedSprite>enemy).animation.queue("Dead");
                                setTimeout(() => {
                                    enemy.destroy();
                                }, 800);
                            } else if ((<AnimatedSprite>enemy).imageId === "robot_dog") {
                                (<AnimatedSprite>enemy).freeze();
                                (<AnimatedSprite>enemy).animation.stop();
                                (<AnimatedSprite>enemy).animation.play("Dying");
                                (<AnimatedSprite>enemy).animation.queue("Dead");
                                setTimeout(() => {
                                    enemy.destroy();
                                }, 1500);
                            } else if ((<AnimatedSprite>enemy).imageId === "superSoldier") {
                                (<AnimatedSprite>enemy).freeze();
                                (<AnimatedSprite>enemy).animation.stop();
                                (<AnimatedSprite>enemy).animation.play("Dying");
                                (<AnimatedSprite>enemy).animation.queue("Dead");
                                setTimeout(() => {
                                    enemy.destroy();
                                }, 800);
                            } else if ((<AnimatedSprite>enemy).imageId === "farmer") {
                                (<AnimatedSprite>enemy).freeze();
                                (<AnimatedSprite>enemy).animation.stop();
                                (<AnimatedSprite>enemy).animation.play("Dying");
                                (<AnimatedSprite>enemy).animation.queue("Dead");
                                setTimeout(() => {
                                    enemy.destroy();
                                }, 800);
                            } else {
                                enemy.destroy();
                            }
                        } else {
                            this.enemies.get(enemy).health = newHealth;
                        }
                    }
                    break;
            }
        }

        if(Input.isKeyJustPressed("escape")){
            this.isGamePaused = !this.isGamePaused;
            if (this.isGamePaused) {
                this.pauseLayer.enable();
                this.UILayer.disable();
            } else {
                this.UILayer.enable();
                this.pauseLayer.disable();
            }
            if (this.spawningEnemies) {
                this.isGamePaused ? this.spawnTimer.pause() : this.spawnTimer.resume();
            }
            this.emitter.fireEvent(AR_Events.PAUSE_RESUME_GAME, {pausing: this.isGamePaused});
        }

        if (this.isTowerSelectedFromShop && !this.isGamePaused) {
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
                    let newTower = this.add.animatedSprite(this.selectedTowerShopSprite.imageId + "Tower", "primary");
                    newTower.position.set(this.selectedTowerShopSprite.position.x, this.selectedTowerShopSprite.position.y);

                    let newTowerBtn = <Button>this.add.uiElement(UIElementType.BUTTON, "primary", {position: newTower.position, text: ""});
                    newTowerBtn.backgroundColor = Color.TRANSPARENT;
                    newTowerBtn.borderColor = Color.TRANSPARENT;
                    newTowerBtn.borderRadius = 0;
                    newTowerBtn.fontSize = 0;

                    let defaultTowerData = this.defaultTowerValues.get(this.selectedTowerShopSprite.imageId + "Tower");
                    newTower.addPhysics(new CircleShape(Vec2.ZERO, defaultTowerData.range), undefined, true, false);
                    switch (this.selectedTowerShopSprite.imageId) {
                        case "chicken":
                            {
                                newTower.scale.set(4, 4);
                                newTower.addAI(ChickenAI, {damage: defaultTowerData.damage, attackSpeed: defaultTowerData.attackSpeed, range: defaultTowerData.range});
                            }
                            break;
                        
                        case "cow":
                            {
                                newTower.scale.set(3, 3);
                                newTower.addAI(CowAI, {damage: defaultTowerData.damage, attackSpeed: defaultTowerData.attackSpeed, range: defaultTowerData.range, hasAura: defaultTowerData.hasAura});
                            } 
                            break;  
                        case "penguin":
                            {   
                                newTower.scale.set(4, 4);
                                newTower.addAI(PenguinAI, {damage: defaultTowerData.damage, attackSpeed: defaultTowerData.attackSpeed, range: defaultTowerData.range, hasStrongSlow: defaultTowerData.hasStrongSlow});
                            }   
                            break;
                        case "eagle":
                            {   
                                newTower.scale.set(3.5, 3.5);
                                newTower.addAI(EagleAI, {damage: defaultTowerData.damage, attackSpeed: defaultTowerData.attackSpeed, range: defaultTowerData.range, hasDamageAura: defaultTowerData.hasDamageAura});
                            }      
                            break;
                        case "elephant":
                            {   
                                newTower.scale.set(5.5, 5.5);
                                newTower.addAI(ElephantAI, {damage: defaultTowerData.damage, attackSpeed: defaultTowerData.attackSpeed, range: defaultTowerData.range, accuracy: defaultTowerData.accuracy});
                            }      
                            break;
                        case "spider":
                            {
                                newTower.scale.set(2.5, 2.5);
                                newTower.addAI(SpiderAI, {damage: defaultTowerData.damage, attackSpeed: defaultTowerData.attackSpeed, range: defaultTowerData.range, canAttack: defaultTowerData.canAttack, slowUpgrade: defaultTowerData.slowUpgrade});
                            }
                    }
                    newTowerBtn.setPadding(newTower.sizeWithZoom);
                    newTowerBtn.addPhysics(new AABB(Vec2.ZERO, newTower.sizeWithZoom), undefined, true, true);
                    
                    this.selectedTowerShopSprite.destroy();
                    this.selectedTowerShopSprite = null;
                    this.selectedTowerRange.destroy();
                    this.selectedTowerRange = null;
                   
                    let newTowerData = Object.create(null);
                    newTowerData = Object.assign(newTowerData, defaultTowerData);
                    newTowerData.sprite = newTower;
                    newTowerData.button = newTowerBtn;
                    newTowerData.totalValue = defaultTowerData.cost;
                    if (newTowerData.sprite.imageId === "elephant") {
                        newTowerData.target = new Vec2(-100, -100);
                    }
                    let towerId = this.placedTowers.size;
                    this.placedTowers.set(towerId, newTowerData);
                    this.incMoney(-defaultTowerData.cost);
                    newTowerBtn.onClick = () => {
                        if (Input.getMousePressButton() == BUTTON.LEFTCLICK && !this.isTowerSelectedFromShop) {
                            if (this.isPlacedTowerSelected) {
                                this.selectedTowerRange.destroy();
                                this.selectedTowerRange = null;
                            }
                            this.isPlacedTowerSelected = true;
                            this.selectedTowerId = towerId;
                            this.displayTowerInfoFromId(towerId);
                        }
                    }

                    this.deselectTowerShopBtn.visible = false;
                    this.isTowerSelectedFromShop = false;
                    this.hideTowerInfoFromShop();
                } else {
                    this.selectedTowerShopSprite.moving = true;
                    this.selectedTowerShopSprite.position.set(Input.getMousePosition().x, Input.getMousePosition().y);
                    this.selectedTowerRange.position.set(Input.getMousePosition().x, Input.getMousePosition().y);
                }
            }
        } else if (this.isPlacedTowerSelected && Input.getMousePosition().x < 900 && !this.isGamePaused) {
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
                    this.selectedTowerTarget.visible = false;
                }
            }
        }

        if (!this.waveInProgress) {
            for (let firstTower of Array.from(this.placedTowers.values())) {
                if (firstTower.name === "Cow Tower" && firstTower.hasAura) {
                    for (let secondTower of Array.from(this.placedTowers.values())) {
                        if (secondTower.name !== "Cow Tower" && !secondTower.receivedAttackSpeedAura && this.checkAABBtoCircleCollision(secondTower.button.collisionShape.getBoundingRect(), firstTower.sprite.collisionShape.getBoundingCircle())) {
                            if (secondTower.name === "Eagle Tower") {
                                secondTower.attackSpeed += 0.5;
                            } else {
                                secondTower.attackSpeed += 2;
                            }
                            secondTower.receivedAttackSpeedAura = true;
                            secondTower.sprite.setAIActive(true, {type: "attackSpeed", attackSpeed: secondTower.attackSpeed});
                        }
                    }
                } else if (firstTower.name === "Eagle Tower" && firstTower.hasDamageAura) {
                    for (let secondTower of Array.from(this.placedTowers.values())) {
                        if (secondTower.sprite.id !== firstTower.sprite.id && !secondTower.receivedDamageAura && this.checkAABBtoCircleCollision(secondTower.button.collisionShape.getBoundingRect(), firstTower.sprite.collisionShape.getBoundingCircle())) {
                            if (secondTower.name === "Cow Tower") {
                                secondTower.damage += 0.2;
                            } else {
                                secondTower.damage += 2;
                            }
                            secondTower.receivedDamageAura = true;
                            secondTower.sprite.setAIActive(true, {type: "damage", damage: secondTower.damage});
                        }
                    }
                }   
            }
        }

        if(this.spawningEnemies && !this.isGamePaused){
            this.spawnEnemy();
        }

        if (this.waveInProgress) {
            if (this.enemies.size === 0 && !this.spawningEnemies && this.healthCount > 0) {
                this.waveInProgress = false;
                if (this.currentWave === this.totalWaves) {
                    this.victoryLabel.visible = true;
                    this.victoryLabel.text = "Victory!";
                    this.levelSpeedBtn.visible = false;
                    this.startWaveBtn.visible = false;
                    this.emitter.fireEvent(AR_Events.WAVE_START_END, {isWaveInProgress: false});
                    if (this.currentLevel === LevelSelection.levelsUnlocked) {
                        LevelSelection.levelsUnlocked++;
                    }
                    setTimeout(() => {
                        if (this.currentLevel === 6) {
                            this.sceneManager.changeToScene(EndingStory, {}, {});
                        } else {
                            this.sceneManager.changeToScene(LevelSelection, {}, {});
                        }
                    }, 3000);
                } else {
                    this.spawnArrow.visible = true;
                    this.startWaveBtn.visible = true;
                    this.victoryLabel.visible = true;
                    this.levelSpeedBtn.visible = false;
                    this.victoryLabel.text = "Wave Complete!";
                    this.emitter.fireEvent(AR_Events.LEVEL_SPEED_CHANGE, {levelSpeed: 1});
                    setTimeout(() => {
                        this.victoryLabel.visible = false;
                    }, 3000);
                    this.emitter.fireEvent(AR_Events.WAVE_START_END, {isWaveInProgress: false});
                    this.incMoney(150);
                    this.currentWave++;
                    this.waveCountLabel.text = "Wave " + this.currentWave + "/" + this.totalWaves;
                }
            }

            if (this.isPlacedTowerSelected && Input.getMousePosition().x < 900 && !this.isGamePaused) {
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
                        this.selectedTowerTarget.visible = false;
                    }
                }
            }
        }

        if (this.isPlacedTowerSelected && this.placedTowers.get(this.selectedTowerId).sprite.imageId === "elephant" && Input.isKeyPressed("x") && !this.isGamePaused) {
            let newPosition = Input.getMousePosition();
            this.placedTowers.get(this.selectedTowerId).target = newPosition;
            this.selectedTowerTarget.position.set(newPosition.x, newPosition.y);
            this.emitter.fireEvent(AR_Events.NEW_TARGET_LOCATION, {id: this.placedTowers.get(this.selectedTowerId).sprite.id, target: Input.getMousePosition()});
        }

        if (this.enemies !== undefined && this.enemies.size !== 0) {
            for (let enemySprite of Array.from(this.enemies.keys())) {
                let healthBar = <Rect>this.enemies.get(enemySprite).healthBar;
                healthBar.position.set(enemySprite.position.x, enemySprite.position.y - 50);
            }

            for (let towerValue of Array.from(this.placedTowers.values())) {
                for (let enemySprite of Array.from(this.enemies.keys())) {
                    if (this.checkAABBtoCircleCollision(enemySprite.collisionShape.getBoundingRect(), towerValue.sprite.collisionShape.getBoundingCircle())) {
                        this.emitter.fireEvent(AR_Events.ENEMY_ENTERED_TOWER_RANGE, {turret: (<GameNode>towerValue.sprite).id, target: (<GameNode>enemySprite).id,})
                        break;
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

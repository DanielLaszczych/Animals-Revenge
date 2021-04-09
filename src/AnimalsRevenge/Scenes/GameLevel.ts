import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import Input, { BUTTON } from "../../Wolfie2D/Input/Input";
import Game from "../../Wolfie2D/Loop/Game";
import Circle from "../../Wolfie2D/Nodes/Graphics/Circle";
import { GraphicType } from "../../Wolfie2D/Nodes/Graphics/GraphicTypes";
import Rect from "../../Wolfie2D/Nodes/Graphics/Rect";
import Sprite from "../../Wolfie2D/Nodes/Sprites/Sprite";
import Button from "../../Wolfie2D/Nodes/UIElements/Button";
import Label from "../../Wolfie2D/Nodes/UIElements/Label";
import { UIElementType } from "../../Wolfie2D/Nodes/UIElements/UIElementTypes";
import Scene from "../../Wolfie2D/Scene/Scene"
import Color from "../../Wolfie2D/Utils/Color";

export default class GameLevel extends Scene {

    //Labels for the UI
    protected healthCount: number = 0;
    protected healthCountLabel: Label;
    protected moneyCount: number = 0;
    protected moneyCountLabel: Label;
    protected totalWaves: number = 0;
    protected currentWave: number = 0;
    protected waveCountLabel: Label;

    protected turretsUnlocked: number = 0;

    protected size: Vec2;
    protected selectedTower: Sprite = null;
    protected selectedTowerRange: Circle = null;

    initScene(init: Record<string, any>) {
        this.healthCount = init.startHealth;
        this.moneyCount = init.startMoney;
        this.currentWave = 1;
        this.totalWaves = init.totalWaves;
        this.turretsUnlocked = init.turretsUnlocked;
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
        this.receiver.subscribe([]);
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

        if (this.turretsUnlocked >= 1) {
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
                    
                    this.selectedTowerRange = <Circle>this.add.graphic(GraphicType.CIRCLE, "UI", {position: Input.getMousePosition(), radius: new Number(350)});
                    this.selectedTowerRange.color = Color.GREEN;
                    this.selectedTowerRange.alpha = 0.3;
                    this.selectedTowerRange.borderWidth = 3;
                }
            }
        }

        if (this.turretsUnlocked >= 2) {
            let cowTowerBtn = <Button>this.add.uiElement(UIElementType.BUTTON, "UI", {position: new Vec2(1125, 125), text: "2"});
            cowTowerBtn.backgroundColor = Color.TRANSPARENT;
            cowTowerBtn.textColor = Color.BLACK;
            cowTowerBtn.borderColor = Color.BLACK;
            cowTowerBtn.borderRadius = 0;
            cowTowerBtn.setPadding(new Vec2(50, 25));
        }

        if (this.turretsUnlocked >= 3) {
            let spiderTowerBtn = <Button>this.add.uiElement(UIElementType.BUTTON, "UI", {position: new Vec2(975, 250), text: "3"});
            spiderTowerBtn.backgroundColor = Color.TRANSPARENT;
            spiderTowerBtn.textColor = Color.BLACK;
            spiderTowerBtn.borderColor = Color.BLACK;
            spiderTowerBtn.borderRadius = 0;
            spiderTowerBtn.setPadding(new Vec2(50, 25));
        }

        if (this.turretsUnlocked >= 4) {
            let eagleTowerBtn = <Button>this.add.uiElement(UIElementType.BUTTON, "UI", {position: new Vec2(1125, 250), text: "4"});
            eagleTowerBtn.backgroundColor = Color.TRANSPARENT;
            eagleTowerBtn.textColor = Color.BLACK;
            eagleTowerBtn.borderColor = Color.BLACK;
            eagleTowerBtn.borderRadius = 0;
            eagleTowerBtn.setPadding(new Vec2(50, 25));
        }

        if (this.turretsUnlocked >= 5) {
            let elephantTowerBtn = <Button>this.add.uiElement(UIElementType.BUTTON, "UI", {position: new Vec2(975, 375), text: "5"});
            elephantTowerBtn.backgroundColor = Color.TRANSPARENT;
            elephantTowerBtn.textColor = Color.BLACK;
            elephantTowerBtn.borderColor = Color.BLACK;
            elephantTowerBtn.borderRadius = 0;
            elephantTowerBtn.setPadding(new Vec2(50, 25));
        }

        if (this.turretsUnlocked >= 6) {
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

    updateScene(deltaT: number): void {
        if (this.selectedTower !== null) {
            this.selectedTower.position.set(Input.getMousePosition().x, Input.getMousePosition().y);
        }

        if (this.selectedTowerRange !== null) {
            this.selectedTowerRange.position.set(Input.getMousePosition().x, Input.getMousePosition().y);
        }
    }
}
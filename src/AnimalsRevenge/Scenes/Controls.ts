import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import Input, { BUTTON } from "../../Wolfie2D/Input/Input";
import { GraphicType } from "../../Wolfie2D/Nodes/Graphics/GraphicTypes";
import Line from "../../Wolfie2D/Nodes/Graphics/Line";
import Button from "../../Wolfie2D/Nodes/UIElements/Button";
import Label from "../../Wolfie2D/Nodes/UIElements/Label";
import { UIElementType } from "../../Wolfie2D/Nodes/UIElements/UIElementTypes";
import Scene from "../../Wolfie2D/Scene/Scene";
import Color from "../../Wolfie2D/Utils/Color";
import MainMenu from "./MainMenu";

export default class Controls extends Scene {
    
    loadScene(): void {
        this.load.image("backgroundImage", "assets/images/Background_Lighter.png");
    }

    startScene(): void {        
        let backgroundLayer = this.addUILayer("background");
        backgroundLayer.setDepth(0);
        let controlsLayer = this.addUILayer("controls");
        controlsLayer.setDepth(1);

        let size = this.viewport.getHalfSize();
        this.viewport.setFocus(size);

        this.viewport.setZoomLevel(1);

        let backgroundImage = this.add.sprite("backgroundImage", "background");
        backgroundImage.position.set(size.x, size.y);

        let backBtn = <Button>this.add.uiElement(UIElementType.BUTTON, "controls", {position: new Vec2(100, 50), text: "Back"});
        backBtn.backgroundColor = Color.TRANSPARENT;
        backBtn.textColor = Color.BLACK;
        backBtn.borderColor = Color.BLACK;
        backBtn.borderRadius = 0;
        backBtn.borderWidth = 3;
        backBtn.setPadding(new Vec2(50, 10));
        backBtn.font = "PixelSimple";

        let controlsLabel = <Label>this.add.uiElement(UIElementType.LABEL, "controls", {position: new Vec2(size.x, size.y - 300), text: "Controls"});
        controlsLabel.textColor = Color.BLACK;
        controlsLabel.font = "PixelSimple";
        controlsLabel.fontSize = 60;

        let line = <Line>this.add.graphic(GraphicType.LINE, "controls", {start: new Vec2(size.x - 150, size.y - 275), end: new Vec2(size.x + 150, size.y - 275)});
        line.color = Color.BLACK;
        line.thickness = 5;

        let objectiveLabel = <Label>this.add.uiElement(UIElementType.LABEL, "controls", {position: new Vec2(size.x, size.y - 200), text: "Objective: Build towers to defend against waves of enemies"});
        objectiveLabel.font = "PixelSimple";
        objectiveLabel.textColor = Color.BLACK;
        objectiveLabel.fontSize = 35;

        let dialogueText = "Left Click to progress through dialogue";
        let dialogue = <Label>this.add.uiElement(UIElementType.LABEL, "controls", {position: new Vec2(size.x, size.y - 130), text: dialogueText});

        dialogue.font = "PixelSimple";
        dialogue.textColor = Color.BLACK;
        dialogue.fontSize = 35;

        let selectTowerText1 = "Left Click to select a tower in the shop or a tower that\nis already placed";
        let selectTower1 = <Label>this.add.uiElement(UIElementType.LABEL, "controls", {position: new Vec2(size.x, size.y - 60), text: selectTowerText1});

        selectTower1.font = "PixelSimple";
        selectTower1.textColor = Color.BLACK;
        selectTower1.fontSize = 35;

        let purchaseTowerText1 = "Left Click on a free space to place and purchase the tower\nyou selected from the shop";
        let purchaseTower1 = <Label>this.add.uiElement(UIElementType.LABEL, "controls", {position: new Vec2(size.x, size.y + 30), text: purchaseTowerText1});
        
        purchaseTower1.font = "PixelSimple";
        purchaseTower1.textColor = Color.BLACK;
        purchaseTower1.fontSize = 35;

        let upgradeTowerText1 = "Left Click on an upgrade to purchase it and upgrade the\nselected tower";
        let upgradeTower1 = <Label>this.add.uiElement(UIElementType.LABEL, "controls", {position: new Vec2(size.x, size.y + 120), text: upgradeTowerText1});
        
        upgradeTower1.font = "PixelSimple";
        upgradeTower1.textColor = Color.BLACK;
        upgradeTower1.fontSize = 35;


        let sellTowerText1 = "Left Click on the sell button to sell a selected tower";
        let sellTower1 = <Label>this.add.uiElement(UIElementType.LABEL, "controls", {position: new Vec2(size.x, size.y + 210), text: sellTowerText1});
        
        sellTower1.font = "PixelSimple";
        sellTower1.textColor = Color.BLACK;
        sellTower1.fontSize = 35;

        let pauseGameText = "Press ESC to pause/resume the game. Left click the speed\nbutton to speed the game up and right click to slow the game down";
        let pauseGame = <Label>this.add.uiElement(UIElementType.LABEL, "controls", {position: new Vec2(size.x, size.y + 280), text: pauseGameText});
        
        pauseGame.font = "PixelSimple";
        pauseGame.textColor = Color.BLACK;
        pauseGame.fontSize = 35;

        backBtn.onClick = () => {
            if (Input.getMousePressButton() == BUTTON.LEFTCLICK) {
                this.sceneManager.changeToScene(MainMenu, {}, {});
            }
        }

        backBtn.onEnter = () => {
            backBtn.textColor = Color.WHITE;
        }
        
        backBtn.onLeave = () => {
            backBtn.textColor = Color.BLACK;
        }
    }
}
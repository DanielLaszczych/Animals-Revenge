import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import Input, { BUTTON } from "../../Wolfie2D/Input/Input";
import { GraphicType } from "../../Wolfie2D/Nodes/Graphics/GraphicTypes";
import Line from "../../Wolfie2D/Nodes/Graphics/Line";
import Rect from "../../Wolfie2D/Nodes/Graphics/Rect";
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

        let objectiveLabel = <Label>this.add.uiElement(UIElementType.LABEL, "controls", {position: new Vec2(size.x, size.y - 200), text: "Objective: Build turrets to defend against waves of enemies"});
        objectiveLabel.font = "PixelSimple";
        objectiveLabel.textColor = Color.BLACK;
        objectiveLabel.fontSize = 35;

        let selectTowerText1 = "Left Click to select a tower in the shop";
        let selectTowerText2 = "or a tower that is already placed";
        let selectTower1 = <Label>this.add.uiElement(UIElementType.LABEL, "controls", {position: new Vec2(size.x, size.y - 130), text: selectTowerText1});
        let selectTower2 = <Label>this.add.uiElement(UIElementType.LABEL, "controls", {position: new Vec2(size.x, size.y - 90), text: selectTowerText2});
        
        selectTower1.font = "PixelSimple";
        selectTower1.textColor = Color.BLACK;
        selectTower1.fontSize = 40;

        selectTower2.font = "PixelSimple";
        selectTower2.textColor = Color.BLACK;
        selectTower2.fontSize = 40;

        let purchaseTowerText1 = "Left Click on a free space to place and purcahse";
        let purchaseTowerText2 = "the tower you selected from the shop";
        let purchaseTower1 = <Label>this.add.uiElement(UIElementType.LABEL, "controls", {position: new Vec2(size.x, size.y - 10), text: purchaseTowerText1});
        let purchaseTower2 = <Label>this.add.uiElement(UIElementType.LABEL, "controls", {position: new Vec2(size.x, size.y + 30), text: purchaseTowerText2});
        
        purchaseTower1.font = "PixelSimple";
        purchaseTower1.textColor = Color.BLACK;
        purchaseTower1.fontSize = 40;

        purchaseTower2.font = "PixelSimple";
        purchaseTower2.textColor = Color.BLACK;
        purchaseTower2.fontSize = 40;

        let upgradeTowerText1 = "Left Click on an upgrade to purchase it and upgrade";
        let upgradeTowerText2 = "the selected tower";
        let upgradeTower1 = <Label>this.add.uiElement(UIElementType.LABEL, "controls", {position: new Vec2(size.x, size.y + 110), text: upgradeTowerText1});
        let upgradeTower2 = <Label>this.add.uiElement(UIElementType.LABEL, "controls", {position: new Vec2(size.x, size.y + 150), text: upgradeTowerText2});
        
        upgradeTower1.font = "PixelSimple";
        upgradeTower1.textColor = Color.BLACK;
        upgradeTower1.fontSize = 40;

        upgradeTower2.font = "PixelSimple";
        upgradeTower2.textColor = Color.BLACK;
        upgradeTower2.fontSize = 40;

        let sellTowerText1 = "Left Click on the sell button or press DEL on a";
        let sellTowerText2 = "selected tower to sell it";
        let sellTower1 = <Label>this.add.uiElement(UIElementType.LABEL, "controls", {position: new Vec2(size.x, size.y + 230), text: sellTowerText1});
        let sellTower2 = <Label>this.add.uiElement(UIElementType.LABEL, "controls", {position: new Vec2(size.x, size.y + 270), text: sellTowerText2});
        
        sellTower1.font = "PixelSimple";
        sellTower1.textColor = Color.BLACK;
        sellTower1.fontSize = 40;

        sellTower2.font = "PixelSimple";
        sellTower2.textColor = Color.BLACK;
        sellTower2.fontSize = 40;

        let pauseGame = <Label>this.add.uiElement(UIElementType.LABEL, "controls", {position: new Vec2(size.x, size.y + 350), text: "Press ESC to pause/resume the game"});
        
        pauseGame.font = "PixelSimple";
        pauseGame.textColor = Color.BLACK;
        pauseGame.fontSize = 40;

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
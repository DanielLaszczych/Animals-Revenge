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
import Level1 from "./Level1";
import MainMenu from "./MainMenu";

export default class LevelSelection extends Scene {
    
    loadScene(): void {
        this.load.image("backgroundImage", "assets/images/Background_Lighter.png");
        this.load.image("level1Map", "assets/images/Level1_Map.png");
    }

    startScene(): void {
        let backgroundLayer = this.addUILayer("background");
        backgroundLayer.setDepth(0);
        let levelLayer = this.addUILayer("levelSelection");
        levelLayer.setDepth(1);


        let size = this.viewport.getHalfSize();
        this.viewport.setFocus(size);

        this.viewport.setZoomLevel(1);

        let background = this.add.sprite("backgroundImage", "background");
        background.position.set(size.x, size.y);

        let backBtn = <Button>this.add.uiElement(UIElementType.BUTTON, "levelSelection", {position: new Vec2(100, 50), text: "Back"});
        backBtn.backgroundColor = Color.TRANSPARENT;
        backBtn.textColor = Color.BLACK;
        backBtn.borderColor = Color.BLACK;
        backBtn.borderRadius = 0;
        backBtn.borderWidth = 3;
        backBtn.setPadding(new Vec2(50, 10));
        backBtn.font = "PixelSimple";

        let levelSelectionLabel = <Label>this.add.uiElement(UIElementType.LABEL, "levelSelection", {position: new Vec2(size.x, size.y - 300), text: "Level Selection"});
        levelSelectionLabel.textColor = Color.BLACK;
        levelSelectionLabel.font = "PixelSimple";
        levelSelectionLabel.fontSize = 60;

        let line = <Line>this.add.graphic(GraphicType.LINE, "levelSelection", {start: new Vec2(size.x - 230, size.y - 275), end: new Vec2(size.x + 230, size.y - 275)});
        line.color = Color.BLACK;
        line.thickness = 5;

        let level1Img = this.add.sprite("level1Map", "levelSelection");
        level1Img.position.set(size.x - 400, size.y - 50);
        level1Img.scale.set(0.3, 0.3);

        let level1Label = <Label>this.add.uiElement(UIElementType.LABEL, "levelSelection", {position: new Vec2(size.x - 400, (size.y - 50) - 130), text: "Level 1"});
        level1Label.textColor = Color.BLACK;
        level1Label.font = "PixelSimple";
        level1Label.fontSize = 40;

        let level1Btn = <Button>this.add.uiElement(UIElementType.BUTTON, "levelSelection", {position: level1Img.position, text: ""});
        level1Btn.backgroundColor = Color.TRANSPARENT;
        level1Btn.borderColor = Color.TRANSPARENT;
        level1Btn.borderRadius = 0;
        level1Btn.fontSize = 0;
        level1Btn.setPadding(level1Img.sizeWithZoom);

        let level2Img = this.add.sprite("level1Map", "levelSelection");
        level2Img.position.set(size.x, size.y - 50);
        level2Img.scale.set(0.3, 0.3);

        let level2Label = <Label>this.add.uiElement(UIElementType.LABEL, "levelSelection", {position: new Vec2(size.x, (size.y - 50) - 130), text: "Level 2"});
        level2Label.textColor = Color.BLACK;
        level2Label.font = "PixelSimple";
        level2Label.fontSize = 40;
        
        let level2Btn = <Button>this.add.uiElement(UIElementType.BUTTON, "levelSelection", {position: level2Img.position, text: "Locked"});
        level2Btn.backgroundColor = Color.BLACK;
        level2Btn.borderColor = Color.TRANSPARENT;
        level2Btn.borderRadius = 0;
        level2Btn.fontSize = 50;
        level2Btn.font = "PixelSimple";
        level2Btn.setPadding(level2Img.sizeWithZoom.sub(new Vec2(79, 25)));

        let level3Img = this.add.sprite("level1Map", "levelSelection");
        level3Img.position.set(size.x + 400, size.y - 50);
        level3Img.scale.set(0.3, 0.3);

        let level3Label = <Label>this.add.uiElement(UIElementType.LABEL, "levelSelection", {position: new Vec2(size.x + 400, (size.y - 50) - 130), text: "Level 3"});
        level3Label.textColor = Color.BLACK;
        level3Label.font = "PixelSimple";
        level3Label.fontSize = 40;

        let level3Btn = <Button>this.add.uiElement(UIElementType.BUTTON, "levelSelection", {position: level3Img.position, text: "Locked"});
        level3Btn.backgroundColor = Color.BLACK;
        level3Btn.borderColor = Color.TRANSPARENT;
        level3Btn.borderRadius = 0;
        level3Btn.fontSize = 50;
        level3Btn.font = "PixelSimple"
        level3Btn.setPadding(level3Img.sizeWithZoom.sub(new Vec2(79, 25)));

        let level4Img = this.add.sprite("level1Map", "levelSelection");
        level4Img.position.set(size.x - 400, size.y + 250);
        level4Img.scale.set(0.3, 0.3);

        let level4Label = <Label>this.add.uiElement(UIElementType.LABEL, "levelSelection", {position: new Vec2(size.x - 400, (size.y + 250) - 130), text: "Level 4"});
        level4Label.textColor = Color.BLACK;
        level4Label.font = "PixelSimple";
        level4Label.fontSize = 40;

        let level4Btn = <Button>this.add.uiElement(UIElementType.BUTTON, "levelSelection", {position: level4Img.position, text: "Locked"});
        level4Btn.backgroundColor = Color.BLACK;
        level4Btn.borderColor = Color.TRANSPARENT;
        level4Btn.borderRadius = 0;
        level4Btn.fontSize = 50;
        level4Btn.font = "PixelSimple"
        level4Btn.setPadding(level4Img.sizeWithZoom.sub(new Vec2(79, 25)));

        let level5Img = this.add.sprite("level1Map", "levelSelection");
        level5Img.position.set(size.x, size.y + 250);
        level5Img.scale.set(0.3, 0.3);

        let level5Label = <Label>this.add.uiElement(UIElementType.LABEL, "levelSelection", {position: new Vec2(size.x, (size.y + 250) - 130), text: "Level 5"});
        level5Label.textColor = Color.BLACK;
        level5Label.font = "PixelSimple";
        level5Label.fontSize = 40;

        let level5Btn = <Button>this.add.uiElement(UIElementType.BUTTON, "levelSelection", {position: level5Img.position, text: "Locked"});
        level5Btn.backgroundColor = Color.BLACK;
        level5Btn.borderColor = Color.TRANSPARENT;
        level5Btn.borderRadius = 0;
        level5Btn.fontSize = 50;
        level5Btn.font = "PixelSimple"
        level5Btn.setPadding(level5Img.sizeWithZoom.sub(new Vec2(79, 25)));

        let level6Img = this.add.sprite("level1Map", "levelSelection");
        level6Img.position.set(size.x + 400, size.y + 250);
        level6Img.scale.set(0.3, 0.3);

        let level6Label = <Label>this.add.uiElement(UIElementType.LABEL, "levelSelection", {position: new Vec2(size.x + 400, (size.y + 250) - 130), text: "Level 6"});
        level6Label.textColor = Color.BLACK;
        level6Label.font = "PixelSimple";
        level6Label.fontSize = 40;
        
        let level6Btn = <Button>this.add.uiElement(UIElementType.BUTTON, "levelSelection", {position: level6Img.position, text: "Locked"});
        level6Btn.backgroundColor = Color.BLACK;
        level6Btn.borderColor = Color.TRANSPARENT;
        level6Btn.borderRadius = 0;
        level6Btn.fontSize = 50;
        level6Btn.font = "PixelSimple"
        level6Btn.setPadding(level6Img.sizeWithZoom.sub(new Vec2(79, 25)));

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

        level1Btn.onClick = () => {
            if (Input.getMousePressButton() == BUTTON.LEFTCLICK) {
                
                let sceneOptions = {
                    physics: {
                        groupNames: ["enemy", "projectile"],
                        collisions:
                        [
                            [0, 0],
                            [0, 0]
                        ]
                    }
                }

                this.sceneManager.changeToScene(Level1, {startHealth: 10, startMoney: 1000, totalWaves: 10, towersUnlocked: 6}, sceneOptions);
            }
        }

        level2Btn.onClick = () => {
            if (Input.getMousePressButton() == BUTTON.LEFTCLICK) {
                // this.sceneManager.changeToScene(MainMenu, {}, {});
            }
        }

        level3Btn.onClick = () => {
            if (Input.getMousePressButton() == BUTTON.LEFTCLICK) {
                // this.sceneManager.changeToScene(MainMenu, {}, {});
            }
        }

        level4Btn.onClick = () => {
            if (Input.getMousePressButton() == BUTTON.LEFTCLICK) {
                // this.sceneManager.changeToScene(MainMenu, {}, {});
            }
        }

        level5Btn.onClick = () => {
            if (Input.getMousePressButton() == BUTTON.LEFTCLICK) {
                // this.sceneManager.changeToScene(MainMenu, {}, {});
            }
        }

        level6Btn.onClick = () => {
            if (Input.getMousePressButton() == BUTTON.LEFTCLICK) {
                // this.sceneManager.changeToScene(MainMenu, {}, {});
            }
        }
    }
}
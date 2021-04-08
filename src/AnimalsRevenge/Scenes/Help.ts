import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import { GraphicType } from "../../Wolfie2D/Nodes/Graphics/GraphicTypes";
import Line from "../../Wolfie2D/Nodes/Graphics/Line";
import Rect from "../../Wolfie2D/Nodes/Graphics/Rect";
import Button from "../../Wolfie2D/Nodes/UIElements/Button";
import Label, { HAlign, VAlign } from "../../Wolfie2D/Nodes/UIElements/Label";
import { UIElementType } from "../../Wolfie2D/Nodes/UIElements/UIElementTypes";
import Scene from "../../Wolfie2D/Scene/Scene";
import Color from "../../Wolfie2D/Utils/Color";
import MainMenu from "./MainMenu";
import SplashScreen from "./SplashScreen";

export default class Help extends Scene {
    
    loadScene(): void {

    }

    startScene(): void {
        let backgroundLayer = this.addUILayer("background");
        backgroundLayer.setDepth(0);
        let helpLayer = this.addUILayer("help");
        helpLayer.setDepth(1);

        let size = this.viewport.getHalfSize();
        this.viewport.setFocus(size);

        this.viewport.setZoomLevel(1);

        let background = <Rect>this.add.graphic(GraphicType.RECT, "background", {position: new Vec2(size.x, size.y), size: new Vec2(size.x * 2.0, size.y * 2)});
        background.color = new Color(211, 211, 211, 1); //light grey

        let backBtn = <Button>this.add.uiElement(UIElementType.BUTTON, "help", {position: new Vec2(100, 50), text: "Back"});
        backBtn.backgroundColor = Color.TRANSPARENT;
        backBtn.textColor = Color.BLACK;
        backBtn.borderColor = Color.BLACK;
        backBtn.borderRadius = 0;
        backBtn.borderWidth = 3;
        backBtn.setPadding(new Vec2(50, 10));
        backBtn.font = "PixelSimple";

        let helpLabel = <Label>this.add.uiElement(UIElementType.LABEL, "help", {position: new Vec2(size.x, size.y - 300), text: "Help"});
        helpLabel.textColor = Color.BLACK;
        helpLabel.font = "PixelSimple";
        helpLabel.fontSize = 60;

        let line = <Line>this.add.graphic(GraphicType.LINE, "help", {start: new Vec2(size.x - 75, size.y - 275), end: new Vec2(size.x + 75, size.y - 275)});
        line.color = Color.BLACK;
        line.thickness = 5;

        const aboutText1 = "This game was created by Daniel Xie, Daniel Laszczych, and";
        const aboutText2 = "Juliana Pham using the Wolfie2D game engine, a TypeScript";
        const aboutText3 = "game engine created by Joe Weaver and Richard McKenna.";

        let about1 = <Label>this.add.uiElement(UIElementType.LABEL, "help", {position: new Vec2(size.x, size.y - 210), text: aboutText1});
        let about2 = <Label>this.add.uiElement(UIElementType.LABEL, "help", {position: new Vec2(size.x, size.y - 170), text: aboutText2});
        let about3 = <Label>this.add.uiElement(UIElementType.LABEL, "help", {position: new Vec2(size.x, size.y - 130), text: aboutText3});

        about1.font = "PixelSimple";
        about1.textColor = Color.BLACK;
        about1.fontSize = 35;

        about2.font = "PixelSimple";
        about2.textColor = Color.BLACK;
        about2.fontSize = 35;

        about3.font = "PixelSimple";
        about3.textColor = Color.BLACK;
        about3.fontSize = 35;

        let cutSceneBtn = <Button>this.add.uiElement(UIElementType.BUTTON, "help", {position: new Vec2(size.x, size.y), text: "Reply Backstory Cut Scene"});
        cutSceneBtn.backgroundColor = Color.TRANSPARENT;
        cutSceneBtn.textColor = Color.BLACK;
        cutSceneBtn.borderColor = Color.BLACK;
        cutSceneBtn.borderRadius = 0;
        cutSceneBtn.borderWidth = 3;
        cutSceneBtn.setPadding(new Vec2(50, 10));
        cutSceneBtn.font = "PixelSimple";

        let infHealthBtn = <Button>this.add.uiElement(UIElementType.BUTTON, "help", {position: new Vec2(100, 600), text: ""});
        infHealthBtn.backgroundColor = Color.TRANSPARENT;
        infHealthBtn.borderColor = Color.BLACK;
        infHealthBtn.borderRadius = 0;
        infHealthBtn.borderWidth = 3;
        infHealthBtn.setPadding(new Vec2(25, 8));

        let infHealthLabel = <Button>this.add.uiElement(UIElementType.BUTTON, "help", {position: new Vec2(270, 600), text: "Infinite Health"});
        infHealthLabel.textColor = Color.BLACK;
        infHealthLabel.backgroundColor = Color.TRANSPARENT;
        infHealthLabel.borderColor = Color.TRANSPARENT;
        infHealthLabel.font = "PixelSimple";
        infHealthLabel.fontSize = 35;

        let infMoneyBtn = <Button>this.add.uiElement(UIElementType.BUTTON, "help", {position: new Vec2(480, 600), text: ""});
        infMoneyBtn.backgroundColor = Color.TRANSPARENT;
        infMoneyBtn.borderColor = Color.BLACK;
        infMoneyBtn.borderRadius = 0;
        infMoneyBtn.borderWidth = 3;
        infMoneyBtn.setPadding(new Vec2(25, 8));
        
        let infMoneyLabel = <Button>this.add.uiElement(UIElementType.BUTTON, "help", {position: new Vec2(650, 600), text: "Infinite Money"});
        infMoneyLabel.textColor = Color.BLACK;
        infMoneyLabel.backgroundColor = Color.TRANSPARENT;
        infMoneyLabel.borderColor = Color.TRANSPARENT;
        infMoneyLabel.font = "PixelSimple";
        infMoneyLabel.fontSize = 35;

        let allLevelsBtn = <Button>this.add.uiElement(UIElementType.BUTTON, "help", {position: new Vec2(860, 600), text: ""});
        allLevelsBtn.backgroundColor = Color.TRANSPARENT;
        allLevelsBtn.borderColor = Color.BLACK;
        allLevelsBtn.borderRadius = 0;
        allLevelsBtn.borderWidth = 3;
        allLevelsBtn.setPadding(new Vec2(25, 8));

        let allLevelLabel = <Button>this.add.uiElement(UIElementType.BUTTON, "help", {position: new Vec2(1045, 600), text: "Unlock all Levels"});
        allLevelLabel.textColor = Color.BLACK;
        allLevelLabel.backgroundColor = Color.TRANSPARENT;
        allLevelLabel.borderColor = Color.TRANSPARENT;
        allLevelLabel.font = "PixelSimple";
        allLevelLabel.fontSize = 35;

        let allTurretsBtn = <Button>this.add.uiElement(UIElementType.BUTTON, "help", {position: new Vec2(100, 700), text: ""});
        allTurretsBtn.backgroundColor = Color.TRANSPARENT;
        allTurretsBtn.borderColor = Color.BLACK;
        allTurretsBtn.borderRadius = 0;
        allTurretsBtn.borderWidth = 3;
        allTurretsBtn.setPadding(new Vec2(25, 8));

        let allTurretsLabel = <Button>this.add.uiElement(UIElementType.BUTTON, "help", {position: new Vec2(300, 700), text: "Unlock all Turrets"});
        allTurretsLabel.textColor = Color.BLACK;
        allTurretsLabel.backgroundColor = Color.TRANSPARENT;
        allTurretsLabel.borderColor = Color.TRANSPARENT;
        allTurretsLabel.font = "PixelSimple";
        allTurretsLabel.fontSize = 35;

        let oneShotBtn = <Button>this.add.uiElement(UIElementType.BUTTON, "help", {position: new Vec2(480, 700), text: ""});
        oneShotBtn.backgroundColor = Color.TRANSPARENT;
        oneShotBtn.borderColor = Color.BLACK;
        oneShotBtn.borderRadius = 0;
        oneShotBtn.borderWidth = 3;
        oneShotBtn.setPadding(new Vec2(25, 8));

        let oneShotLabel = <Button>this.add.uiElement(UIElementType.BUTTON, "help", {position: new Vec2(675, 700), text: "One shot enemies"});
        oneShotLabel.textColor = Color.BLACK;
        oneShotLabel.backgroundColor = Color.TRANSPARENT;
        oneShotLabel.borderColor = Color.TRANSPARENT;
        oneShotLabel.font = "PixelSimple";
        oneShotLabel.fontSize = 35;

        backBtn.onClick = () => {
            this.sceneManager.changeToScene(MainMenu, {}, {});
        }

        backBtn.onEnter = () => {
            backBtn.textColor = Color.RED;
        }
        
        backBtn.onLeave = () => {
            backBtn.textColor = Color.BLACK;
        }

        cutSceneBtn.onClick = () => {
            this.sceneManager.changeToScene(SplashScreen, {}, {});
        }

        cutSceneBtn.onEnter = () => {
            cutSceneBtn.textColor = Color.RED;
        }
        
        cutSceneBtn.onLeave = () => {
            cutSceneBtn.textColor = Color.BLACK;
        }

        infHealthBtn.onClick = () => {
            if (infHealthBtn.backgroundColor.toStringRGBA() === Color.TRANSPARENT.toStringRGBA()) {
                infHealthBtn.backgroundColor = Color.BLACK;
                infHealthBtn.borderColor = Color.WHITE;
            } else {
                infHealthBtn.backgroundColor = Color.TRANSPARENT;
                infHealthBtn.borderColor = Color.BLACK;
            }
        }

        infHealthBtn.calculateBackgroundColor = (): Color => {
            return infHealthBtn.backgroundColor;
        }

        infMoneyBtn.onClick = () => {
            if (infMoneyBtn.backgroundColor.toStringRGBA() === Color.TRANSPARENT.toStringRGBA()) {
                infMoneyBtn.backgroundColor = Color.BLACK;
                infMoneyBtn.borderColor = Color.WHITE;
            } else {
                infMoneyBtn.backgroundColor = Color.TRANSPARENT;
                infMoneyBtn.borderColor = Color.BLACK;
            }
        }

        infMoneyBtn.calculateBackgroundColor = (): Color => {
            return infMoneyBtn.backgroundColor;
        }

        allLevelsBtn.onClick = () => {
            if (allLevelsBtn.backgroundColor.toStringRGBA() === Color.TRANSPARENT.toStringRGBA()) {
                allLevelsBtn.backgroundColor = Color.BLACK;
                allLevelsBtn.borderColor = Color.WHITE;
            } else {
                allLevelsBtn.backgroundColor = Color.TRANSPARENT;
                allLevelsBtn.borderColor = Color.BLACK;
            }
        }

        allLevelsBtn.calculateBackgroundColor = (): Color => {
            return allLevelsBtn.backgroundColor;
        }

        allTurretsBtn.onClick = () => {
            if (allTurretsBtn.backgroundColor.toStringRGBA() === Color.TRANSPARENT.toStringRGBA()) {
                allTurretsBtn.backgroundColor = Color.BLACK;
                allTurretsBtn.borderColor = Color.WHITE;
            } else {
                allTurretsBtn.backgroundColor = Color.TRANSPARENT;
                allTurretsBtn.borderColor = Color.BLACK;
            }
        }

        allTurretsBtn.calculateBackgroundColor = (): Color => {
            return allTurretsBtn.backgroundColor;
        }

        oneShotBtn.onClick = () => {
            if (oneShotBtn.backgroundColor.toStringRGBA() === Color.TRANSPARENT.toStringRGBA()) {
                oneShotBtn.backgroundColor = Color.BLACK;
                oneShotBtn.borderColor = Color.WHITE;
            } else {
                oneShotBtn.backgroundColor = Color.TRANSPARENT;
                oneShotBtn.borderColor = Color.BLACK;
            }
        }

        oneShotBtn.calculateBackgroundColor = (): Color => {
            return oneShotBtn.backgroundColor;
        }
    }
}
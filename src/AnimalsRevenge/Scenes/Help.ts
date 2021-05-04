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
import SplashScreen from "./SplashScreen";

export default class Help extends Scene {

    static infHealth: boolean = false;
    static infMoney: boolean = false;
    static allLevels: boolean = false;
    static allTowers: boolean = false;
    static oneShot: boolean = false;
    
    loadScene(): void {
        this.load.image("backgroundImage", "assets/images/Background_Lighter.png");
    }

    startScene(): void {
        let backgroundLayer = this.addUILayer("background");
        backgroundLayer.setDepth(0);
        let helpLayer = this.addUILayer("help");
        helpLayer.setDepth(1);

        let size = this.viewport.getHalfSize();
        this.viewport.setFocus(size);

        this.viewport.setZoomLevel(1);

        let background = this.add.sprite("backgroundImage", "background");
        background.position.set(size.x, size.y);

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
        infHealthBtn.textColor = Color.BLACK;
        if (Help.infHealth) {
            infHealthBtn.text = '\u2716';
            infHealthBtn.setPadding(new Vec2(14, 8));
        } else {
            infHealthBtn.text = "";
            infHealthBtn.setPadding(new Vec2(25, 8));
        }
        infHealthBtn.borderRadius = 0;
        infHealthBtn.borderWidth = 3;

        let infHealthLabel = <Button>this.add.uiElement(UIElementType.BUTTON, "help", {position: new Vec2(270, 600), text: "Infinite Health"});
        infHealthLabel.textColor = Color.BLACK;
        infHealthLabel.backgroundColor = Color.TRANSPARENT;
        infHealthLabel.borderColor = Color.TRANSPARENT;
        infHealthLabel.font = "PixelSimple";
        infHealthLabel.fontSize = 35;

        let infMoneyBtn = <Button>this.add.uiElement(UIElementType.BUTTON, "help", {position: new Vec2(480, 600), text: ""});
        infMoneyBtn.backgroundColor = Color.TRANSPARENT;
        infMoneyBtn.borderColor = Color.BLACK;
        infMoneyBtn.textColor = Color.BLACK;
        if (Help.infMoney) {
            infMoneyBtn.text = '\u2716';
            infMoneyBtn.setPadding(new Vec2(14, 8));
        } else {
            infMoneyBtn.text = "";
            infMoneyBtn.setPadding(new Vec2(25, 8));
        }
        infMoneyBtn.borderRadius = 0;
        infMoneyBtn.borderWidth = 3;
        
        let infMoneyLabel = <Button>this.add.uiElement(UIElementType.BUTTON, "help", {position: new Vec2(650, 600), text: "Infinite Money"});
        infMoneyLabel.textColor = Color.BLACK;
        infMoneyLabel.backgroundColor = Color.TRANSPARENT;
        infMoneyLabel.borderColor = Color.TRANSPARENT;
        infMoneyLabel.font = "PixelSimple";
        infMoneyLabel.fontSize = 35;

        let allLevelsBtn = <Button>this.add.uiElement(UIElementType.BUTTON, "help", {position: new Vec2(860, 600), text: ""});
        allLevelsBtn.backgroundColor = Color.TRANSPARENT;
        allLevelsBtn.borderColor = Color.BLACK;
        allLevelsBtn.textColor = Color.BLACK;
        if (Help.allLevels) {
            allLevelsBtn.text = '\u2716';
            allLevelsBtn.setPadding(new Vec2(14, 8));
        } else {
            allLevelsBtn.text = "";
            allLevelsBtn.setPadding(new Vec2(25, 8));
        }
        allLevelsBtn.borderRadius = 0;
        allLevelsBtn.borderWidth = 3;

        let allLevelLabel = <Button>this.add.uiElement(UIElementType.BUTTON, "help", {position: new Vec2(1045, 600), text: "Unlock all Levels"});
        allLevelLabel.textColor = Color.BLACK;
        allLevelLabel.backgroundColor = Color.TRANSPARENT;
        allLevelLabel.borderColor = Color.TRANSPARENT;
        allLevelLabel.font = "PixelSimple";
        allLevelLabel.fontSize = 35;

        let allTowersBtn = <Button>this.add.uiElement(UIElementType.BUTTON, "help", {position: new Vec2(100, 700), text: ""});
        allTowersBtn.backgroundColor = Color.TRANSPARENT;
        allTowersBtn.borderColor = Color.BLACK;
        allTowersBtn.textColor = Color.BLACK;
        if (Help.allTowers) {
            allTowersBtn.text = '\u2716';
            allTowersBtn.setPadding(new Vec2(14, 8));
        } else {
            allTowersBtn.text = "";
            allTowersBtn.setPadding(new Vec2(25, 8));
        }
        allTowersBtn.borderRadius = 0;
        allTowersBtn.borderWidth = 3;

        let allTowersLabel = <Button>this.add.uiElement(UIElementType.BUTTON, "help", {position: new Vec2(300, 700), text: "Unlock all Towers"});
        allTowersLabel.textColor = Color.BLACK;
        allTowersLabel.backgroundColor = Color.TRANSPARENT;
        allTowersLabel.borderColor = Color.TRANSPARENT;
        allTowersLabel.font = "PixelSimple";
        allTowersLabel.fontSize = 35;

        let oneShotBtn = <Button>this.add.uiElement(UIElementType.BUTTON, "help", {position: new Vec2(480, 700), text: ""});
        oneShotBtn.backgroundColor = Color.TRANSPARENT;
        oneShotBtn.borderColor = Color.BLACK;
        oneShotBtn.textColor = Color.BLACK;
        if (Help.oneShot) {
            oneShotBtn.text = '\u2716';
            oneShotBtn.setPadding(new Vec2(14, 8));
        } else {
            oneShotBtn.text = "";
            oneShotBtn.setPadding(new Vec2(25, 8));
        }
        oneShotBtn.borderRadius = 0;
        oneShotBtn.borderWidth = 3;

        let oneShotLabel = <Button>this.add.uiElement(UIElementType.BUTTON, "help", {position: new Vec2(675, 700), text: "One shot enemies"});
        oneShotLabel.textColor = Color.BLACK;
        oneShotLabel.backgroundColor = Color.TRANSPARENT;
        oneShotLabel.borderColor = Color.TRANSPARENT;
        oneShotLabel.font = "PixelSimple";
        oneShotLabel.fontSize = 35;

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

        cutSceneBtn.onClick = () => {
            if (Input.getMousePressButton() == BUTTON.LEFTCLICK) {
                this.sceneManager.changeToScene(SplashScreen, {}, {});
            }
        }

        cutSceneBtn.onEnter = () => {
            cutSceneBtn.textColor = Color.ORANGE;
        }
        
        cutSceneBtn.onLeave = () => {
            cutSceneBtn.textColor = Color.BLACK;
        }

        infHealthBtn.onClick = () => {
            if (Input.getMousePressButton() == BUTTON.LEFTCLICK) {
                if (Help.infHealth) {
                    infHealthBtn.text = "";
                    infHealthBtn.setPadding(new Vec2(25, 8));
                    Help.infHealth = false;
                } else {
                    infHealthBtn.text = '\u2716';
                    infHealthBtn.setPadding(new Vec2(14, 8));
                    Help.infHealth = true;
                }
            }
        }

        infHealthBtn.calculateBackgroundColor = (): Color => {
            return infHealthBtn.backgroundColor;
        }

        infMoneyBtn.onClick = () => {
            if (Input.getMousePressButton() == BUTTON.LEFTCLICK) {
                if (Help.infMoney) {
                    infMoneyBtn.text = "";
                    infMoneyBtn.setPadding(new Vec2(25, 8));
                    Help.infMoney = false;
                } else {
                    infMoneyBtn.text = '\u2716';
                    infMoneyBtn.setPadding(new Vec2(14, 8));
                    Help.infMoney = true;
                }
            }
        }

        infMoneyBtn.calculateBackgroundColor = (): Color => {
            return infMoneyBtn.backgroundColor;
        }

        allLevelsBtn.onClick = () => {
            if (Input.getMousePressButton() == BUTTON.LEFTCLICK) {
                if (Help.allLevels) {
                    allLevelsBtn.text = "";
                    allLevelsBtn.setPadding(new Vec2(25, 8));
                    Help.allLevels = false;
                } else {
                    allLevelsBtn.text = '\u2716';
                    allLevelsBtn.setPadding(new Vec2(14, 8));
                    Help.allLevels = true;
                }
            }
        }

        allLevelsBtn.calculateBackgroundColor = (): Color => {
            return allLevelsBtn.backgroundColor;
        }

        allTowersBtn.onClick = () => {
            if (Input.getMousePressButton() == BUTTON.LEFTCLICK) {
                if (Help.allTowers) {
                    allTowersBtn.text = "";
                    allTowersBtn.setPadding(new Vec2(25, 8));
                    Help.allTowers = false;
                } else {
                    allTowersBtn.text = '\u2716';
                    allTowersBtn.setPadding(new Vec2(14, 8));
                    Help.allTowers = true;
                }
            }
        }

        allTowersBtn.calculateBackgroundColor = (): Color => {
            return allTowersBtn.backgroundColor;
        }

        oneShotBtn.onClick = () => {
            if (Input.getMousePressButton() == BUTTON.LEFTCLICK) {
                if (Help.oneShot) {
                    oneShotBtn.text = "";
                    oneShotBtn.setPadding(new Vec2(25, 8));
                    Help.oneShot = false;
                } else {
                    oneShotBtn.text = '\u2716';
                    oneShotBtn.setPadding(new Vec2(14, 8));
                    Help.oneShot = true;
                }
            }
        }

        oneShotBtn.calculateBackgroundColor = (): Color => {
            return oneShotBtn.backgroundColor;
        }
    }
}
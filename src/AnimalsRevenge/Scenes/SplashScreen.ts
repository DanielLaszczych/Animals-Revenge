import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import Input, { BUTTON } from "../../Wolfie2D/Input/Input";
import { TweenableProperties } from "../../Wolfie2D/Nodes/GameNode";
import { GraphicType } from "../../Wolfie2D/Nodes/Graphics/GraphicTypes";
import Rect from "../../Wolfie2D/Nodes/Graphics/Rect";
import Label from "../../Wolfie2D/Nodes/UIElements/Label";
import { UIElementType } from "../../Wolfie2D/Nodes/UIElements/UIElementTypes";
import Scene from "../../Wolfie2D/Scene/Scene";
import Color from "../../Wolfie2D/Utils/Color";
import { EaseFunctionType } from "../../Wolfie2D/Utils/EaseFunctions";
import MainMenu from "./MainMenu";


export default class SplashScreen extends Scene {

    clickLabel: Label;
    clickLabelAlphaModifier: number;
    numberofUpdates: number;

    loadScene(): void {
        this.load.image("logo", "assets/images/Animals_Revenge_Logo.png");
        this.load.image("backgroundImage", "assets/images/Background.png");
    }

    unloadScene(): void {
    }

    startScene(): void {
        let backgroundLayer = this.addUILayer("background");
        backgroundLayer.setDepth(0);
        let splashLayer = this.addUILayer("splashScreen");
        splashLayer.setDepth(1);

        let size = this.viewport.getHalfSize();
        this.viewport.setFocus(size);

        this.viewport.setZoomLevel(1);

        let background = this.add.sprite("backgroundImage", "background");
        background.position.set(size.x, size.y);

        let logo = this.add.sprite("logo", "splashScreen");
        logo.position.set(size.x, size.y + 20);
        logo.scale.set(3.7, 3.8); 

        this.clickLabel = <Label>this.add.uiElement(UIElementType.LABEL, "splashScreen", {position: new Vec2(size.x, size.y + 330), text: "\"Click anywhere to start\""});
        this.clickLabel.textColor = new Color(0, 0, 0, 1);
        this.clickLabel.font = "PixelSimple";
        this.clickLabel.fontSize = 60;

        this.clickLabelAlphaModifier = -0.1;
        this.numberofUpdates = 0;

    }

    updateScene(deltaT: number): void {
        this.numberofUpdates++;
        if (Input.isMouseJustPressed()) {
            if (Input.getMousePressButton() == BUTTON.LEFTCLICK) {
                this.sceneManager.changeToScene(MainMenu, {}, {});
            }
        }

        if (this.numberofUpdates === 3) {
            if (this.clickLabel.textColor.toStringRGBA() === new Color(0, 0, 0, 0.4).toStringRGBA()) {
                this.clickLabelAlphaModifier = 0.05;
            } else if (this.clickLabel.textColor.toStringRGBA() === Color.BLACK.toStringRGBA()) {
                this.clickLabelAlphaModifier = -0.05;
            }
            this.clickLabel.textColor = new Color(0, 0, 0, parseFloat((this.clickLabel.textColor.a + this.clickLabelAlphaModifier).toFixed(2)));
            this.numberofUpdates = 0;
        }
    }
}
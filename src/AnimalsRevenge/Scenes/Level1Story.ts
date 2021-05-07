import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import { GameEventType } from "../../Wolfie2D/Events/GameEventType";
import Input, { BUTTON } from "../../Wolfie2D/Input/Input";
import Label, { HAlign } from "../../Wolfie2D/Nodes/UIElements/Label";
import { UIElementType } from "../../Wolfie2D/Nodes/UIElements/UIElementTypes";
import Scene from "../../Wolfie2D/Scene/Scene";
import AudioManager, { AudioChannelType } from "../../Wolfie2D/Sound/AudioManager";
import Color from "../../Wolfie2D/Utils/Color";
import Level1 from "./Level1";
import MainMenu from "./MainMenu";

export default class Level1Story extends Scene {

    protected texts: Array<string>;
    protected currentText: string;
    protected currentSubStringIndex: number;
    protected textLabel: Label;
    protected numberofUpdates: number;

    initScene(init: Record<string, any>) {
        this.texts = new Array();
        this.texts.push("This is the first part of the dialogue");
        this.texts.push("This is the second part of the dialogue");
        
        this.currentSubStringIndex = 0;
        this.currentText = this.texts.shift();
        this.numberofUpdates = 0;
    }

    loadScene(): void {
        this.load.image("backgroundImage", "assets/images/Background_Lighter.png");
        this.load.audio("textScroll", "assets/sounds/textScroll.wav");
    }

    startScene(): void {
        AudioManager.setVolume(AudioChannelType.MUSIC, 0.1 * 0.1);
        
        let size = this.viewport.getHalfSize();
        this.viewport.setFocus(size);
        this.viewport.setZoomLevel(1);

        let backgroundLayer = this.addUILayer("background");
        backgroundLayer.setDepth(0);
        let splashLayer = this.addUILayer("UI");
        splashLayer.setDepth(1);

        let background = this.add.sprite("backgroundImage", "background");
        background.position.set(size.x, size.y);

        this.textLabel = <Label>this.add.uiElement(UIElementType.LABEL, "UI", {position: new Vec2(100, size.y + 330), text: ""});
        this.textLabel.textColor = new Color(0, 0, 0, 1);
        this.textLabel.font = "PixelSimple";
        this.textLabel.fontSize = 40;
        this.textLabel.setHAlign(HAlign.LEFT);
    }

    updateScene(deltaT: number): void {
        this.numberofUpdates++;

        if (Input.isMouseJustPressed() && Input.getMousePressButton() === BUTTON.LEFTCLICK) {
            if (this.textLabel.text.normalize() !== this.currentText.normalize()) {
                this.textLabel.text = this.currentText;
            } else {
                if (this.texts.length === 0) {
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
    
                    this.sceneManager.changeToScene(Level1, {startHealth: 10, startMoney: 150, towersUnlocked: 2, currentLevel: 1}, sceneOptions);
                } else {
                    this.textLabel.text = "";
                    this.currentText = this.texts.shift();
                    this.currentSubStringIndex = 0;
                    this.numberofUpdates = 0;
                }
            }
        }
        
        if (this.textLabel.text.normalize() !== this.currentText.normalize() && this.numberofUpdates === 4) {
                this.textLabel.text += this.currentText.substring(this.currentSubStringIndex, ++this.currentSubStringIndex);
                this.emitter.fireEvent(GameEventType.PLAY_SOUND, {key: "textScroll", loop: false});

                this.numberofUpdates = 0;
        }
    }
}
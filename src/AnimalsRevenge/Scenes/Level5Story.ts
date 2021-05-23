import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import { GameEventType } from "../../Wolfie2D/Events/GameEventType";
import Input, { BUTTON } from "../../Wolfie2D/Input/Input";
import { GraphicType } from "../../Wolfie2D/Nodes/Graphics/GraphicTypes";
import Rect from "../../Wolfie2D/Nodes/Graphics/Rect";
import Sprite from "../../Wolfie2D/Nodes/Sprites/Sprite";
import Label, { HAlign } from "../../Wolfie2D/Nodes/UIElements/Label";
import { UIElementType } from "../../Wolfie2D/Nodes/UIElements/UIElementTypes";
import Scene from "../../Wolfie2D/Scene/Scene";
import AudioManager, { AudioChannelType } from "../../Wolfie2D/Sound/AudioManager";
import Color from "../../Wolfie2D/Utils/Color";
import Level5 from "./Level5";

export default class Level5Story extends Scene {

    protected talkers: Array<string>;
    protected texts: Array<string>;
    protected currentTalker: string;
    protected currentText: string;
    protected currentSubStringIndex: number;
    protected textLabel: Label;
    protected numberofUpdates: number;
    protected mom: Sprite;
    protected kid: Sprite;

    initScene(init: Record<string, any>) {
        this.talkers = new Array();
        this.texts = new Array();

        this.talkers.push("Kid: ");
        this.talkers.push("Mom: ");
        this.talkers.push("Kid: ");
        this.talkers.push("Chicken: ");
        this.talkers.push("Mom: ");
        this.talkers.push("Mom: ");
        this.talkers.push("Kid: ");
        this.talkers.push("Kid: ");
        this.talkers.push("Kid: ");

        this.texts.push("Mom, I want some chicken nuggies");
        this.texts.push("Ok Billy, but only if you say please");
        this.texts.push("Fine, pleas...");
        this.texts.push("CLUCK CLUCK CLUCK");
        this.texts.push("OH GOD NO, BILLYY");
        this.texts.push("HE WAS SO YOUNG");
        this.texts.push("my hopes...");
        this.texts.push("my dreams...");
        this.texts.push("my nuggies...");

        this.currentSubStringIndex = 0;
        this.currentTalker = this.talkers.shift();
        this.currentText = this.texts.shift();

        this.numberofUpdates = 0;
    }

    loadScene(): void {
        this.load.image("chicken", "assets/images/Chicken_Portrait.png");
        this.load.image("mom_normal", "assets/images/Mom_Portrait_Normal.png");
        this.load.image("mom_sad", "assets/images/Mom_Portrait_Sad.png");
        this.load.image("kid_happy", "assets/images/Kid_Portrait_Happy.png");
        this.load.image("kid_egg", "assets/images/Kid_Portrait_Egg.png");
        this.load.image("backgroundImage", "assets/images/ParkingLot.png");
        this.load.audio("textScroll", "assets/sounds/textScroll.wav");
    }

    startScene(): void {
        AudioManager.setVolume(AudioChannelType.MUSIC, 0.5);
        
        let size = this.viewport.getHalfSize();
        this.viewport.setFocus(size);
        this.viewport.setZoomLevel(1);

        let backgroundLayer = this.addUILayer("background");
        backgroundLayer.setDepth(0);
        let splashLayer = this.addUILayer("UI");
        splashLayer.setDepth(1);

        let background = this.add.sprite("backgroundImage", "background");
        background.position.set(size.x, size.y);
        background.scale.set(1.315, 1.33);

        let sidePanel = <Rect>this.add.graphic(GraphicType.RECT, "UI", {position: new Vec2(size.x, 695), size: new Vec2(1190, 200)});
        sidePanel.color = new Color(186, 104, 30, 0.9);
        sidePanel.borderColor = Color.BLACK;
        sidePanel.borderWidth = 5;

        this.mom = this.add.sprite("mom_normal", "UI");
        this.mom.position.set(100, 496);
        this.mom.scale.set(1.5, 1.5);

        this.kid = this.add.sprite("kid_happy", "UI");
        this.kid.position.set(250, 510);
        this.kid.scale.set(1.3, 1.3);

        this.textLabel = <Label>this.add.uiElement(UIElementType.LABEL, "UI", {position: new Vec2(60, size.y + 240), text: this.currentTalker});
        this.textLabel.textColor = new Color(0, 0, 0, 1);
        this.textLabel.font = "PixelSimple";
        this.textLabel.fontSize = 40;
        this.textLabel.setHAlign(HAlign.LEFT);
    }

    updateScene(deltaT: number): void {
        this.numberofUpdates++;

        if (Input.isMouseJustPressed() && Input.getMousePressButton() === BUTTON.LEFTCLICK) {
            if (this.textLabel.text.normalize() !== (this.currentTalker.normalize() + this.currentText.normalize())) {
                this.textLabel.text = this.currentTalker + this.currentText;
                if (this.texts.length === 6) {
                    let chicken = this.add.sprite("chicken", "UI");
                    chicken.position.set(1100, 527);
                    chicken.scale.set(1, 1);
                }
                if (this.texts.length === 5) {
                    this.mom.destroy();
                    this.mom = this.add.sprite("mom_sad", "UI");
                    this.mom.position.set(100, 496);
                    this.mom.scale.set(1.5, 1.5);

                    this.kid.destroy();
                    this.kid = this.add.sprite("kid_egg", "UI");
                    this.kid.position.set(250, 510);
                    this.kid.scale.set(1.3, 1.3);
                }
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
    
                    this.sceneManager.changeToScene(Level5, {startHealth: 10, startMoney: 250, towersUnlocked: 6, currentLevel: 5}, sceneOptions);
                } else {
                    this.textLabel.text = "";
                    this.currentTalker = this.talkers.shift();
                    this.currentText = this.texts.shift();
                    this.textLabel.text += this.currentTalker;
                    this.currentSubStringIndex = 0;
                    this.numberofUpdates = 0;
                }
            }
        }
        
        if (this.textLabel.text.normalize() !== (this.currentTalker.normalize() + this.currentText.normalize()) && this.numberofUpdates === 4) {
                this.textLabel.text += this.currentText.substring(this.currentSubStringIndex, ++this.currentSubStringIndex);
                if (this.textLabel.text.normalize() === (this.currentTalker.normalize() + this.currentText.normalize())) {
                    if (this.texts.length === 6) {
                        let chicken = this.add.sprite("chicken", "UI");
                        chicken.position.set(1100, 527);
                        chicken.scale.set(1, 1);
                    }
                    if (this.texts.length === 5) {
                        let chicken = this.add.sprite("chicken", "UI");
                        chicken.position.set(1100, 527);
                        chicken.scale.set(1, 1);

                        this.mom.destroy();
                        this.mom = this.add.sprite("mom_sad", "UI");
                        this.mom.position.set(100, 496);
                        this.mom.scale.set(1.5, 1.5);

                        this.kid.destroy();
                        this.kid = this.add.sprite("kid_egg", "UI");
                        this.kid.position.set(250, 510);
                        this.kid.scale.set(1.3, 1.3);
                    }
                }
                this.emitter.fireEvent(GameEventType.PLAY_SOUND, {key: "textScroll", loop: false});

                this.numberofUpdates = 0;
        }
    }
}
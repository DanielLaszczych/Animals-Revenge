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
import Level1 from "./Level1";
import Level3 from "./Level3";
import MainMenu from "./MainMenu";

export default class Level3Story extends Scene {

    protected talkers: Array<string>;
    protected texts: Array<string>;
    protected currentTalker: string;
    protected currentText: string;
    protected currentSubStringIndex: number;
    protected textLabel: Label;
    protected numberofUpdates: number;
    protected soldier: Sprite;

    initScene(init: Record<string, any>) {
        this.talkers = new Array();
        this.texts = new Array();

        this.talkers.push("Soldier: ");
        this.talkers.push("Cow: ");
        this.talkers.push("Soldier: ");

        this.texts.push("Captain, reporting the situation, the animals have\nreached the eastern front and it won’t be long till they\nreach the city");
        this.texts.push("Moo...Moo...MOOOOOOOOOOOOOOO");
        this.texts.push("OH MY GOD, TAKE COVER, BURP CLOUDS ROLLING IN\nFROM THE SOUTH, TELL MY WIFE I LOVE H...");

        this.currentSubStringIndex = 0;
        this.currentTalker = this.talkers.shift();
        this.currentText = this.texts.shift();

        this.numberofUpdates = 0;
    }

    loadScene(): void {
        this.load.image("cow", "assets/images/Cow_Portrait.png");
        this.load.image("soldier_talking", "assets/images/Soldier_Portrait_Talking.png");
        this.load.image("soldier_faint", "assets/images/Soldier_Portrait_Faint.png");
        this.load.image("backgroundImage", "assets/images/PenguinExhibit.png");
        this.load.audio("textScroll", "assets/sounds/textScroll.wav");
    }

    startScene(): void {
        if (!MainMenu.lowerMusicOnce) {
            MainMenu.musicVolume = 0.5;
            MainMenu.lowerMusicOnce = true;
            AudioManager.setVolume(AudioChannelType.MUSIC, MainMenu.musicVolume);
        }
        
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

        this.soldier = this.add.sprite("soldier_talking", "UI");
        this.soldier.position.set(100, 496);
        this.soldier.scale.set(1.5, 1.5);

        this.textLabel = <Label>this.add.uiElement(UIElementType.LABEL, "UI", {position: new Vec2(100, size.y + 240), text: this.currentTalker});
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
                if (this.texts.length === 0) {
                    this.soldier.destroy();
                    this.soldier = this.add.sprite("soldier_faint", "UI");
                    this.soldier.position.set(100, 496);
                    this.soldier.scale.set(1.5, 1.5);
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
    
                    this.sceneManager.changeToScene(Level3, {startHealth: 10, startMoney: 300, towersUnlocked: 4, currentLevel: 3}, sceneOptions);
                } else {
                    this.textLabel.text = "";
                    this.currentTalker = this.talkers.shift();
                    this.currentText = this.texts.shift();
                    if (this.texts.length === 1) {
                        let cow = this.add.sprite("cow", "UI");
                        cow.position.set(1100, 495);
                        cow.scale.set(1.5, 1.5);
                    }
                    this.textLabel.text += this.currentTalker;
                    this.currentSubStringIndex = 0;
                    this.numberofUpdates = 0;
                }
            }
        }
        
        if (this.textLabel.text.normalize() !== (this.currentTalker.normalize() + this.currentText.normalize()) && this.numberofUpdates === 4) {
                this.textLabel.text += this.currentText.substring(this.currentSubStringIndex, ++this.currentSubStringIndex);
                if (this.textLabel.text.normalize() === (this.currentTalker.normalize() + this.currentText.normalize())) {
                    if (this.texts.length === 0) {
                        this.soldier.destroy();
                        this.soldier = this.add.sprite("soldier_faint", "UI");
                        this.soldier.position.set(100, 496);
                        this.soldier.scale.set(1.5, 1.5);
                    }
                }
                this.emitter.fireEvent(GameEventType.PLAY_SOUND, {key: "textScroll", loop: false});

                this.numberofUpdates = 0;
        }
    }
}
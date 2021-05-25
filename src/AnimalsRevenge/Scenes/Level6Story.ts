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
import Level6 from "./Level6";
import MainMenu from "./MainMenu";

export default class Level6Story extends Scene {

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
        this.talkers.push("President: ");
        this.talkers.push("Chicken: ");
        this.talkers.push("Soldier: ");
        this.talkers.push("President: ");

        this.texts.push("Mr. President, the animals are coming.");
        this.texts.push("Animals don't scare me, we have the best military\nin the...");
        this.texts.push("CLUCKKKKKKKKK");
        this.texts.push("GET DOWN MR. PRESIDENT");
        this.texts.push("GAHHHHHH");

        this.currentSubStringIndex = 0;
        this.currentTalker = this.talkers.shift();
        this.currentText = this.texts.shift();

        this.numberofUpdates = 0;
    }

    loadScene(): void {
        this.load.image("chicken", "assets/images/Chicken_Portrait.png");
        this.load.image("soldier_saluting", "assets/images/Soldier_Portrait_Saluting.png");
        this.load.image("soldier_president", "assets/images/Soldier_Portrait_President.png");
        this.load.image("president", "assets/images/President_Portrait.png");
        this.load.image("backgroundImage", "assets/images/WhiteHouseLawn.png");
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

        this.soldier = this.add.sprite("soldier_saluting", "UI");
        this.soldier.position.set(100, 500);
        this.soldier.scale.set(1.5, 1.5);

        let president = this.add.sprite("president", "UI");
        president.position.set(300, 465);
        president.scale.set(2, 2);

        let chicken = this.add.sprite("chicken", "UI");
        chicken.position.set(850, 527);
        chicken.scale.set(1, 1);

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
                if (this.texts.length === 2) {
                    this.soldier.destroy();
                    this.soldier = this.add.sprite("soldier_president", "UI");
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
    
                    this.sceneManager.changeToScene(Level6, {startHealth: 10, startMoney: 400, towersUnlocked: 6, currentLevel: 6}, sceneOptions);
                } else {
                    this.textLabel.text = "";
                    this.currentTalker = this.talkers.shift();
                    this.currentText = this.texts.shift();
                    if (this.texts.length === 2) {
                        this.soldier.destroy();
                        this.soldier = this.add.sprite("soldier_president", "UI");
                        this.soldier.position.set(100, 496);
                        this.soldier.scale.set(1.5, 1.5);
                    }
                    this.textLabel.text += this.currentTalker;
                    this.currentSubStringIndex = 0;
                    this.numberofUpdates = 0;
                }
            }
        }
        
        if (this.textLabel.text.normalize() !== (this.currentTalker.normalize() + this.currentText.normalize()) && this.numberofUpdates === 4) {
                this.textLabel.text += this.currentText.substring(this.currentSubStringIndex, ++this.currentSubStringIndex);
                this.emitter.fireEvent(GameEventType.PLAY_SOUND, {key: "textScroll", loop: false});

                this.numberofUpdates = 0;
        }
    }
}

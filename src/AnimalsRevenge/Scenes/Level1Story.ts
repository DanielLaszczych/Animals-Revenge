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
import MainMenu from "./MainMenu";

export default class Level1Story extends Scene {

    protected talkers: Array<string>;
    protected texts: Array<string>;
    protected currentTalker: string;
    protected currentText: string;
    protected currentSubStringIndex: number;
    protected textLabel: Label;
    protected numberofUpdates: number;
    protected farmer: Sprite;

    initScene(init: Record<string, any>) {
        this.talkers = new Array();
        this.texts = new Array();

        this.talkers.push("Chicken: ");
        this.talkers.push("Cow: ");
        this.talkers.push("Farmer: ");
        this.talkers.push("Farmer: ");
        this.talkers.push("Cow: ");
        this.talkers.push("Chicken: ");
        this.talkers.push("Farmer: ");
        this.talkers.push("Farmer: ");
        this.talkers.push("Cow: ");
        this.talkers.push("Chicken: ");
        this.talkers.push("Farmer: ");

        this.texts.push("...");
        this.texts.push("...");
        this.texts.push("...");
        this.texts.push("Hey guys, what are you doing out of your coup\nand fencing");
        this.texts.push("Moo...Moo");
        this.texts.push("Cluck...Cluck");
        this.texts.push("Margret, look, it looks like the chickens and cows\nare fed up with their horrible living conditions and are\nplanning a revolution that would include exterminating all of\nhumanity. Haha, the ideas I come up with.");
        this.texts.push("Hehe, now go on back to your cage little one");
        this.texts.push("MOO");
        this.texts.push("CLUCK");
        this.texts.push("OH GOD MARGRET THEY ACTUALLY ARE FIGHTING BACK");

        
        this.currentSubStringIndex = 0;
        this.currentTalker = this.talkers.shift();
        this.currentText = this.texts.shift();

        this.numberofUpdates = 0;
    }

    loadScene(): void {
        this.load.image("cow", "assets/images/Cow_Portrait.png");
        this.load.image("chicken", "assets/images/Chicken_Portrait.png");
        this.load.image("farmer_normal", "assets/images/Farmer_Portrait_Normal.png");
        this.load.image("farmer_suprised", "assets/images/Farmer_Portrait_Surprised.png");
        this.load.image("backgroundImage", "assets/images/Farm.png");
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

        this.farmer = this.add.sprite("farmer_normal", "UI");
        this.farmer.position.set(100, 496);
        this.farmer.scale.set(1.5, 1.5);

        let cow = this.add.sprite("cow", "UI");
        cow.position.set(1100, 496);
        cow.scale.set(1.5, 1.5);

        let chicken = this.add.sprite("chicken", "UI");
        chicken.position.set(900, 527);
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
                    this.currentTalker = this.talkers.shift();
                    this.currentText = this.texts.shift();
                    if (this.texts.length === 0) {
                        this.farmer.destroy();
                        this.farmer = this.add.sprite("farmer_suprised", "UI");
                        this.farmer.position.set(100, 496);
                        this.farmer.scale.set(1.5, 1.5);
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
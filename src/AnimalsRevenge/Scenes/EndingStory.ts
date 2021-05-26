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

export default class EndingStory extends Scene {

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

        this.talkers.push("");
        this.talkers.push("");
        this.talkers.push("");
        this.talkers.push("");
        this.talkers.push("");
        this.talkers.push("");
        this.talkers.push("");
        this.talkers.push("");
        this.talkers.push("");

        this.texts.push("And so, sick and tired of their way of life, General Eggbert\nand Captain Betty started a rebellion against the humans.");
        this.texts.push("Along their journey they formed alliances that would prove\nto be much of value.");
        this.texts.push("From the corners of every crevice, Mistress Short-Legs and\nher brood, who were tired of their webs being destroyed,\nwere the first to join the rebellion.");
        this.texts.push("From the forests that were quickly disappearing, Dues Claw\nand his clan joined quickly after hearing of the rebellion.");
        this.texts.push("After escaping the forests, Captain Betty would travel\nto the beaches which had become polluted with garbage\nfrom the humans. At the beach there were penguins who\nwere smiling and waving for some reason but happily joined.");
        this.texts.push("General Eggbert would go to the zoo's in the cities where\nanimals had become a means of human entertainment. The\nElephants, whose firepower would add much needed\nstrength, joined forces with Eggbert after being freed.");
        this.texts.push("Now General Eggbert and Captian Betty with the help of\ntheir newly formed allainces would be able to overthrow\nthe humans and start a new age of dominance.");
        this.texts.push("...and Billy never did get his nuggies...F to pay respects");
        this.texts.push("Free Play is now unlocked in the Main Menu, try to get as\nfar as you can!");

        this.currentSubStringIndex = 0;
        this.currentTalker = this.talkers.shift();
        this.currentText = this.texts.shift();

        this.numberofUpdates = 0;
    }

    loadScene(): void {
        this.load.image("chicken", "assets/images/Chicken_Portrait_Flipped.png");
        this.load.image("cow", "assets/images/Cow_Portrait.png");
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

        let chicken = this.add.sprite("chicken", "UI");
        chicken.position.set(100, 527);
        chicken.scale.set(1, 1);

        let cow = this.add.sprite("cow", "UI");
        cow.position.set(1100, 495);
        cow.scale.set(1.5, 1.5);

        this.textLabel = <Label>this.add.uiElement(UIElementType.LABEL, "UI", {position: new Vec2(20, size.y + 240), text: this.currentTalker});
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
                    this.sceneManager.changeToScene(MainMenu, {}, {});
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
                this.emitter.fireEvent(GameEventType.PLAY_SOUND, {key: "textScroll", loop: false});

                this.numberofUpdates = 0;
        }
    }
}

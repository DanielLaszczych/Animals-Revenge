import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import { GameEventType } from "../../Wolfie2D/Events/GameEventType";
import Input, { BUTTON } from "../../Wolfie2D/Input/Input";
import { GraphicType } from "../../Wolfie2D/Nodes/Graphics/GraphicTypes";
import Line from "../../Wolfie2D/Nodes/Graphics/Line";
import Button from "../../Wolfie2D/Nodes/UIElements/Button";
import Label from "../../Wolfie2D/Nodes/UIElements/Label";
import { UIElementType } from "../../Wolfie2D/Nodes/UIElements/UIElementTypes";
import Scene from "../../Wolfie2D/Scene/Scene";
import AudioManager, { AudioChannelType } from "../../Wolfie2D/Sound/AudioManager";
import Color from "../../Wolfie2D/Utils/Color";
import Controls from "./Controls";
import FreePlayLevel from "./FreePlayLevel";
import Help from "./Help";
import LevelSelection from "./LevelSelection";


export default class MainMenu extends Scene {

    static startMusicOnce: boolean = false;

    loadScene(): void {
        this.load.image("logo", "assets/images/Animals_Revenge_Logo.png");
        this.load.image("backgroundImage", "assets/images/Background_Lighter.png");
        this.load.audio("game_music", "assets/music/main_menu.mp3");
    }

    unloadScene(): void {
        this.load.keepAudio("game_music");
    }

    startScene(): void {
        if (!MainMenu.startMusicOnce) {
            this.emitter.fireEvent(GameEventType.PLAY_MUSIC, {key: "game_music", loop: true, holdReference: true});
            AudioManager.setVolume(AudioChannelType.MUSIC, 1.0);
            AudioManager.setVolume(AudioChannelType.SFX, 0.7 * 0.7);
            MainMenu.startMusicOnce = true;
        }        
    
        let backgroundLayer = this.addUILayer("background");
        backgroundLayer.setDepth(0);
        let mainLayer = this.addUILayer("mainMenu");
        mainLayer.setDepth(1);

        let size = this.viewport.getHalfSize();
        this.viewport.setFocus(size);

        this.viewport.setZoomLevel(1);

        let background = this.add.sprite("backgroundImage", "background");
        background.position.set(size.x, size.y);

        let mainMenuLabel = <Label>this.add.uiElement(UIElementType.LABEL, "mainMenu", {position: new Vec2(size.x, size.y - 300), text: "Main Menu"});
        mainMenuLabel.textColor = Color.BLACK;
        mainMenuLabel.font = "PixelSimple";
        mainMenuLabel.fontSize = 60;

        let line = <Line>this.add.graphic(GraphicType.LINE, "mainMenu", {start: new Vec2(size.x - 180, size.y - 275), end: new Vec2(size.x + 180, size.y - 275)});
        line.color = Color.BLACK;
        line.thickness = 5;

        let logo = this.add.sprite("logo", "mainMenu");
        logo.position.set(size.x, size.y - 120);
        logo.scale.set(1.5, 1.5);

        let playBtn = <Button>this.add.uiElement(UIElementType.BUTTON, "mainMenu", {position: new Vec2(size.x, size.y + 30), text: "Play"});
        playBtn.backgroundColor = Color.TRANSPARENT;
        playBtn.textColor = Color.BLACK;
        playBtn.borderColor = Color.BLACK;
        playBtn.borderRadius = 0;
        playBtn.borderWidth = 3;
        playBtn.setPadding(new Vec2(50, 10));
        playBtn.font = "PixelSimple";

        let additionalY = 0;
        if (Help.freePlay || LevelSelection.levelsUnlocked > 6) {
            let freePlayBtn = <Button>this.add.uiElement(UIElementType.BUTTON, "mainMenu", {position: new Vec2(size.x, size.y + 130), text: "Free Play"});
            freePlayBtn.backgroundColor = Color.TRANSPARENT;
            freePlayBtn.textColor = Color.BLACK;
            freePlayBtn.borderColor = Color.BLACK;
            freePlayBtn.borderRadius = 0;
            freePlayBtn.borderWidth = 3;
            freePlayBtn.setPadding(new Vec2(50, 10));
            freePlayBtn.font = "PixelSimple";
            
            freePlayBtn.onClick = () => {
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
    
                    this.sceneManager.changeToScene(FreePlayLevel, {startHealth: 10, startMoney: 200, towersUnlocked: 6, currentLevel: 7}, sceneOptions);
                }
            }
    
            freePlayBtn.onEnter = () => {
                freePlayBtn.textColor = Color.ORANGE;
            }
            
            freePlayBtn.onLeave = () => {
                freePlayBtn.textColor = Color.BLACK;
            }

            additionalY = 100;
        }

        let controlsBtn = <Button>this.add.uiElement(UIElementType.BUTTON, "mainMenu", {position: new Vec2(size.x, size.y + 130 + additionalY), text: "Controls"});
        controlsBtn.backgroundColor = Color.TRANSPARENT;
        controlsBtn.textColor = Color.BLACK;
        controlsBtn.borderColor = Color.BLACK;
        controlsBtn.borderRadius = 0;
        controlsBtn.borderWidth = 3;
        controlsBtn.setPadding(new Vec2(50, 10));
        controlsBtn.font = "PixelSimple";

        let helpBtn = <Button>this.add.uiElement(UIElementType.BUTTON, "mainMenu", {position: new Vec2(size.x, size.y + 230 + additionalY), text: "Help"});
        helpBtn.backgroundColor = Color.TRANSPARENT;
        helpBtn.textColor = Color.BLACK;
        helpBtn.borderColor = Color.BLACK;
        helpBtn.borderRadius = 0;
        helpBtn.borderWidth = 3;
        helpBtn.setPadding(new Vec2(50, 10));
        helpBtn.font = "PixelSimple";

        playBtn.onClick = () => {
            if (Input.getMousePressButton() == BUTTON.LEFTCLICK) {
                this.sceneManager.changeToScene(LevelSelection, {}, {});
            }
        }

        playBtn.onEnter = () => {
            playBtn.textColor = Color.ORANGE;
        }
        
        playBtn.onLeave = () => {
            playBtn.textColor = Color.BLACK;
        }

        controlsBtn.onClick = () => {
            if (Input.getMousePressButton() == BUTTON.LEFTCLICK) {
                this.sceneManager.changeToScene(Controls, {}, {});
            }
        }

        controlsBtn.onEnter = () => {
            controlsBtn.textColor = Color.ORANGE;
        }
        
        controlsBtn.onLeave = () => {
            controlsBtn.textColor = Color.BLACK;
        }

        helpBtn.onClick = () => {
            if (Input.getMousePressButton() == BUTTON.LEFTCLICK) {
                this.sceneManager.changeToScene(Help, {}, {});
            }
        }

        helpBtn.onEnter = () => {
            helpBtn.textColor = Color.ORANGE;
        }
        
        helpBtn.onLeave = () => {
            helpBtn.textColor = Color.BLACK;
        }

        
    }
}
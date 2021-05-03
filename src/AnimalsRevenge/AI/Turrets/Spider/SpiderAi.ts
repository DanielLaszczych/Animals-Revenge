// import StateMachineAI from "../../../../Wolfie2D/AI/StateMachineAI";
// import AABB from "../../../../Wolfie2D/DataTypes/Shapes/AABB";
// import Vec2 from "../../../../Wolfie2D/DataTypes/Vec2";
// import { GraphicType } from "../../../../Wolfie2D/Nodes/Graphics/GraphicTypes";
// import Point from "../../../../Wolfie2D/Nodes/Graphics/Point";
// import AnimatedSprite from "../../../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
// import Sprite from "../../../../Wolfie2D/Nodes/Sprites/Sprite";
// import Timer from "../../../../Wolfie2D/Timing/Timer";
// import Color from "../../../../Wolfie2D/Utils/Color";
// import { AR_Events } from "../../../animalrevenge_enums";
// import Idle from "./Idle";
// import Combat from "./Combat"

// export default class SpiderAi extends StateMachineAI {
    
//     protected owner: AnimatedSprite;

//     protected stats: Record<string, any>;
//     public target: number;
//     public areaofEffect: Sprite;
//     public trigger: Point;
//     public slowDuration: Timer;
//     public isPaused: boolean = false;
//     public levelSpeed: number;
//     public predictionMultiplier: Map<number, number>;
    
//     initializeAI(owner: AnimatedSprite, stats: Record<string, any>) {
//         this.owner = owner;
//         this.stats = stats;

//         this.levelSpeed = 1;
//         this.predictionMultiplier = new Map([
//             [1, 80],
//             [2, 90],
//             [4, 100]
//         ]);

//         this.addState("idle", new Idle(this, owner));
//         this.addState("combat", new Combat(this, owner, this.stats));

//         this.trigger = this.owner.getScene().add.graphic(GraphicType.POINT, "primary", {position: new Vec2(-100, -100)});
//         this.trigger.color = Color.TRANSPARENT;
//         this.trigger.addPhysics(new AABB(Vec2.ZERO, new Vec2(0, 0)), undefined, false, false);
        
//         this.areaofEffect = this.owner.getScene().add.sprite("cobweb", "UI");
//         this.areaofEffect.position.set(-100, -100);
//         this.areaofEffect.visible = false;
//         this.areaofEffect.alpha = 1;

//         this.receiver.subscribe(AR_Events.ENEMY_ENTERED_TOWER_RANGE);
//         this.receiver.subscribe(AR_Events.ENEMY_DIED);
//         this.receiver.subscribe(AR_Events.PAUSE_RESUME_GAME);
//         this.receiver.subscribe(AR_Events.LEVEL_SPEED_CHANGE);

//         this.initialize("idle");
//     }

//     activate(stats: Record<string, any>) {
//         this.stats = stats;
//         this.addState("idle", new Idle(this, this.owner));
//         this.addState("combat", new Combat(this, this.owner, this.stats));
//     }
// }
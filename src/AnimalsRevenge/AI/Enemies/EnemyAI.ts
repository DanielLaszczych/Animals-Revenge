import StateMachineAI from "../../../Wolfie2D/AI/StateMachineAI";
import Vec2 from "../../../Wolfie2D/DataTypes/Vec2";
import AnimatedSprite from "../../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import Walk from "./Walk";

export default class EnemyAI extends StateMachineAI{
    protected owner: AnimatedSprite;

    protected speed: number = 30;

    initializeAI(owner: AnimatedSprite, navigation: Array<Vec2>){
        this.owner = owner;
        
        if(this.owner.imageId === "farmer" || this.owner.imageId === "soldier" ||
            this.owner.imageId === "super_soldier" || this.owner.imageId === "drone"){
            this.addState("default", new Walk(this, owner, navigation, 120));
        }

        if(this.owner.imageId === "dog_robot"){
            this.addState("default", new Walk(this, owner, navigation, 200));
        }

        if(this.owner.imageId === "president"){
            this.addState("default", new Walk(this, owner, navigation, 80));
        }
        
        this.initialize("default");
    }

    activate(options: Record<string, any>): void {
    }
}
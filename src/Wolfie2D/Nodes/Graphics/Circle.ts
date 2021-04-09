import Vec2 from "../../DataTypes/Vec2";
import Color from "../../Utils/Color";
import Graphic from "../Graphic";

/** A basic circle to be drawn on the screen. */
export default class Circle extends Graphic {

    /** The radius color of the Circle */
    radius: number;

    /** The border color of the Circle */
    borderColor: Color;

    /** The width of the border */
    borderWidth: number;

    constructor(position: Vec2, radius: number) {
        super();
        this.position = position;
        this.radius = radius;
        this.borderColor = Color.BLACK;
        this.borderWidth = 1;
    }

      /**
     * Sets the border color of this circle
     * @param color The border color
     */
    setBorderColor(color: Color): void {
        this.borderColor = color;
    }

    // @deprecated
    getBorderColor(): Color {
        return this.borderColor;
    }

    /**
     * Sets the border width of this circle
     * @param width The width of the circle in pixels
     */
    setBorderWidth(width: number){
        this.borderWidth = width;
    }

    getBorderWidth(): number {
        return this.borderWidth;
    }
    
    /**
     * Sets the radius of this circle
     * @param radius The radius of the circle in pixels
     */
     setRadius(radius: number){
        this.radius = radius;
    }

    getRadius(): number {
        return this.radius;
    }
}
import Graphic from "../Graphic";
import Vec2 from "../../DataTypes/Vec2";
import Color from "../../Utils/Color";

/** A basic rectangle to be drawn on the screen. */
export default class Rect extends Graphic {

    /** The border color of the Rect */
    borderColor: Color;

    /** The width of the border */
    borderWidth: number;

    /** The width of the fill */
    fillWidth: number;

    /** The line join property of the rectangle */
    lineJoin: CanvasLineJoin;

    constructor(position: Vec2, size: Vec2){
        super();
        this.position = position;
        this.size = size;
        this.borderColor = Color.TRANSPARENT;
        this.borderWidth = 0;
        this.fillWidth = null;
        this.lineJoin = null;
    }

    /**
     * Sets the border color of this rectangle
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
     * Sets the border width of this rectangle
     * @param width The width of the rectangle in pixels
     */
    setBorderWidth(width: number){
        this.borderWidth = width;
    }

    getBorderWidth(): number {
        return this.borderWidth;
    }
}
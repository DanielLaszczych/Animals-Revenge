import Vec2 from "../../DataTypes/Vec2";
import Circle from "../../Nodes/Graphics/Circle";
import Line from "../../Nodes/Graphics/Line";
import Point from "../../Nodes/Graphics/Point";
import Rect from "../../Nodes/Graphics/Rect";
import ResourceManager from "../../ResourceManager/ResourceManager";
import Scene from "../../Scene/Scene";

/**
 * A utility class to help the @reference[CanvasRenderer] render @reference[Graphic]s
 */
export default class GraphicRenderer {
    /** The resource manager of the game engine */
    protected resourceManager: ResourceManager;
    /** The current scene */
    protected scene: Scene;
    /** The rendering context */
    protected ctx: CanvasRenderingContext2D;

    constructor(ctx: CanvasRenderingContext2D){
        this.resourceManager = ResourceManager.getInstance();
        this.ctx = ctx;
    }

    /**
     * Sets the scene of this GraphicRenderer
     * @param scene The current scene
     */
    setScene(scene: Scene): void {
        this.scene = scene;
    }

    /**
     * Renders a point
     * @param point The point to render
     * @param zoom The zoom level
     */
    renderPoint(point: Point, zoom: number): void {
		this.ctx.fillStyle = point.color.toStringRGBA();
        this.ctx.fillRect((-point.size.x/2)*zoom, (-point.size.y/2)*zoom,
        point.size.x*zoom, point.size.y*zoom);
    }

    renderLine(line: Line, origin: Vec2, zoom: number): void {
        this.ctx.strokeStyle = line.color.toStringRGBA();
        this.ctx.lineWidth = line.thickness;
        this.ctx.beginPath();
        this.ctx.moveTo(0, 0);
        this.ctx.lineTo((line.end.x - line.start.x)*zoom, (line.end.y - line.start.y)*zoom);
        this.ctx.closePath();
        this.ctx.stroke();
    }

    /**
     * Renders a rect
     * @param rect The rect to render
     * @param zoom The zoom level
     */
    renderRect(rect: Rect, zoom: number): void {
        // Draw the interior of the rect
        if(rect.color.a !== 0){
            this.ctx.fillStyle = rect.color.toStringRGB();
            if (rect.fillWidth !== null) {
                this.ctx.fillRect((-rect.size.x/2)*zoom, (-rect.size.y/2)*zoom, rect.fillWidth*zoom, rect.size.y*zoom);
            } else {
                this.ctx.fillRect((-rect.size.x/2)*zoom, (-rect.size.y/2)*zoom, rect.size.x*zoom, rect.size.y*zoom);
            }
        }

        // Draw the border of the rect if it isn't transparent
        if (rect.lineJoin !== null) {
            this.ctx.lineJoin = rect.lineJoin;
        }
        if(rect.borderColor.a !== 0){
            this.ctx.strokeStyle = rect.getBorderColor().toStringRGB();
            this.ctx.lineWidth = rect.getBorderWidth();
            this.ctx.strokeRect((-rect.size.x/2)*zoom, (-rect.size.y/2)*zoom, rect.size.x*zoom, rect.size.y*zoom);
        }
    }

    /**
     * Renders a circle
     * @param circle The circle to render
     * @param zoom The zoom level
     */
    renderCircle(circle: Circle, zoom: number): void {
        this.ctx.beginPath();
        this.ctx.arc(0, 0, (circle.radius) * zoom, 0, 2 * Math.PI, false);
        if(circle.color.a !== 0){
            this.ctx.fillStyle = circle.color.toStringRGB();
            this.ctx.fill();
        }

        // Draw the border of the rect if it isn't transparent
        if(circle.borderColor.a !== 0){
            this.ctx.strokeStyle = circle.getBorderColor().toStringRGB();
            this.ctx.lineWidth = circle.getBorderWidth();
            this.ctx.stroke();
        }
    }
}
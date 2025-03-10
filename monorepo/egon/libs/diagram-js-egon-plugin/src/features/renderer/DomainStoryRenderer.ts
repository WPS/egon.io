import EventBus from "diagram-js/lib/core/EventBus";
import Styles from "diagram-js/lib/draw/Styles";
import Canvas from "diagram-js/lib/core/Canvas";
import BaseRenderer from "diagram-js/lib/draw/BaseRenderer";
import CommandStack from "diagram-js/lib/command/CommandStack";
import { Connection, Element, Shape } from "diagram-js/lib/model/Types";
import { componentsToPath, createLine } from "diagram-js/lib/util/RenderUtil";
import Ids from "ids";
import {
    append as svgAppend,
    attr as svgAttr,
    classes as svgClasses,
    create as svgCreate,
} from "tiny-svg";
import { query as domQuery } from "min-dom";
import { assign, isObject } from "min-dash";
import { DomainStoryTextRenderer } from "../text-renderer/DomainStoryTextRenderer";
import { getNumberStash } from "../labeling/DomainStoryLabelEditingProvider";
import {
    addNumberToRegistry,
    Box,
    generateAutomaticNumber,
    numberBoxDefinitions,
} from "../../utils/numbering";
import { ElementTypes, getIconId } from "../../domain/entities/elementTypes";
import { Point } from "diagram-js/lib/util/Types";
import { countLines, labelPosition } from "../labeling/position";
import { calculateTextWidth } from "../labeling/utils";
import { angleBetween } from "../../utils/mathExtensions";
import { getScaledPath, isCustomIcon, isCustomSvgIcon } from "../../utils/util";
import { ElementRegistryService } from "../../domain/service/ElementRegistryService";
import { DirtyFlagService } from "../../domain/service/DirtyFlagService";
import { IconDictionaryService } from "../../icon-set-config/service/IconDictionaryService";

const RENDERER_IDS = new Ids();
const numbers = [];
const DEFAULT_COLOR = "#000000";

export class DomainStoryRenderer extends BaseRenderer {
    static $inject: string[] = [];

    private rendererId = RENDERER_IDS.next();

    private markers: Record<string, SVGMarkerElement> = {};

    constructor(
        eventBus: EventBus,
        private readonly styles: Styles,
        private readonly canvas: Canvas,
        private readonly commandStack: CommandStack,
        private readonly domainStoryTextRenderer: DomainStoryTextRenderer,
        private readonly elementRegistryService: ElementRegistryService,
        private readonly dirtyFlagService: DirtyFlagService,
        private readonly iconDictionaryService: IconDictionaryService,
    ) {
        super(eventBus, 2000);

        eventBus.on("bendpoint.move.start", 200, function (event: any) {
            // the bendpoint which we are dragging will otherwise be displayed with 0.3 opacity
            // through bendpoint-dragging we match the CSS class more specifically, hence our style applies
            svgClasses(event.context.draggerGfx).add("bendpoint-dragging");
            // the old path of the activity will otherwise be displayed in gray
            canvas.addMarker(event.context.connection, "djs-element-hidden");
        });

        eventBus.on("bendpoint.move.end", 2000, function (event: any) {
            // the acitvity will not be displayed if we don't remove the marker we added during bendpoint.move.start
            // high priority is neccessary, so we come before something that might stop the execution
            canvas.removeMarker(event.context.connection, "djs-element-hidden");
        });
    }

    override canRender(element: Element): boolean {
        return /^domainStory:/.test(element["type"]);
    }

    override drawShape(visuals: SVGElement, shape: Shape): SVGElement {
        // polyfill for tests
        if (!String.prototype.startsWith) {
            Object.defineProperty(String.prototype, "startsWith", {
                value: function (search: any[], pos: number) {
                    pos = !pos || pos < 0 ? 0 : +pos;
                    return this.substring(pos, pos + search.length) === search;
                },
            });
        }

        const type = shape["type"];
        shape.businessObject.type = type;

        this.elementRegistryService.correctInitialize();
        this.dirtyFlagService.makeDirty();

        if (type.includes(ElementTypes.ACTOR)) {
            return this.drawActor(visuals, shape);
        } else if (type.includes(ElementTypes.WORKOBJECT)) {
            return this.drawWorkObject(visuals, shape);
        } else if (type.includes(ElementTypes.TEXTANNOTATION)) {
            return this.drawAnnotation(visuals, shape);
        } else if (type.includes(ElementTypes.GROUP)) {
            return this.drawGroup(visuals, shape);
        }

        throw new Error("[DomainStoryRenderer] The type of the shape is invalid.");
    }

    override getShapePath(shape: Shape): string {
        const type = shape["type"];

        if (type.includes(ElementTypes.ACTOR)) {
            return this.getPath(shape);
        } else if (type.includes(ElementTypes.WORKOBJECT)) {
            return this.getPath(shape);
        } else if (type.includes(ElementTypes.GROUP)) {
            return this.getPath(shape);
        } else if (type.includes(ElementTypes.TEXTANNOTATION)) {
            return this.getPath(shape);
        } else {
            return super.getShapePath(shape);
        }
    }

    override drawConnection(visuals: SVGElement, connection: Connection): SVGElement {
        const type = connection["type"];

        this.dirtyFlagService.makeDirty();

        // fixes activities that were copy-pasted
        if (!connection.businessObject.type) {
            connection.businessObject.type = type;
        }
        if (type === ElementTypes.ACTIVITY) {
            return this.drawActivity(visuals, connection);
        } else if (type === ElementTypes.CONNECTION) {
            return this.drawDSConnection(visuals, connection);
        } else {
            return super.drawConnection(visuals, connection);
        }
    }

    drawActor(parent: SVGElement, element: Shape) {
        const svgDynamicSizeAttributes = {
            width: element.width,
            height: element.height,
        };
        let iconSRC = this.iconDictionaryService.getTypeIconSRC(
            ElementTypes.ACTOR,
            getIconId(element["type"]),
        );
        iconSRC = this.getIconSvg(iconSRC, element);
        const actor = svgCreate(iconSRC);

        svgAttr(actor, svgDynamicSizeAttributes);
        svgAppend(parent, actor);

        this.renderActorAndWorkObjectLabel(parent, element, "center", -5);
        return actor;
    }

    drawWorkObject(parent: SVGElement, element: Shape) {
        const svgDynamicSizeAttributes = {
            width: element.width * 0.65,
            height: element.height * 0.65,
            x: element.width / 2 - 25,
            y: element.height / 2 - 25,
        };
        let iconSRC =
            this.iconDictionaryService.getTypeIconSRC(
                ElementTypes.WORKOBJECT,
                getIconId(element["type"]),
            ) ?? "";
        iconSRC = this.getIconSvg(iconSRC, element);
        const workObject = svgCreate(iconSRC);

        svgAttr(workObject, svgDynamicSizeAttributes);
        svgAppend(parent, workObject);
        this.renderActorAndWorkObjectLabel(parent, element, "center", -5);

        return workObject;
    }

    drawGroup(parentGfx: SVGElement, element: Shape) {
        if (!element.businessObject.pickedColor) {
            element.businessObject.pickedColor = DEFAULT_COLOR;
        }
        const rect = this.drawRect(
            parentGfx,
            element.width,
            element.height,
            0,
            0,
            assign(
                {
                    fill: "none",
                    stroke: element.businessObject.pickedColor,
                },
                element["attrs"],
            ),
        );

        this.renderActorAndWorkObjectLabel(parentGfx, element, "left-top", 8);

        return rect;
    }

    drawActivity(visuals: SVGElement, element: Connection): SVGElement {
        this.adjustForTextOverlap(element);

        const attrs = this.useColorForActivity(element);

        const x = svgAppend(visuals, createLine(element.waypoints, attrs)) as SVGElement;
        this.renderActivityLabel(visuals, element);
        this.renderExternalNumber(visuals, element);

        // Just adjusting the start- and endpoint of the connection-element moves only the drawn connection,
        // not the interactive line. This can be fixed by manually overriding the points of the interactive polyline
        // in the HTML with the points of the drawn one.
        // This, however, does not adjust the surrounding box of the connection.
        this.fixConnectionInHTML(visuals.parentElement);

        // changes the color of the moved activity back to original instead of blue
        if (visuals.getAttribute("djs-dragger")) {
            svgClasses(visuals).remove("djs-dragger");
            svgClasses(visuals).add("djs-connection-preview");
        }

        return x;
    }

    drawDSConnection(visuals: SVGElement, element: Connection): SVGElement {
        let attrs = "";
        attrs = this.styles.computeStyle(attrs, {
            stroke: element.businessObject.pickedColor ?? "black",
            strokeWidth: 1.5,
            strokeLinejoin: "round",
            strokeDasharray: "5, 5",
        });

        return svgAppend(visuals, createLine(element.waypoints, attrs)) as SVGElement;
    }

    drawAnnotation(parentGfx: SVGElement, element: Shape) {
        const style = {
            fill: "none",
            stroke: "none",
        };

        const text = element.businessObject.text || "";
        if (element.businessObject.text) {
            let height = element.height ?? 0;

            if (height === 0 && element.businessObject.number) {
                height = element.businessObject.number;
            }
            assign(element, {
                height: height,
            });

            // for some reason, the keyword height is not exported, so we use another, which we know will be exported,
            // to ensure persistent annotation heights between sessions
            assign(element.businessObject, {
                number: height,
            });
        }

        const textElement = this.drawRect(
            parentGfx,
            element.width,
            element.height,
            0,
            0,
            style,
        );
        const textPathData = getScaledPath({
            xScaleFactor: 1,
            yScaleFactor: 1,
            containerWidth: element.width,
            containerHeight: element.height,
            position: {
                mx: 0.0,
                my: 0.0,
            },
        });

        this.drawPath(parentGfx, textPathData, {
            stroke: element.businessObject.pickedColor ?? "black",
        });

        this.renderLabel(parentGfx, text, {
            box: element,
            align: "left-top",
            padding: 5,
            style: {
                fill: element.businessObject.pickedColor ?? "black",
            },
        });

        return textElement;
    }

    getActivityPath(connection: Connection) {
        const waypoints = connection.waypoints.map(function (p) {
            // return p.original || p;
            return p;
        });

        const activityPath = [["M", waypoints[0].x, waypoints[0].y]];

        waypoints.forEach(function (waypoint, index) {
            if (index !== 0) {
                activityPath.push(["L", waypoint.x, waypoint.y]);
            }
        });
        return componentsToPath(activityPath);
    }

    private getPath(shape: Shape) {
        const rectangle = this.getRectPath(shape);
        return componentsToPath(rectangle);
    }

    private drawRect(
        parentGfx: SVGElement,
        width: number,
        height: number,
        r: number,
        offset: number,
        attrs?: any,
    ) {
        if (isObject(offset)) {
            attrs = offset;
            offset = 0;
        }

        offset = offset || 0;
        attrs = this.styles.computeStyle(attrs, {
            stroke: "black",
            strokeWidth: 2,
            fill: "white",
        });

        const rect = svgCreate("rect");
        svgAttr(rect, {
            x: offset,
            y: offset,
            width: width - offset * 2,
            height: height - offset * 2,
            rx: r,
            ry: r,
        });

        svgAttr(rect, attrs);
        svgAppend(parentGfx, rect);

        return rect;
    }

    private drawPath(parentGfx: SVGElement, d: string, attrs: any) {
        attrs = this.styles.computeStyle(attrs, ["no-fill"], {
            strokeWidth: 2,
            stroke: "black",
        });

        const path = svgCreate("path");
        svgAttr(path, { d: d });
        svgAttr(path, attrs);

        svgAppend(parentGfx, path);

        return path;
    }

    /**
     * creates an SVG path that describes a rectangle which encloses the given shape.
     */
    private getRectPath(shape: Shape) {
        const offset = 5;
        const x = shape.x,
            y = shape.y,
            width = shape.width / 2 + offset,
            height = shape.height / 2 + offset;

        return [
            ["M", x, y],
            ["l", width, 0],
            ["l", width, height],
            ["l", -width, height],
            ["l", -width, 0],
            ["z"],
        ];
    }

    private getIconSvg(icon: string, element: Shape) {
        const pickedColor = element.businessObject.pickedColor;
        if (isCustomIcon(icon)) {
            let dataURL;
            if (isCustomSvgIcon(icon)) {
                dataURL = this.applyColorToCustomSvgIcon(pickedColor, icon);
            } else {
                dataURL = icon;
                if (pickedColor && pickedColor !== DEFAULT_COLOR) {
                    document.dispatchEvent(new CustomEvent("errorColoringOnlySvg"));
                }
            }
            return (
                '<svg viewBox="0 0 24 24" width="48" height="48" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">' +
                '<image width="24" height="24" xlink:href="' +
                dataURL +
                '"/></svg>'
            );
        } else {
            return this.applyColorToIcon(pickedColor, icon);
        }
    }

    private applyColorToCustomSvgIcon(pickedColor: string, iconSvg: string) {
        if (!pickedColor) {
            return iconSvg;
        }
        const [rest, base64Svg] = iconSvg.split("base64,");
        const svg = atob(base64Svg);
        const coloredSvg = this.applyColorToIcon(pickedColor, svg);
        const encodedColoredSvg = btoa(coloredSvg);
        return rest + "base64," + encodedColoredSvg;
    }

    private applyColorToIcon(pickedColor = DEFAULT_COLOR, iconSvg: string) {
        const match = iconSvg.match(/fill=\s*"(?!none).*?"|fill:\s*[#r]\w*[;\s]{1}/);
        if (match && match.some((it) => it)) {
            return iconSvg
                .replaceAll(/fill=\s*"(?!none).*?"/g, `fill="${pickedColor}"`)
                .replaceAll(/fill:\s*[#r]\w*[;\s]{1}/g, `fill:${pickedColor};`);
        } else {
            const index = iconSvg.indexOf("<svg ") + 5;
            return (
                iconSvg.substring(0, index) +
                ' fill=" ' +
                pickedColor +
                '" ' +
                iconSvg.substring(index)
            );
        }
    }

    private adjustForTextOverlap(element: Connection) {
        const source = element.source;
        const target = element.target;

        const waypoints = element.waypoints;
        const startPoint = waypoints[0];
        const endPoint = waypoints[waypoints.length - 1];

        if (startPoint && endPoint && source && target) {
            this.checkIfPointOverlapsText(startPoint, source);
            this.checkIfPointOverlapsText(endPoint, source);
        }
    }

    private useColorForActivity(element: Connection) {
        if (!element.businessObject.pickedColor) {
            element.businessObject.pickedColor = "black";
        }
        const attrs = "";
        return this.styles.computeStyle(attrs, {
            stroke: element.businessObject.pickedColor,
            fill: "none",
            strokeWidth: 1.5,
            strokeLinejoin: "round",
            markerEnd: this.marker(
                "activity",
                "black",
                element.businessObject.pickedColor,
            ),
        });
    }

    private renderActivityLabel(
        parentGfx: SVGElement,
        element: Connection,
    ): SVGElement | undefined {
        const semantic = element.businessObject;
        const waypoints = element.waypoints;
        const lines = countLines(semantic.name);

        const position = labelPosition(waypoints, lines);
        const startPoint = element.waypoints[position.selected];
        const endPoint = element.waypoints[position.selected + 1];
        const angle = angleBetween(startPoint, endPoint);
        let alignment = "left";
        let boxWidth = 500;
        let xStart = position.x;

        // if the activity is horizontal, we want to center the label
        if (angle === 0 || angle === 180) {
            boxWidth = Math.abs(startPoint.x - endPoint.x);
            alignment = "center";
            xStart = (startPoint.x + endPoint.x) / 2 - calculateTextWidth(semantic.name);
        }

        const box = {
            textAlign: alignment,
            width: boxWidth,
            height: 30,
            x: xStart,
            y: position.y,
        };

        if (semantic.name && semantic.name.length) {
            return this.renderLabel(
                parentGfx,
                semantic.name,
                {
                    box: box,
                    fitBox: true,
                    style: assign({}, this.domainStoryTextRenderer.getExternalStyle(), {
                        fill: "black",
                        wordWrap: "break-word",
                        overflowWrap: "break-word",
                        hyphens: "auto",
                    }),
                },
                element["type"],
            );
        }

        return undefined;
    }

    private checkIfPointOverlapsText(point: Point, source: Element) {
        if (point.y > source["y"] + 60) {
            if (point.x > source["x"] + 3 && point.x < source["x"] + 72) {
                const lineOffset = this.getLineOffset(source);
                if (source["y"] + 75 + lineOffset > point.y) {
                    point.y += lineOffset;
                }
            }
        }
    }

    private getLineOffset(element: Element) {
        const id = element.id;
        let offset = 0;

        const objects = document.getElementsByClassName("djs-element djs-shape");
        for (let i = 0; i < objects.length; i++) {
            const data_id = objects.item(i)?.getAttribute("data-element-id");
            if (data_id === id) {
                const object = objects.item(i);
                const text = object?.getElementsByTagName("text")[0];
                const tspans = text?.getElementsByTagName("tspan");
                if (tspans) {
                    const tspan = tspans[tspans.length - 1];
                    offset = parseInt(tspan.getAttribute("y") ?? "0");
                }
            }
        }
        return offset - 70;
    }

    private fixConnectionInHTML(wantedConnection: HTMLElement | null) {
        if (wantedConnection) {
            const polylines = wantedConnection.getElementsByTagName("polyline");
            if (polylines.length > 1) {
                polylines[1].setAttribute(
                    "points",
                    <string>polylines[0].getAttribute("points"),
                );
            }
        }
    }

    /**
     * marker functions ("markers" are arrowheads of activities)
     */
    private marker(type: string, fill: string, stroke: string) {
        const id = type + "-" + fill + "-" + stroke + "-" + this.rendererId;

        if (!this.markers[id]) {
            this.createMarker(type, fill, stroke);
        }
        return "url(#" + id + ")";
    }

    private createMarker(type: string, fill: string, stroke: string) {
        const id = type + "-" + fill + "-" + stroke + "-" + this.rendererId;

        if (type === "activity") {
            const activityArrow = svgCreate("path");
            svgAttr(activityArrow, { d: "M 1 5 L 11 10 L 1 15 Z" });

            this.addMarker(id, {
                element: activityArrow,
                ref: { x: 11, y: 10 },
                scale: 0.5,
                attrs: {
                    fill: stroke,
                    stroke: stroke,
                },
            });
        }
    }

    private addMarker(id: string, options: any) {
        const attrs = assign(
            {
                fill: "black",
                strokeWidth: 1,
                strokeLinecap: "round",
                strokeDasharray: "none",
            },
            options.attrs,
        );

        const ref = options.ref || { x: 0, y: 0 };
        const scale = options.scale || 1;

        // resetting stroke dash array
        if (attrs.strokeDasharray === "none") {
            attrs.strokeDasharray = [10000, 1];
        }

        const marker = svgCreate("marker");

        svgAttr(options.element, attrs);
        svgAppend(marker, options.element);
        svgAttr(marker, {
            id: id,
            viewBox: "0 0 20 20",
            refX: ref.x,
            refY: ref.y,
            markerWidth: 20 * scale,
            markerHeight: 20 * scale,
            orient: "auto",
        });

        // @ts-expect-error _svg does exist on canvas
        let defs = domQuery("defs", this.canvas._svg);
        if (!defs) {
            defs = svgCreate("defs");
            // @ts-expect-error _svg does exist on canvas
            svgAppend(this.canvas._svg, defs);
        }
        svgAppend(defs, marker);
        this.markers[id] = marker;
    }

    /**
     * Generate the automatic Number for an activity originating from an actor
     */
    private generateActivityNumber(parentGfx: SVGElement, element: Element, box: Box) {
        // whenever we want to edit an activity, it gets redrawn as a new object
        // and the custom information is lost,
        // so we stash it before the editing occurs and set the value here

        const numberStash = getNumberStash();
        const semantic = element.businessObject;

        if (numberStash.use) {
            semantic.number = numberStash.number;
        }

        numbers[semantic.number] = true;
        box.x -= 26;
        box.y -= 16;

        if (semantic.number < 10) {
            box.x += 3;
        }

        const newRenderedNumber = this.renderNumber(
            parentGfx,
            semantic.number,
            this.numberStyle(box),
            element["type"],
        );
        addNumberToRegistry(newRenderedNumber, semantic.number);
    }

    private renderNumber(parentGfx: any, number: number, options: any, type: string) {
        const text = this.domainStoryTextRenderer.createText(String(number), options);

        svgClasses(text).add("djs-labelNumber");

        this.setCoordinates(type, text, options, parentGfx);

        // !IMPORTANT!
        // When converting svg-files via Inkscape or Photoshop, the svg-circle is converted to a black dot that obscures the number.
        // To circumvent this, we draw an arc.
        const circle = svgCreate("path");
        const radius = 11;
        const x = options.box.x + 18 + (number > 9 ? 3 : 0);
        const y = options.box.y - radius + 7;
        svgAttr(circle, {
            d: `
      M ${x} ${y}
      m ${radius},0
      a ${radius},${radius} 0 1,0 ${-radius * 2},0
      a ${radius},${radius} 0 1,0 ${radius * 2},0
      `,
            fill: "white",
            stroke: "black",
        });

        svgAppend(parentGfx, circle);
        svgAppend(parentGfx, text);

        return text;
    }

    /**
     * render the number associated with an activity
     */
    private renderExternalNumber(parentGfx: SVGElement, element: Connection) {
        if (element && element.source) {
            const semantic = element.businessObject;

            const box = numberBoxDefinitions(element);

            if (
                semantic.number == null &&
                element.source["type"] &&
                element.source["type"].includes(ElementTypes.ACTOR)
            ) {
                generateAutomaticNumber(
                    element,
                    this.commandStack,
                    this.elementRegistryService,
                );
            }

            // render the background for the number
            if (semantic.number && element.source["type"].includes(ElementTypes.ACTOR)) {
                this.generateActivityNumber(parentGfx, element, box);
            } else {
                semantic.number = null;
            }
        }
    }

    private numberStyle(box: any) {
        return {
            box: box,
            fitBox: true,
            style: assign({}, this.domainStoryTextRenderer.getExternalStyle(), {
                fill: "black",
                position: "absolute",
            }),
        };
    }

    private setCoordinates(
        type: string,
        text: SVGElement,
        options: any,
        parentGfx: SVGElement,
    ) {
        if (/:activity$/.test(type)) {
            text.innerHTML = this.manipulateInnerHTMLXLabel(
                text.children,
                options.box.x,
                0,
            );
            text.innerHTML = this.manipulateInnerHTMLYLabel(
                text.children,
                options.box.y,
                0,
            );
        } else if (/:actor/.test(type)) {
            const h: string =
                (parentGfx.firstChild as SVGElement)?.getAttribute("height") ?? "";
            text.innerHTML = this.manipulateInnerHTMLYLabel(text.children, h, 0);
        } else if (/:workObject/.test(type)) {
            const h: string =
                (parentGfx.firstChild as SVGElement)?.getAttribute("height") ?? "";
            text.innerHTML = this.manipulateInnerHTMLYLabel(text.children, h, 26);
        }
    }

    /**
     * render a label on the canvas
     */
    private renderLabel(
        parentGfx: SVGElement,
        label: string,
        options: any,
        type?: string,
    ) {
        const text = this.domainStoryTextRenderer.createText(label || "", options);

        svgClasses(text).add("djs-label");
        this.setCoordinates(type ?? "", text, options, parentGfx);

        svgAppend(parentGfx, text);
        return text;
    }

    private renderActorAndWorkObjectLabel(
        parentGfx: SVGElement,
        element: Element,
        align: string,
        padding: number,
    ) {
        const businessObject = element.businessObject;
        return this.renderLabel(
            parentGfx,
            businessObject.name,
            {
                box: element,
                align: align,
                padding: padding ? padding : 0,
                style: {
                    fill: "#000000",
                },
            },
            element["type"],
        );
    }

    /**
     * determine the X-coordinate of the label / number to be rendered
     */
    private manipulateInnerHTMLXLabel(
        children: HTMLCollection,
        x: string,
        offset: number,
    ) {
        if (!children) {
            throw new Error("[DomainStoryRenderer] Parameter children is undefined!");
        }

        let result = "";
        for (let i = 0; i < children.length; i++) {
            result += children[i].outerHTML.replace(
                /x="-?\d*.\d*"/,
                'x="' + (Number(x) + offset + 14) + '"',
            );
        }
        return result;
    }

    /**
     * determine the Y-coordinate of the label / number to be rendered
     */
    private manipulateInnerHTMLYLabel(
        children: HTMLCollection,
        y: string,
        offset: number,
    ) {
        let result = "";
        for (let i = 0; i < children.length; i++) {
            result += children[i].outerHTML.replace(
                /y="-?\d*.\d*"/,
                'y="' + (Number(y) + offset + 14 * i) + '"',
            );
        }
        return result;
    }
}

DomainStoryRenderer.$inject = [
    "eventBus",
    "styles",
    "canvas",
    "commandStack",
    "domainStoryTextRenderer",
    "domainStoryElementRegistryService",
    "domainStoryDirtyFlagService",
    "domainStoryIconDictionaryService",
];

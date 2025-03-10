import { assign } from "min-dash";
import TextUtil, { TextLayoutConfig } from "diagram-js/lib/util/Text";
import { Rect } from "diagram-js/lib/util/Types";

export interface DomainStoryTextRendererStyle {
    fontFamily: string;
    fontSize: number;
    fontWeight: string;
    lineHeight: number;
}

export interface DomainStoryTextRendererConfig {
    defaultStyle?: Partial<DomainStoryTextRendererStyle>;
    externalStyle?: Partial<DomainStoryTextRendererStyle>;
}

const DEFAULT_FONT_SIZE = 12;
const LINE_HEIGHT_RATIO = 1.2;
const MIN_TEXT_ANNOTATION_HEIGHT = 30;

export class DomainStoryTextRenderer {
    static $inject: string[] = [];

    private config: DomainStoryTextRendererConfig;

    private textUtil: TextUtil;

    constructor() {
        // private readonly config: DomainStoryTextRendererConfig) {
        const defaultStyle: DomainStoryTextRendererStyle = {
            fontFamily: "Arial, sans-serif",
            fontSize: DEFAULT_FONT_SIZE,
            fontWeight: "normal",
            lineHeight: LINE_HEIGHT_RATIO,
        };

        const externalStyle = assign(
            defaultStyle,
            {
                fontSize: defaultStyle.fontSize - 1,
            },
            // (config && config.externalStyle) || {},
        );

        this.config = {
            defaultStyle,
            externalStyle,
        };

        this.textUtil = new TextUtil({
            style: this.config.defaultStyle,
        });
    }

    /**
     * Get the new bounds of an externally rendered and arranged label.
     */
    getExternalLabelBounds(bounds: Rect, text: string): Rect {
        const layoutDimensions = this.textUtil.getDimensions(text, {
            box: {
                width: 90,
                height: 30,
            },
            style: this.config.externalStyle,
        });

        // resize label shape to fit label text
        return {
            x: Math.round(bounds.x + bounds.width / 2 - layoutDimensions.width / 2),
            y: Math.round(bounds.y),
            width: Math.ceil(layoutDimensions.width),
            height: Math.ceil(layoutDimensions.height),
        };
    }

    /**
     * Get the new bounds of text annotation.
     */
    getTextAnnotationBounds(bounds: Rect, text: string): Rect {
        const layoutDimensions = this.textUtil.getDimensions(text, {
            box: bounds,
            style: this.config.defaultStyle,
            align: "center-top",
            padding: 5,
        });

        return {
            x: bounds.x,
            y: bounds.y,
            width: bounds.width,
            height: Math.max(
                MIN_TEXT_ANNOTATION_HEIGHT,
                Math.round(layoutDimensions.height),
            ),
        };
    }

    /**
     * Create an arranged text element.
     *
     * @param {string} text
     * @param {TextLayoutConfig} [options]
     *
     * @return {SVGElement} rendered text
     */
    createText(text: string, options: TextLayoutConfig): SVGElement {
        return this.textUtil.createText(text, options || {});
    }

    /**
     * Get the default text style.
     */
    getDefaultStyle() {
        return this.config.defaultStyle;
    }

    /**
     * Get the external text style.
     */
    getExternalStyle() {
        return this.config.externalStyle;
    }
}

// TODO: Does a config exist???
DomainStoryTextRenderer.$inject = ["config.textRenderer"];

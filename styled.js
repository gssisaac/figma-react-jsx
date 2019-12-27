import { getFillColor, rgbToHex } from './utils';
const ALIGNVERTICAL = {
    CNETER: 'middle',
    TOP: 'flex-start',
    BOTTOM: 'flex-end',
};
const ALIGNHORIZONTAL = {
    CNETER: 'center',
    LEFT: 'left',
    RIGHT: 'right',
    JUSTIFIED: 'justify',
};
const FONTWEIGHT = {
    Light: '200',
    Regular: 'normal',
    Medium: '600',
    Bold: 'bold',
    Black: '800',
};
var Position;
(function (Position) {
    Position[Position["relative"] = 0] = "relative";
    Position[Position["absolute"] = 1] = "absolute";
})(Position || (Position = {}));
const CONTAINER_NODES = ['FRAME', 'INSTANCE', 'COMPONENT'];
function getColor(node) {
    let css = '';
    if (node.type === 'TEXT') {
        const fillColor = getFillColor(node);
        if (fillColor) {
            css += `  color: ${fillColor};\n`;
        }
    }
    if (node.type === 'TEXT' || node.type === 'FRAME' || node.type === 'INSTANCE') {
        // Stroke color
        if (node.strokes.length > 0) {
            node.strokes.forEach(stroke => {
                if (stroke.type === 'SOLID') {
                    css += `  border: ${node.strokeWeight}px solid ${rgbToHex(stroke.color)};\n`;
                }
            });
        }
    }
    return css;
}
function getBorder(node) {
    let css = '';
    if (node.type === 'FRAME' || node.type === 'INSTANCE' || node.type === 'COMPONENT') {
        // background
        const fills = (node.fills);
        if (fills.length > 0) {
            fills.forEach(fill => {
                if (fill.type === 'SOLID') {
                    css += `  background: ${rgbToHex(fill.color)};\n`;
                }
            });
        }
        //radius
        //border-radius: 5px;
        if (typeof (node.cornerRadius) === 'number') {
            if (node.cornerRadius > 0) {
                css += `  border-radius: ${node.cornerRadius}px;\n`;
            }
        }
        else {
            if (node.topLeftRadius
                && node.topRightRadius
                && node.bottomRightRadius
                && node.bottomLeftRadius) {
                css += `  border-radius: ${node.topLeftRadius}px ${node.topRightRadius}px ${node.bottomRightRadius}px ${node.bottomLeftRadius}px;\n`;
            }
        }
        // add padding
        if (node.verticalPadding) {
            css += `  padding-top: ${node.verticalPadding}px;\n`;
            css += `  padding-bottom: ${node.verticalPadding}px;\n`;
        }
        if (node.horizontalPadding) {
            css += `  padding-left: ${node.horizontalPadding}px;\n`;
            css += `  padding-right: ${node.horizontalPadding}px;\n`;
        }
    }
    return css;
}
function getTextStyle(node) {
    let css = '';
    if (node.type === 'TEXT') {
        const fontName = (node.fontName);
        // const lineHeight = <LineHeight>(node.lineHeight)
        css += `  font-size: ${Number(node.fontSize)}px;\n`;
        // css += node.lineHeight ? `  line-height: ${<LineHeight>(node.lineHeight)}px;\n`: ''
        css += fontName.family ? `  font-family: ${fontName.family};\n` : '';
        css += FONTWEIGHT[fontName.style] ? `  font-weight: ${FONTWEIGHT[fontName.style]};\n` : '';
        css += ALIGNHORIZONTAL[node.textAlignHorizontal] ? `  text-align: ${ALIGNHORIZONTAL[node.textAlignHorizontal]};\n` : '';
        css += ALIGNVERTICAL[node.textAlignVertical] ? `  vertical-align: ${ALIGNVERTICAL[node.textAlignVertical]};\n` : '';
        // css += node.letterSpacing ? `  letter-spacing: ${<LetterSpacing>(node.letterSpacing)}em;\n`: ''
        // if not auto layout, we set specific width and height
        css += `  line-height: ${node.height}px;\n`;
    }
    return css;
}
function getSize(node) {
    let css = '';
    css += `  width: ${node.width}px;\n`;
    css += `  height: ${node.height}px;\n`;
    return css;
}
function isFlex(node) {
    if (!node) {
        return false;
    }
    if (node.type === 'FRAME' || node.type === 'INSTANCE' || node.type === 'COMPONENT') {
        if (node.layoutMode === 'HORIZONTAL' || node.layoutMode === 'VERTICAL') {
            return true;
        }
    }
    return false;
}
function getFlexItemSpacing(node) {
    let css = '';
    // Auto layout: item spacing to margin
    if (node.layoutMode === 'HORIZONTAL') {
        css += `  margin-right: ${node.itemSpacing}px;\n`;
    }
    if (node.layoutMode === 'VERTICAL') {
        css += `  margin-bottom: ${node.itemSpacing}px;\n`;
    }
    return css;
}
function getPosition(node, position) {
    let css = '';
    const { vertical, horizontal } = node.constraints;
    switch (horizontal) {
        case 'MIN':
            css += `  left: ${node.x}px;\n`;
            break;
        case 'CENTER':
            css += `  left: calc(50% - ${node.width}px/2);\n`;
            break;
        case 'MAX':
            css += `  right: ${node.parent.width - (node.width + node.x)}px;\n`;
            break;
    }
    switch (vertical) {
        case 'MIN':
            css += `  top: ${node.y}px;\n`;
            break;
        case 'CENTER':
            css += `  top: calc(50% - ${node.height}px/2);\n`;
            break;
        case 'MAX':
            css += `  bottom: ${node.parent.height - (node.height + node.y)}px;\n`;
            break;
    }
    if (position === Position.absolute) {
        css += `  position: absolute;\n`;
    }
    else {
        // only top parent can have relative
        css += `  position: relative;\n`;
    }
    return css;
}
function containerNode(node) {
    if (node.type in CONTAINER_NODES) {
        return (node);
    }
}
export function getCSSStyles(node) {
    let css = '';
    if (isFlex(node.parent)) {
        css += getFlexItemSpacing(node.parent);
    }
    // if container
    const container = containerNode(node);
    if (container) {
        if (!isFlex(node)) {
            css += getSize(node);
            if (isFlex(node.parent)) {
                css += getPosition(node, Position.relative);
            }
            else {
                css += getPosition(node, Position.absolute);
            }
        }
    }
    else { // leaf node
        css += getSize(node);
        if (!isFlex(node.parent)) {
            css += getPosition(node, Position.absolute);
        }
    }
    return css;
}

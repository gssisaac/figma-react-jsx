// import { getFillColor, isSvgNode } from './utils'
// import { getCSSStyles } from './styled'
function isSvgNode(node) {
    return (node.type === 'FRAME' || node.type === 'INSTANCE' || node.type === 'COMPONENT') && node.children.find(child => child.type === 'VECTOR');
}
function componentToHex(c) {
    const v = Math.round(c * 255);
    var hex = v.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}
function rgbToHex(color) {
    return "#" + componentToHex(color.r) + componentToHex(color.g) + componentToHex(color.b);
}
// function getFillColor(node: FrameNode | TextNode | ComponentNode | VectorNode) {
function getFillColor(node) {
    if (!node.fills) {
        return null;
    }
    let color = null;
    const fills = (node.fills);
    if (fills.length > 0) {
        fills.forEach(fill => {
            if (fill.type === 'SOLID') {
                color = rgbToHex(fill.color);
            }
        });
    }
    return color;
}
// --------------------------- JSX --------------------------------
let totalText = '';
const allNodes = [];
function extractNodes(node) {
    const found = allNodes.find(n => n.name === node.name);
    if (!found) {
        allNodes.push(node);
    }
    if (node.type === 'FRAME' || node.type === 'GROUP' || node.type === 'INSTANCE' || node.type === 'COMPONENT') {
        node.children.forEach((child) => {
            // console.log("child", child)
            extractNodes(child);
        });
    }
}
figma.currentPage.selection.forEach(node => {
    extractNodes(node);
});
// totalText += '// Styled components\n'
function levelTab(level) {
    let tab = '';
    for (let i = 0; i < level; i++) {
        tab += '  ';
    }
    return tab;
}
// let Svgs = ''
// if a frame has vector children, assuming that is svg
const allSvgs = {};
function extractSvg(node) {
    if (node.name in allSvgs) {
        return true;
    }
    // check SVG
    // console.log('splie:', node.name.split(':'))
    // if (node.type === 'FRAME' && node.name.indexOf(':') >= 0 && node.name.split(':')[0] === 'SVG') {
    if ((node.type === 'FRAME' || node.type === 'COMPONENT' || node.type === 'INSTANCE') && isSvgNode(node)) {
        let svg = '';
        svg += `const SVG${node.name} = <svg width="${node.width}" height="${node.height}" viewBox="-${node.x} -${node.y} ${node.width} ${node.width}" fill="none" xmlns="http://www.w3.org/2000/svg">\n`;
        node.children.forEach(vector => {
            if (vector.type === 'VECTOR') {
                const fillColor = getFillColor(vector);
                vector.vectorPaths.forEach(data => {
                    svg += `  <path d="${data.data}" transform="translate(${vector.x}, ${vector.y})" ${fillColor ? 'fill="' + fillColor + '"' : ''}/>\n`;
                });
            }
        });
        svg += '</svg>\n';
        allSvgs[node.name] = svg;
        // Svgs += svg
        return true;
    }
    return false;
}
function extractJsx(node, level) {
    const tab = levelTab(level);
    let text = '';
    if (extractSvg(node)) {
        // text += `${tab}<${node.name} src={SVG_${node.name}}/>\n`
        text += `${tab}<${node.name}>\n`;
        text += `${tab}  {SVG${node.name}}\n`;
        text += `${tab}</${node.name}>\n`;
        return text;
    }
    if ((node.type === 'FRAME' || node.type === 'GROUP' || node.type === 'COMPONENT' || node.type === 'INSTANCE') && node.children.length > 0) {
        text += `${tab}<${node.name}>\n`;
        node.children.forEach(child => {
            text += extractJsx(child, level + 1);
        });
        text += `${tab}</${node.name}>\n`;
    }
    else if (node.type === 'TEXT') {
        text += `${tab}<${node.name}>${node.characters}</${node.name}>\n`;
    }
    else if (isSvgNode(node)) {
        text += `${tab}<${node.name}/>\n`;
    }
    else {
        text += `${tab}<${node.name}/>\n`;
    }
    return text;
}
figma.currentPage.selection.forEach(head => {
    const text = extractJsx(head, 2);
    let styledComponents = getCSSStyles(head, true);
    allNodes.forEach(node => {
        console.log(`node[${node.name}]: `, node);
        if (node !== head) {
            const text = getCSSStyles(node, false);
            if (text) {
                styledComponents += text + '\n';
            }
        }
    });
    const jsx = `
import React from 'react'
import styled from 'styled-components'

function ${head.name}Component() {
  return (
${text}
  )
}

// Styled components
${styledComponents}

export default ${head.name}Component
`;
    // console.log(jsx)
    totalText += jsx + '\n';
    totalText += '// SVGS \n';
    for (const svg in allSvgs) {
        totalText += allSvgs[svg] + '\n';
    }
});
// allNodes.forEach(node => {
//   console.log('node:', node)
// })
console.log(totalText);
// enum NodePosition {
//   relative = 1, 
//   absolute = 2,
// }
// const relative = 'relative'
// const absolute = 'absolute'
// const CONTAINER_NODES = ['FRAME', 'INSTANCE', 'COMPONENT']
function cssColorStyle(node) {
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
function cssFrameStyle(node) {
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
function cssTextStyle(node) {
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
function cssSize(node) {
    let css = '';
    css += `  width: ${node.width}px;\n`;
    css += `  height: ${node.height}px;\n`;
    return css;
}
function isAutoLayout(node) {
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
function isParentAutoLayout(node) {
    if (node.parent && (node.parent.type === 'FRAME' || node.parent.type === 'INSTANCE' || node.parent.type === 'COMPONENT')) {
        if (node.parent.layoutMode === 'HORIZONTAL' || node.parent.layoutMode === 'VERTICAL') {
            return true;
        }
    }
    return false;
}
function cssAutoLayoutItemSpacing(node) {
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
function cssConstraints(node) {
    let css = '';
    if (node.constraints) {
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
    }
    return css;
}
function cssPosition(position) {
    return `  position: ${position};\n`;
}
function cssAutoLayout(node) {
    let css = '';
    let autoLayout = false;
    if (node.type === 'FRAME' || node.type === 'INSTANCE' || node.type === 'COMPONENT') {
        // Auto layout
        if (node.layoutMode === 'HORIZONTAL') {
            css += `  display: flex;\n`;
            css += `  flex-direction: row;\n`;
            css += `  align-content: space-between;\n`;
            autoLayout = true;
        }
        else if (node.layoutMode === 'VERTICAL') {
            css += `  display: flex;\n`;
            css += `  flex-direction: column;\n`;
            css += `  align-content: space-between;\n`;
            autoLayout = true;
        }
        if (!autoLayout) {
            css += `  position: relative;\n`;
        }
    }
    return css;
}
// function containerNode(node: SceneNode): ContainerNode {
//   if (node.type in CONTAINER_NODES) {
//     return <ContainerNode>(node)
//   }
// }
function getTag(node) {
    let tag = 'div';
    if (node.type === 'TEXT') {
        tag = 'div';
    }
    else if (isSvgNode(node)) {
        tag = 'div';
    }
    return tag;
}
function cssComment(comment) {
    return `  /* ${comment} */\n`;
}
// get css for a node
function getCSSStyles(node, isHead) {
    let css = '';
    if (!node) {
        return '';
    }
    if (node.type == 'VECTOR') {
        return '';
    }
    css += `const ${node.name} = styled.${getTag(node)}` + "`\n";
    if (isParentAutoLayout(node)) {
        css += cssAutoLayoutItemSpacing(node.parent);
    }
    else {
        css += cssSize(node);
        css += cssConstraints(node);
    }
    css += cssColorStyle(node);
    // if head, we set size
    if (isHead) {
        css += cssComment('Head');
        css += cssSize(node);
    }
    // if container
    if (node.type === 'FRAME' || node.type === 'INSTANCE' || node.type === 'COMPONENT') {
        if (isAutoLayout(node)) {
            css += cssComment('Auto layout');
            css += cssAutoLayout(node);
            if (isParentAutoLayout(node)) {
            }
            else {
                css += cssPosition('absolute');
            }
        }
        else {
            if (isParentAutoLayout(node)) {
                css += cssPosition('relative');
            }
            else {
                // console.log(`${node.name} is Frame, and parent ${node.parent.name} is Frame`)
                css += cssPosition('absolute');
            }
        }
        css += cssFrameStyle(node);
    }
    else { // leaf node
        if (!isParentAutoLayout(node)) {
            css += cssPosition('absolute');
        }
        // get specific styles
        if (node.type === 'TEXT') {
            css += cssTextStyle(node);
        }
    }
    css += '`\n';
    return css;
}

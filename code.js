// This plugin creates 5 rectangles on the screen.
// const numberOfRectangles = 5
// This file holds the main code for the plugins. It has access to the *document*.
// You can access browser APIs such as the network by creating a UI which contains
// a full browser environment (see documentation).
// const nodes: SceneNode[] = [];
// for (let i = 0; i < numberOfRectangles; i++) {
//   const rect = figma.createRectangle();
//   rect.x = i * 150;
//   rect.fills = [{type: 'SOLID', color: {r: 1, g: 0.5, b: 0}}];
//   figma.currentPage.appendChild(rect);
//   nodes.push(rect);
// }
// figma.currentPage.selection = nodes;
// figma.viewport.scrollAndZoomIntoView(nodes);
function componentToHex(c) {
    const v = Math.round(c * 255);
    var hex = v.toString(16);
    console.log('hex:', c, v, hex);
    return hex.length == 1 ? "0" + hex : hex;
}
function rgbToHex(color) {
    return "#" + componentToHex(color.r) + componentToHex(color.g) + componentToHex(color.b);
}
function getFillColor(node) {
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
function isSvgNode(node) {
    return (node.type === 'FRAME' || node.type === 'INSTANCE' || node.type === 'COMPONENT') && node.children.find(child => child.type === 'VECTOR');
}
function alignByContraints(node) {
    let text = '';
    if (node.parent.type === 'FRAME' || node.parent.type === 'COMPONENT') {
        // constraints
        const { vertical, horizontal } = node.constraints;
        switch (horizontal) {
            case 'MIN':
                text += `  left: ${node.x}px;\n`;
                break;
            case 'CENTER':
                text += `  left: calc(50% - ${node.width}px/2);\n`;
                break;
            case 'MAX':
                text += `  right: ${node.parent.width - (node.width + node.x)}px;\n`;
                break;
        }
        switch (vertical) {
            case 'MIN':
                text += `  top: ${node.y}px;\n`;
                break;
            case 'CENTER':
                text += `  top: calc(50% - ${node.height}px/2);\n`;
                break;
            case 'MAX':
                text += `  bottom: ${node.parent.height - (node.height + node.y)}px;\n`;
                break;
        }
    }
    if (text.length > 0) {
        text += `  position: absolute;\n`;
    }
    else {
        // only top parent can have relative
        text += `  position: relative;\n`;
    }
    return text;
}
// --------------------------- CSS --------------------------------
function styledComponent(node) {
    if (node.type === 'VECTOR') {
        return;
    }
    // console.log('node:', node.name)
    let text = '';
    let tag = 'div';
    if (node.type === 'TEXT') {
        tag = 'div';
    }
    else if (isSvgNode(node)) {
        tag = 'img';
    }
    text += `const ${node.name} = styled.${tag}` + "`\n";
    if (node.type === 'TEXT') {
        const fillColor = getFillColor(node);
        if (fillColor) {
            text += `  color: ${fillColor};\n`;
        }
    }
    if (node.type === 'TEXT' || node.type === 'FRAME' || node.type === 'INSTANCE') {
        // Stroke color
        if (node.strokes.length > 0) {
            node.strokes.forEach(stroke => {
                if (stroke.type === 'SOLID') {
                    text += `  border: ${node.strokeWeight}px solid ${rgbToHex(stroke.color)};\n`;
                }
            });
        }
    }
    // check parent container
    let parentAutoLayout = false;
    if (node.parent && (node.parent.type === 'FRAME' || node.parent.type === 'INSTANCE' || node.parent.type === 'COMPONENT')) {
        if (node.parent.layoutMode === 'HORIZONTAL' || node.parent.layoutMode === 'VERTICAL') {
            parentAutoLayout = true;
            // Auto layout: item spacing to margin
            if (node.parent.layoutMode === 'HORIZONTAL') {
                text += `  margin-right: ${node.parent.itemSpacing}px;\n`;
            }
            if (node.parent.layoutMode === 'VERTICAL') {
                text += `  margin-bottom: ${node.parent.itemSpacing}px;\n`;
            }
        }
    }
    // if not auto layout, we set specific width and height
    if (!parentAutoLayout) {
        text += `  width: ${node.width}px;\n`;
        text += `  height: ${node.height}px;\n`;
        if (node.type === 'FRAME' || node.type === 'INSTANCE' || node.type === 'TEXT') {
            text += alignByContraints(node);
        }
    }
    console.log('node:', node.name, 'parent', node.parent, 'auto:', parentAutoLayout);
    // check auto layout
    if (node.type === 'FRAME' || node.type === 'INSTANCE' || node.type === 'COMPONENT') {
        // Auto layout
        if (node.layoutMode === 'HORIZONTAL') {
            text += `  display: flex;\n`;
            text += `  flex-direction: row;\n`;
            text += `  align-content: space-between;\n`;
        }
        else if (node.layoutMode === 'VERTICAL') {
            text += `  display: flex;\n`;
            text += `  flex-direction: column;\n`;
            text += `  align-content: space-between;\n`;
        }
    }
    if (node.type === 'FRAME' || node.type === 'INSTANCE') {
        // background
        const fills = (node.fills);
        if (fills.length > 0) {
            fills.forEach(fill => {
                if (fill.type === 'SOLID') {
                    text += `  background: ${rgbToHex(fill.color)};\n`;
                }
            });
        }
        //radius
        //border-radius: 5px;
        if (typeof (node.cornerRadius) === 'number') {
            if (node.cornerRadius > 0) {
                text += `  border-radius: ${node.cornerRadius}px;\n`;
            }
        }
        else {
            if (node.topLeftRadius
                && node.topRightRadius
                && node.bottomRightRadius
                && node.bottomLeftRadius) {
                text += `  border-radius: ${node.topLeftRadius}px ${node.topRightRadius}px ${node.bottomRightRadius}px ${node.bottomLeftRadius}px;\n`;
            }
        }
        // add padding
        if (node.verticalPadding) {
            text += `  padding-top: ${node.verticalPadding}px;\n`;
            text += `  padding-bottom: ${node.verticalPadding}px;\n`;
        }
        if (node.horizontalPadding) {
            text += `  padding-left: ${node.horizontalPadding}px;\n`;
            text += `  padding-right: ${node.horizontalPadding}px;\n`;
        }
        // // Auto layout: item spacing to margin
        // if (node.parent && node.parent.type === 'FRAME' && node.parent.layoutMode === 'HORIZONTAL') {
        //   text += `  margin-right: ${node.parent.itemSpacing}px;\n`
        // }
        // if (node.parent && node.parent.type === 'FRAME' && node.parent.layoutMode === 'VERTICAL') {
        //   text += `  margin-bottom: ${node.parent.itemSpacing}px;\n`
        // }
    }
    else if (node.type === 'TEXT') {
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
        const fontName = (node.fontName);
        // const lineHeight = <LineHeight>(node.lineHeight)
        text += `  font-size: ${Number(node.fontSize)}px;\n`;
        // text += node.lineHeight ? `  line-height: ${<LineHeight>(node.lineHeight)}px;\n`: ''
        text += fontName.family ? `  font-family: ${fontName.family};\n` : '';
        text += FONTWEIGHT[fontName.style] ? `  font-weight: ${FONTWEIGHT[fontName.style]};\n` : '';
        text += ALIGNHORIZONTAL[node.textAlignHorizontal] ? `  text-align: ${ALIGNHORIZONTAL[node.textAlignHorizontal]};\n` : '';
        text += ALIGNVERTICAL[node.textAlignVertical] ? `  vertical-align: ${ALIGNVERTICAL[node.textAlignVertical]};\n` : '';
        // text += node.letterSpacing ? `  letter-spacing: ${<LetterSpacing>(node.letterSpacing)}em;\n`: ''
        // Auto layout
        // if not auto layout, we set specific width and height
        text += `  width: ${node.width}px;\n`;
        text += `  height: ${node.height}px;\n`;
        // text += alignByContraints(node)
        // })
    }
    // alignment
    text += '`';
    return text;
}
// --------------------------- JSX --------------------------------
let totalText = '';
const allNodes = [];
function extractNodes(node) {
    allNodes.push(node);
    if (node.type === 'FRAME' || node.type === 'GROUP') {
        // const found = allNodes.find(n => n.name === node.name)
        // if (!found) {
        // }
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
// allNodes.forEach(node => {
//   const text = styledComponent(node)
//   totalText += text + '\n'
// })
function levelTab(level) {
    let tab = '';
    for (let i = 0; i < level; i++) {
        tab += '  ';
    }
    return tab;
}
let Svgs = '';
// if a frame has vector children, assuming that is svg
function extractSvg(node) {
    // check SVG
    // console.log('splie:', node.name.split(':'))
    // if (node.type === 'FRAME' && node.name.indexOf(':') >= 0 && node.name.split(':')[0] === 'SVG') {
    if ((node.type === 'FRAME' || node.type === 'COMPONENT' || node.type === 'INSTANCE') && isSvgNode(node)) {
        console.log('svg found');
        let svg = '';
        svg += `<svg width="${node.width}" height="${node.height}" viewBox="0 0 ${node.width} ${node.width}" fill="none" xmlns="http://www.w3.org/2000/svg">\n`;
        node.children.forEach(vector => {
            if (vector.type === 'VECTOR') {
                const fillColor = getFillColor(vector);
                vector.vectorPaths.forEach(data => {
                    svg += `  <path d="${data.data}" ${fillColor ? 'fill="' + fillColor + '"' : ''}/>\n`;
                });
            }
        });
        svg += '</svg>\n';
        Svgs += svg;
        return true;
    }
    return false;
}
function extractJsx(node, level) {
    if (extractSvg(node)) {
        return;
    }
    const tab = levelTab(level);
    let text = '';
    if ((node.type === 'FRAME' || node.type === 'GROUP') && node.children.length > 0) {
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
// console.log('// JSX')
// totalText += '// functional component\n'
figma.currentPage.selection.forEach(node => {
    const text = extractJsx(node, 2);
    // totalText += '// Styled components\n'
    let styledComponents = '';
    allNodes.forEach(node => {
        const text = styledComponent(node);
        if (text) {
            styledComponents += text + '\n';
        }
    });
    const jsx = `
import React from 'react'
import styled from 'styled-components'

function ${node.name}Component() {
  return (
${text}
  )
}

// Styled components
${styledComponents}

export default ${node.name}Component
`;
    // console.log(jsx)
    totalText += jsx + '\n';
    totalText += '// SVGS \n';
    totalText += Svgs + '\n';
});
allNodes.forEach(node => {
    console.log('node:', node);
});
console.log(totalText);
// const copytexts = <HTMLTextAreaElement>(document.createElement('textarea'))
// document.body.appendChild(copytexts)
// copytexts.innerHTML = totalText
// // copytexts.select();
// // document.execCommand("copy");
// document.body.removeChild(copytexts)
// Make sure to close the plugin when you're done. Otherwise the plugin will
// keep running, which shows the cancel button at the bottom of the screen.
// figma.closePlugin();

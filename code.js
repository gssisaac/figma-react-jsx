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
    return (node.type === 'FRAME' || node.type === 'COMPONENT') && node.children.find(child => child.type === 'VECTOR');
}
function styledComponent(node) {
    if (node.type === 'VECTOR') {
        return;
    }
    // console.log('node:', node.name)
    let text = '';
    let tag = 'div';
    if (node.type === 'TEXT') {
        tag = 'p';
    }
    else if (isSvgNode(node)) {
        tag = 'img';
    }
    text += `const ${node.name} = styled.${tag}` + "`\n";
    text += `  width: ${node.width};\n`;
    text += `  height: ${node.height};\n`;
    if (node.type === 'TEXT') {
        const fillColor = getFillColor(node);
        if (fillColor) {
            text += `  color: ${fillColor}};\n`;
        }
    }
    if (node.type === 'TEXT' || node.type === 'FRAME') {
        // Stroke color
        if (node.strokes.length > 0) {
            node.strokes.forEach(stroke => {
                if (stroke.type === 'SOLID') {
                    text += `  border: ${node.strokeWeight}px solid ${rgbToHex(stroke.color)};\n`;
                }
            });
        }
    }
    if (node.type === 'FRAME') {
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
            text += `  border-radius: ${node.cornerRadius}px;\n`;
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
            text += `  padding-top: ${node.verticalPadding};\n`;
            text += `  padding-bottom: ${node.verticalPadding};\n`;
        }
        if (node.horizontalPadding) {
            text += `  padding-left: ${node.horizontalPadding};\n`;
            text += `  padding-right: ${node.horizontalPadding};\n`;
        }
        // Auto layout: item spacing to margin
        if (node.parent && node.parent.type === 'FRAME' && node.parent.layoutMode === 'HORIZONTAL') {
            text += `  margin: ${node.parent.itemSpacing}px 0px;\n`;
        }
        if (node.parent && node.parent.type === 'FRAME' && node.parent.layoutMode === 'VERTICAL') {
            text += `  margin: 0px ${node.parent.itemSpacing}px;\n`;
        }
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
        switch (node.layoutAlign) {
            case 'MIN':
                text += `  align-self: flex-start;\n`;
                break;
            case 'CENTER':
                text += `  align-self: center;\n`;
                break;
            case 'MAX':
                text += `  align-self: flex-end;\n`;
                break;
        }
    }
    else if (node.type === 'TEXT') {
        // font-family: Roboto;
        // font-style: normal;
        // font-weight: normal;
        // font-size: 12px;
        // line-height: 14px;
        // color: #000000;
        // /* Inside Auto Layout */
        // flex: none;
        // order: 1;
        // align-self: center;
        // margin: 6px 0px;
        const ALIGNVERTICAL = {
            CNETER: 'center',
            TOP: 'flex-start',
            BOTTOM: 'flex-end',
        };
        const ALIGNHORIZONTAL = {
            CNETER: 'center',
            TOP: 'flex-start',
            BOTTOM: 'flex-end',
        };
        const fontName = (node.fontName);
        // const lineHeight = <LineHeight>(node.lineHeight)
        text += `  font-size: ${Number(node.fontSize)}px;\n`;
        // text += node.lineHeight ? `  line-height: ${<LineHeight>(node.lineHeight)}px;\n`: ''
        text += fontName.family ? `  font-family: ${fontName.family};\n` : '';
        text += fontName.style ? `  font-weight: ${fontName.style};\n` : '';
        text += node.textAlignHorizontal ? `  text-align: ${ALIGNVERTICAL[node.textAlignHorizontal]};\n` : '';
        text += node.textAlignVertical ? `  algin-items: ${ALIGNHORIZONTAL[node.textAlignVertical]};\n` : '';
        // text += node.letterSpacing ? `  letter-spacing: ${<LetterSpacing>(node.letterSpacing)}em;\n`: ''
        // figma.loadFontAsync(node.getRangeFontName(0, node.characters.length - 1))
        // .then(font => {
        // })
    }
    text += '`';
    return text;
}
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
// for (let i = 0; i < figma.currentPage.selection.length; i++) {
//   extractNodes(figma.currentPage.selection[i])
// }
// console.log('allNodes:', allNodes)
// console.log('// Styled components')
totalText += '// Styled components\n';
allNodes.forEach(node => {
    const text = styledComponent(node);
    // console.log('  --- ')
    // console.log(text)
    totalText += text + '\n';
});
function levelTab(level) {
    let tab = '';
    for (let i = 0; i < level; i++) {
        tab += '  ';
    }
    return tab;
}
let Svgs = '';
// <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
// <path d="M12.9725 4.63002C12.7025 4.24752 12.2525 4.00002 11.75 4.00002L3.5 4.00752C2.675 4.00752 2 4.67502 2 5.50002V13C2 13.825 2.675 14.4925 3.5 14.4925L11.75 14.5C12.2525 14.5 12.7025 14.2525 12.9725 13.87L16.25 9.25002L12.9725 4.63002Z" fill="#C92892"/>
// </svg>
// if a frame has vector children, assuming that is svg
function extractJsx(node, level) {
    // check SVG
    // console.log('splie:', node.name.split(':'))
    // if (node.type === 'FRAME' && node.name.indexOf(':') >= 0 && node.name.split(':')[0] === 'SVG') {
    if ((node.type === 'FRAME' || node.type === 'COMPONENT') && isSvgNode(node)) {
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
        // return ''
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
totalText += '// functional component\n';
figma.currentPage.selection.forEach(node => {
    const text = extractJsx(node, 2);
    const jsx = `
function Component(props: Props) {
  return (
${text}
  )
}
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

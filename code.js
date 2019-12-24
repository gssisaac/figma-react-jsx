// This plugin creates 5 rectangles on the screen.
const numberOfRectangles = 5;
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
    text += `const ${node.name} = styled.${tag}` + "`\n";
    text += `  width: ${node.width};\n`;
    text += `  height: ${node.height};\n`;
    if (node.type === 'FRAME') {
        node.backgrounds.forEach(background => {
        });
        if (node.strokes.length > 0) {
            node.strokes.forEach(stroke => {
                if (stroke.type === 'SOLID') {
                    text += `  border: ${node.strokeWeight}px solid #${stroke.color.r};\n`;
                }
            });
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
        if (node.layoutMode === 'HORIZONTAL') {
            text += `  flex-direction: row;\n`;
            text += `  align-content: space-between;\n`;
        }
        else if (node.layoutMode === 'VERTICAL') {
            text += `  flex-direction: column;\n`;
            text += `  align-content: space-between;\n`;
        }
    }
    else if (node.type === 'TEXT') {
        text += `  font-size: ${Number(node.fontSize)}px;\n`;
    }
    text += '`';
    return text;
}
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
console.log('// Styled components');
allNodes.forEach(node => {
    const text = styledComponent(node);
    // console.log('  --- ')
    console.log(text);
});
function levelTab(level) {
    let tab = '';
    for (let i = 0; i < level; i++) {
        tab += '  ';
    }
    return tab;
}
function extractJsx(node, level) {
    if (node.type === 'VECTOR') {
        return '';
    }
    const tab = levelTab(level);
    let text = '';
    if (node.type === 'FRAME' && node.children.length > 0) {
        text += `${tab}<${node.name}>\n`;
        node.children.forEach(child => {
            text += extractJsx(child, level + 1);
        });
        text += `${tab}</${node.name}>\n`;
    }
    else {
        text += `${tab}<${node.name}/>\n`;
    }
    return text;
}
console.log('// JSX');
allNodes.forEach(node => {
    const text = extractJsx(node, 0);
    console.log(text);
});
// Make sure to close the plugin when you're done. Otherwise the plugin will
// keep running, which shows the cancel button at the bottom of the screen.
figma.closePlugin();

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
import { getFillColor, isSvgNode } from './utils';
import { styledComponent } from './styled';
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
    for (const svg in allSvgs) {
        totalText += allSvgs[svg] + '\n';
    }
});
// allNodes.forEach(node => {
//   console.log('node:', node)
// })
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

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
let imports = [];
let allProps = [];
let allFunctions = [];
const allNodes = [];
function extractAllNodes(node) {
    const found = allNodes.find(n => n.name === node.name);
    if (node.parent.type === 'INSTANCE' && !isSvgNode(node)) {
        return;
    }
    if (!found) {
        allNodes.push(node);
    }
    if (node.type === 'FRAME' || node.type === 'GROUP' || node.type === 'COMPONENT') {
        node.children.forEach((child) => {
            // console.log("child", child)
            extractAllNodes(child);
        });
    }
}
figma.currentPage.selection.forEach(node => {
    extractAllNodes(node);
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
    const nodeName = clearName(node.name);
    // check SVG
    if ((node.type === 'FRAME' || node.type === 'COMPONENT' || node.type === 'INSTANCE') && isSvgNode(node)) {
        let svg = '';
        svg += `const SVG${nodeName} = <svg width='${node.width}' height='${node.height}' viewBox='0 0 ${node.width} ${node.width}' fill='none' xmlns='http://www.w3.org/2000/svg'>\n`;
        node.children.forEach(vector => {
            if (vector.type === 'VECTOR') {
                const fillColor = getFillColor(vector);
                vector.vectorPaths.forEach(data => {
                    svg += `  <path d='${data.data}' transform='translate(${vector.x}, ${vector.y})' ${fillColor ? `fill='${fillColor}'` : ''}/>\n`;
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
function extractPropsAll(node) {
    const { nodeName, params } = parseNodeName(node.name);
    let prop = null;
    let onClick = '';
    let onClickProp = '';
    if (params && params.props) {
        prop = params.props;
    }
    if (prop) {
        allProps.push(`${prop}: string`);
    }
    if (params && params.clickProps) {
        onClick = ` onClick={props.${params.clickProps}}`;
        const name = `${params.clickProps}: () => void`;
        if (!allProps.find(prop => prop === name)) {
            allProps.push(name);
        }
    }
    if (params && params.click) {
        onClick = ` onClick={${params.click}}`;
        const name = `  const ${params.click} = () => {
  }
`;
        if (!allFunctions.find(func => func === name)) {
            allFunctions.push(name);
        }
    }
    if (params && params.hover) {
        // styles += '  ${' + params.hover + '}'
    }
    return { prop, onClick, onClickProp };
}
function extractProps(params) {
    let prop = null;
    if (params) {
        if (params.props) {
            prop = params.props;
        }
        if (prop) {
            allProps.push(`${prop}: string`);
        }
    }
    return prop;
}
function extractVisible(params) {
    let value = null;
    if (params) {
        if (params.visible) {
            value = params.visible;
        }
    }
    return value;
}
// rule
/*
  visible
  $visible: prop=thumbnail
  $visible: hoverOn
  $visible: hoverOff
  
  value
  $value: prop=MenuItem     #inside children
  
  props
  - put props inside props area
  $props: onClick=onTabClicked

  hoverProvider:self
  - self pover provider
  
  <ThumbnailImage onClick={props.onTabClicked}/>

  $props: src=props.thumbnail

  <ThumbnailImage src={props.thumbnail}/>

  style
  - put into style area
  $style: hover=
*/
function extractJsx(node, level, baseProps) {
    const tab = levelTab(level);
    let text = '';
    // const nodeName = clearName(node.name)
    const { nodeName, params } = parseNodeName(node.name);
    const { prop, onClick, onClickProp } = extractPropsAll(node);
    // const prop = extractProps(params)
    if (extractSvg(node)) {
        // text += `${tab}<${nodeName} src={SVG_${nodeName}}/>\n`
        text += `${tab}<${nodeName}${baseProps}${onClick}>\n`;
        text += `${tab}  {SVG${nodeName}}\n`;
        text += `${tab}</${nodeName}>\n`;
        return text;
    }
    if ((node.type === 'FRAME' || node.type === 'GROUP' || node.type === 'COMPONENT') && node.children.length > 0) {
        text += `${tab}<${nodeName}${baseProps}${onClick}>\n`;
        node.children.forEach(child => {
            text += extractJsx(child, level + 1, '');
        });
        text += `${tab}</${nodeName}>\n`;
    }
    else if (node.type === 'TEXT') {
        if (prop) {
            text += `${tab}<${nodeName}${baseProps}${onClick}>{props.${prop}}</${nodeName}>\n`;
        }
        else {
            text += `${tab}<${nodeName}${baseProps}${onClick}>${node.characters}</${nodeName}>\n`;
        }
    }
    else if (isSvgNode(node)) {
        text += `${tab}<${nodeName}${baseProps}${onClick}/>\n`;
    }
    else if (isInstanceNode(node)) {
        if (!imports.find(name => name === nodeName)) {
            imports.push(nodeName);
        }
        text += `${tab}<${nodeName}${baseProps}${onClick}/>\n`;
    }
    else {
        text += `${tab}<${nodeName}${baseProps}${onClick}/>\n`;
    }
    return text;
}
function clearName(str) {
    const arr = str.split('$');
    if (arr.length === 0) {
        return str.replace(/\s/g, '').trim();
    }
    else {
        return arr[0].replace(/\s/g, '').trim();
    }
}
function parseNodeName(str) {
    const arr = str.split('$');
    let result = {
        nodeName: arr[0].replace(/\s/g, '').trim(),
    };
    if (arr.length >= 2) {
        let params = {};
        try {
            arr[1].trim().split(',').forEach(param => {
                const values = param.trim().split(':');
                params[values[0]] = values[1].trim();
            });
            result = Object.assign(Object.assign({}, result), { params: params });
        }
        catch (e) {
            console.log(e);
        }
    }
    return result;
}
figma.currentPage.selection.forEach(head => {
    const text = extractJsx(head, 2, ' {...props}');
    let styledComponents = getCSSStyles(head, true);
    allNodes.forEach(node => {
        // console.log(`node[${node.name}]: `, node)
        if (node !== head) {
            const text = getCSSStyles(node, false);
            if (text) {
                styledComponents += text + '\n';
            }
        }
    });
    let importsText = '';
    imports.forEach(nodeName => importsText += `import ${nodeName}Component from './${nodeName}'\n`);
    let propsText = '';
    allProps.forEach(prop => propsText += `  ${prop}\n`);
    let funcsText = '';
    allFunctions.forEach(func => funcsText += func);
    const jsx = `
import React from 'react'
import styled from 'styled-components'
${importsText}
type Props = {
  className?: string
${propsText}}

function ${clearName(head.name)}Component(props: Props) {
${funcsText}  return (
${text}  )
}

// Styled components

${styledComponents}export default ${clearName(head.name)}Component
`;
    // console.log(jsx)
    totalText += jsx + '\n';
    totalText += '// SVGS\n';
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
figma.closePlugin();
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
    if (node.type === 'TEXT' || node.type === 'FRAME' || node.type === 'INSTANCE' || node.type === 'COMPONENT' || node.type === 'RECTANGLE') {
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
function cssOpacity(node) {
    let css = '';
    if (node.opacity && node.opacity !== 1.0) {
        css += `  opacity: ${node.opacity};\n`;
    }
    return css;
}
function cssFrameStyle(node) {
    let css = '';
    if ((node.type === 'FRAME' || node.type === 'INSTANCE' || node.type === 'COMPONENT') && !isSvgNode(node)) {
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
        //  if (node.verticalPadding) {
        //    css += `  padding-top: ${node.verticalPadding}px;\n`
        //    css += `  padding-bottom: ${node.verticalPadding}px;\n`
        //  }
        //  if (node.horizontalPadding) {
        //    css += `  padding-left: ${node.horizontalPadding}px;\n`
        //    css += `  padding-right: ${node.horizontalPadding}px;\n`
        //  }
        if (node.verticalPadding || node.horizontalPadding) {
            css += `  padding: ${node.verticalPadding}px ${node.horizontalPadding}px;\n`;
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
        // css += `  font-size: ${Number(node.fontSize)}px;\n`;
        // css += fontName.family ?`  font-family: ${fontName.family};\n`: ''
        // css += FONTWEIGHT[fontName.style] ? `  font-weight: ${FONTWEIGHT[fontName.style]};\n`: ''
        // css += ALIGNHORIZONTAL[node.textAlignHorizontal] ? `  text-align: ${ALIGNHORIZONTAL[node.textAlignHorizontal]};\n`: ''
        // css += ALIGNVERTICAL[node.textAlignVertical] ? `  vertical-align: ${ALIGNVERTICAL[node.textAlignVertical]};\n`: ''
        // // css += node.letterSpacing ? `  letter-spacing: ${<LetterSpacing>(node.letterSpacing)}em;\n`: ''
        // // if not auto layout, we set specific width and height
        let styles = '';
        fontName.style.split(' ').forEach(style => {
            styles += FONTWEIGHT[style] ? FONTWEIGHT[style] : style;
            styles += ' ';
        });
        const lineHeight = (node.lineHeight);
        let lineHeightCss = '';
        if (lineHeight.unit === 'PERCENT') {
            lineHeightCss = `/${Number(lineHeight.value)}%`;
        }
        else if (lineHeight.unit === 'PIXELS') {
            lineHeightCss = `/${Number(lineHeight.value)}px`;
        }
        // one line
        css += `  font: ${styles}${Number(node.fontSize)}px${lineHeightCss} ${fontName.family};\n`;
        // wrapping
        css += `  white-space: nowrap;\n`;
        css += `  overflow: hidden;\n`;
        css += `  text-overflow: ellipsis;\n`;
    }
    return css;
}
function cssSize(node) {
    let css = '';
    let needWidth = true;
    if (node.type === 'TEXT' && isParentAutoLayout(node)) {
        // by default do not set width for text, only parent is auto layout
        needWidth = false;
    }
    if (needWidth) {
        css += `  width: ${node.width}px;\n`;
    }
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
    // except for last child
    const children = node.parent.children;
    const lastOne = (children.length > 0 && children[children.length - 1] === node);
    // Auto layout: item spacing to margin
    if (!lastOne) {
        if (node.parent.itemSpacing > 0) {
            if (node.parent.layoutMode === 'HORIZONTAL') {
                css += `  margin-right: ${node.parent.itemSpacing}px;\n`;
            }
            if (node.parent.layoutMode === 'VERTICAL') {
                css += `  margin-bottom: ${node.parent.itemSpacing}px;\n`;
            }
        }
    }
    // console.log(`node: ${node.name}, layout:${node.layoutAlign}`)
    //alignment
    const LAYOUTALIGN = {
        CENTER: 'center',
        MIN: 'flex-start',
        MAX: 'flex-end',
    };
    if (node.layoutAlign in LAYOUTALIGN) {
        css += `  align-self: ${LAYOUTALIGN[node.layoutAlign]};\n`;
    }
    // console.log('css:', css)
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
            case 'SCALE':
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
            case 'SCALE':
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
    if (node.type === 'FRAME' || node.type === 'INSTANCE' || node.type === 'COMPONENT') {
        // Auto layout
        css += `  display: flex;\n`;
        if (node.layoutMode === 'HORIZONTAL') {
            css += `  flex-direction: row;\n`;
        }
        else if (node.layoutMode === 'VERTICAL') {
            css += `  flex-direction: column;\n`;
        }
    }
    return css;
}
// function containerNode(node: SceneNode): ContainerNode {
//   if (node.type in CONTAINER_NODES) {
//     return <ContainerNode>(node)
//   }
// }
function isImageNode(node) {
    let image = false;
    if (node.type === 'RECTANGLE') {
        const fills = (node.fills);
        fills.forEach(fill => {
            if (fill.type === 'IMAGE') {
                image = true;
            }
        });
    }
    return image;
}
function getTag(node) {
    let tag = 'div';
    if (node.type === 'TEXT') {
        tag = 'span';
    }
    else if (isSvgNode(node)) {
        tag = 'div';
    }
    else if (isImageNode(node)) {
        tag = 'img';
    }
    return tag;
}
function cssComment(comment) {
    return `  /* ${comment} */\n`;
}
function isInstanceNode(node) {
    return node.type === 'INSTANCE' && !isSvgNode(node);
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
    const nodeName = clearName(node.name);
    if (isInstanceNode(node)) {
        css += `const ${nodeName} = styled(${nodeName}Component)` + "`\n";
    }
    else {
        css += `const ${nodeName} = styled.${getTag(node)}` + "`\n";
    }
    // if head, we set size
    if (isHead) {
        css += cssComment('Head');
    }
    else if (isParentAutoLayout(node)) {
        css += cssAutoLayoutItemSpacing(node);
    }
    else {
        css += cssSize(node);
        css += cssComment('Constraints');
        css += cssConstraints(node);
    }
    // if container
    if (node.type === 'FRAME' || node.type === 'INSTANCE' || node.type === 'COMPONENT') {
        if (isAutoLayout(node)) {
            css += cssComment('Auto layout');
            css += cssAutoLayout(node);
            if (isHead) {
                css += cssSize(node);
                css += cssPosition('relative');
            }
            else if (isParentAutoLayout(node)) {
            }
            else {
                css += cssPosition('absolute');
            }
        }
        else {
            if (isHead) {
                css += cssSize(node);
                css += cssPosition('relative');
            }
            else if (isParentAutoLayout(node)) {
                css += cssSize(node);
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
        if (isHead) {
            css += cssSize(node);
            css += cssPosition('relative');
        }
        else if (isParentAutoLayout(node)) {
            css += cssSize(node);
        }
        else {
            css += cssPosition('absolute');
        }
        // get specific styles
        if (node.type === 'TEXT') {
            css += cssTextStyle(node);
        }
    }
    // color except for svg node and instance node
    if (!isSvgNode(node) && !isInstanceNode(node)) {
        css += cssColorStyle(node);
    }
    css += cssOpacity(node);
    // css += cssDebugBorder(node)
    css += '`\n';
    return css;
}
function cssDebugBorder(node) {
    return `  border: 0.2px solid red;\n`;
}

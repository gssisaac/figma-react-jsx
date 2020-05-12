import { getFillColor, rgbToHex, isSvgNode, clearName } from "./utils"


export function cssColorStyle(node: SceneNode): string {
  let css = ''
  if (node.type === 'TEXT') {
    const fillColor = getFillColor(node)
    if (fillColor) {
      css += `  color: ${fillColor};\n`
    }
  }
  
  if (node.type === 'TEXT' || node.type === 'FRAME' || node.type === 'INSTANCE' || node.type === 'COMPONENT' || node.type === 'RECTANGLE') {
    // Stroke color
    if (node.strokes.length > 0) {      
      node.strokes.forEach(stroke => {
        if (stroke.type === 'SOLID') {
          css += `  border: ${node.strokeWeight}px solid ${rgbToHex(stroke.color)};\n`
        }
      })
    }
  }
  return css
}

export function cssOpacity(node): string {
  let css = ''
  if (node.opacity && node.opacity !== 1.0) {
    css += `  opacity: ${node.opacity};\n`
  }
  return css
}

export function cssFrameStyle(node: SceneNode): string {
  let css = ''
  if ((node.type === 'FRAME' || node.type === 'INSTANCE' || node.type === 'COMPONENT') && !isSvgNode(node)) {
   // background
   const fills = <Paint[]>(node.fills)
   if (fills.length > 0) {
     fills.forEach(fill => {
       if (fill.type === 'SOLID') {
         css += `  background: ${rgbToHex(fill.color)};\n`
       }
     })
   }

   //radius
   //border-radius: 5px;
   if (typeof(node.cornerRadius) === 'number') {
     if (node.cornerRadius > 0) {
       css += `  border-radius: ${node.cornerRadius}px;\n`
     }
   } else {
     if (node.topLeftRadius
       && node.topRightRadius
       && node.bottomRightRadius
       && node.bottomLeftRadius) {
       css += `  border-radius: ${node.topLeftRadius}px ${node.topRightRadius}px ${node.bottomRightRadius}px ${node.bottomLeftRadius}px;\n`
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
    css += `  padding: ${node.verticalPadding}px ${node.horizontalPadding}px;\n`
  }
  }
  return css
}

export function cssTextStyle(node: SceneNode): string {
  const ALIGNVERTICAL = {
    CNETER: 'middle',
    TOP: 'flex-start',
    BOTTOM: 'flex-end',
  }
  const ALIGNHORIZONTAL = {
    CNETER: 'center',
    LEFT: 'left',
    RIGHT: 'right',
    JUSTIFIED: 'justify',
  }
  const FONTWEIGHT = {
    Light: '200',
    Regular: 'normal',
    Medium: '600',
    Bold: 'bold',
    Black: '800',
  }
  
  let css = ''
  if (node.type === 'TEXT') {
   
    const fontName = <FontName>(node.fontName)
    // css += `  font-size: ${Number(node.fontSize)}px;\n`;
    // css += fontName.family ?`  font-family: ${fontName.family};\n`: ''
    // css += FONTWEIGHT[fontName.style] ? `  font-weight: ${FONTWEIGHT[fontName.style]};\n`: ''
    // css += ALIGNHORIZONTAL[node.textAlignHorizontal] ? `  text-align: ${ALIGNHORIZONTAL[node.textAlignHorizontal]};\n`: ''
    // css += ALIGNVERTICAL[node.textAlignVertical] ? `  vertical-align: ${ALIGNVERTICAL[node.textAlignVertical]};\n`: ''
    // // css += node.letterSpacing ? `  letter-spacing: ${<LetterSpacing>(node.letterSpacing)}em;\n`: ''
    
    // // if not auto layout, we set specific width and height

    let styles = ''
    if (fontName.style) {
      fontName.style.split(' ').forEach(style => {
        styles += FONTWEIGHT[style] ? FONTWEIGHT[style] : style
        styles += ' '
      })

      const lineHeight = <LineHeight>(node.lineHeight)
      let lineHeightCss = ''
      if (lineHeight.unit === 'PERCENT') {
        lineHeightCss = `/${Number(lineHeight.value)}%`
      } else if (lineHeight.unit === 'PIXELS') {
        lineHeightCss = `/${Number(lineHeight.value)}px`
      }

      // one line
      css += `  font: ${styles}${Number(node.fontSize)}px${lineHeightCss} ${fontName.family};\n`

      // wrapping
      css += `  white-space: nowrap;\n`
      css += `  overflow: hidden;\n`
      css += `  text-overflow: ellipsis;\n`
    }
  }
  return css
}

export function cssSize(node: SceneNode): string {
  let css = ''

  let needWidth = true
  if (node.type === 'TEXT' && isParentAutoLayout(node)) {
    // by default do not set width for text, only parent is auto layout
    needWidth = false
  }
  if (needWidth) {
    css += `  width: ${node.width}px;\n`
  }
  css += `  height: ${node.height}px;\n`
  return css
}


export function isAutoLayout(node: SceneNode): boolean {
  if (!node) {
    return false
  }
  if (node.type === 'FRAME' || node.type === 'INSTANCE' || node.type === 'COMPONENT') {
    if (node.layoutMode === 'HORIZONTAL' || node.layoutMode === 'VERTICAL') {
      return true
    }
  }
  return false
}

export function isParentAutoLayout(node: SceneNode): boolean {
  if (node.parent && (node.parent.type === 'FRAME' || node.parent.type === 'INSTANCE' || node.parent.type === 'COMPONENT')) {
    if (node.parent.layoutMode === 'HORIZONTAL' || node.parent.layoutMode === 'VERTICAL') {
      return true
    }
  }
  return false
}

export function cssAutoLayoutItemSpacing(node): string{
  let css = ''
  // except for last child
  const children = node.parent.children
  const lastOne = (children.length > 0 && children[children.length-1] === node)
  // Auto layout: item spacing to margin
  if (!lastOne) {
    if (node.parent.itemSpacing > 0) {
      if (node.parent.layoutMode === 'HORIZONTAL') {
        css += `  margin-right: ${node.parent.itemSpacing}px;\n`
      }
      if (node.parent.layoutMode === 'VERTICAL') {
        css += `  margin-bottom: ${node.parent.itemSpacing}px;\n`
      }
    }
  }

  // console.log(`node: ${node.name}, layout:${node.layoutAlign}`)

  //alignment
  const LAYOUTALIGN = {
    CENTER: 'center',
    MIN: 'flex-start',
    MAX: 'flex-end',
  }
  if (node.layoutAlign in LAYOUTALIGN) {
    css += `  align-self: ${LAYOUTALIGN[node.layoutAlign]};\n`
  }
  // console.log('css:', css)
  return css
}

export function cssConstraints(node): string {
  let css = ''
  if (node.constraints) {
    const { vertical, horizontal } = node.constraints
    switch (horizontal) {
      case 'MIN':
        css += `  left: ${node.x}px;\n`;
        break
      case 'CENTER':
      case 'SCALE':
            css += `  left: calc(50% - ${node.width}px/2);\n`;
        break
      case 'MAX':
        css += `  right: ${node.parent.width - (node.width + node.x)}px;\n`;
        break
    }
    switch (vertical) {
      case 'MIN':
        css += `  top: ${node.y}px;\n`;
        break
      case 'SCALE':
      case 'CENTER':
        css += `  top: calc(50% - ${node.height}px/2);\n`;
        break
      case 'MAX':
        css += `  bottom: ${node.parent.height - (node.height + node.y)}px;\n`;
        break
    }
  }
  return css
}

export function cssPosition(position: string): string {
  return `  position: ${position};\n`;  
}

export function cssAutoLayout(node: SceneNode): string {
  let css = ''
  if (node.type === 'FRAME' || node.type === 'INSTANCE' || node.type === 'COMPONENT') {
    // Auto layout
    css += `  display: flex;\n`
    if (node.layoutMode === 'HORIZONTAL') {
      css += `  flex-direction: row;\n`
    } else if (node.layoutMode === 'VERTICAL') {
      css += `  flex-direction: column;\n`
    }
  }
  return css
}

// export function containerNode(node: SceneNode): ContainerNode {
//   if (node.type in CONTAINER_NODES) {
//     return <ContainerNode>(node)
//   }
// }

export function isImageNode(node: SceneNode): boolean {
  let image = false
  if (node.type === 'RECTANGLE') {
    const fills = <Paint[]>(node.fills)
    fills.forEach(fill => {
      if (fill.type === 'IMAGE') {
        image = true
      }
    })
  }
  return image
}

export function getTag(node: SceneNode): string {
  let tag = 'div'
  if (node.type === 'TEXT') {
    tag = 'span'
  } else if (isSvgNode(node)) {
    tag = 'div'
  } else if (isImageNode(node)) {
    tag = 'img'
  }
  return tag
}

export function cssComment(comment: string) {
  return `  /* ${comment} */\n`
}

export function isInstanceNode(node: SceneNode) {
  return node.type === 'INSTANCE' && !isSvgNode(node)
}

// get css for a node
export function getCSSStyles(node: SceneNode, isHead: boolean): string {
  let css = ''
  if (!node) {
    return ''
  }
  if (node.type == 'VECTOR') {
    return ''
  }

  const nodeName = clearName(node.name)
  if (isInstanceNode(node)) {
    css += `const ${nodeName} = styled(${nodeName}Component)` + "`\n"
  } else {
    css += `const ${nodeName} = styled.${getTag(node)}` + "`\n"
  }

  // if head, we set size
  if (isHead) {
    css += cssComment('Head')
  } else if (isParentAutoLayout(node)) {
    css += cssAutoLayoutItemSpacing(node)
  } else {
    css += cssSize(node)
    css += cssComment('Constraints')
    css += cssConstraints(node)
  }

  // if container
  if (node.type === 'FRAME' || node.type === 'INSTANCE' || node.type === 'COMPONENT') {
    if (isAutoLayout(node)) {
      css += cssComment('Auto layout')
      css += cssAutoLayout(node)
      if (isHead) {      
        css += cssSize(node)
        css += cssPosition('relative')
      } else if (isParentAutoLayout(node)) {
      } else {
        css += cssPosition('absolute')
      }
    } else {
      if (isHead) {      
        css += cssSize(node)
        css += cssPosition('relative')
      } else if (isParentAutoLayout(node)) {
        css += cssSize(node)
        css += cssPosition('relative')
      } else {
        // console.log(`${node.name} is Frame, and parent ${node.parent.name} is Frame`)
        css += cssPosition('absolute')
      }
    }
    css += cssFrameStyle(node)
  } else { // leaf node
    if (isHead) {      
      css += cssSize(node)
      css += cssPosition('relative')
    } else if (isParentAutoLayout(node)) {
      css += cssSize(node)
    } else {
      css += cssPosition('absolute')
    }

    // get specific styles
    if (node.type === 'TEXT') {
      css += cssTextStyle(node)
    }
  }

  // color except for svg node and instance node
  if (!isSvgNode(node) && !isInstanceNode(node)) {
    css += cssColorStyle(node)
  }
  css += cssOpacity(node)
  // css += cssDebugBorder(node)
  css += '`\n'
  return css
}

export function cssDebugBorder(node) {
  return `  border: 0.2px solid red;\n`
}

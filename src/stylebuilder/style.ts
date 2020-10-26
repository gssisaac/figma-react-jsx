import { getFillColor, rgbToHex } from "../utils"
import { isParentAutoLayout, isSvgNode } from "../identification"
import { COLOR_CODES } from "../config"

export function cssColorStyle(node: SceneNode): string {
  let css = ''

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


//TODO: theme provider
function themeColor(color: string): string {
  let code = color.toUpperCase()


  if (code in COLOR_CODES) {
    code = '${({ theme }) => theme.colors.' + COLOR_CODES[code] + '}'
  }

  return code 
}

export function cssFrameStyle(node: SceneNode): string {
  let css = ''
  if ((node.type === 'FRAME' || node.type === 'INSTANCE' || node.type === 'COMPONENT') && !isSvgNode(node)) {
   // background
   const fills = <Paint[]>(node.fills)
   if (fills.length > 0) {
     fills.forEach(fill => {
       if (fill.type === 'SOLID') {
         const color = rgbToHex(fill.color).toUpperCase()
         console.log(color)
         css += `  background: ${themeColor(color)} !important;\n`
       }
     })
   }

    //radius .. border-radius 
    if (typeof(node.cornerRadius) === 'number') {
      if (node.cornerRadius > 0) {
        if (node.cornerRadius === 4) {
          css += '  ${borders.radius}\n'
        } else {
          css += `  border-radius: ${node.cornerRadius}px;\n`
        }
      }
    } else {
      if (node.topLeftRadius
        && node.topRightRadius
        && node.bottomRightRadius
        && node.bottomLeftRadius) {
        css += `  border-radius: ${node.topLeftRadius}px ${node.topRightRadius}px ${node.bottomRightRadius}px ${node.bottomLeftRadius}px;\n`
      }
    }

    if (node.verticalPadding || node.horizontalPadding) {
      css += `  padding: ${node.verticalPadding}px ${node.horizontalPadding}px;\n`
    }
  }
  return css
}


export function cssSize(node: SceneNode): string {
  let css = ''

  if (node.type !== 'TEXT') {
    if (!isParentAutoLayout(node)) {
      css += `  width: ${node.width}px;\n`
    }
    css += `  height: ${node.height}px;\n`
  }

  // if (node.type !== 'TEXT') {
  //   css += `  height: ${node.height}px;\n`
  // }
  return css
}


const LAYOUTALIGN = {
  // CENTER: 'center',
  MIN: 'flex-start',
  MAX: 'flex-end',
}

export function cssLayoutAlign(node): string {
  let css = ''
  //alignment
  if (node.layoutAlign in LAYOUTALIGN) {
    css += `  align-self: ${LAYOUTALIGN[node.layoutAlign]};\n`
  }
  return css
}


export function cssPosition(position: string): string {
  // return `  position: ${position};\n`;  
  return '  ${relative.position}\n'
}


// export function cssTextStyle(node: SceneNode): string {
//   const FONTWEIGHT = {
//     Light: '200',
//     Regular: 'normal',
//     Medium: '600',
//     Bold: 'bold',
//     Black: '800',
//   }
  
//   let css = ''
//   if (node.type === 'TEXT') {
   
//     const fontName = <FontName>(node.fontName)

//     let styles = ''
//     if (fontName.style) {
//       fontName.style.split(' ').forEach(style => {
//         styles += FONTWEIGHT[style] ? FONTWEIGHT[style] : style
//         styles += ' '
//       })

//       const lineHeight = <LineHeight>(node.lineHeight)
//       let lineHeightCss = ''
//       if (lineHeight.unit === 'PERCENT') {
//         lineHeightCss = `/${Number(lineHeight.value)}%`
//       } else if (lineHeight.unit === 'PIXELS') {
//         lineHeightCss = `/${Number(lineHeight.value)}px`
//       }

//       // one line
//       css += `  font: ${styles}${Number(node.fontSize)}px${lineHeightCss} ${fontName.family};\n`

//       // wrapping
//       css += `  white-space: nowrap;\n`
//       css += `  overflow: hidden;\n`
//       css += `  text-overflow: ellipsis;\n`
//     }
//   }
//   return css
// }

// export function cssAutoLayout(node: SceneNode): string {
//   let css = ''
//   if (node.type === 'FRAME' || node.type === 'INSTANCE' || node.type === 'COMPONENT') {
//     // Auto layout
//     css += `  display: flex;\n`
//     if (node.layoutMode === 'HORIZONTAL') {
//       css += `  flex-direction: row;\n`
//     } else if (node.layoutMode === 'VERTICAL') {
//       css += `  flex-direction: column;\n`
//     }
//   }
//   return css
// }

// export function containerNode(node: SceneNode): ContainerNode {
//   if (node.type in CONTAINER_NODES) {
//     return <ContainerNode>(node)
//   }
// }

// export function cssComment(comment: string) {
//   return `  /* ${comment} */\n`
// }



// export function cssConstraints(node): string {
//   let css = ''
//   //! flex container: center
  // if (node.constraints) {
  //   const { vertical, horizontal } = node.constraints
  //   switch (horizontal) {
  //     case 'MIN':
  //       css += `  left: ${node.x}px;\n`;
  //       break
  //     case 'CENTER':
  //     case 'SCALE':
  //           css += `  left: calc(50% - ${node.width}px/2);\n`;
  //       break
  //     case 'MAX':
  //       css += `  right: ${node.parent.width - (node.width + node.x)}px;\n`;
  //       break
  //   }
  //   switch (vertical) {
  //     case 'MIN':
  //       css += `  top: ${node.y}px;\n`;
  //       break
  //     case 'SCALE':
  //     case 'CENTER':
  //       css += `  top: calc(50% - ${node.height}px/2);\n`;
  //       break
  //     case 'MAX':
  //       css += `  bottom: ${node.parent.height - (node.height + node.y)}px;\n`;
  //       break
  //   }
  // }
//   return css
// }
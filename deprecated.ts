
// export function styledComponent(node: SceneNode) {
//     if (node.type === 'VECTOR') {
//       return
//     }
//     // console.log('node:', node.name)
//     let text = ''
//     let tag = 'div'
//     if (node.type === 'TEXT') {
//       tag = 'div'
//     } else if (isSvgNode(node)) {
//       tag = 'div'
//     }
  
//     text += `const ${node.name} = styled.${tag}` + "`\n"
  
//     if (node.type === 'TEXT') {
//       const fillColor = getFillColor(node)
//       if (fillColor) {
//         text += `  color: ${fillColor};\n`
//       }
//     }
    
//     if (node.type === 'TEXT' || node.type === 'FRAME' || node.type === 'INSTANCE') {
//       // Stroke color
//       if (node.strokes.length > 0) {      
//         node.strokes.forEach(stroke => {
//           if (stroke.type === 'SOLID') {
//             text += `  border: ${node.strokeWeight}px solid ${rgbToHex(stroke.color)};\n`
//           }
//         })
//       }
//     }
  
//     // check parent container
//     let parentAutoLayout = false
//     if (node.parent && (node.parent.type === 'FRAME' || node.parent.type === 'INSTANCE' || node.parent.type === 'COMPONENT')) {
//       if (node.parent.layoutMode === 'HORIZONTAL' || node.parent.layoutMode === 'VERTICAL') {
//         parentAutoLayout = true
        
//         // Auto layout: item spacing to margin
//         if (node.parent.layoutMode === 'HORIZONTAL') {
//           text += `  margin-right: ${node.parent.itemSpacing}px;\n`
//         }
//         if (node.parent.layoutMode === 'VERTICAL') {
//           text += `  margin-bottom: ${node.parent.itemSpacing}px;\n`
//         }
//       }
//     } 
  
//     // if not auto layout, we set specific width and height
//     if (!parentAutoLayout) {
//       if (node.type === 'FRAME' || node.type === 'INSTANCE' || node.type === 'TEXT') {
//         text += alignByContraints(node)
//       }
//     }
//     // console.log('node:', node.name, 'parent', node.parent, 'auto:', parentAutoLayout)
    
//     // check auto layout
//     let autoLayout = false
//     if (node.type === 'FRAME' || node.type === 'INSTANCE' || node.type === 'COMPONENT') {
//       // Auto layout
//       if (node.layoutMode === 'HORIZONTAL') {
//         text += `  display: flex;\n`
//         text += `  flex-direction: row;\n`
//         text += `  align-content: space-between;\n`
//         autoLayout = true
//       } else if (node.layoutMode === 'VERTICAL') {
//         text += `  display: flex;\n`
//         text += `  flex-direction: column;\n`
//         text += `  align-content: space-between;\n`
//         autoLayout = true
//       }
  
//       if (!autoLayout) {
//         text += `  position: relative;\n`
//       }
//     }
  
//     if (!autoLayout) {
//       text += `  width: ${node.width}px;\n`
//       text += `  height: ${node.height}px;\n`
//     }
  
//     // if frame
//     if (node.type === 'FRAME' || node.type === 'INSTANCE') {
//       // background
//       const fills = <Paint[]>(node.fills)
//       if (fills.length > 0) {
//         fills.forEach(fill => {
//           if (fill.type === 'SOLID') {
//             text += `  background: ${rgbToHex(fill.color)};\n`
//           }
//         })
//       }
   
//       //radius
//       //border-radius: 5px;
//       if (typeof(node.cornerRadius) === 'number') {
//         if (node.cornerRadius > 0) {
//           text += `  border-radius: ${node.cornerRadius}px;\n`
//         }
//       } else {
//         if (node.topLeftRadius
//           && node.topRightRadius
//           && node.bottomRightRadius
//           && node.bottomLeftRadius) {
//           text += `  border-radius: ${node.topLeftRadius}px ${node.topRightRadius}px ${node.bottomRightRadius}px ${node.bottomLeftRadius}px;\n`
//         }
//       }
  
//       // add padding
//       if (node.verticalPadding) {
//         text += `  padding-top: ${node.verticalPadding}px;\n`
//         text += `  padding-bottom: ${node.verticalPadding}px;\n`
//       }
//       if (node.horizontalPadding) {
//         text += `  padding-left: ${node.horizontalPadding}px;\n`
//         text += `  padding-right: ${node.horizontalPadding}px;\n`
//       }
//     } else if (node.type === 'TEXT') {
     
//       const fontName = <FontName>(node.fontName)
//       // const lineHeight = <LineHeight>(node.lineHeight)
    
//       text += `  font-size: ${Number(node.fontSize)}px;\n`;
//       // text += node.lineHeight ? `  line-height: ${<LineHeight>(node.lineHeight)}px;\n`: ''
//       text += fontName.family ?`  font-family: ${fontName.family};\n`: ''
//       text += FONTWEIGHT[fontName.style] ? `  font-weight: ${FONTWEIGHT[fontName.style]};\n`: ''
//       text += ALIGNHORIZONTAL[node.textAlignHorizontal] ? `  text-align: ${ALIGNHORIZONTAL[node.textAlignHorizontal]};\n`: ''
//       text += ALIGNVERTICAL[node.textAlignVertical] ? `  vertical-align: ${ALIGNVERTICAL[node.textAlignVertical]};\n`: ''
//       // text += node.letterSpacing ? `  letter-spacing: ${<LetterSpacing>(node.letterSpacing)}em;\n`: ''
      
//       // if not auto layout, we set specific width and height
//       text += `  width: ${node.width}px;\n`
//       text += `  height: ${node.height}px;\n`
//       text += `  line-height: ${node.height}px;\n`
//     }
  
//     text += '`'
//     return text
//   }
  
  
  
//   export function alignByContraints(node: FrameNode | InstanceNode | TextNode): string {
//     let text = ''
//     if (node.parent.type === 'FRAME' || node.parent.type === 'COMPONENT') {
//       // constraints
//       const { vertical, horizontal } = node.constraints
//       switch (horizontal) {
//         case 'MIN':
//           text += `  left: ${node.x}px;\n`;
//           break
//         case 'CENTER':
//           text += `  left: calc(50% - ${node.width}px/2);\n`;
//           break
//         case 'MAX':
//           text += `  right: ${node.parent.width - (node.width + node.x)}px;\n`;
//           break
//       }
//       switch (vertical) {
//         case 'MIN':
//           text += `  top: ${node.y}px;\n`;
//           break
//         case 'CENTER':
//           text += `  top: calc(50% - ${node.height}px/2);\n`;
//           break
//         case 'MAX':
//           text += `  bottom: ${node.parent.height - (node.height + node.y)}px;\n`;
//           break
//       }
//     }
//     if (text.length > 0) {
//       text += `  position: absolute;\n`;
//     } else {
//       // only top parent can have relative
//       text += `  position: relative;\n`;
//     }
//     return text
//   }
  
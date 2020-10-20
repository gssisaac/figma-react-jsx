import { clearName, getButtonType } from "../utils"
import { cssAutoLayout, cssColorStyle, cssConstraints, cssFrameStyle, cssLayoutAlign, cssOpacity, cssPosition, cssSize, cssTextStyle } from "./style"
import { getTag, isAutoLayout, isButton, isInstanceNode, isParentAutoLayout, isSvgNode } from "../identification"

// get css for a node
export function buildStyledComponent(node: SceneNode, isHead: boolean, compName?: string): string {
  let css = ''
  if (!node) {
    return ''
  }
  if (node.type == 'VECTOR') {
    return ''
  }

  // if head, we set size
   if (isParentAutoLayout(node)) {
  } 

  // if container
  if (node.type === 'FRAME' || node.type === 'INSTANCE' || node.type === 'COMPONENT') {
    if (isAutoLayout(node)) {
      // css += cssComment('Auto layout')
      css += cssAutoLayout(node)
      if (isHead) {      
        css += cssSize(node)
        css += cssPosition('relative')
      } else if (isParentAutoLayout(node)) {
        css += cssLayoutAlign(node)
      } else {
        css += cssPosition('absolute')
      }
    } else {
      if (isHead) {      
        css += cssSize(node)
        css += cssPosition('relative')
      } else if (isParentAutoLayout(node)) {
        css += cssLayoutAlign(node)
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
      css += cssLayoutAlign(node)
      css += cssSize(node)
    } else {
      css += cssPosition('absolute')
    }

    // get specific styles
    // if (node.type === 'TEXT') {
    //   css += cssTextStyle(node)
    // }
  }

  // color except for svg node and instance node
  if (!isSvgNode(node) && !isInstanceNode(node)) {
    css += cssColorStyle(node)
  }

  css += cssOpacity(node)




  const nodeName = clearName(node.name)
  
  if (css.length > 0) {
    if (compName) {
      css = `const Container = styled(${compName})` + "`\n" + css
    } else if (isButton(nodeName)) {
      const buttonType = getButtonType(nodeName)
      css = `const ${nodeName} = styled(${buttonType})` + "`\n" + css
    } else if (isInstanceNode(node)) {
      css = `const ${nodeName} = styled(${nodeName}Component)` + "`\n" + css
    } else {
      css = `const ${nodeName} = styled.${getTag(node)}` + "`\n" + css
    }
    css += '`\n'
  }
  
  return css
}

export function cssDebugBorder(node) {
  return `  border: 0.2px solid red;\n`
}

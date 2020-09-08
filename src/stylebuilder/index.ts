import { clearName, getButtonType } from "../utils"
import { cssAutoLayout, cssAutoLayoutItemSpacing, cssColorStyle, cssConstraints, cssFrameStyle, cssOpacity, cssPosition, cssSize, cssTextStyle } from "./style"
import { getTag, isAutoLayout, isButton, isInstanceNode, isParentAutoLayout, isSvgNode } from "../identification"

// get css for a node
export function buildStyledComponent(node: SceneNode, isHead: boolean): string {
  let css = ''
  if (!node) {
    return ''
  }
  if (node.type == 'VECTOR') {
    return ''
  }

  const nodeName = clearName(node.name)
  if (isButton(nodeName)) {
    const buttonType = getButtonType(nodeName)
    css += `const ${nodeName} = styled(${buttonType})` + "`\n"
  } else if (isInstanceNode(node)) {
    css += `const ${nodeName} = styled(${nodeName}Component)` + "`\n"
  } else {
    css += `const ${nodeName} = styled.${getTag(node)}` + "`\n"
  }

  // if head, we set size
  if (isHead) {
    // css += cssComment('Head')
  } else if (isParentAutoLayout(node)) {
    css += cssAutoLayoutItemSpacing(node)
  } else {
    css += cssSize(node)
    // css += cssComment('Constraints')
    css += cssConstraints(node)
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

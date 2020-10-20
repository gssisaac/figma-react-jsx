import { clearName, getButtonType } from "../utils"
import { cssColorStyle, cssFrameStyle, cssLayoutAlign, cssOpacity, cssPosition, cssSize } from "./style"
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

  if (isHead) {
    css += cssSize(node)
    css += cssPosition('relative')
    css += cssFrameStyle(node)
  } else if (isParentAutoLayout(node)) {
    if (node.type === 'FRAME' || node.type === 'INSTANCE' || node.type === 'COMPONENT') {
      if (isAutoLayout(node)) {
        css += cssLayoutAlign(node)
      } else {
        css += cssLayoutAlign(node)
        css += cssSize(node)
        css += cssPosition('relative')
      }
      
    css += cssFrameStyle(node)
    } else {
      css += cssLayoutAlign(node)
      css += cssSize(node)
    }
  }
  
  // color except for svg node and instance node
  if (!isSvgNode(node) && !isInstanceNode(node)) {
    css += cssColorStyle(node)
  }

  css += cssOpacity(node)




  const nodeName = clearName(node.name)
  
  if (css.length > 0) {
    if (isHead && compName) {
      css = `const Container = styled(${compName})` + "`\n" + css
    } else if (isButton(nodeName)) {
      const buttonType = getButtonType(nodeName)
      css = `const ${nodeName} = styled(${buttonType})` + "`\n" + css
    } else if (isInstanceNode(node)) {
      if (compName) {
        css = `const ${nodeName} = styled(${compName})` + "`\n" + css
      } else {
        css = `const ${nodeName} = styled(${nodeName}Component)` + "`\n" + css
      }
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

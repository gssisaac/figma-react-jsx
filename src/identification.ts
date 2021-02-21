
export function isAutoLayout(node: SceneNode): boolean {
  if (!node) {
    return false
  }
  if (node.type === 'FRAME' || node.type === 'INSTANCE' || node.type === 'COMPONENT') {
    console.log({ node: node })
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

export function isInstanceNode(node: SceneNode) {
  return node.type === 'INSTANCE' && !isSvgNode(node)
}

export function isSvgNode(node: SceneNode) {
  return (node.type === 'FRAME' || node.type === 'INSTANCE' || node.type === 'COMPONENT') && node.children.find(child => child.type === 'VECTOR')
}


export const isButton = (name: string) => {
  return name.includes('Button')
}

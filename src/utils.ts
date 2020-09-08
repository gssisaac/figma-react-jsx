
export const getButtonType = (name: string) => {
  if (name.includes('IconButton')) {
    return 'IconButton'
  } else {
    return 'BasicButton'
  }
}

export function componentToHex(c) {
  const v = Math.round(c * 255)
  var hex = v.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}

export function rgbToHex(color) {
  return "#" + componentToHex(color.r) + componentToHex(color.g) + componentToHex(color.b);
}

// export function getFillColor(node: FrameNode | TextNode | ComponentNode | VectorNode) {
export function getFillColor(node: any) {
  if (!node.fills) {
    return null
  }
  let color = null
  const fills = <Paint[]>(node.fills)
  if (fills.length > 0) {
    fills.forEach(fill => {
      if (fill.type === 'SOLID') {
        color = rgbToHex(fill.color)
      }
    })
  }
  return color
}

export function clearName(str: string): string {
  const arr = str.split('$')
  if (arr.length === 0) {
    return str.replace(/\s/g, '').trim()
  } else {
    return arr[0].replace(/\s/g, '').trim()
  }
}

export function isContainer(node: SceneNode) {
  return ((node.type === 'FRAME' || node.type === 'GROUP' || node.type === 'COMPONENT') && node.children.length > 0)
}

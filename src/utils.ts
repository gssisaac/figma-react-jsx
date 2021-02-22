
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

const capitalize = (s) => {
  if (typeof s !== 'string') return ''
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export function clearName(str: string): string {
  const arr = str.split('$')
  let name = ''
  if (arr.length === 0) {
    name = str.replace(/\s/g, '').trim()
  } else {
    name = arr[0].replace(/\s/g, '').trim()
  }

  // to upper case
  name = name.replace(/-([a-z])|:([a-z])/g, function (g) { return g[1].toUpperCase(); })
  return capitalize(name)
}

export function isContainer(node: SceneNode) {
  return ((node.type === 'FRAME' || node.type === 'GROUP' || node.type === 'COMPONENT') && node.children.length > 0)
}

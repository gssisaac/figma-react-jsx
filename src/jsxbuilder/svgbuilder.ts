import { clearName, getFillColor } from '../utils'

import { Refer } from './types'
import { isSvgNode } from '../identification'

// let Svgs = ''
// if a frame has vector children, assuming that is svg

export function buildSVG(refer: Refer, node: SceneNode): [number, number] {
  if (node.name in refer.allSvgs) {
    return [node.width, node.height]
  }
  const nodeName = clearName(node.name)
  console.log({nodeName})
  // check SVG
  if ((node.type === 'FRAME' || node.type === 'COMPONENT' || node.type === 'INSTANCE') && isSvgNode(node)) {
    let svg = ''
    svg += `const SVG${nodeName} = <svg width='100%' height='100%' viewBox='0 0 ${node.width} ${node.width}' fill='none' xmlns='http://www.w3.org/2000/svg'>\n`
    node.children.forEach(vector => {
      if (vector.type === 'VECTOR') {
        const fillColor = getFillColor(vector)
        vector.vectorPaths.forEach(data => {
          svg += `  <path d='${data.data}' transform='translate(${vector.x}, ${vector.y})' ${fillColor ? `fill='${fillColor}'` : ''}/>\n`
        })
      }
    })
    svg += '</svg>\n'
    refer.allSvgs[node.name] = svg
    // Svgs += svg
    return [node.width, node.height]
  }
  return null
}

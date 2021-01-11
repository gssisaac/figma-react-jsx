import { clearName, rgbToHex } from '../utils'

import { COMP_NAMES } from '../config'
import { Refer } from '../jsxbuilder/types'
import { buildJsx } from '../jsxbuilder/jsx'
import { isSvgNode } from '../identification'

export function exportReactHooksComponent(head): string {
  
  const refer: Refer = {
    imports: [],
    allProps: [],
    allFunctions: [],
    allSvgs: {},
    styledComponent: []
  }

  const localStyle = getLocalStyles()

  const text = buildJsx(refer, head, 2, ' {...props}')
  if (!text){ return ''}

  const totalText = getTotalText(refer, head.name, text)
  
  return totalText
}


function getLocalStyles() {
  const figmaLocalPaintStyles = figma.getLocalPaintStyles() 
  const figmaLocalTextStyles = figma.getLocalTextStyles() 

  const PaintStyles = figmaLocalPaintStyles.map((paintStyle) => {
    const paint = paintStyle.paints?.[0]
    if (paint?.type === 'SOLID') {
      const color = rgbToHex(paint.color).toUpperCase()
      return { name: paintStyle.name, color }
    }

    return null
  })

  const TextStyles = figmaLocalTextStyles.map((textStyles) => {
    return {
      name: textStyles.name,
      size: textStyles.fontSize,
      // ex) lineHeight, letterSpacing  ... 
    }
  })
  
  return {
    PaintStyles,
    TextStyles
  }
}

function getTotalText(refer: Refer, headName: string, text: string) {
  let importsText = ''
  const uiPack = refer.imports.filter((nodeName) => {
    if (Object.keys(COMP_NAMES).includes(nodeName)) {
      return true 
    }
    importsText += `import ${nodeName}Component from './${nodeName}'\n`
    return false
  })

  importsText +=`import { ${uiPack.join(', ')} } from '@modules/ui-pack'\n`


  let styledComponents = refer.styledComponent.join('\n')
  
  let propsText = ''
  refer.allProps.forEach(prop => propsText += `  ${prop}\n`)

  let funcsText = ''
  refer.allFunctions.forEach(func => funcsText += func)

  let totalText = `
import React from 'react'
import styled from 'styled-components'
${importsText}
type Props = {
  className?: string
${propsText}}

export function ${clearName(headName)}(props: Props) {
${funcsText}  return (
${text}  )
}

/* Styled components */
${styledComponents}\n
`


totalText += '/* SVGS */\n'
for (const svg in refer.allSvgs) {
  totalText += refer.allSvgs[svg]
}

  return totalText
}



// const allContainers: SceneNode[] = []
// searchAllContainers(allContainers, head)

// function searchAllContainers(allContainers: SceneNode[], node: SceneNode) {
//   const found = allContainers.find(n => n.name === node.name)
//   if (node.parent.type === 'INSTANCE' && !isSvgNode(node)) {
//     return
//   }
//   if (!found) {
//     allContainers.push(node)
//   }
//   if (node.type === 'FRAME' || node.type === 'GROUP' || node.type === 'COMPONENT') {
//     node.children.forEach((child) => {
//       searchAllContainers(allContainers, child)
//     })
//   }
//   return allContainers
// }


import { CompNames, clearName } from '../utils'

import { Refer } from '../jsxbuilder/types'
import { buildJsx } from '../jsxbuilder/jsx'
import { buildStyledComponent } from '../stylebuilder'
import { isSvgNode } from '../identification'

const UI_PACK_COMPONENT = ['FlexColumn', 'FlexRow']
export function exportReactHooksComponent(head): string {
  let totalText = ''  
  
  const refer: Refer = {
    imports: [],
    allProps: [],
    allFunctions: [],
    allSvgs: {},
    styledComponent: []
  }

  const allContainers: SceneNode[] = []
  searchAllContainers(allContainers, head)
  console.log({ allContainers })

  const text = buildJsx(refer, head, 2, ' {...props}')

  let styledComponents = refer.styledComponent.join('/n')
  // let styledComponents = buildStyledComponent(head, true)
  // allContainers.forEach(node => {
  //   // console.log(`node[${node.name}]: `, node)
  //   if (node !== head) {
  //     const text = buildStyledComponent(node, false)
  //     if (text) {
  //       styledComponents += text + '\n'
  //     }
  //   }
  // })
  // console.log({ styledComponents })

  let importsText = ''
  const uiPack = refer.imports.filter((nodeName) => {
    if (Object.keys(CompNames).includes(nodeName)) {
      return true 
    }
    importsText += `import ${nodeName}Component from './${nodeName}'\n`
    return false
  })

  importsText +=`import { ${uiPack.join(', ')} } from '@modules/ui-pack'\n`

  let propsText = ''
  refer.allProps.forEach(prop => propsText += `  ${prop}\n`)

  let funcsText = ''
  refer.allFunctions.forEach(func => funcsText += func)

  const jsx = `
import React from 'react'
import styled from 'styled-components'
${importsText}
type Props = {
  className?: string
${propsText}}

function ${clearName(head.name)}Component(props: Props) {
${funcsText}  return (
${text}  )
}

/* Styled components */
${styledComponents}export default ${clearName(head.name)}Component
`
  totalText += jsx + '\n'

  totalText += '/* SVGS */\n'
  for (const svg in refer.allSvgs) {
    totalText += refer.allSvgs[svg]
  }
  return totalText
}


function searchAllContainers(allContainers: SceneNode[], node: SceneNode) {
  const found = allContainers.find(n => n.name === node.name)
  if (node.parent.type === 'INSTANCE' && !isSvgNode(node)) {
    return
  }
  if (!found) {
    allContainers.push(node)
  }
  if (node.type === 'FRAME' || node.type === 'GROUP' || node.type === 'COMPONENT') {
    node.children.forEach((child) => {
      searchAllContainers(allContainers, child)
    })
  }
  return allContainers
}
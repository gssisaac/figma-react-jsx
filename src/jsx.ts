import { clearName, getFillColor, isSvgNode } from './utils'
import { getCSSStyles, isInstanceNode } from './style'

type SvgType = {
  [id: string]: string
}
type Refer = {
  imports: string[]
  allProps: string[]
  allFunctions: string[]
  allSvgs: SvgType
}

function levelTab(level: number) {
  let tab = ''
  for (let i = 0; i < level; i++) {
    tab += '  '
  }
  return tab
}

// let Svgs = ''
// if a frame has vector children, assuming that is svg

function extractSvg(refer: Refer, node: SceneNode): boolean {
  if (node.name in refer.allSvgs) {
    return true
  }
  const nodeName = clearName(node.name)
  // check SVG
  if ((node.type === 'FRAME' || node.type === 'COMPONENT' || node.type === 'INSTANCE') && isSvgNode(node)) {
    let svg = ''
    svg += `const SVG${nodeName} = <svg width='${node.width}' height='${node.height}' viewBox='0 0 ${node.width} ${node.width}' fill='none' xmlns='http://www.w3.org/2000/svg'>\n`
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
    return true
  }
  return false
}

type ExtractProps = {
  prop: string
  onClick: string
  onClickProp: string
}

function extractPropsAll(refer: Refer, node: SceneNode): ExtractProps {
  const { nodeName, params } = parseNodeName(node.name)
  let prop = null
  let onClick = ''
  let onClickProp = ''
  if (params && params.props) {
    prop = params.props
  }
  if (prop) {
    refer.allProps.push(`${prop}: string`)
  }
  if (params && params.clickProps) {
    onClick = ` onClick={props.${params.clickProps}}`
    const name = `${params.clickProps}: () => void`
    if (!refer.allProps.find(prop => prop === name)) {
      refer.allProps.push(name)
    }
  }
  if (params && params.click) {
    onClick = ` onClick={${params.click}}`
    const name =
`  const ${params.click} = () => {
  }
`
  if (!refer.allFunctions.find(func => func === name)) {
      refer.allFunctions.push(name)
    }
  }

  if (params && params.hover) {
    // styles += '  ${' + params.hover + '}'
  }
  return { prop, onClick, onClickProp }
}

function extractProps(refer: Refer, params): string {
  let prop = null
  if (params) {
    if (params.props) {
      prop = params.props
    }
    if (prop) {
      refer.allProps.push(`${prop}: string`)
    }
  }
  return prop
}

function extractVisible(params): string {
  let value = null
  if (params) {
    if (params.visible) {
      value = params.visible
    }
  }
  return value
}

// rule
/*
  visible
  $visible: prop=thumbnail
  $visible: hoverOn
  $visible: hoverOff
  
  value
  $value: prop=MenuItem     #inside children
  
  props
  - put props inside props area
  $props: onClick=onTabClicked

  hoverProvider:self
  - self pover provider
  
  <ThumbnailImage onClick={props.onTabClicked}/>

  $props: src=props.thumbnail

  <ThumbnailImage src={props.thumbnail}/>

  style
  - put into style area
  $style: hover=
*/

export function checkError(node: SceneNode) {
  const { nodeName } = parseNodeName(node.name)
}

function extractJsx(refer: Refer, node: SceneNode, level: number, baseProps: string) {
  const tab = levelTab(level)
  let text = ''

  // const nodeName = clearName(node.name)
  const { nodeName, params } = parseNodeName(node.name)
  const { prop, onClick, onClickProp } = extractPropsAll(refer, node)
  // const prop = extractProps(params)
  

  if (extractSvg(refer, node)) {
    // text += `${tab}<${nodeName} src={SVG_${nodeName}}/>\n`
    text += `${tab}<${nodeName}${baseProps}${onClick}>\n`
    text += `${tab}  {SVG${nodeName}}\n`
    text += `${tab}</${nodeName}>\n`
    return text
  }

  if ((node.type === 'FRAME' || node.type === 'GROUP' || node.type === 'COMPONENT') && node.children.length > 0) {
    text += `${tab}<${nodeName}${baseProps}${onClick}>\n`
    node.children.forEach(child => {
      text += extractJsx(refer, child, level + 1, '')
    })
    text += `${tab}</${nodeName}>\n`
  } else if (node.type === 'TEXT') {
    if (prop) {
      text += `${tab}<${nodeName}${baseProps}${onClick}>{props.${prop}}</${nodeName}>\n`
    } else {
      text += `${tab}<${nodeName}${baseProps}${onClick}>${node.characters}</${nodeName}>\n`
    }
  } else if (isSvgNode(node)) {
    text += `${tab}<${nodeName}${baseProps}${onClick}/>\n`
  } else if (isInstanceNode(node)) {
    if (!refer.imports.find(name => name === nodeName)) {
      refer.imports.push(nodeName)
    }
    text += `${tab}<${nodeName}${baseProps}${onClick}/>\n`
  } else {
    text += `${tab}<${nodeName}${baseProps}${onClick}/>\n`
  }
  return text
}

type ParamType = {
  props?: string
  hoverOn?: string
  hover?: string  // whiteFillHover, boundsFillHover, textHighlightHover
  click?: string
  clickProps?: string
  visible?: string  // triggerHover, triggerProps
}
type ParsedNodeName = {
  nodeName: string
  params?: ParamType
}

function parseNodeName(str: string): ParsedNodeName {
  const arr = str.split('$')
  let result: ParsedNodeName = {
    nodeName: arr[0].replace(/\s/g, '').trim(),
  }

  if (arr.length >= 2) {
    let params: ParamType = {}
    try {
      arr[1].trim().split(',').forEach(param => {
        const values = param.trim().split(':')
        params[values[0]] = values[1].trim()
      })
      result = {...result, params: params}
    } catch(e) {console.log(e)}
  }
  return result
}

export function exportReactHooksComponent(head): string {
  let totalText = ''  
  const refer: Refer = {
    imports: [],
    allProps: [],
    allFunctions: [],
    allSvgs: {},
  }

  const allContainers: SceneNode[] = []
  searchAllContainers(allContainers, head)
  // console.log({ allContainers })

  const text = extractJsx(refer, head, 2, ' {...props}')

  let styledComponents = getCSSStyles(head, true)
  
  allContainers.forEach(node => {
    // console.log(`node[${node.name}]: `, node)
    if (node !== head) {
      const text = getCSSStyles(node, false)
      if (text) {
        styledComponents += text + '\n'
      }
    }
  })

  // console.log({ styledComponents })

  let importsText = ''
  refer.imports.forEach(nodeName => importsText += `import ${nodeName}Component from './${nodeName}'\n`)
  
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

// Styled components

${styledComponents}export default ${clearName(head.name)}Component
`
  totalText += jsx + '\n'

  totalText += '// SVGS\n'
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

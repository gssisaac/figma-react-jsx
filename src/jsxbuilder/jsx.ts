import { isInstanceNode, isSvgNode } from '../identification'

import { Refer } from './types'
import { buildSVG } from './svgbuilder'
import { parseNodeName } from './nodeNameParser'

function levelTab(level: number) {
  let tab = ''
  for (let i = 0; i < level; i++) {
    tab += '  '
  }
  return tab
}

type ExtractProps = {
  prop: string
  onClick: string
  onClickProp: string
}

function extractPropsAll(refer: Refer, node: SceneNode): ExtractProps {
  const { params } = parseNodeName(node.name)
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
}

export function buildJsx(refer: Refer, node: SceneNode, level: number, baseProps: string) {
  const tab = levelTab(level)
  let text = ''

  // const nodeName = clearName(node.name)
  const { nodeName } = parseNodeName(node.name)
  const { prop, onClick } = extractPropsAll(refer, node)
  // const prop = extractProps(params)

  if (buildSVG(refer, node)) {
    // text += `${tab}<${nodeName} src={SVG_${nodeName}}/>\n`
    text += `${tab}<${nodeName}${baseProps}${onClick}>\n`
    text += `${tab}  {SVG${nodeName}}\n`
    text += `${tab}</${nodeName}>\n`
    return text
  }
  if ((node.type === 'FRAME' || node.type === 'GROUP' || node.type === 'COMPONENT') && node.children.length > 0) {
    text += `${tab}<${nodeName}${baseProps}${onClick}>\n`
    node.children.forEach(child => {
      text += buildJsx(refer, child, level + 1, '')
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


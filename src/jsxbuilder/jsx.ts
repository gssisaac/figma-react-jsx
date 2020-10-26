import { isAutoLayout, isInstanceNode, isSvgNode } from '../identification'

import { Refer } from './types'
import { buildFlexContainerBuilder } from './flexContainerBuilder'
import { buildSVG } from './svgbuilder'
import { buildStyledComponent } from '../stylebuilder'
import { buildText } from './textBuilder'
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

/*

* SPAContainer
* 
*/
export function buildJsx(refer: Refer, node: SceneNode, level: number, baseProps: string) {
  const tab = levelTab(level)
  let text = ''

  const { nodeName } = parseNodeName(node.name)
  const { prop, onClick } = extractPropsAll(refer, node)

  if (isSvgNode(node)) {
    const [ width, height ] = buildSVG(refer, node)
    if (width && height) {
      const sizeProps = ` width={${width}} height={${height}}`
      text += `${tab}<Icon${sizeProps}>{SVG${nodeName}}</Icon>\n`

      addReferImports(refer, 'Icon')
    } else console.log('** [Error] buildJsx SVG ')
    return text
  }
  
  if (isAutoLayout(node)) {
    if (!node) return false
      let [compName, compProps] = buildFlexContainerBuilder(node) 
      const styled = buildStyledComponent(node, level, compName)
        
      addReferStyledComponent(refer, styled)
      addReferImports(refer, compName)
      
      compName = styled.length 
        ? (level === 2 ? 'Container' : nodeName)
        : compName
      
      if (compName) {
        if (node.type === 'FRAME' || node.type === 'INSTANCE' || node.type === 'COMPONENT' ) {
          text += `${tab}<${compName}${baseProps}${compProps}${onClick}>\n`    
          node.children.forEach(child => {
            text += buildJsx(refer, child, level + 1, '')
          })
          text += `${tab}</${compName}>\n`
        }
      }
    return text
  }
  
  if ((node.type === 'FRAME' || node.type === 'GROUP' || node.type === 'COMPONENT') && node.children.length > 0) {
    text += `${tab}<${nodeName}${baseProps}${onClick}>\n`
    node.children.forEach(child => {
      text += buildJsx(refer, child, level + 1, '')
    })
    text += `${tab}</${nodeName}>\n`
  } else if (node.type === 'TEXT') {
    let [compName, compProps] = buildText(node)
    const styled = buildStyledComponent(node, level, compName)
        
    addReferStyledComponent(refer, styled)
    addReferImports(refer, compName)
    compName = styled.length ? nodeName : compName
    
    text += `${tab}<${compName}${baseProps}${compProps}${onClick}>${node.characters}</${compName}>\n`  
  } else if (isInstanceNode(node)) {
    addReferImports(refer, nodeName)
    text += `${tab}<${nodeName}${baseProps}${onClick}/>\n`  
  } else {
    text += `${tab}<${nodeName}${baseProps}${onClick}/>\n`
  }

  return text
}


function addReferImports(refer: Refer, compName: string){
  if (!refer.imports.find((name) => name === compName)) {
    refer.imports.push(compName) 
  }
}

function addReferStyledComponent(refer: Refer, styled: string){
  refer.styledComponent.push(styled)
}
import { COMP_NAMES } from "../config"

function getLayoutMode(node): string {
  return node.layoutMode === 'HORIZONTAL' ? COMP_NAMES.FlexRow : COMP_NAMES.FlexColumn
}


export function buildFlexContainerBuilder(node: SceneNode) {
  let compName = getLayoutMode(node)
  let compProps = '' 
  
  if (node.type === 'FRAME' || node.type === 'INSTANCE' || node.type === 'COMPONENT' ) {
    //* gap
    if (node.itemSpacing) {
      compProps += ` gap={'${node.itemSpacing}px'} `
    } 
    
    //* align
    if (node.children) {
      let itemsCenter: boolean = true 

      node.children.forEach((child) => {
        if (child.type !== 'SLICE' && child.type !== 'BOOLEAN_OPERATION' && child.type !== 'GROUP'){
          const { vertical, horizontal } = child.constraints
          const contraint = compName === COMP_NAMES.FlexRow ? vertical : horizontal
          if (contraint !== 'CENTER' && contraint !== 'SCALE') {
            itemsCenter = false 
          } 
        }
      })
      compProps += itemsCenter ? ` center` : ``
    }
    
    //* wrap,full,background,minheight

  }
  return [compName, compProps]
}
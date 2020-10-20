import { CompNames, getFillColor } from "../utils";

export function buildText(node: TextNode) {
  let compName = ''
  let compProps = ' '
  switch (node.fontSize) {
    case 16: 
      compName = CompNames.TitleText
      break;
    case 15: case 14:
      compName = CompNames.SubTitleText
      break;
    case 13:
      compName = CompNames.DescriptionText
      break;
    default:
      // compNames = CompNames.SubTitleText
      break;
  }

  //* bold
  const fontName = <FontName>(node.fontName)
  if (fontName.style) {
    fontName.style.split(' ').forEach(style => {
      if (style === 'Bold') {
        compProps += 'bold '
      }
    })
  }
  
  //* font color
  const color = getFillColor(node).toUpperCase()
  switch (color) {
    case '#FFFFFF': case 'white':
      compProps += 'white '
      break
    case '#828282':
      compProps += 'sub '
      break
    default:
      break
  }

  //* selectable  
  // content -> selectable

  //* ellipsis 한줄일때
  // compProps += 'ellipsis '

  return [compName, compProps]
}
import { COMP_NAMES } from "../config";
import { getFillColor } from "../utils";

const enum TextColor {
  white = '#FFFFFF',
  sub = '#828282',
}

export function buildText(node: TextNode) {
  let compName = ''
  let compProps = ' '
  switch (node.fontSize) {
    case 16: 
      compName = COMP_NAMES.TitleText
      break;
    case 15: case 14:
      compName = COMP_NAMES.SubTitleText
      break;
    case 13:
      compName = COMP_NAMES.DescriptionText
      break;
    case 12: case 11:
      compName = COMP_NAMES.SmallInfoText
      break;
    case 10:
      compName = COMP_NAMES.SmallDescriptionText
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
    case TextColor.white: 
      compProps += 'white '
      break
    case TextColor.sub:
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
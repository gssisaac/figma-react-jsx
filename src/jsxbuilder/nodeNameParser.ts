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

export function parseNodeName(str: string): ParsedNodeName {
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


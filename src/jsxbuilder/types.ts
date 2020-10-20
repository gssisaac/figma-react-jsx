
type SvgType = {
  [id: string]: string
}

export type Refer = {
  imports: string[]
  allProps: string[]
  allFunctions: string[]
  allSvgs: SvgType
  styledComponent: string[]
}

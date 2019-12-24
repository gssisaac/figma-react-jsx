
This plugin is for Figma to generate React hooks JSX and Styled components.

1. Select nodes in Figma

2. Run this Plugins

3. Open console

4. See results on consle and copy and use it


```

// Styled components
const Item = styled.div`
  width: 169;
  height: 34;
  border: 1px solid #101010;
  background: #ffffff;
  border-radius: 0px;
  padding-top: 8;
  padding-bottom: 8;
  padding-left: 16;
  padding-right: 16;
  margin: 0px 1px;
  align-self: flex-start;
`
const Content = styled.div`
  width: 134;
  height: 18;
  border-radius: 0px;
  flex-direction: row;
  align-content: space-between;
  item-spacing: 8;
  align-self: flex-start;
`
const Icon = styled.div`
  width: 18;
  height: 18;
  border-radius: 0px;
  margin: 8px 0px;
  align-self: center;
`
const SVGIcon = styled.div`
  width: 14;
  height: 14;
`
const TitleFrame = styled.div`
  width: 108;
  height: 18;
  border-radius: 0px;
  margin: 8px 0px;
  flex-direction: row;
  align-content: space-between;
  item-spacing: 6;
  align-self: center;
`
const SVGIcon = styled.div`
  width: 18;
  height: 18;
`
const Title = styled.p`
  width: 84;
  height: 12;
  color: #000000;
  border: 1px solid #ef6d6d;
  font-size: 12px;
  font-family: Roboto;
  font-weight: Bold;
  text-align: undefined;
  algin-items: flex-start;
`
// functional component

function Component(props: Props) {
  return (
    <Item>
      <Content>
        <Icon>
          <SVGIcon/>
        </Icon>
        <TitleFrame>
          <SVGIcon/>
          <Title>Marked only</Title>
        </TitleFrame>
      </Content>
    </Item>

  )
}

```

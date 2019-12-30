
This plugin is for Figma to generate React hooks JSX and Styled components.

1. Select nodes in Figma

2. Run this Plugins

3. Open console in Figma (Context menu > Plugin > Development > Console)

4. See results on consle and copy and use it


`Using Props

``Using props by setting layer name in Figma like below

```
PageNumber$props:pageIndex
FileTitle$props:fileName

```

We parse these layer name as props for React to set Text element


```

import React from 'react'
import styled from 'styled-components'


type Props = {
  fileName: string
  pageIndex: string

}

function ThumbnailAreaComponent(props: Props) {
  return (
    <ThumbnailArea>
      <ThumnailImage>
        <Image/>
      </ThumnailImage>
      <FileNameFrame>
        <FileTitle>{props.fileName}</FileTitle>
        <PageNumber>{props.pageIndex}</PageNumber>
      </FileNameFrame>
    </ThumbnailArea>

  )
}

// Styled components
const ThumbnailArea = styled.div`
  /* Head */
  /* Auto layout */
  display: flex;
  flex-direction: column;
  align-self: center;
  width: 207px;
  height: 111px;
  position: relative;
  border: 0.2px solid red;
`
const ThumnailImage = styled.div`
  margin-bottom: 8px;
  align-self: flex-start;
  width: 161px;
  height: 91px;
  position: relative;
  border-radius: 4px;
  border: 0.2px solid red;
`

const Image = styled.div`
  width: 161px;
  height: 91px;
  /* Constraints */
  left: 0px;
  top: 0px;
  position: absolute;
  border: 0.2px solid red;
`

const FileNameFrame = styled.div`
  /* Auto layout */
  display: flex;
  flex-direction: row;
  align-self: center;
  border: 0.2px solid red;
`

const FileTitle = styled.div`
  margin-right: 8px;
  align-self: flex-start;
  width: 163px;
  height: 12px;
  font-size: 9px;
  font-family: Open Sans;
  font-weight: bold;
  text-align: left;
  vertical-align: flex-end;
  line-height: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #333333;
  border: 0.2px solid red;
`

const PageNumber = styled.div`
  align-self: flex-start;
  width: 36px;
  height: 12px;
  font-size: 9px;
  font-family: Open Sans;
  font-weight: bold;
  text-align: left;
  vertical-align: flex-end;
  line-height: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #333333;
  border: 0.2px solid red;
`

export default ThumbnailAreaComponent
```

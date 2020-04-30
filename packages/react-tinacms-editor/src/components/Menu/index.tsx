/**

Copyright 2019 Forestry.io Inc

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

import React from 'react'
import { useState, useRef, useEffect, useLayoutEffect } from 'react'

// todo: all these inports should come for different plugins eventually
// And thus can be replaced by just a loop on plugin collection
import { BlockControl } from '../../plugins/Menu/blockControl'
import { FloatingTableMenu } from '../../plugins/Menu/FloatingTableMenu'
import { HistoryControl } from '../../plugins/Menu/historyControl'
import {
  InlineControl,
  TableControl,
  QuoteControl,
  CodeControl,
  ListControl,
} from '../../plugins/Menu'
import {
  FloatingMenu as FloatingMenuImage,
  Loaders as LoadersImage,
  ToolbarComponent as ToolbarComponentImage,
} from '../../plugins/Image'
import {
  LinkForm as FloatingLinkForm,
  ToolbarComponent as ToolbarComponentLink,
} from '../../plugins/Link'
import { useEditorStateContext } from '../../context/editorState'
import { MenuPortalProvider } from '../../context/MenuPortal'

import { MenuPlaceholder, MenuWrapper, MenuContainer } from './styledComponents'

interface Props {
  bottom?: boolean
  sticky?: boolean | string
  uploadImages?: (files: File[]) => Promise<string[]>
}

export const Menu = ({
  bottom = false,
  sticky = true,
  uploadImages,
}: Props) => {
  const [menuFixed, setMenuFixed] = useState(false)
  const isBrowser = typeof window !== `undefined`
  const menuRef = useRef<HTMLDivElement>(null)
  const [menuBoundingBox, setMenuBoundingBox] = useState<any>(null)
  const menuFixedTopOffset = typeof sticky === 'string' ? sticky : '0'

  useEffect(() => {
    if (menuRef.current && sticky) {
      setMenuBoundingBox(menuRef.current.getBoundingClientRect())
    }
  }, [menuRef])

  useLayoutEffect(() => {
    if (!isBrowser || !menuRef.current || !sticky) {
      return
    }

    const handleScroll = () => {
      const wysiwygWrapper = menuRef.current!.parentElement
      const startPosition = wysiwygWrapper ? wysiwygWrapper.offsetTop : 0
      const endPosition = wysiwygWrapper
        ? startPosition + wysiwygWrapper.offsetHeight
        : 0

      if (window.scrollY > startPosition && window.scrollY < endPosition) {
        setMenuFixed(true)
      } else {
        setMenuFixed(false)
      }
    }

    const handleResize = () => {
      if (menuRef.current) {
        const wasMenuFixed = menuFixed
        setMenuFixed(false)
        setMenuBoundingBox(menuRef.current.getBoundingClientRect())
        setMenuFixed(wasMenuFixed)
      }
    }

    window.addEventListener('scroll', handleScroll)
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleResize)
    }
  }, [menuRef, menuBoundingBox])

  const preventProsemirrorFocusLoss = React.useCallback((e: any) => {
    e.stopPropagation()
    e.preventDefault()
  }, [])

  const { editorView } = useEditorStateContext()
  if (!editorView) return null
  return (
    <>
      {menuFixed && (
        <MenuPlaceholder menuBoundingBox={menuBoundingBox}></MenuPlaceholder>
      )}
      <MenuWrapper
        menuFixedTopOffset={menuFixedTopOffset}
        menuFixed={menuFixed}
        menuBoundingBox={menuBoundingBox}
        ref={menuRef}
      >
        <MenuPortalProvider>
          <MenuContainer onMouseDown={preventProsemirrorFocusLoss}>
            <BlockControl />
            <InlineControl />
            <ToolbarComponentLink />
            <ToolbarComponentImage uploadImages={uploadImages} />
            <TableControl bottom={bottom} />
            <QuoteControl bottom={bottom} />
            <CodeControl bottom={bottom} />
            <ListControl bottom={bottom} />
            <HistoryControl />
          </MenuContainer>
        </MenuPortalProvider>
      </MenuWrapper>
      <FloatingTableMenu />
      <LoadersImage />
      <FloatingMenuImage />
      <FloatingLinkForm />
    </>
  )
}

// todo: sub-menus to return null if schema does not have related type of node / mark.

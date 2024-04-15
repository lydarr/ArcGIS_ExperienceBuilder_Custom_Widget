/** @jsx jsx */
import { React, css, jsx, ReactRedux, type IMState, hooks, getAppStore, appActions, AppMode, WidgetType } from 'jimu-core'
import { Popper, type Size, type Placement, getFallbackPlacementsModifier } from 'jimu-ui'
import { SINGLE_POPPER_MODIFIERS } from '../../../common/consts'
import { WidgetRenderer } from '../../runtime/widget-renderer'
import { getTheme2 } from 'jimu-theme'
import { jsx, type IMLayoutItemJson, type IMThemeVariables } from 'jimu-core';
import { type Modifiers } from 'jimu-ui';
import { type ToolbarConfig } from 'jimu-layouts/layout-runtime';

export interface DummyLayoutProps {
  reference: HTMLDivElement
  placement?: Placement
  disableResize?: boolean
  widgetId: string
  controllerId: string
  version?: number
  onClose: () => void
  size: Size
  onSizeChange?: (widgetId: string, size: Size) => void
}

const style = css`
  max-width: 100vw !important;
  /* hide rnd-resize bar for the outermost layout item */
  .controller-configuration-container > * > * > .builder-layout-item > .select-wrapper > .action-area {
      > .rnd-resize-top,
      > .rnd-resize-right,
      > .rnd-resize-bottom,
      > .rnd-resize-left {
        display: none;
      }
    }

    .controller-configuration-container .builder-layout-item > .select-wrapper > .lock-layout-tip {
      display: none;
    }

  .selectable {
    > div {
      cursor: default;
    }
  }

  .widget-container {
    height: 100%;
    overflow: auto;
  }
`

const MIN_SIZE = { width: 150, height: 150 }
const DEFAULT_SIZE = { width: 300, height: 300 }

export const DummyLayout = (props: DummyLayoutProps) => {
  const {
    reference,
    placement,
    disableResize = false,
    widgetId,
    controllerId,
    onClose,
    onSizeChange,
    size,
    version
  } = props

  const title = ReactRedux.useSelector((state: IMState) => state.appConfig.widgets?.[widgetId]?.label)

  const [open, setOpen] = React.useState(!!widgetId)
  hooks.useUpdateEffect(() => {
    setOpen(false)
    setTimeout(() => {
      setOpen(!!widgetId)
    }, 0)
  }, [widgetId])

  const handleEscape = (evt) => {
    if (evt?.key === 'Escape') {
      onClose?.()
      const button = reference?.querySelector('button')
      button?.focus()
    }
  }

  const handleResize = (size) => {
    onSizeChange(widgetId, size)
  }
  const [layoutId, setLayoutId] = React.useState('')
  const [layoutItemId, setLayoutItemId] = React.useState('')
  const [layoutItem, setLayoutItem] = React.useState(null)
  React.useEffect(() => {
    const state = getAppStore().getState()
    const widgetJson = state.appConfig.widgets[widgetId]
    const browserSizeMode = state.browserSizeMode
    let layoutInfos = widgetJson?.parent?.[browserSizeMode] ?? []
    if (layoutInfos.length === 0) {
      layoutInfos = widgetJson?.parent?.[state.appConfig.mainSizeMode] ?? []
    }
    const layouts = state.appConfig.layouts
    const layoutInfo = layoutInfos.find(layoutInfo => {
      const layoutId = layoutInfo.layoutId
      const layout = layouts[layoutId]
      return layout.parent.id === controllerId
    })
    const newLayoutId = layoutInfo?.layoutId ?? ''
    setLayoutId(newLayoutId)
    const newLayoutItemId = layoutInfo?.layoutItemId ?? ''
    setLayoutItemId(newLayoutItemId)
    const layoutContent = layouts[newLayoutId]?.content ?? {}
    setLayoutItem(layoutContent[newLayoutItemId] ?? null)
  }, [controllerId, widgetId])

  const [nodeRef, setNodeRef] = React.useState(null as HTMLDivElement)
  const onRefChange = React.useCallback((node: HTMLDivElement) => {
    if (node.style.visibility !== 'hidden' && node.style.display !== 'none') {
      if (nodeRef !== node) setNodeRef(node)
    } else {
      setNodeRef(null)
    }
  }, [nodeRef])

  const modifiers = [
    {
      name: 'preventOverflow',
      enabled: true,
      options: {
        boundary: 'viewport',
        altAxis: true // allow the popper to overlap its reference element.
      }
    },
    {
      name: 'flip',
      enabled: true,
      options: {
        boundary: 'viewport',
        fallbackPlacements: getFallbackPlacementsModifier(['top-start', 'bottom-start'], true).options.fallbackPlacements
      }
    }
  ]
  const theme = getTheme2()
  const translate = hooks.useTranslation()

  const isDesignMode = ReactRedux.useSelector((state: IMState) => {
    return state.appRuntimeInfo.appMode === AppMode.Design
  })
  const supportInlineEditing = ReactRedux.useSelector((state: IMState) => {
    const widgetJson = state.appConfig.widgets[widgetId]
    return widgetJson?.manifest?.properties?.supportInlineEditing ?? false
  })
  const isInlineEditing = ReactRedux.useSelector((state: IMState) => {
    const widgetRuntimeInfo = state.widgetsRuntimeInfo[widgetId]
    return supportInlineEditing && widgetRuntimeInfo?.isInlineEditing
  })
  const isFunctionalWidget = ReactRedux.useSelector((state: IMState) => {
    const widgetJson = state.appConfig.widgets[widgetId]
    return widgetJson?.manifest?.widgetType !== WidgetType.Layout
  })
  const hasEmbeddedLayout = ReactRedux.useSelector((state: IMState) => {
    const widgetJson = state.appConfig.widgets[widgetId]
    return widgetJson?.manifest?.properties?.hasEmbeddedLayout && Object.keys(widgetJson.layouts ?? {}).length > 0
  })

  const showMask = isDesignMode && !isInlineEditing && isFunctionalWidget && !hasEmbeddedLayout

  const handleDoubleClick = React.useCallback((e) => {
    e.stopPropagation()
    if (supportInlineEditing) {
      getAppStore().dispatch(appActions.setWidgetIsInlineEditingState(widgetId, true))
    }
  }, [widgetId, supportInlineEditing])

  return <React.Fragment>
    <Popper
      modifiers={SINGLE_POPPER_MODIFIERS}
      floating={true}
      open={open}
      headerTitle={title}
      onHeaderClose={onClose}
      showHeaderCollapse={true}
      minSize={MIN_SIZE}
      onResizeStop={handleResize}
      dragBounds="body"
      defaultSize={size || DEFAULT_SIZE}
      css={style}
      version={version}
      className="flex-grow-1"
      reference={reference}
      disableResize={disableResize}
      toggle={handleEscape}
      placement={placement}
      popperNodeRef={onRefChange}
      onClick={(e) => { e.stopPropagation() }}
      onDoubleClick={handleDoubleClick}>
      <div className="widget-container controller-configuration-container d-flex">
        <WidgetRenderer widgetId={widgetId} layoutId={layoutId} layoutItemId={layoutItemId} showMask={showMask} />

      </div>
    </Popper>
  </React.Fragment>
}

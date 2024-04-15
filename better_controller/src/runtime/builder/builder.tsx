/**@jsx jsx */
import { React, jsx, ReactRedux, type IMState, appActions, getAppStore, type Size, Immutable, css, type LayoutItemConstructorProps, BrowserSizeMode, hooks } from 'jimu-core'
import { type IMConfig, type IMSizeMap } from '../../config'
import { type Placement } from 'jimu-ui'
import { DummyLayout } from './layout/dummy-layout'
import { BASE_LAYOUT_NAME } from '../../common/consts'
import { getAppConfigAction, appBuilderSync } from 'jimu-for-builder'
import { getWidgetChildLayoutJson, isWidgetOpening, useControlledWidgets } from '../common/layout-utils'
import { WidgetListPopper } from 'jimu-ui/advanced/setting-components'
import { isLayoutItemAcceptedForController, insertWidgetToLayout } from './utils'
import { LayoutListPlaceholder } from './layout-list-placeholder'
import { PageContext, searchUtils } from 'jimu-layouts/layout-runtime'

export interface BuilderProps {
  id: string
  config: IMConfig
  version?: number
  autoSize?: boolean
}

const widgetPanelStyles = css`
  width: 300px;
  height: 300px;
  overflow-y: auto;
`

const isAddWidgetExt = (node: HTMLElement) => {
  if (!node) return false
  if (node.dataset?.extname === 'controller-add-widget') {
    return true
  }
  const parent = node.parentElement
  return parent?.dataset?.extname === 'controller-add-widget'
}

export const Builder = (props: BuilderProps) => {
  const { id, config, version, autoSize } = props

  const mobile = hooks.useCheckSmallBrowserSizeMode()
  const arrangement = config?.behavior?.arrangement ?? 'floating'
  const vertical = config?.behavior?.vertical
  const size = config.behavior?.size
  const placement: Placement = !vertical ? 'bottom' : 'right-start'

  const { viewOnly } = React.useContext(PageContext)

  const rootRef = React.useRef<HTMLDivElement>(null)

  const widgetsState = ReactRedux.useSelector((state: IMState) => state.widgetsState[id])
  const currentDialogId = ReactRedux.useSelector((state: IMState) => state.appRuntimeInfo?.currentDialogId)
  const showWidgetsPanel = widgetsState?.showWidgetsPanel
  const browserSizeMode = ReactRedux.useSelector((state: IMState) => state.browserSizeMode)

  const scrollRef = React.useRef<(previous: boolean, moveOne?: boolean) => void>()
  //Get all open state widgets in controller
  const widgets = useControlledWidgets(id, BASE_LAYOUT_NAME)
  const showPlaceholder = !Object.keys(widgets ?? {}).length

  const selectedLayoutInfo = ReactRedux.useSelector((state: IMState) => state.appRuntimeInfo.selection)
  const [selectedWidgetId, setSelectedWidgetId] = React.useState('')
  const [selectedLayoutId, setSelectedLayoutId] = React.useState('')
  const [selectedLayoutItemId, setSelectedLayoutItemId] = React.useState('')
  React.useEffect(() => {
    if (selectedLayoutInfo) {
      const state = getAppStore().getState()
      const appConfig = state.appConfig
      const embedWidgetIds = Object.keys(widgets)
      const browserSizeMode = state.browserSizeMode
      const mainSizeMode = state.appConfig.mainSizeMode
      let selectedLayoutItem = searchUtils.findLayoutItem(appConfig, selectedLayoutInfo)
      let parentLayoutInfo = selectedLayoutInfo.asMutable()
      // Consider selecting nested widgets, sections and views in a son widget(like Card, List etc.)
      while (selectedLayoutItem && !embedWidgetIds.includes(selectedLayoutItem?.widgetId)) {
        parentLayoutInfo = searchUtils.findParentLayoutInfo(parentLayoutInfo, appConfig, browserSizeMode) || searchUtils.findParentLayoutInfo(parentLayoutInfo, appConfig, mainSizeMode)
        selectedLayoutItem = searchUtils.findLayoutItem(appConfig, parentLayoutInfo)
      }
      setSelectedWidgetId(selectedLayoutItem?.widgetId ?? '')
      setSelectedLayoutId(parentLayoutInfo?.layoutId ?? '')
      setSelectedLayoutItemId(parentLayoutInfo?.layoutItemId ?? '')
    } else {
      setSelectedWidgetId('')
      setSelectedLayoutId('')
      setSelectedLayoutItemId('')
    }
  }, [selectedLayoutInfo, widgets])

  React.useEffect(() => {
    const openingWidgets = Object.keys(widgets).filter((widgetId) => isWidgetOpening(widgets[widgetId]))
    getAppStore().dispatch(appActions.closeWidgets(openingWidgets))
    if (selectedWidgetId) {
      getAppStore().dispatch(appActions.openWidget(selectedWidgetId, id))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, selectedWidgetId])

  //DOM node used to locate the floating panel in the controller(Only for `onlyOpenOne`)
  const reference = rootRef.current?.querySelector(`div.layout-item[data-layoutid="${selectedLayoutId}"][data-layoutitemid="${selectedLayoutItemId}"]`)
  const selectedWidgetSize = size?.[selectedWidgetId]

  const floatingMode = arrangement === 'floating' || mobile //apply floating behavior to fixed as well in mobile mode

  React.useEffect(() => {
    if (browserSizeMode === BrowserSizeMode.Small && showWidgetsPanel !== undefined) {
      appBuilderSync.publishSidePanelToApp({
        type: 'widget',
        isPlaceholder: false,
        isItemAccepted: isLayoutItemAcceptedForController,
        onSelect: onItemSelect,
        keepPanel: true,
        active: showWidgetsPanel
      })
      // getAppStore().dispatch(appActions.widgetStatePropChange(id, 'showWidgetsPanel', false))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showWidgetsPanel])

  const handleScrollStatusChange = React.useCallback((hideArrow: boolean, disablePrevious?: boolean, disableNext?: boolean) => {
    getAppStore().dispatch(appActions.widgetStatePropChange(id, 'hideArrow', hideArrow))
    getAppStore().dispatch(appActions.widgetStatePropChange(id, 'disablePrevious', disablePrevious))
    getAppStore().dispatch(appActions.widgetStatePropChange(id, 'disableNext', disableNext))
  }, [id])

  //Synchronize the state and method of scroll-list component to toolbar
  React.useEffect(() => {
    getAppStore().dispatch(appActions.widgetStatePropChange(id, 'onArrowClick', scrollRef.current))
  }, [id])

  const closeWidgetsPanel = React.useCallback(() => {
    getAppStore().dispatch(appActions.widgetStatePropChange(id, 'showWidgetsPanel', false))
  }, [id])

  React.useEffect(() => {
    if (currentDialogId) {
      closeWidgetsPanel()
    }
  }, [closeWidgetsPanel, currentDialogId])

  const updateWidgetConfig = (config: IMConfig) => {
    getAppConfigAction().editWidgetConfig(id, config).exec()
  }

  const onWidgetSizeChanged = (widgetId: string, _size: Size) => {
    if (!widgetId) {
      return
    }
    let size = config?.behavior.size || Immutable({}) as IMSizeMap
    size = size.set(widgetId, _size)
    updateWidgetConfig(config.setIn(['behavior', 'size'], size))
  }

  const afterRemoveWidget = (widgetId: string) => {
    if (config.behavior.openStarts.includes(widgetId)) {
      updateWidgetConfig(config.setIn(['behavior', 'openStarts'], config.behavior.openStarts.filter(id => id !== widgetId)))
    }
  }

  const clickXY = React.useRef([0, 0])
  const handleItemClick = (evt: React.MouseEvent<HTMLDivElement>) => {
    if (viewOnly) return
    const reference = evt.currentTarget
    const widgetId = reference.dataset?.widgetid
    const isDragging = clickXY.current[0] !== evt.clientX || clickXY.current[1] !== evt.clientY
    if (widgetId && !isDragging) {
      evt.stopPropagation()
      const layout = getWidgetChildLayoutJson(id, BASE_LAYOUT_NAME)
      const layoutItemId = Object.keys(layout.content).find(itemId => layout.content[itemId].widgetId === widgetId)
      getAppStore().dispatch(appActions.selectionChanged({ layoutId: layout.id, layoutItemId }))
    }
  }
  const handleMouseDown: React.MouseEventHandler = (e) => {
    clickXY.current = [e.clientX, e.clientY]
  }

  const handleClose = (e) => {
    if (!isAddWidgetExt(e?.target)) {
      closeWidgetsPanel()
    }
  }

  const handleRootClick = (evt: React.MouseEvent<HTMLDivElement>) => {
    const target = evt.target as HTMLElement
    const root = rootRef.current
    if (!target || !root) return
    if (root.contains(target)) {
      closeWidgetsPanel()
    }
  }

  const onItemSelect = (item: LayoutItemConstructorProps) => {
    const layout = getWidgetChildLayoutJson(id, BASE_LAYOUT_NAME)
    const insertIndex = layout.order?.length ?? 0
    insertWidgetToLayout(layout, item, insertIndex)
  }

  // Select controller after closing child widget
  const closeChildWidget = () => {
    const state = getAppStore().getState()
    const appConfig = state.appConfig
    const browserSizeMode = state.browserSizeMode
    const layoutInfosObject = appConfig.widgets[id].parent
    let controllerLayoutInfos = layoutInfosObject[browserSizeMode] ?? []
    if (controllerLayoutInfos.length === 0) {
      const mainSizeMode = appConfig.mainSizeMode
      controllerLayoutInfos = layoutInfosObject[mainSizeMode] ?? []
    }
    if (controllerLayoutInfos.length > 0) {
      getAppStore().dispatch(appActions.selectionChanged(controllerLayoutInfos[0]))
    } else {
      getAppStore().dispatch(appActions.selectionChanged(null))
    }
  }

  return <div className='controller-builder w-100 h-100' ref={rootRef} onClick={handleRootClick}>
    {(selectedWidgetId && floatingMode) &&
      <DummyLayout
        reference={reference as HTMLDivElement}
        version={version}
        disableResize={mobile}
        widgetId={selectedWidgetId}
        controllerId={id}
        size={selectedWidgetSize}
        onClose={closeChildWidget}
        onSizeChange={onWidgetSizeChanged}
        placement={placement}
      />
    }
    <LayoutListPlaceholder
      autoSize={autoSize}
      scrollRef={scrollRef}
      showPlaceholder={showPlaceholder}
      onScrollStatusChange={handleScrollStatusChange}
      vertical={config?.behavior?.vertical}
      widgetId={id}
      onItemClick={handleItemClick}
      onMouseDown={handleMouseDown}
      itemStyle={config.appearance.card as any}
      draggable={true}
      markerEnabled={!viewOnly}
      space={config?.appearance?.space}
      afterRemoveWidget={afterRemoveWidget}
    />
    {showWidgetsPanel && browserSizeMode !== BrowserSizeMode.Small &&
      <WidgetListPopper
        css={widgetPanelStyles}
        placement='right-start'
        referenceElement={rootRef.current}
        isAccepted={isLayoutItemAcceptedForController}
        onSelect={onItemSelect}
        onClose={handleClose}
      />
    }
  </div>
}

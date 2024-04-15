import { React, type IMLayoutJson, type ImmutableObject, type IMRuntimeInfo, type IMRuntimeInfos, type IMState, ReactRedux, type RuntimeInfo, type SizeModeLayoutJson, Immutable, getAppStore, WidgetState } from 'jimu-core'
import { searchUtils } from 'jimu-layouts/layout-runtime'

/**
 * Get all child widegts in the specified widegt(e.g. widget controller) by passing widegtId and widget layout name as params.
 *
 * Note: React custom hook
 * @param widgetId The id of a exb widget
 * @param layoutName  The layout name of a widget layout
 */
export const useControlledWidgets = (widgetId: string, layoutName: string): IMRuntimeInfos => {
  const widgetsRuntimeInfo = ReactRedux.useSelector((state: IMState) => state.widgetsRuntimeInfo)
  const layout = useWidgetChildLayoutJson(widgetId, layoutName)
  const widgetIds = getWidgetIdsFromLayout(layout)

  return React.useMemo(() => {
    const runtimeInfos: { [id: string]: IMRuntimeInfo } = {}
    widgetIds.forEach((widgetId) => {
      const runtimeInfo: RuntimeInfo = widgetsRuntimeInfo?.[widgetId] ?? {
        isClassLoaded: false
      }
      runtimeInfos[widgetId] = Immutable(runtimeInfo)
    })
    return Immutable(runtimeInfos)
  }, [widgetIds, widgetsRuntimeInfo])
}

/**
 * Gets the child layout json in the specified widget.
 */
export const useWidgetChildLayoutJson = (widgetId: string, layoutName: string) => {
  const layout = ReactRedux.useSelector((state: IMState) => {
    const layouts = state.appConfig.widgets?.[widgetId]?.layouts?.[layoutName]
    const browserSizeMode = state.browserSizeMode
    const mainSizeMode = state.appConfig.mainSizeMode
    const layoutId = searchUtils.findLayoutId(layouts, browserSizeMode, mainSizeMode)
    const layout = state.appConfig.layouts?.[layoutId]
    return layout
  })
  return layout
}

/**
 * Get the child layout json in the specified widget.
 */
export const getWidgetChildLayoutJson = (widgetId: string, layoutName: string) => {
  const appConfig = getAppStore().getState().appConfig
  const browserSizeMode = getAppStore().getState().browserSizeMode
  const layouts = appConfig.widgets?.[widgetId]?.layouts?.[layoutName]
  const layoutId = searchUtils.findLayoutId(layouts, browserSizeMode, appConfig.mainSizeMode)
  const layout = appConfig.layouts?.[layoutId]
  return layout
}

/**
 * Get the layout json in current size mode.
 */
export const getCurrentLayoutJson = (layouts: ImmutableObject<SizeModeLayoutJson>): IMLayoutJson => {
  const state = getAppStore().getState()
  const layoutId = searchUtils.findLayoutId(layouts, state.browserSizeMode, state.appConfig.mainSizeMode)
  return state.appConfig.layouts?.[layoutId]
}

/**
 *  Get visible orders from `layout`
 * @param layout
 */
export const getVisibleOrderFromLayout = (layout: IMLayoutJson): string[] => {
  const order = layout?.order?.asMutable?.() ?? []
  let layoutItems = order.map(itemId => layout.content?.[itemId])
  layoutItems = layoutItems.filter(layoutItem => (layoutItem && layoutItem.id && layoutItem.widgetId && !layoutItem.isPending))
  return layoutItems.map(layoutItem => layoutItem.id)
}

/**
 *  Gets the child widgets in the widget layout.
 * @param layout
 */
export const getWidgetIdsFromLayout = (layout: IMLayoutJson): string[] => {
  const order = getVisibleOrderFromLayout(layout)
  return order.map(itemId => layout.content?.[itemId]?.widgetId)
}

/**
 * Get the layout item id by widget id.
 * @param layout
 * @param widgetId
 */
export const getLayoutItemId = (layout: IMLayoutJson, widgetId: string): string => {
  if (layout?.content == null || !widgetId) return
  return Object.keys(layout.content).find(id => layout.content[id].widgetId === widgetId)
}

/**
 * Judge a widget is opened or active by runtimeInfo
 * @param runtimeInfo
 */
export const isWidgetOpening = (runtimeInfo: RuntimeInfo): boolean => {
  return [WidgetState.Opened, WidgetState.Active].includes(runtimeInfo.state)
}

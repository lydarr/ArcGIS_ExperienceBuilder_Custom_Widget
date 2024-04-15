import { React, classNames, type IMRuntimeInfos, Immutable, getAppStore, appActions } from 'jimu-core'
import { MobilePanel } from 'jimu-ui'
import { WidgetRenderer } from './widget-renderer'
import { getLayoutItemId, isWidgetOpening, useWidgetChildLayoutJson } from '../common/layout-utils'
import { BASE_LAYOUT_NAME } from '../../common/consts'

export interface MobileWidgetLuncherProps {
  controllerId: string
  containerMapId: string
  widgets: IMRuntimeInfos
  onClose?: (id?: string) => any
}

const DefaultWidgets = Immutable({}) as IMRuntimeInfos
export const MobileWidgetLuncher = (props: MobileWidgetLuncherProps) => {
  const { controllerId, containerMapId, onClose, widgets = DefaultWidgets } = props

  const openingWidget = Object.keys(widgets).find((widgetId) => isWidgetOpening(widgets[widgetId])) ?? ''
  const title = getAppStore().getState().appConfig.widgets?.[openingWidget]?.label

  const layout = useWidgetChildLayoutJson(controllerId, BASE_LAYOUT_NAME)
  const handleClick = React.useCallback((evt: React.MouseEvent<HTMLDivElement>, widgetId: string) => {
    evt.stopPropagation()
    const layoutId = layout?.id
    const layoutItemId = getLayoutItemId(layout, widgetId)
    const selection = getAppStore().getState().appRuntimeInfo?.selection

    if (!selection || selection.layoutId !== layoutId || selection.layoutItemId !== layoutItemId) {
      getAppStore().dispatch(appActions.selectionChanged({ layoutId, layoutItemId }))
    }
  }, [layout])

  const handleClose = (evt?: React.MouseEvent<HTMLDivElement>) => {
    evt?.stopPropagation()
    evt?.nativeEvent.stopImmediatePropagation()
    onClose?.(openingWidget)
  }

  return (
    <MobilePanel
      className={classNames({ 'd-none': !openingWidget })}
      mapWidgetId={containerMapId}
      title={title}
      open={!!openingWidget}
      keepMount={true}
      onClose={handleClose}
    >
      {Object.entries(widgets).map(([id, runtimeInfo]) => {
        const opened = runtimeInfo.state !== undefined
        if (!opened) return null
        const opening = isWidgetOpening(runtimeInfo)

        return (
          <WidgetRenderer
            key={id}
            widgetId={id}
            onClick={(evt) => { handleClick(evt, id) }}
            className={classNames({ 'd-none': !opening })}
          ></WidgetRenderer>
        )
      })}
    </MobilePanel>
  )
}

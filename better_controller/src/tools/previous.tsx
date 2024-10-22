import { type extensionSpec, type React, getAppStore, type LayoutContextToolProps, i18n, appActions } from 'jimu-core'
import { defaultMessages } from 'jimu-ui'
import rightOutlined from 'jimu-icons/svg/outlined/directional/right.svg'
import leftOutlined from 'jimu-icons/svg/outlined/directional/left.svg'

export default class Previous implements extensionSpec.ContextToolExtension {
  index = 1
  id = 'controller-roll-list-previous'
  widgetId: string

  classes: { [widgetId: string]: React.ComponentClass<unknown> } = {}

  visible (props: LayoutContextToolProps) {
    const hideArrow = getAppStore().getState().widgetsState[props.layoutItem.widgetId]?.hideArrow ?? true
    return !hideArrow
  }

  disabled (props: LayoutContextToolProps) {
    const widgetState = getAppStore().getState().widgetsState[props.layoutItem.widgetId]
    return widgetState?.disablePrevious
  }

  getGroupId () {
    return 'controller-tools'
  }

  getTitle () {
    const intl = i18n.getIntl('_jimu')
    return intl ? intl.formatMessage({ id: 'previous', defaultMessage: defaultMessages.previous }) : 'Previous'
  }

  getIcon () {
    const isRTL = getAppStore().getState().appContext?.isRTL
    return !isRTL ? leftOutlined : rightOutlined
  }

  onClick (props: LayoutContextToolProps) {
    const widgetId = props.layoutItem.widgetId
    const widgetState = getAppStore().getState().widgetsState[props.layoutItem.widgetId]
    if (widgetState?.onArrowClick) {
      widgetState.onArrowClick(true, false)
      let version = widgetState?.version ?? 0
      getAppStore().dispatch(appActions.widgetStatePropChange(widgetId, 'version', ++version))
    }
  }

  getSettingPanel (props: LayoutContextToolProps): React.ComponentClass<unknown> {
    return null
  }
}

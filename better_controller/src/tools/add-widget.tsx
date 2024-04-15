import { type extensionSpec, type React, getAppStore, type LayoutContextToolProps, i18n, appActions } from 'jimu-core'
import { defaultMessages } from 'jimu-ui'
import PlusOutlined from 'jimu-icons/svg/outlined/editor/plus.svg'

export default class AddWidget implements extensionSpec.ContextToolExtension {
  index = 3
  id = 'conttroller-add-widget1'
  name = 'conttroller-add-widget2'
  widgetId: string

  classes: { [widgetId: string]: React.ComponentClass<unknown> } = {}

  getGroupId () {
    return 'controller-tools'
  }

  getTitle () {
    const intl = i18n.getIntl('_jimu')
    return intl ? intl.formatMessage({ id: 'addWidget', defaultMessage: defaultMessages.addWidget }) : 'Add widget'
  }

  getIcon () {
    return PlusOutlined
  }

  checked (props: LayoutContextToolProps): boolean {
    const widgetId = props.layoutItem.widgetId
    const widgetState = getAppStore().getState().widgetsState[widgetId]

    const showWidgetsPanel = !!widgetState?.showWidgetsPanel
    return showWidgetsPanel
  }

  onClick (props: LayoutContextToolProps): void {
    const widgetId = props.layoutItem.widgetId
    const widgetState = getAppStore().getState().widgetsState[widgetId]

    const showWidgetsPanel = !widgetState?.showWidgetsPanel
    getAppStore().dispatch(appActions.widgetStatePropChange(widgetId, 'showWidgetsPanel', showWidgetsPanel))
  }

  getSettingPanel (props: LayoutContextToolProps): React.ComponentClass<unknown> {
    return null
  }
}

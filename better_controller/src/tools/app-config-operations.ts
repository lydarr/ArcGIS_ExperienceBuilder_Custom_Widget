import { type extensionSpec, type IMAppConfig, type ImmutableArray } from 'jimu-core'
import { type IMConfig } from '../config'

export default class AppConfigOperation implements extensionSpec.AppConfigOperationsExtension {
  id = 'controller-app-config-operation'
  widgetId: string

  afterWidgetCopied (
    sourceWidgetId: string,
    sourceAppConfig: IMAppConfig,
    destWidgetId: string,
    destAppConfig: IMAppConfig,
    widgetMap?: { [key: string]: string }
  ): IMAppConfig {
    const widgetJson = sourceAppConfig.widgets[sourceWidgetId] // widgetJson being copied
    const copiedWidgetJson = destAppConfig.widgets[destWidgetId]
    const config: IMConfig = widgetJson?.config

    // process the controller panels
    const panelConfig = sourceAppConfig.controllerPanels?.[sourceWidgetId]
    if (panelConfig) {
      destAppConfig = destAppConfig.setIn(['controllerPanels', destWidgetId], panelConfig)
    }

    if (!config?.behavior?.openStarts || config?.behavior?.openStarts?.length <= 0) {
      return destAppConfig
    }

    const useWidgetIds: ImmutableArray<string> = config.behavior.openStarts
    const newUseWidgetIds: string[] = []

    if (widgetMap) {
      useWidgetIds.forEach(wId => {
        // widgetMap[wId] is the linked widget id after copying
        newUseWidgetIds.push(widgetMap[wId])
      })
    } else {
      useWidgetIds.forEach(wId => {
        // use large mode only here. all size mode should keep sync
        const sourceLayoutJson = sourceAppConfig.layouts[widgetJson.layouts.controller.LARGE]
        const destLayoutJson = destAppConfig.layouts[copiedWidgetJson.layouts.controller.LARGE]

        sourceLayoutJson?.order.forEach((itemId, i) => {
          if (sourceLayoutJson.content[itemId].widgetId === wId) {
            const newWId = destLayoutJson.content[destLayoutJson.order[i]].widgetId
            newUseWidgetIds.push(newWId)
          }
        })
      })
    }

    return destAppConfig.setIn(['widgets', destWidgetId, 'config', 'behavior', 'openStarts'], newUseWidgetIds)
  }

  /**
   * Do some cleanup operations before current widget is removed.
   * @returns The updated appConfig
   */
  widgetWillRemove (appConfig: IMAppConfig): IMAppConfig {
    // process the controller panels
    if (appConfig.controllerPanels?.[this.widgetId]) {
      return appConfig.set('controllerPanels', appConfig.controllerPanels.without(this.widgetId))
    }
    return appConfig
  }
}

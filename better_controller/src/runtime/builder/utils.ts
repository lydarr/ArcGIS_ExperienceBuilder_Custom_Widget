import { LayoutItemType, type LayoutItemConstructorProps, type IMLayoutJson, type LayoutInfo, getAppStore, appActions, ReactRedux, type IMState } from 'jimu-core'
import { utils } from 'jimu-layouts/layout-runtime'
import { appBuilderSync, getAppConfigAction } from 'jimu-for-builder'
import { addItemToLayout } from 'jimu-layouts/layout-builder'

export const isLayoutItemAcceptedForController = (item: LayoutItemConstructorProps): boolean => {
  const itemType = item?.itemType
  const name = item?.manifest?.name
  return itemType !== LayoutItemType.Section && !['controller'].includes(name) && !utils.isWidgetPlaceholder(utils.getAppConfig(), item)
}

export const calInsertPositionForColumn = (boundingRect: Partial<DOMRectReadOnly>,
  childRects: Array<Partial<DOMRectReadOnly> & { id: string }>,
  clientY: number): { insertY: number, refId: string } => {
  let result, refId
  let found = false
  childRects.some((rect, i) => {
    const rectY = rect.top + rect.height / 2
    if (rectY > clientY) {
      if (i === 0) { // insert before the first item
        result = rect.top
      } else { // insert between this and previous one
        const previousItem = childRects[i - 1]
        result = (rect.top + previousItem.top + previousItem.height) / 2
      }
      found = true
      refId = rect.id
    }
    return found
  })
  if (!found) { // insert after the last one
    const lastItem = childRects[childRects.length - 1]
    result = lastItem.top + lastItem.height
  }
  return {
    insertY: result,
    refId
  }
}

export const calInsertPositionForRow = (boundingRect: Partial<DOMRectReadOnly>,
  childRects: Array<Partial<DOMRectReadOnly> & { id: string }>,
  clientX: number): { insertX: number, refId: string } => {
  let result, refId
  let found = false
  childRects.some((rect, i) => {
    const rectX = rect.left + rect.width / 2
    if (rectX > clientX) {
      if (i === 0) { // insert before the first item
        result = rect.left
      } else { // insert between this and previous one
        const previousItem = childRects[i - 1]
        result = (rect.left + previousItem.left + previousItem.width) / 2
      }
      found = true
      refId = rect.id
    }
    return found
  })
  if (!found) { // insert after the last one
    const lastItem = childRects[childRects.length - 1]
    result = lastItem.left + lastItem.width
  }
  return {
    insertX: result,
    refId
  }
}

export const insertWidgetToLayout = (
  layout: IMLayoutJson,
  itemProps: LayoutItemConstructorProps,
  insertIndex: number
) => {
  const layoutInfo = {
    layoutId: layout.id
  }

  let appConfigAction = getAppConfigAction()
  addItemToLayout(appConfigAction.appConfig, itemProps, layout.id)
    .then((result) => {
      appConfigAction = getAppConfigAction(result.updatedAppConfig)
      appConfigAction.adjustOrderOfItem(result.layoutInfo, insertIndex || 0)
      appConfigAction.editLayoutItemProperty(result.layoutInfo, 'bbox', {})
      getAppStore().dispatch(appActions.layoutChanged(appConfigAction.appConfig, layoutInfo))
    })
}

export const removeLayoutItem = (layoutInfo: LayoutInfo) => {
  appBuilderSync.publishConfirmDeleteToApp(layoutInfo)
}

/**
 * Check whether controller widget or controlled widgets by controller widget is selected
 */
export const useControlledWidgetsSelected = (widgetLayoutId: string, controllerLayoutId: string, nodeRef: React.RefObject<HTMLDivElement>) => {
  const selection = ReactRedux.useSelector((state: IMState) => state.appRuntimeInfo.selection)
  if (!selection) return false
  if (widgetLayoutId === selection.layoutId || controllerLayoutId === selection.layoutId) return true

  const nested = nodeRef.current?.querySelector(`div.layout[data-layoutid="${controllerLayoutId}"] div.layout[data-layoutid="${selection.layoutId}"]`)
  return nested != null
}

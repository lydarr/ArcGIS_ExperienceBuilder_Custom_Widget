/**
 * Get widget card node.
 * @param widgetId
 */
export const getWidgetCardNode = (widgetId: string): HTMLButtonElement => {
  const node = document.querySelector(`.widget-controller .avatar-card[data-widgetid='${widgetId}']`)
  return node as HTMLButtonElement
}

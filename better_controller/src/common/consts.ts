import { type ControllerPanelJson, ControllerPosition } from 'jimu-core'
import { type ControlPosition } from 'jimu-ui'

// Width of placeholder when dragging
export const DROP_ZONE_PLACEHOLDER_WIDTH = 5
// Widgets layout name in controller
export const BASE_LAYOUT_NAME = 'controller'

// Three sizes of widget cards
export const WIDGET_ITEM_SIZES = {
  sm: 24,
  default: 32,
  lg: 48
}
// Minimum size of open widget panel
export const MIN_PANEL_SIZE = { width: 150, height: 120 }
// The default size of the widget panel
export const DEFAULT_PANEL_SIZE = { width: 300, height: 300 }
// The starting position for widget panel of multiple mode
export const DEFAULT_WIDGET_START_POSITION: ControlPosition = {
  x: 70,
  y: 70
}
// Spacing between panels of multiple mode
export const DEFAULT_PANEL_SPACE = { x: 30, y: 30 }

export const DEFAULT_FIXED_LAYOUT_STYLE: ControllerPanelJson = {
  position: ControllerPosition.TopRight,
  width: '320px',
  height: '480px',
  offsetX: 0,
  offsetY: 0
}

// Popper modifiers in single-floating mode
export const SINGLE_POPPER_MODIFIERS = [
  {
    name: 'preventOverflow',
    options: {
      boundary: document.body,
      rootBoundary: document
    }
  },
  {
    name: 'offset',
    options: {
      offset: [0, 16]
    }
  }
]

import { React, type IMLayoutItemJson, classNames } from 'jimu-core'
import { withRnd } from 'jimu-layouts/layout-builder'
import { type WidgetAvatarCardProps, WidgetAvatarCard } from '../../common'

const WidgetRndAvatarCard = withRnd(false)(WidgetAvatarCard as any)

export interface ControllerLayoutItemProps extends Omit<WidgetAvatarCardProps, 'onDragStart' | 'onDragEnd' | 'onMarkerClick'> {
  draggable?: boolean
  layoutId: string
  layoutItem: IMLayoutItemJson
  layoutItemId: string
  removeWidget: (widgetId: string) => void
}

export const LayoutItem = (props: ControllerLayoutItemProps) => {
  const {
    className,
    draggable,
    layoutId,
    layoutItem,
    onClick,
    label,
    showLabel,
    showIndicator,
    showTooltip,
    labelGrowth,
    markerEnabled,
    avatar,
    active,
    removeWidget
  } = props

  return (
    <WidgetRndAvatarCard
      className={classNames(className, 'layout-item', 'align-items-center')}
      layoutId={layoutId}
      layoutItem={layoutItem}
      widgetid={layoutItem.widgetId}
      layoutItemId={layoutItem.id}
      label={label}
      markerEnabled={markerEnabled}
      showLabel={showLabel}
      showIndicator={showIndicator}
      showTooltip={showTooltip}
      labelGrowth={labelGrowth}
      avatar={avatar}
      active={active}
      editDraggable={draggable}
      useDragHandler={true}
      onClick={onClick as any}
      onMarkerClick={() => { removeWidget(layoutItem.widgetId) }}
    />
  )
}

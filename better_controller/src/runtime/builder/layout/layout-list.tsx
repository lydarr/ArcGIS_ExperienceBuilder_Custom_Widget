import { React, classNames, ReactRedux, type IMState } from 'jimu-core'
import { type ScrollListProps, ScrollList } from '../../common/scroll-list'
import { getListItemLength } from '../../common/utils'
import { BASE_LAYOUT_NAME, DROP_ZONE_PLACEHOLDER_WIDTH } from '../../../common/consts'
import { type AvatarCardProps } from '../../common/avatar-card'
import { LayoutContext } from 'jimu-layouts/layout-runtime'
import { DrapZone } from './drop-zone'
import { LayoutItem } from './layout-item'
import { isLayoutItemAcceptedForController, removeLayoutItem } from '../utils'
import { getBuilderThemeVariables } from 'jimu-theme'
import { getVisibleOrderFromLayout, isWidgetOpening, useControlledWidgets, useWidgetChildLayoutJson } from '../../common/layout-utils'

export interface LayoutListProps extends Omit<ScrollListProps, 'lists' | 'createItem' | 'itemLength'> {
  widgetId: string
  itemStyle?: AvatarCardProps
  draggable?: boolean
  space: number
  dropZoneRef?: (ref: HTMLDivElement) => void
  onItemClick?: (evt: React.MouseEvent<HTMLDivElement>) => void
  scrollRef?: React.RefObject<(previous: boolean, moveOne?: boolean) => void>
  markerEnabled?: boolean
  autoSize?: boolean
  placeholder?: React.ReactNode
  afterRemoveWidget: (widgetId: string) => void
}

export const LayoutList = React.forwardRef((props: LayoutListProps, ref: React.RefObject<HTMLDivElement>) => {
  const { widgetId, draggable, itemStyle, vertical, className, space, dropZoneRef, onItemClick, onClick, scrollRef, markerEnabled = true, autoSize, placeholder, afterRemoveWidget, ...others } = props
  const layouts = ReactRedux.useSelector((state: IMState) => state.appConfig.widgets?.[widgetId]?.layouts?.[BASE_LAYOUT_NAME])
  const layout = useWidgetChildLayoutJson(widgetId, BASE_LAYOUT_NAME)
  const order = getVisibleOrderFromLayout(layout)
  const builderTheme = getBuilderThemeVariables()
  //Get all open state widgets in controller
  const widgets = useControlledWidgets(widgetId, BASE_LAYOUT_NAME)
  const openingWidgets = Object.keys(widgets).filter((widgetId) => isWidgetOpening(widgets[widgetId]))
  const itemLength = getListItemLength(itemStyle, space)
  const placeholderProps = {
    color: builderTheme?.colors.palette.primary[700],
    size: [itemLength, DROP_ZONE_PLACEHOLDER_WIDTH]
  }

  const createItem = (itemId: string, className: string) => {
    const layoutItem = layout.content[itemId]
    const widgetId = (layoutItem && layoutItem.widgetId) || ''
    const active = openingWidgets.includes(widgetId)

    const removeWidget = (widgetId: string) => {
      removeLayoutItem({ layoutId: layout.id, layoutItemId: itemId })
      afterRemoveWidget(widgetId)
    }

    return (
      <LayoutItem
        {...itemStyle}
        key={itemId}
        className={classNames(`layout-${layout?.id}-item layout-item`, className)}
        widgetid={widgetId}
        layoutId={layout.id}
        layoutItemId={itemId}
        draggable={draggable}
        markerEnabled={markerEnabled}
        layoutItem={layoutItem}
        active={active}
        removeWidget={removeWidget}
        onClick={onItemClick}
      />
    )
  }

  return (
    <LayoutContext.Provider value={{ isItemAccepted: isLayoutItemAcceptedForController }}>
      <div
        ref={ref}
        className={classNames(className, 'layout controller-layout w-100 h-100 d-flex align-items-center justify-content-center')}
        data-layoutid={layout.id}
        onClick={onClick}
      >
        <DrapZone
          widgetId={widgetId}
          vertical={vertical}
          layout={layout}
          childClass={`layout-${layout.id}-item`}
          placeholder={placeholderProps}
          layouts={layouts}
        />
        {!placeholder
          ? <ScrollList
            {...others}
            autoSize={autoSize}
            scrollRef={scrollRef}
            className='layout-item-list'
            vertical={vertical}
            itemLength={itemLength}
            space={space}
            autoHideArrow
            lists={order as any}
            autoScrollEnd={true}
            createItem={createItem}
          />
          : placeholder}
      </div>
    </LayoutContext.Provider>
  )
})

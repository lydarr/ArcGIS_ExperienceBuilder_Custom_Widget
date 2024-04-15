import { React } from 'jimu-core'
import { ListPlaceholder } from '../common'
import { LayoutList, type LayoutListProps } from './layout/layout-list'

export interface LayoutListPlaceholderProps extends LayoutListProps {
  showPlaceholder: boolean
}

export const LayoutListPlaceholder = React.forwardRef((props: LayoutListPlaceholderProps, ref: React.RefObject<HTMLDivElement>) => {
  const { showPlaceholder, itemStyle, space: propSpace, vertical, ...others } = props
  const space = vertical ? propSpace : itemStyle.labelGrowth

  return <LayoutList
    className='w-100 h-100'
    ref={ref}
    itemStyle={itemStyle}
    space={propSpace}
    vertical={vertical}
    placeholder={showPlaceholder ? <ListPlaceholder size={itemStyle.avatar?.size} space={space} vertical={vertical} /> : undefined}
    {...others} />
})

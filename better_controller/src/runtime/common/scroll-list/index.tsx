/** @jsx jsx */
import { React, css, jsx, classNames, polished, hooks } from 'jimu-core'
import { type NavButtonGroupProps, NavButtonGroup, utils, defaultMessages } from 'jimu-ui'
import { useResponsiveViewport } from './utils'

export interface ScrollListProps extends Omit<NavButtonGroupProps, 'placeholder'> {
  scrollRef?: React.Ref<((previous: boolean, moveOne?: boolean) => void)>
  space?: number
  lists: string[]
  createItem: (item: string, props: any) => React.ReactElement
  autoHideArrow?: boolean
  itemLength: number
  minLength?: number
  autoScrollEnd?: boolean
  autoSize?: boolean
  onScrollStatusChange?: (hideArrow: boolean, disablePrevious?: boolean, disableNext?: boolean) => void
}
const useStyle = (vertical: boolean, space: number, minLength: number, autoSize: boolean, hideArrow: boolean) => {
  return css`
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    button.previous, button.next {
      flex-shrink: 0;
      display: ${!hideArrow ? 'block' : 'none'};
    }
    .root {
      flex-direction: ${vertical ? 'column' : 'row'};
      width: 100%;
      height: 100%;
      min-width: ${polished.rem(minLength)};
      max-height: ${!autoSize ? 'calc(100% - 20px)' : '100%'};
      max-width: ${!autoSize ? 'calc(100% - 20px)' : '100%'};
      display: flex;
      justify-content: center;
      flex-wrap: nowrap;
      align-items: center;
      .scroll-list-item {
        &:not(:first-of-type) {
          margin-top: ${vertical ? polished.rem(space) : 'unset'};
          margin-left: ${!vertical ? polished.rem(space) : 'unset'};
        }
      }
    }
`
}

const DefaultList = []
export const ScrollList = React.forwardRef((props: ScrollListProps, ref: React.Ref<HTMLDivElement>) => {
  const {
    scrollRef,
    className,
    lists = DefaultList,
    createItem,
    vertical,
    itemLength,
    space,
    onChange,
    autoHideArrow,
    minLength = itemLength,
    autoScrollEnd,
    autoSize,
    onScrollStatusChange,
    ...others
  } = props

  const translate = hooks.useTranslation(defaultMessages)

  const [rootRef, handleRef] = hooks.useForwardRef(ref)

  const {
    start,
    end,
    disablePrevious,
    disableNext,
    hideArrow,
    scroll
  } = useResponsiveViewport({ rootRef, lists, itemLength, autoSize, vertical, space, minLength, autoScrollEnd })

  const visibleList = lists.slice(start, end)
  const style = useStyle(vertical, space, minLength, autoSize, hideArrow)

  React.useEffect(() => {
    onScrollStatusChange?.(hideArrow, disablePrevious, disableNext)
  }, [disableNext, disablePrevious, hideArrow, onScrollStatusChange])

  React.useEffect(() => {
    utils.setRef(scrollRef, scroll)
  }, [scroll, scrollRef])

  const handleChange = (previous: boolean) => {
    onChange?.(previous)
    scroll(previous, true)
  }

  return <NavButtonGroup
    {...others}
    css={style}
    type="tertiary"
    vertical={vertical}
    onChange={handleChange}
    disablePrevious={disablePrevious}
    disableNext={disableNext}
    previousAriaLabel={translate('previous')}
    nextAriaLabel={translate('next')}
    className={classNames('scroll-list', className)}>
    <div className="root scroll-list-root" ref={handleRef}>
      {
        lists.map((item) => {
          const hidden = !visibleList.includes(item)
          return createItem(item, classNames('scroll-list-item', { 'd-none': hidden }))
        })
      }
    </div>
  </NavButtonGroup>
})

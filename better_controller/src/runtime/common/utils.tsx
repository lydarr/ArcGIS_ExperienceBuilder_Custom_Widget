import { React, getAppStore, type WidgetProps, WidgetManager, lodash, hooks } from 'jimu-core'
import { getItemLength, type AvatarCardProps } from './avatar-card'

/**
 * Get AvatarCard element length by AvatarCard props and space
 * @param props The props of AvatarCard
 * @param space Spacing between each AvatarCard element
 */
export const getListItemLength = (props: AvatarCardProps, space: number) => {
  const showLabel = props?.showLabel
  const labelGrowth = props?.labelGrowth
  const size = props?.avatar.size
  const shape = props?.avatar.shape

  const baseLength = getItemLength(size, showLabel, shape)
  return baseLength + space + labelGrowth
}

export const loadWidgetClass = (widgetId: string): Promise<React.ComponentType<WidgetProps>> => {
  if (!widgetId) return
  const isClassLoaded = getAppStore().getState().widgetsRuntimeInfo?.[widgetId]?.isClassLoaded
  if (!isClassLoaded) {
    return WidgetManager.getInstance().loadWidgetClass(widgetId)
  } else {
    return Promise.resolve(WidgetManager.getInstance().getWidgetClass(widgetId))
  }
}

/**
 * Debounce monitor element size
 * @param rootRef
 * @param duration
 * @param vertical
 */
export const useObserveDebouncedLength = (
  rootRef: React.RefObject<HTMLElement>,
  duration: number = 500,
  vertical: boolean = false,
  enable?: boolean
) => {
  const clientSize = vertical ? 'clientHeight' : 'clientWidth'
  const [length, setLength] = React.useState(rootRef.current?.[clientSize] ?? 0)
  const noobserve = !enable && !window.jimuConfig.isInBuilder

  const fn = () => {
    const node = rootRef.current
    const length = node[clientSize] || 0
    setLength(length)
  }

  const fnRef = hooks.useLatest(fn)
  const debounced = React.useMemo(
    () =>
      lodash.debounce(() => {
        fnRef.current()
      }, duration, { leading: true }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  //Use ResizeObserver to monitor the size change of root dom
  React.useEffect(() => {
    if (noobserve) return
    const node = rootRef.current
    if (node) {
      debounced()
    }
    const resizeObserver = new ResizeObserver(debounced)
    resizeObserver.observe(node)
    return () => {
      resizeObserver.disconnect()
      debounced.cancel()
    }
  }, [rootRef, debounced, noobserve])

  return length
}

/**
 * make sure controller won't exceed body, issue:16756
 * @param duration
 * @param vertical
 */
export const useMaxLength = (
  duration: number = 500,
  vertical: boolean = false
) => {
  const clientSize = vertical ? 'clientHeight' : 'clientWidth'
  const [length, setLength] = React.useState(() => document.body[clientSize] - 40)
  hooks.useUpdateEffect(() => {
    setLength(document.body[clientSize] - 40)
  }, [clientSize])
  const debounced = React.useMemo(() =>
    lodash.debounce(() => {
      setLength(document.body[clientSize] - 40)
    }, duration), [clientSize, duration]
  )
  React.useEffect(() => {
    window.addEventListener('resize', debounced)
    return () => {
      window.removeEventListener('resize', debounced)
    }
  }, [debounced])
  return length
}

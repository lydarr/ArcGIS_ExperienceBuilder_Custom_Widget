import { React, hooks } from 'jimu-core'
import { useObserveDebouncedLength as _useObserveDebouncedLength, useMaxLength } from '../utils'

const useObserveDebouncedLength = (
  rootRef: React.RefObject<HTMLElement>,
  vertical: boolean,
  offset: number = 0,
  minLength: number = offset,
  autoSize?: boolean) => {
  let length = _useObserveDebouncedLength(rootRef, 500, vertical, !autoSize)
  length += offset
  length = Math.max(length, minLength)
  const maxLength = useMaxLength(500, vertical)
  length = autoSize ? maxLength : Math.min(length, maxLength)
  return length
}

const getStartEnd = (previousStart: number, previousEnd: number, number: number): [number, number] => {
  let start = previousStart
  let end = previousEnd

  if (end - start > number) {
    end = previousStart + number
  } else if (end - start < number) {
    start = 0
    end = start + number
  }
  return [start, end]
}

interface ResponsiveViewportProps {
  rootRef: React.RefObject<HTMLElement>
  lists: string[]
  itemLength: number
  autoSize: boolean
  vertical?: boolean
  space?: number
  minLength?: number
  autoScrollEnd?: boolean
}

interface ResponsiveViewportResult {
  start: number
  end: number
  disablePrevious: boolean
  disableNext: boolean
  hideArrow: boolean
  scroll: (previous: boolean, moveOne?: boolean) => void
}

export const useResponsiveViewport = (props: ResponsiveViewportProps): ResponsiveViewportResult => {
  const { rootRef, lists, itemLength, autoSize, vertical, space, minLength, autoScrollEnd } = props
  const counts = lists?.length ?? 0
  //The length of the viewport that can be used to display items
  const length = useObserveDebouncedLength(rootRef, vertical, space, minLength, autoSize)
  //Number of items that can be displayed in the viewport.
  //When length or itemLength changed, recalculate the number that can be displayed in the viewport
  const number = Math.floor(length / itemLength)

  const [start, setStart] = React.useState(getStartEnd(0, 0, number)[0])
  const [end, setEnd] = React.useState(getStartEnd(0, 0, number)[1])
  const previousStartRef = hooks.useLatest(start)
  const previousEndRef = hooks.useLatest(end)
  const hideArrow = (end - start) >= counts
  const disablePrevious = start === 0
  const disableNext = end === counts

  //When the number that can be displayed in the viewport changed, automatically update end
  React.useEffect(() => {
    if (length === 0) return
    const [start, end] = getStartEnd(previousEndRef.current, previousStartRef.current, number)
    setStart(start)
    setEnd(end)
  }, [number, length, previousEndRef, previousStartRef])

  //Fire scroll function to change start and end
  const scroll = hooks.useEventCallback((previous: boolean, moveOne = true) => {
    const moveNumber = moveOne ? 1 : number
    let s = 0; let e = 0
    if (previous) {
      s = start - moveNumber
      if (s < 0) {
        s = 0
        e = s + number
      } else {
        e = end - moveNumber
      }
    } else {
      e = end + moveNumber
      if (e > counts) {
        e = counts
        s = e - number
      } else {
        s = start + moveNumber
      }
    }
    setStart(s)
    setEnd(e)
  })

  //When the counts of lists changed, automatically scroll to end
  const listsRef = React.useRef([])
  const scrollToEnd = hooks.useEventCallback(() => {
    const validList = counts > 0 && listsRef.current.length > 0 &&
      lists[lists.length - 1] !== listsRef.current[listsRef.current.length - 1]
    const scrollEnd = autoScrollEnd && validList && listsRef.current.length > counts
    if (scrollEnd) {
      let start = 0
      let end = 0
      end = counts
      start = end - number
      start = Math.max(0, start)
      setStart(start)
      setEnd(end)
    }
  })

  React.useEffect(() => {
    scrollToEnd()
    listsRef.current = lists
  }, [lists, scrollToEnd])

  return {
    start,
    end,
    disablePrevious,
    disableNext,
    hideArrow,
    scroll
  }
}

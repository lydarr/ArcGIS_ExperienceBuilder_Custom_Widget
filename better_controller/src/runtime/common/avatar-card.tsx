/** @jsx jsx */
import { React, css, jsx, type IconResult, classNames, polished } from 'jimu-core'
import { Button, Icon, type ButtonProps, type ButtonSize, Tooltip } from 'jimu-ui'
import { WIDGET_ITEM_SIZES } from '../../common/consts'

export const LABEL_HEIGHT = 21
export type AvatarSize = ButtonSize

export const getItemLength = (buttonSize: AvatarSize, showLabel: boolean, shape: 'circle' | 'rectangle') => {
  let size = WIDGET_ITEM_SIZES[buttonSize]
  if (showLabel) {
    size = size + LABEL_HEIGHT
  }

  const padding = calcPadding(buttonSize, shape)
  size = size + padding * 2
  return size
}

const calcPadding = (buttonSize: AvatarSize, shape: 'circle' | 'rectangle'): number => {
  const circle = shape === 'circle'
  if (!circle) return 6
  if (buttonSize === 'sm') return 4
  if (buttonSize === 'default') return 2
  if (buttonSize === 'lg') return 0
}

interface MarkerProps {
  marker?: string
  onMarkerClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
}

export interface AvatarProps extends ButtonProps {
  shape: 'circle' | 'rectangle'
}

export interface AvatarCardProps extends MarkerProps, React.HTMLAttributes<HTMLDivElement> {
  icon?: IconResult | string
  autoFlip?: boolean
  label?: string
  showLabel?: boolean
  showIndicator?: boolean
  showTooltip?: boolean
  labelGrowth?: number
  avatar: AvatarProps
  active?: boolean
  disabled?: boolean
  editDraggable?: boolean
  widgetid?: string
}

const useStyle = (size: ButtonSize, showLabel: boolean, showIndicator: boolean, shape: 'circle' | 'rectangle', labelGrowth: number) => {
  return React.useMemo(() => {
    const length = getItemLength(size, showLabel, shape)
    const width = length + labelGrowth
    const padding = calcPadding(size, shape)
    return css`
      display: flex;
      align-items:center;
      flex-direction: column;
      justify-content: ${showLabel ? 'space-around' : 'center'};
      width: ${polished.rem(width)} !important;
      height: ${polished.rem(length)};
      .tool-drag-handler {
        cursor: auto;
      }
      .avatar {
        padding: ${padding}px;
        position: relative;
        text-align: center;
        &:hover .marker {
          visibility: visible;
        }
        .marker {
          position: absolute;
          right: 0;
          top: 0;
          padding: 0;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          .icon-btn-sizer {
            min-width: .625rem;
            min-height: .625rem;
          }
          visibility: hidden;
        }
      }
      ${showIndicator
      ? `.avatar.active {
        .avatar-button, .marker {
          transform: translateY(-7px);
        }
        .marker {
          z-index: 1;
        }
        ::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          border: 1px solid var(--white);
          border-radius: 3px;
          width: 6px;
          height: 3px;
          background-color: var(--primary);
          box-sizing: content-box;
        }
      }`
      : ''}
      .avatar-label {
        text-align: center;
        width: 100%;
        min-height: ${polished.rem(21)};
        cursor: default;
      }
    `
  }, [size, showLabel, shape, labelGrowth, showIndicator])
}

export const AvatarCard = React.forwardRef((props: AvatarCardProps, ref: React.RefObject<HTMLButtonElement>) => {
  const {
    label,
    className,
    title,
    showLabel,
    showIndicator = true,
    showTooltip = true,
    labelGrowth = 0,
    icon,
    marker,
    onClick,
    onMarkerClick,
    avatar,
    autoFlip,
    active,
    editDraggable,
    disabled,
    widgetid,
    ...others
  } = props

  const { shape, style, ...buttonProps } = avatar || {} as AvatarProps
  const size = buttonProps?.size
  const cssStyle = useStyle(size, showLabel, showIndicator, shape, labelGrowth)

  const avatarButton = <Button
    data-widgetid={widgetid}
    icon
    active={active}
    className={classNames('avatar-button', { disabled })}
    ref={ref}
    {...buttonProps}
    style={{ borderRadius: shape === 'circle' ? '50%' : undefined, ...style }}
    onClick={onClick}
  >
    <Icon
      color={typeof icon !== 'string' && icon.properties?.color}
      icon={typeof icon !== 'string' ? icon.svg : icon} autoFlip={autoFlip}
    />
  </Button>

  return (
    <div
      {...others}
      className={classNames('avatar-card', `${className} avatar-card`)}
      css={cssStyle}
    >
      <div
        className={classNames({ 'no-drag-action': !editDraggable, active }, 'avatar tool-drag-handler')}
      >
        {
          marker && <Button className="marker" size="sm" icon onClick={onMarkerClick}>
            <Icon size={8} icon={marker} />
          </Button>
        }
        {showTooltip ? <Tooltip title={title || label} style={{ pointerEvents: 'none' }}>{avatarButton}</Tooltip> : avatarButton}
      </div>
      {
        showLabel &&
        <div className={classNames('avatar-label text-truncate', { active })}>{label}</div>
      }
    </div>
  )
})

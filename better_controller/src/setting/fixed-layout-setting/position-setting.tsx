import { ControllerPosition, React, classNames, hooks } from 'jimu-core'
import { styled } from 'jimu-theme'
import { defaultMessages } from 'jimu-ui'

interface PositionItemProps {
  className?: string
  title?: string
  'aria-label'?: string
  activate: boolean
  onClick: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void
}

const PositionItem = (props: PositionItemProps) => {
  const { className, activate, onClick, title, 'aria-label': ariaLabel } = props
  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && onClick) {
      onClick(event)
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      title={title}
      aria-label={ariaLabel}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className={classNames('position-item', { activate }, className)}
      style={{ cursor: 'pointer' }}
    />)
}

const StyledPositionItem = styled(PositionItem)`
    width: 22px;
    height: 22px;
    cursor: pointer;
    background-color: transparent;
    border-top: 1px solid var(--light-500);
    border-left: 1px solid var(--light-500);
    &:nth-of-type(-n+2) {
        border-top: none;
    }
    &:nth-of-type(3n+1){
        border-left: none;
    }
    &.activate {
        background: var(--primary-100);
        border: 1px solid var(--primary-700);
    }
`

interface PositionSettingProps {
  'aria-label'?: string
  value: ControllerPosition
  onChange: (value: ControllerPosition) => void
}

const Positions: ControllerPosition[] = [
  ControllerPosition.TopLeft,
  ControllerPosition.TopCenter,
  ControllerPosition.TopRight,
  ControllerPosition.MiddleLeft,
  ControllerPosition.MiddleCenter,
  ControllerPosition.MiddleRight,
  ControllerPosition.BottomLeft,
  ControllerPosition.BottomCenter,
  ControllerPosition.BottomRight
]

const Translations = {
  [ControllerPosition.TopLeft]: 'TL',
  [ControllerPosition.TopCenter]: 'TC',
  [ControllerPosition.TopRight]: 'TR',
  [ControllerPosition.MiddleLeft]: 'ML',
  [ControllerPosition.MiddleCenter]: 'MC',
  [ControllerPosition.MiddleRight]: 'MR',
  [ControllerPosition.BottomLeft]: 'BL',
  [ControllerPosition.BottomCenter]: 'BC',
  [ControllerPosition.BottomRight]: 'BR'
}

const PositionSettingRoot = styled.div`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(3, 1fr);
    gap: 0;
    border: 1px solid var(--light-500);
  `

export const PositionSetting = (props: PositionSettingProps) => {
  const { value, onChange, 'aria-label': ariaLabel } = props
  const translate = hooks.useTranslation(defaultMessages)
  return (<PositionSettingRoot className='posotion-setting' role='group' aria-label={ariaLabel}>
    {
      Positions.map((position) => {
        return <StyledPositionItem
          key={position}
          title={translate(Translations[position])}
          aria-label={translate(Translations[position])}
          activate={position === value}
          onClick={() => { onChange?.(position) }} />
      })
    }
  </PositionSettingRoot>)
}

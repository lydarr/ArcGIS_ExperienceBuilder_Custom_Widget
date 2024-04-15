/** @jsx jsx */
import { css, jsx, React, classNames } from 'jimu-core'
import { Icon, Tooltip, Button } from 'jimu-ui'
import infoOutlined from 'jimu-icons/svg/outlined/suggested/info.svg'
import { useTheme } from 'jimu-theme'

export interface IconTooltipProps {
  className?: string
  icon?: any
  tooltip: string
}

const useStyle = () => {
  const theme = useTheme()
  const dark600 = theme?.colors.palette.dark[600]
  const black = theme?.colors.black

  return css`
    .jimu-icon {
      color: ${dark600};
      &:hover {
        color: ${black};
      }
    }
  `
}

export const IconTooltip = (props: IconTooltipProps): React.ReactElement => {
  const style = useStyle()
  const { className, tooltip = '', icon = infoOutlined } = props
  return (
    <Tooltip title={tooltip}>
      <Button icon size='sm' type='tertiary' css={style} className={classNames('icon-tooltip d-flex align-items-center', className)}>
        <Icon icon={icon} />
      </Button>
    </Tooltip>
  )
}

export interface LabelTooltipProps extends IconTooltipProps {
  label: string
}

export const LabelTooltip = (props: LabelTooltipProps) => {
  const { className, label, tooltip = '', icon } = props

  return <div className={classNames('label-tooltip d-flex align-items-center justify-content-between', className)}>
    <div className='text-truncate' title={label}>{label}</div>
    <IconTooltip icon={icon} tooltip={tooltip}></IconTooltip>
  </div>
}

import { React } from 'jimu-core'
import { ThemeColorPicker } from 'jimu-ui/basic/color-picker'
import { FontStyle } from 'jimu-ui/advanced/style-setting-components'
import { useTheme2 } from 'jimu-theme'

interface FontSettingProps {
  bold: boolean
  italic: boolean
  underline: boolean
  strike: boolean
  color: string
  'aria-label'?: string
  onChange: (key: string, value: any) => void
}

export const FontSetting = (props: FontSettingProps) => {
  const { bold, italic, underline, strike, color, onChange } = props
  const theme = useTheme2()

  return (<div className='font-setting d-flex align-items-center' role='group' aria-label={props['aria-label']}>
    <FontStyle
      bold={bold}
      italic={italic}
      underline={underline}
      strike={strike}
      onChange={onChange}
    />
    <ThemeColorPicker
      className='jimu-outline-inside'
      specificTheme={theme}
      value={color}
      onChange={(value) => { onChange('color', value) }}
    />
  </div>)
}

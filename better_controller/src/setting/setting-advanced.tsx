/** @jsx jsx */
import { type ImmutableObject, type IMThemeButtonStylesByState, jsx, type ThemeBoxStyles, hooks, classNames } from 'jimu-core'
import { SettingRow } from 'jimu-ui/advanced/setting-components'
import { Tabs, Tab, defaultMessages as jimuUiDefaultMessages } from 'jimu-ui'
import { ThemeColorPicker } from 'jimu-ui/basic/color-picker'
import defaultMessages from './translations/default'
import { useTheme2 } from 'jimu-theme'
import { FontSetting } from './font-setting'

interface AdvancedSettingProps {
  className?: string
  variant: IMThemeButtonStylesByState
  onChange: (state: string, key: string, value: any) => void
}

const BoxStates = ['default', 'active', 'hover']
export const SettingAdvanced = (props: AdvancedSettingProps) => {
  const { className, variant, onChange } = props
  const translate = hooks.useTranslation(defaultMessages, jimuUiDefaultMessages)
  const theme = useTheme2()

  return (
    <SettingRow className="sw-controller__advanced-setting" role='group' aria-label={translate('advance')} flow="wrap">
      <Tabs type='pills' className={classNames('flex-grow-1 w-100 h-100', className)} fill defaultValue={BoxStates[0]}>
        {
          BoxStates.map((state, x) => {
            const themeBoxStyles = variant?.[state] as ImmutableObject<ThemeBoxStyles>
            return (
              <Tab key={x} id={state} className="tab-title-item" title={translate(state === 'active' ? 'selected' : state)}>
                <SettingRow className="mt-4" label={translate('textFormatOverride')} flow="no-wrap" truncateLabel>
                  <FontSetting
                    aria-label={translate('textFormatOverride')}
                    bold={themeBoxStyles?.bold as boolean}
                    italic={themeBoxStyles?.italic as boolean}
                    underline={themeBoxStyles?.underline as boolean}
                    strike={themeBoxStyles?.strike as boolean}
                    color={themeBoxStyles?.color}
                    onChange={(key, value) => { onChange(state, key, value) }}
                  />
                </SettingRow>
                <SettingRow className="mt-2" label={translate('iconBackgroundOverride')} flow="no-wrap" truncateLabel>
                  <ThemeColorPicker
                    className='jimu-outline-inside'
                    aria-label={translate('iconBackgroundOverride')}
                    specificTheme={theme}
                    value={themeBoxStyles?.bg}
                    onChange={(value) => { onChange(state, 'bg', value) }}
                  />
                </SettingRow>
              </Tab>
            )
          })
        }
      </Tabs>
    </SettingRow>
  )
}

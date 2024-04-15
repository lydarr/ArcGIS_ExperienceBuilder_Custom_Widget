import * as React from 'react'
import { mockTheme, getInitState, widgetRender } from 'jimu-for-test'
import { SettingAdvanced } from './setting-advanced'
import '@testing-library/jest-dom'
import { getAppStore, appActions } from 'jimu-core'

const themeBoxStyle = {
  default: { color: '#fff', bg: '#ff0' },
  active: { color: '#fff', bg: '#ff0' },
  hover: { color: '#000', bg: '#00f' }
} as any

const initState = getInitState().merge({ appConfig: { dialogs: {} } })
getAppStore().dispatch(appActions.updateStoreState(initState))

describe('<SettingAdvanced />', () => {
  const mockOnSettingConfigChange = jest.fn()
  describe('given themeBoxDataItems prop', () => {
    const renderContent = (
      <SettingAdvanced
        variant={themeBoxStyle}
        onChange={mockOnSettingConfigChange}
      />
    )

    it('Tab has defaultActive prop properly provided', () => {
      const { container } = widgetRender(getAppStore(), mockTheme as any)(renderContent)
      const Tabs = container.querySelectorAll('.tab-title-item > .jimu-link')
      expect(Tabs[0]).toHaveClass('active')
      expect(Tabs[1]).not.toHaveClass('active')
    })

    it('ThemeColorPicker has value prop properly provided', () => {
      const { container } = widgetRender(getAppStore(), mockTheme as any)(renderContent)
      const Tabs = container.querySelectorAll('.tab-pane')
      const ThemeColorPickers = Tabs[0].querySelectorAll('.color-picker-block [data-color]')
      expect(ThemeColorPickers[0].getAttribute('data-color')).toBe(themeBoxStyle.default.color)
      expect(ThemeColorPickers[1].getAttribute('data-color')).toBe(themeBoxStyle.default.bg)
    })
  })
})

/** @jsx jsx */
import { React, css, jsx, polished, type IMThemeVariables, type IMState, Immutable, type ImmutableArray, ReactRedux, type IMThemeButtonStylesByState, hooks, BrowserSizeMode } from 'jimu-core'
import { type AllWidgetSettingProps, getAppConfigAction } from 'jimu-for-builder'
import { SettingSection, SettingRow, DirectionSelector } from 'jimu-ui/advanced/setting-components'
import { defaultMessages as jimuLayoutMessages, searchUtils } from 'jimu-layouts/layout-runtime'
import { type IMConfig, DisplayType } from '../config'
import { Switch, Radio, Select, Label, defaultMessages as jimuUiDefaultMessages, MultiSelect, DistanceUnits, CollapsablePanel, CollapsableToggle } from 'jimu-ui'
import defaultMessages from './translations/default'
import { Shapes, ShapeType } from './shapes'
import { InputUnit } from 'jimu-ui/advanced/style-setting-components'
import { BASE_LAYOUT_NAME, DEFAULT_FIXED_LAYOUT_STYLE } from '../common/consts'
import { SettingAdvanced } from './setting-advanced'
import { LabelTooltip } from './label-tooltip'
import { useTheme2 } from 'jimu-theme'
import { FixedLayoutStyleSetting } from './fixed-layout-setting'

const DEFAULT_COLOR = '#080808'

const DEFAULT_OPEN_START = 'none'

type ControlledWidgets = ImmutableArray<{
  label: string
  value: string
}>

const style = css`
    font-size: 13px;
    font-weight: lighter;
    .setting-row-item {
      width: 100%;
      display: flex;
      margin-top: 0.5rem;
      > span.jimu-radio {
        flex-shrink: 0;
        margin-top: 0.1rem;
      }
      > label {
        margin-bottom: 0;
      }
    }
    .jimu-multi-select {
      width: 100%;
      > .jimu-dropdown {
        width: 100%;
      }
      > .jimu-menu-item {
        width: 100%;
        height: ${polished.rem(26)};
      }
    }
  `

export type ControllerSettingProps = AllWidgetSettingProps<IMConfig>

const getWidgetIdsFromLayout = (layout): string[] => {
  const order = layout?.order?.asMutable?.() ?? []
  let layoutItems = order.map(itemId => layout.content?.[itemId])
  layoutItems = layoutItems.filter(layoutItem => (layoutItem && layoutItem.id && layoutItem.widgetId && !layoutItem.isPending))
  const layoutItem = layoutItems.map(layoutItem => layoutItem.id)
  return layoutItem.map(itemId => layout.content?.[itemId]?.widgetId)
}

const useControlledWidgets = (id: string, layoutName: string): ControlledWidgets => {
  const layout = ReactRedux.useSelector((state: IMState) => {
    state = state.appStateInBuilder
    const layouts = state.appConfig.widgets?.[id]?.layouts?.[layoutName]
    const browserSizeMode = state.browserSizeMode
    const mainSizeMode = state.appConfig.mainSizeMode
    const layoutId = searchUtils.findLayoutId(layouts, browserSizeMode, mainSizeMode)
    const layout = state.appConfig.layouts?.[layoutId]
    return layout
  })
  const controlledWidgets = getWidgetIdsFromLayout(layout)
  const widgets = ReactRedux.useSelector((state: IMState) => state.appStateInBuilder.appConfig.widgets)
  const imControlledWidgets = Immutable(controlledWidgets || [])
  return imControlledWidgets.map((widgetId) => ({
    label: widgets[widgetId]?.label,
    value: widgetId
  })) as any
}

const getButtonVariant = (theme: IMThemeVariables, config: IMConfig): IMThemeButtonStylesByState => {
  const type = config?.appearance?.card.avatar?.type || 'primary'
  let variant = theme?.components?.button?.variants?.[type]
  variant = variant.setIn(['default', 'color'], DEFAULT_COLOR)
  variant = variant.setIn(['active', 'color'], DEFAULT_COLOR)
  return variant
}

const Setting = (props: ControllerSettingProps) => {
  const { id, config, onSettingChange } = props
  const mobile = ReactRedux.useSelector((state: IMState) => state.appStateInBuilder?.browserSizeMode === BrowserSizeMode.Small)
  const onlyOpenOne = config?.behavior?.onlyOpenOne
  const displayType = config?.behavior?.displayType
  const arrangement = config?.behavior?.arrangement ?? 'floating'
  const vertical = config?.behavior?.vertical
  const openStarts = config?.behavior?.openStarts
  const space = config?.appearance?.space
  const advanced = config?.appearance?.advanced
  const showLabel = config?.appearance.card?.showLabel
  const showIndicator = config?.appearance.card?.showIndicator ?? true
  const showTooltip = config?.appearance.card?.showTooltip ?? true
  const labelGrowth = config?.appearance.card?.labelGrowth ?? 0
  const size = config?.appearance.card?.avatar?.size
  const shape = config?.appearance.card?.avatar?.shape

  const openStart = openStarts?.[0] ?? DEFAULT_OPEN_START
  const iconInterval = vertical ? space : labelGrowth
  const preIconInterval = React.useRef(0)

  const appTheme = useTheme2()
  const controlledWidgets = useControlledWidgets(id, BASE_LAYOUT_NAME)

  const translate = hooks.useTranslation(jimuUiDefaultMessages, jimuLayoutMessages, defaultMessages)

  const variant = advanced ? config?.appearance?.card.variant : getButtonVariant(appTheme, config)

  const onSettingConfigChange = (key: string | string[], value: any) => {
    let newConfig = null
    if (Array.isArray(key)) {
      newConfig = config.setIn(key, value)
    } else {
      newConfig = config.set(key, value)
    }
    onSettingChange({
      id: id,
      config: newConfig
    })
  }

  const handleOpenTypeChange = (e: React.ChangeEvent<HTMLInputElement>, key: string, value: any) => {
    const checked = e.currentTarget.checked
    if (!checked) {
      return
    }
    let newConfig = null
    if (key === 'onlyOpenOne') {
      newConfig = config.setIn(['behavior', 'openStarts'], Immutable([])).setIn(['behavior', key], value)
      if (!value) {
        newConfig = newConfig.setIn(['behavior', 'arrangement'], 'floating')
      }
      toggleControllerPanel('floating')
    } else if (key === 'displayType') {
      value = value ? DisplayType.Stack : DisplayType.SideBySide
      newConfig = config.setIn(['behavior', key], value)
    }
    onSettingChange({
      id,
      config: newConfig
    })
  }

  const toggleControllerPanel = (arrangement: 'floating' | 'fixed') => {
    const appConfigAction = getAppConfigAction()
    if (arrangement === 'floating') {
      appConfigAction.removeControllerPanel(id)
    } else if (arrangement === 'fixed') {
      appConfigAction.editControllerPanel(id, DEFAULT_FIXED_LAYOUT_STYLE)
    }
    appConfigAction.exec()
  }

  const handleArrangementChange = (e: React.ChangeEvent<HTMLInputElement>, value: 'floating' | 'fixed') => {
    const checked = e.currentTarget.checked
    if (!checked) {
      return
    }
    const newConfig = config.set('behavior', config?.behavior?.set('arrangement', value))
    toggleControllerPanel(value)
    onSettingChange({
      id,
      config: newConfig
    })
  }

  const handleOpenStartMultipleClick = (_, value: string, selectedValues: string[]) => {
    const values = onlyOpenOne ? (selectedValues.length ? [value] : []) : selectedValues
    onSettingConfigChange(['behavior', 'openStarts'], values)
  }

  const handleOpenStartSingleChange = (evt: React.ChangeEvent<HTMLSelectElement>) => {
    const value = evt.target.value
    let openStarts = []
    if (value !== DEFAULT_OPEN_START) {
      openStarts = [value]
    }
    onSettingConfigChange(['behavior', 'openStarts'], openStarts)
  }

  const renderMultiSelectText = (values: string[]) => {
    if (onlyOpenOne && values.length) {
      const widget = controlledWidgets.find(w => w.value === values[0])
      return widget?.label
    } else {
      const widgetNumber = values?.length || 0
      return translate('widgetsSelected', { widgetNumber })
    }
  }

  const handleIconIntervalChanged = (value: number) => {
    value = +value
    if (isNaN(value)) {
      value = 0
    }

    let newConfig = config
    if (newConfig.behavior.vertical) {
      newConfig = newConfig.setIn(['appearance', 'space'], value).setIn(['appearance', 'card', 'labelGrowth'], 0)
    } else {
      newConfig = newConfig.setIn(['appearance', 'card', 'labelGrowth'], value).setIn(['appearance', 'space'], 0)
    }
    onSettingChange({
      id,
      config: newConfig
    })
  }

  const handleAdvancedToggle = (advanced?: boolean) => {
    let newConfig = config.setIn(['appearance', 'advanced'], advanced)
    if (advanced) {
      const variant = getButtonVariant(appTheme, config)
      newConfig = newConfig.setIn(['appearance', 'card', 'variant'], variant)
    } else {
      newConfig = newConfig.setIn(['appearance', 'card', 'variant'], undefined)
    }

    onSettingChange({
      id,
      config: newConfig
    })
  }

  const handleDirectionChange = (vertical: boolean) => {
    let newConfig = config.setIn(['behavior', 'vertical'], vertical)
    if (vertical) {
      const labelGrowth = newConfig.appearance.card.labelGrowth ?? 0
      newConfig = newConfig.setIn(['appearance', 'card', 'labelGrowth'], 0).setIn(['appearance', 'space'], preIconInterval.current)
      preIconInterval.current = labelGrowth
    } else {
      const space = newConfig.appearance.space ?? 0
      newConfig = newConfig.setIn(['appearance', 'space'], 0).setIn(['appearance', 'card', 'labelGrowth'], preIconInterval.current)
      preIconInterval.current = space
    }
    onSettingChange({
      id,
      config: newConfig
    })
    getAppConfigAction().exchangeWidthAndHeight().exec()
  }

  const handleAdvancedChange = (state: string, key: string, value: any) => {
    onSettingConfigChange(['appearance', 'card', 'variant', state, key], value)
  }

  return (
    <div className='widget-setting-controller jimu-widget-setting' css={style}>
      <SettingSection>
        <SettingRow flow='no-wrap' label={translate('direction')}>
          <DirectionSelector
            aria-label={translate('direction')}
            size='sm'
            vertical={vertical}
            onChange={handleDirectionChange}
          ></DirectionSelector>
        </SettingRow>
      </SettingSection>
      <SettingSection
        title={translate('behavior')}
        role='group'
        aria-label={translate('behavior')}
      >
        <SettingRow flow='wrap' label={translate('openWidget')}>
          <div
            role='radiogroup'
            className='setting-row-item'
            aria-label={translate('openWidget')}
          >
            <Radio
              id='only-open-one'
              style={{ cursor: 'pointer' }}
              name='only-open-one'
              onChange={(e) => { handleOpenTypeChange(e, 'onlyOpenOne', true) }}
              checked={onlyOpenOne}
            />
            <Label
              style={{ cursor: 'pointer' }}
              for='only-open-one'
              className='ml-2'
            >
              {translate('single')}
            </Label>
          </div>
          <div className='setting-row-item'>
            <Radio
              id='open-multiple'
              style={{ cursor: 'pointer' }}
              name='only-open-one'
              onChange={(e) => { handleOpenTypeChange(e, 'onlyOpenOne', false) }}
              checked={!onlyOpenOne}
            />
            <Label
              style={{ cursor: 'pointer' }}
              for='open-multiple'
              className='ml-2'
            >
              {translate('multiple')}
            </Label>
          </div>
        </SettingRow>

        <SettingRow flow='wrap' label={translate('openStart')}>
          {!onlyOpenOne && (
            <MultiSelect
              size='sm'
              a11y-description={translate('openStart')}
              values={openStarts}
              items={controlledWidgets}
              onClickItem={handleOpenStartMultipleClick}
              displayByValues={renderMultiSelectText}
            />
          )}
          {onlyOpenOne && (
            <Select
              a11y-description={translate('openStart')}
              value={openStart}
              size='sm'
              onChange={handleOpenStartSingleChange}
              className='w-100'
            >
              <option value={DEFAULT_OPEN_START}>{translate('none')}</option>
              {controlledWidgets?.map((item) => {
                return (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                )
              })}
            </Select>
          )}
        </SettingRow>
        {!onlyOpenOne && (
          <SettingRow flow='wrap' label={translate('displayType')}>
            <div
              role='radiogroup'
              className='setting-row-item'
              aria-label={translate('displayType')}
            >
              <Radio
                id='display-stack'
                style={{ cursor: 'pointer' }}
                name='display-type'
                onChange={(e) => { handleOpenTypeChange(e, 'displayType', true) }}
                checked={displayType === DisplayType.Stack}
              />
              <Label
                style={{ cursor: 'pointer' }}
                for='display-stack'
                className='ml-2'
              >
                {translate('stack')}
              </Label>
            </div>
            <div className='setting-row-item'>
              <Radio
                id='display-side-by-side'
                style={{ cursor: 'pointer' }}
                name='display-type'
                onChange={(e) => { handleOpenTypeChange(e, 'displayType', false) }}
                checked={displayType === DisplayType.SideBySide}
              />
              <Label
                style={{ cursor: 'pointer' }}
                for='display-side-by-side'
                className='ml-2'
              >
                {translate('sideBySide')}
              </Label>
            </div>
          </SettingRow>
        )}
      </SettingSection>

      {(!mobile && onlyOpenOne) && <SettingSection>
        <CollapsablePanel defaultIsOpen={true} label={translate('widgetPanelArrangment')}>
          <SettingRow flow='wrap' role='group' aria-label={translate('widgetPanelArrangment')}>
            <div
              role='radiogroup'
              className='setting-row-item'
              aria-label={translate('widgetPanelArrangment')}
            >
              <Radio
                id='panel-floating'
                style={{ cursor: 'pointer' }}
                name='panel-arrangment'
                onChange={(e) => { handleArrangementChange(e, 'floating') }}
                checked={arrangement === 'floating'}
              />
              <Label
                style={{ cursor: 'pointer' }}
                for='panel-floating'
                className='ml-2'
              >
                {translate('panelFloating')}
              </Label>
            </div>
            <div className='setting-row-item'>
              <Radio
                id='panel-fixed'
                style={{ cursor: 'pointer' }}
                name='panel-arrangment'
                onChange={(e) => { handleArrangementChange(e, 'fixed') }}
                checked={arrangement === 'fixed'}
              />
              <Label
                style={{ cursor: 'pointer' }}
                for='panel-fixed'
                className='ml-2'
              >
                {translate('fixed')}
              </Label>
            </div>
          </SettingRow>
          {
            arrangement === 'fixed' && <SettingRow flow='wrap' label={translate('positionAndSize')}>
              <FixedLayoutStyleSetting id={id}/>
            </SettingRow>
          }
        </CollapsablePanel>
      </SettingSection>
      }
      <SettingSection>
        <CollapsablePanel
          defaultIsOpen={true}
          label={
            <LabelTooltip
              label={translate('appearance')}
              tooltip={translate('appearanceTip')}
            />
          }>
          <SettingRow flow='wrap' label={translate('iconStyle')} className='mt-4'>
            <div role='group' className='d-flex' aria-label={translate('iconStyle')}>
              <Shapes
                type={ShapeType.Circle}
                title={translate('circle', true)}
                className='mr-2'
                active={shape === 'circle'}
                onClick={() => {
                  onSettingConfigChange(
                    ['appearance', 'card', 'avatar', 'shape'],
                    'circle'
                  )
                }
                }
              />
              <Shapes
                type={ShapeType.Rectangle}
                title={translate('rectangle')}
                active={shape === 'rectangle'}
                onClick={() => {
                  onSettingConfigChange(
                    ['appearance', 'card', 'avatar', 'shape'],
                    'rectangle'
                  )
                }
                }
              />
            </div>
          </SettingRow>
          <SettingRow label={translate('showIconLabel')}>
            <Switch
              checked={showLabel}
              aria-label={translate('showIconLabel')}
              onChange={(evt) => {
                onSettingConfigChange(
                  ['appearance', 'card', 'showLabel'],
                  evt.target.checked
                )
              }
              }
            ></Switch>
          </SettingRow>
          <SettingRow label={translate('indicator')}>
            <Switch
              checked={showIndicator}
              aria-label={translate('indicator')}
              onChange={(evt) => {
                onSettingConfigChange(
                  ['appearance', 'card', 'showIndicator'],
                  evt.target.checked
                )
              }
              }
            ></Switch>
          </SettingRow>
          <SettingRow label={translate('tooltip')}>
            <Switch
              checked={showTooltip}
              aria-label={translate('tooltip')}
              onChange={(evt) => {
                onSettingConfigChange(
                  ['appearance', 'card', 'showTooltip'],
                  evt.target.checked
                )
              }
              }
            ></Switch>
          </SettingRow>
          <SettingRow flow='no-wrap' label={translate('iconSizeOverride')}>
            <Select
              size='sm'
              aria-label={translate('iconSizeOverride')}
              value={size}
              onChange={(e) => {
                onSettingConfigChange(
                  ['appearance', 'card', 'avatar', 'size'],
                  e.target.value
                )
              }
              }
              className='w-50'
            >
              <option value='sm'>{translate('small')}</option>
              <option value='default'>{translate('medium')}</option>
              <option value='lg'>{translate('large')}</option>
            </Select>
          </SettingRow>
          <SettingRow flow='no-wrap' label={translate('iconInterval')}>
            <InputUnit
              className='w-50'
              min={0}
              max={999}
              description={translate('iconInterval')}
              value={{ distance: iconInterval, unit: DistanceUnits.PIXEL }}
              onChange={({ distance }) => { handleIconIntervalChanged(distance) }}
            />
          </SettingRow>
        </CollapsablePanel>
      </SettingSection>

      <SettingSection>
        <CollapsableToggle
          label={translate('advance')}
          isOpen={advanced}
          onRequestOpen={() => { handleAdvancedToggle(true) }}
          onRequestClose={() => { handleAdvancedToggle(false) }}
        >
          <SettingAdvanced
            className='mt-4'
            variant={variant}
            onChange={handleAdvancedChange}
          />
        </CollapsableToggle>
      </SettingSection>
    </div>
  )
}

export default Setting

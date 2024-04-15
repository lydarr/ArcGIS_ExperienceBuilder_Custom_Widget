import { React, ReactRedux, hooks, Immutable, type IMState, utils, getAppStore, polished } from 'jimu-core'
import { InputUnit, SizeEditor } from 'jimu-ui/advanced/style-setting-components'
import { PositionSetting } from './position-setting'
import { LayoutItemSizeModes, utils as layoutUtils } from 'jimu-layouts/layout-runtime'
import { SettingRow, SettingSection } from 'jimu-ui/advanced/setting-components'
import { type LinearUnit, NumericInput, defaultMessages as jimuMessages, DistanceUnits } from 'jimu-ui'
import defaultMessages from '../translations/default'
import { styled } from 'jimu-theme'
import { DEFAULT_FIXED_LAYOUT_STYLE } from '../../common/consts'
import { getAppConfigAction } from 'jimu-for-builder'
import { FixedAnimationSetting } from './animation-setting'
import { ControllerPosition } from 'jimu-core'

interface FixedLayoutSettingProps {
  id: string
}

const Root = styled.div`
  width: 100%;
  .position-size {
    display: flex;
    justify-content: space-between;
    .sizes-editor {
      width: 121px;
      .app-root-emotion-cache-ltr-50z74a >.jimu-widget-setting--row-label {
        margin-right: 8px;
      }
      .size-editor {
        width: 100px !important;
      }
    }
  }
  .jimu-widget-setting--row-label {
    margin-right: auto;
  }
  .offset-numeric-input {
    width: 110px !important;
  }
`

const Divider = styled.div`
  width: 100%;
  height: 1px;
  background-color: var(--light-500);
  margin: 16px 0;
`
const convertStringToLinearUnit = (value: string | LinearUnit) => {
  if (typeof value === 'string') {
    const ret = polished.getValueAndUnit(value)
    return {
      distance: ret[0],
      unit: ret[1]
    }
  } else {
    return value
  }
}

const getWindowSize = (vertical: boolean) => {
  const appState = getAppStore().getState().appStateInBuilder
  const { width, height } = utils.findViewportSize(appState.appConfig, appState.browserSizeMode)
  return vertical ? height : width
}

const pxToPercent = (px: number, vertical: boolean) => {
  const size = getWindowSize(vertical)
  return parseFloat(((px / size) * 100).toFixed(3))
}

const percentToPx = (percent: number, vertical: boolean) => {
  const size = getWindowSize(vertical)
  return Math.floor((percent * size) / 100)
}

const convertUnit = (preValue: LinearUnit, value: LinearUnit, vertical: boolean) => {
  if (preValue == null) {
    return value
  }
  let val = value.distance
  const parsedPreValue = convertStringToLinearUnit(preValue)
  if (parsedPreValue.unit === 'px' && value.unit === '%') {
    val = pxToPercent(value.distance, vertical)
  } else if (parsedPreValue.unit === '%' && value.unit === 'px') {
    val = percentToPx(value.distance, vertical)
  }
  return { distance: val, unit: value.unit }
}

const supportedSizeModes = [LayoutItemSizeModes.Custom, LayoutItemSizeModes.Stretch]
const availableUnits = [DistanceUnits.PIXEL, DistanceUnits.PERCENTAGE]

export const FixedLayoutStyleSetting = (props: FixedLayoutSettingProps) => {
  const { id } = props

  const panelJson = ReactRedux.useSelector((state: IMState) => {
    return state.appStateInBuilder.appConfig.controllerPanels?.[id]
  })

  const originValue = panelJson ?? Immutable(DEFAULT_FIXED_LAYOUT_STYLE)
  const widthMode = (originValue.widthMode as LayoutItemSizeModes) ?? LayoutItemSizeModes.Custom
  const heightMode = (originValue.heightMode as LayoutItemSizeModes) ?? LayoutItemSizeModes.Custom

  const translate = hooks.useTranslation(jimuMessages, defaultMessages)

  const handleChange = (key: string, val: any) => {
    const appConfigAction = getAppConfigAction()
    appConfigAction.editControllerPanel(id, originValue.set(key, val)).exec()
  }

  const handleSizeChange = (key: string, val: LinearUnit) => {
    const vertical = key === 'height' || key === 'top' || key === 'bottom'
    const value = convertUnit(originValue[key], val, vertical)
    const size = `${value?.distance ?? 0}${value?.unit ?? 'px'}`
    const appConfigAction = getAppConfigAction()
    appConfigAction.editControllerPanel(id, originValue.set(key, size)).exec()
  }

  const handleWidthModeChange = (mode: LayoutItemSizeModes) => {
    const appConfigAction = getAppConfigAction()
    let newValue = originValue.set('widthMode', mode)
    const width = originValue.width
    const position = originValue.position

    if (mode === LayoutItemSizeModes.Stretch) { // from custom to stretch
      const offsetRatio = (originValue.offsetX ?? 0) * 100 / getWindowSize(false)
      let widthRatio
      if (!layoutUtils.isPercentage(width)) {
        widthRatio = parseFloat(width) * 100 / getWindowSize(false)
      } else {
        widthRatio = parseFloat(width)
      }
      if (position === ControllerPosition.TopLeft || position === ControllerPosition.BottomLeft || position === ControllerPosition.MiddleLeft) {
        newValue = newValue.set('left', `${offsetRatio.toFixed(2)}%`)
          .set('right', `${(100 - offsetRatio - widthRatio).toFixed(2)}%`)
      } else if (position === ControllerPosition.TopRight || position === ControllerPosition.BottomRight || position === ControllerPosition.MiddleRight) {
        newValue = newValue.set('right', `${-offsetRatio.toFixed(2)}%`)
          .set('left', `${(100 + offsetRatio - widthRatio).toFixed(2)}%`)
      } else {
        newValue = newValue.set('left', `${((100 - widthRatio) / 2 + offsetRatio).toFixed(2)}%`)
          .set('right', `${((100 - widthRatio) / 2 - offsetRatio).toFixed(2)}%`)
      }
      newValue = newValue.set('offsetX', 0).without('width')
    } else {
      let left = parseFloat(originValue.left)
      let right = parseFloat(originValue.right)
      if (!layoutUtils.isPercentage(originValue.left)) {
        left = left * 100 / getWindowSize(false)
      }
      if (!layoutUtils.isPercentage(originValue.right)) {
        right = right * 100 / getWindowSize(false)
      }
      newValue = newValue.without('left').without('right')
        .set('width', `${(100 - left - right).toFixed(2)}%`)
    }
    appConfigAction.editControllerPanel(id, newValue).exec()
  }

  const handleHeightModeChange = (mode: LayoutItemSizeModes) => {
    const appConfigAction = getAppConfigAction()
    let newValue = originValue.set('heightMode', mode)
    const height = originValue.height
    const position = originValue.position

    if (mode === LayoutItemSizeModes.Stretch) { // from custom to stretch
      const offsetRatio = (originValue.offsetY ?? 0) * 100 / getWindowSize(true)
      let heightRatio
      if (!layoutUtils.isPercentage(height)) {
        heightRatio = parseFloat(height) * 100 / getWindowSize(true)
      } else {
        heightRatio = parseFloat(height)
      }
      if (position === ControllerPosition.TopLeft || position === ControllerPosition.TopCenter || position === ControllerPosition.TopRight) {
        newValue = newValue.set('top', `${offsetRatio.toFixed(2)}%`)
          .set('bottom', `${(100 - offsetRatio - heightRatio).toFixed(2)}%`)
      } else if (position === ControllerPosition.BottomLeft || position === ControllerPosition.BottomRight || position === ControllerPosition.BottomCenter) {
        newValue = newValue.set('bottom', `${-offsetRatio.toFixed(2)}%`)
          .set('top', `${(100 + offsetRatio - heightRatio).toFixed(2)}%`)
      } else {
        newValue = newValue.set('top', `${((100 - heightRatio) / 2 + offsetRatio).toFixed(2)}%`)
          .set('bottom', `${((100 - heightRatio) / 2 - offsetRatio).toFixed(2)}%`)
      }
      newValue = newValue.set('offsetY', 0).without('height')
    } else {
      let top = parseFloat(originValue.top)
      let bottom = parseFloat(originValue.bottom)
      if (!layoutUtils.isPercentage(originValue.top)) {
        top = top * 100 / getWindowSize(true)
      }
      if (!layoutUtils.isPercentage(originValue.bottom)) {
        bottom = bottom * 100 / getWindowSize(true)
      }
      newValue = newValue.without('top').without('bottom')
        .set('height', `${(100 - top - bottom).toFixed(2)}%`)
    }
    appConfigAction.editControllerPanel(id, newValue).exec()
  }

  return (
    <Root className='fixed-layout-style-setting'>
      <div className='position-size'>
        <PositionSetting aria-label={translate('positionAndSize')} value={originValue.position} onChange={(position) => { handleChange('position', position) }} />
        <div className='sizes-editor'>
          <SettingRow className='mt-0' label='W' aria-label={translate('width')}>
            <SizeEditor
              label='W'
              mode={widthMode}
              sizeModes={supportedSizeModes}
              value={originValue.width}
              onModeChange={handleWidthModeChange}
              onChange={(width) => { handleSizeChange('width', width) }}
            />
          </SettingRow>
          <SettingRow className='mt-4' label='H' aria-label={translate('height')}>
            <SizeEditor
              label='H'
              mode={heightMode}
              sizeModes={supportedSizeModes}
              value={originValue.height}
              onModeChange={handleHeightModeChange}
              onChange={(height) => { handleSizeChange('height', height) }}
            />
          </SettingRow>
        </div>
      </div>
      {(heightMode === 'STRETCH' || widthMode === 'STRETCH') && (
        <SettingSection className='mt-4 p-0 border-bottom-0' title={translate('margins')}>
          {originValue.heightMode === 'STRETCH' && (
            <React.Fragment>
              <SettingRow className='mt-4' flow='no-wrap' label={translate('top')} truncateLabel>
                <InputUnit
                  className='offset-numeric-input'
                  units={availableUnits}
                  precision={2}
                  value={layoutUtils.normalizeLinearUnit(originValue.top ?? '0%')}
                  onChange={(value) => { handleSizeChange('top', value) }}
                />
              </SettingRow>
              <SettingRow className='mt-4' flow='no-wrap' label={translate('bottom')} truncateLabel>
                <InputUnit
                  className='offset-numeric-input'
                  units={availableUnits}
                  precision={2}
                  value={layoutUtils.normalizeLinearUnit(originValue.bottom ?? '0%')}
                  onChange={(value) => { handleSizeChange('bottom', value) }}
                />
              </SettingRow>
            </React.Fragment>
          )}
          {originValue.widthMode === 'STRETCH' && (
            <React.Fragment>
              <SettingRow className='mt-4' flow='no-wrap' label={translate('left')} truncateLabel>
                <InputUnit
                  className='offset-numeric-input'
                  units={availableUnits}
                  precision={2}
                  value={layoutUtils.normalizeLinearUnit(originValue.left ?? '0%')}
                  onChange={(value) => { handleSizeChange('left', value) }}
                />
              </SettingRow>
              <SettingRow className='mt-4' flow='no-wrap' label={translate('right')} truncateLabel>
                <InputUnit
                  className='offset-numeric-input'
                  units={availableUnits}
                  precision={2}
                  value={layoutUtils.normalizeLinearUnit(originValue.right ?? '0%')}
                  onChange={(value) => { handleSizeChange('right', value) }}
                />
              </SettingRow>
            </React.Fragment>
          )}
        </SettingSection>
      )}
      {originValue.widthMode !== 'STRETCH' && (
        <SettingRow className='mt-4' flow='no-wrap' label={translate('offsetX')} truncateLabel>
          <NumericInput aria-label={translate('offsetX')} className='offset-numeric-input' size='sm' value={originValue.offsetX} onAcceptValue={(offsetX) => { handleChange('offsetX', offsetX) }} />
        </SettingRow>
      )}
      {originValue.heightMode !== 'STRETCH' && (
        <SettingRow className='mt-4' flow='no-wrap' label={translate('offsetY')} truncateLabel>
          <NumericInput aria-label={translate('offsetY')} className='offset-numeric-input' size='sm' value={originValue.offsetY} onAcceptValue={(offsetY) => { handleChange('offsetY', offsetY) }} />
        </SettingRow>
      )}
      <Divider></Divider>
      <FixedAnimationSetting controllerId={id} />
    </Root>
  )
}

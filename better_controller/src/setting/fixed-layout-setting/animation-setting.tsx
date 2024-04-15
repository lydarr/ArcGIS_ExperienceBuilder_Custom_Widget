/** @jsx jsx */
import {
  React,
  jsx,
  type IMState,
  hooks,
  ReactRedux,
  AnimationType,
  getNextAnimationId,
  type AnimationSetting
} from 'jimu-core'
import { SettingSection, SettingRow } from 'jimu-ui/advanced/setting-components'
import { AnimationSettingComponent } from 'jimu-ui/advanced/style-setting-components'
import { getAppConfigAction, builderAppSync } from 'jimu-for-builder'

interface Props {
  controllerId: string
}

function hasEffect (effect: AnimationSetting) {
  return effect?.type && effect.type !== AnimationType.None
}

export function FixedAnimationSetting (props: Props) {
  const { controllerId } = props
  const effect = ReactRedux.useSelector((state: IMState) => {
    const appConfig = state.appStateInBuilder.appConfig
    return appConfig.controllerPanels?.[controllerId]?.effect
  })
  const translate = hooks.useTranslation()

  const handleChange = React.useCallback((_, setting: AnimationSetting) => {
    const appConfigAction = getAppConfigAction()
    const appConfig = appConfigAction.appConfig
    const panelJson = appConfig.controllerPanels[controllerId]
    appConfigAction.editControllerPanel(controllerId, panelJson.set('effect', setting)).exec()
    if (hasEffect(setting)) {
      builderAppSync.publishAnimationPreviewToApp({
        controllerId,
        id: getNextAnimationId()
      })
    }
  }, [controllerId])

  const handlepreview = React.useCallback(() => {
    if (hasEffect(effect)) {
      builderAppSync.publishAnimationPreviewToApp({
        controllerId,
        id: getNextAnimationId()
      })
    }
  }, [effect, controllerId])

  return (
    <SettingSection className='p-0 mt-4' role='group' aria-label={translate('animation')} title={translate('animation')}>
      <SettingRow>
        <AnimationSettingComponent
          effectSetting={effect}
          onSettingChange={handleChange}
          previewEnabled
          supportAsOne
          supportOneByOne={false}
          onPreviewClicked={handlepreview}
          formatMessage={translate}
        />
      </SettingRow>
    </SettingSection>
  )
}

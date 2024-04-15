/** @jsx jsx */
import { React, jsx, css, type AllWidgetProps, type IMState, AppMode, ReactRedux, type IMThemeButtonStylesByState, hooks } from 'jimu-core'
import { type IMConfig } from '../config'
import { Runtime } from './runtime/runtime'
import { WIDGET_ITEM_SIZES } from '../common/consts'
import { styleUtils } from 'jimu-ui'
import { versionManager } from '../version-manager'

export type ControllerWidgetProps = AllWidgetProps<IMConfig>

const useStyle = (autoSize: boolean, autoWidth: boolean, autoHeight: boolean) => {
  const minWidth = !autoSize ? WIDGET_ITEM_SIZES.sm : 0
  const minHeight = !autoSize ? WIDGET_ITEM_SIZES.sm : 0
  const px = autoWidth ? '5px' : 0
  const py = autoHeight ? '5px' : 0
  return React.useMemo(() => {
    return css`
      overflow: visible;
      white-space: nowrap;
      .controller-container {
        width: 100%;
        height: 100%;
        padding: ${py} ${px};
        min-width:  ${minWidth}px;
        min-height: ${minHeight}px;
      }
    `
  }, [px, py, minWidth, minHeight])
}

const useAdvancedStyle = (
  variant: IMThemeButtonStylesByState,
  advanced: boolean
) => {
  const regular = variant?.default
  const active = variant?.active
  const hover = variant?.hover

  return React.useMemo(() => {
    if (!advanced) return css``
    return css`
      .avatar-card:not(.add-widget-btn) {
        ${regular &&
      css`
          > .avatar {
            > .avatar-button {
              background-color: ${regular.bg};
              border-color: ${regular.bg};
            }
          }
          > .avatar-label {
            color: ${regular.color};
            font-style: ${regular?.italic ? 'italic' : 'normal'};
            font-weight: ${regular?.bold ? 'bold' : 'normal'};
            text-decoration: ${styleUtils.toCSSTextUnderLine({
        underline: regular.underline,
        strike: regular.strike
      })};
          }
        `}
        ${hover &&
      css`
          &:hover {
            > .avatar {
              > .avatar-button {
                background-color: ${hover.bg};
                border-color: ${hover.bg};
              }
            }
            > .avatar-label {
              color: ${hover.color};
              font-style: ${hover?.italic ? 'italic' : 'normal'};
              font-weight: ${hover?.bold ? 'bold' : 'normal'};
              text-decoration: ${styleUtils.toCSSTextUnderLine({
        underline: hover.underline,
        strike: hover.strike
      })};
            }
          }
        `}
        ${active &&
      css`
          > .avatar {
            > .avatar-button {
              &:not(:disabled):not(.disabled):active,
              &:not(:disabled):not(.disabled).active,
              &[aria-expanded='true'] {
                background-color: ${active.bg};
                border-color: ${active.bg};
              }
            }
            &::after {
              background-color: ${active.bg};
            }
          }
          > .avatar-label {
            &:not(:disabled):not(.disabled):active,
            &:not(:disabled):not(.disabled).active {
              color: ${active.color};
              font-style: ${active?.italic ? 'italic' : 'normal'};
              font-weight: ${active?.bold ? 'bold' : 'normal'};
              text-decoration: ${styleUtils.toCSSTextUnderLine({
        underline: active.underline,
        strike: active.strike
      })};
            }
          }
        `}
      }
    `
  }, [advanced, regular, active, hover])
}

const ControllerWidget = (props: ControllerWidgetProps) => {
  const { builderSupportModules, id, config, onInitResizeHandler, autoWidth, autoHeight } = props
  const onlyOpenOne = config.behavior?.onlyOpenOne
  const displayType = config.behavior?.displayType
  const vertical = config?.behavior?.vertical
  const advanced = config?.appearance.advanced
  const variant = config?.appearance?.card.variant
  const autoSize = vertical ? autoHeight : autoWidth

  const isInBuilder = ReactRedux.useSelector(
    (state: IMState) => state.appContext.isInBuilder
  )
  const appMode = ReactRedux.useSelector((state: IMState) => state.appRuntimeInfo.appMode)
  const browserSizeMode = ReactRedux.useSelector((state: IMState) => state.browserSizeMode)

  React.useEffect(() => {
    onInitResizeHandler?.(null, null, () => {
      setVersion((v) => v + 1)
    })
  }, [onInitResizeHandler])

  const isBuilder = isInBuilder && appMode !== AppMode.Run
  const Builder = isBuilder && builderSupportModules.widgetModules.Builder
  const [version, setVersion] = React.useState(0)

  hooks.useUpdateEffect(() => {
    setVersion((v) => v + 1)
  }, [onlyOpenOne, displayType, appMode, browserSizeMode])

  const style = useStyle(autoSize, autoWidth, autoHeight)
  const advancedStyle = useAdvancedStyle(variant, advanced)
  return (
    <div
      className='widget-controller jimu-widget rw-controller'
      css={[style, advancedStyle]}
    >
      <div className='controller-container'>
        {!isBuilder && (
          <Runtime
            id={id}
            version={version}
            config={config}
            autoSize={autoSize}
          ></Runtime>
        )}
        {isBuilder && Builder && (
          <Builder
            id={id}
            version={version}
            config={config}
            autoSize={autoSize}
          ></Builder>
        )}
      </div>
    </div>
  )
}

ControllerWidget.versionManager = versionManager

export default ControllerWidget

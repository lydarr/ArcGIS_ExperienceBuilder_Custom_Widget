import { Immutable } from 'jimu-core'
import AppConfigOperations from '../src/tools/app-config-operations'

const ext = new AppConfigOperations()
ext.widgetId = 'w1'

describe('app config operations test', () => {
  it('controller widget with auto open config', () => {
    let appConfig: any = Immutable({
      widgets: {
        w1: {
          id: 'w1',
          label: 'W1',
          manifest: { name: 'controller', properties: { hasEmbeddedLayout: true } },
          layouts: {
            controller: {
              LARGE: 'l1'
            }
          },
          config: {
            behavior: {
              openStarts: ['w2', 'w3']
            }
          }
        },
        w2: { manifest: { properties: {} } },
        w3: { manifest: { properties: {} } }
      },
      layouts: {
        l1: {
          id: 'l1',
          order: ['0', '1'],
          content: {
            0: {
              type: 'WIDGET',
              widgetId: 'w2'
            },
            1: {
              type: 'WIDGET',
              widgetId: 'w3'
            }
          }
        }
      }
    })

    const copiedWidget = {
      id: 'w4',
      label: 'W4',
      manifest: { name: 'controller', properties: { hasEmbeddedLayout: true } },
      layouts: {
        controller: {
          LARGE: 'l2'
        }
      },
      config: {
        behavior: {
          openStarts: ['w2', 'w3']
        }
      }
    }

    const l2 = {
      id: 'l2',
      order: ['0', '1'],
      content: {
        0: {
          type: 'WIDGET',
          widgetId: 'w5'
        },
        1: {
          type: 'WIDGET',
          widgetId: 'w6'
        }
      }
    }
    appConfig = appConfig
      .setIn(['layouts', 'l2'], l2)
      .setIn(['widgets', 'w4'], copiedWidget)
      .setIn(['widgets', 'w5'], { manifest: { properties: {} } })
      .setIn(['widgets', 'w6'], { manifest: { properties: {} } })

    appConfig = ext.afterWidgetCopied('w1', appConfig, 'w4', appConfig)
    const w4 = appConfig.widgets.w4
    expect(w4.config.behavior.openStarts).toEqual(['w5', 'w6'])
  })
})

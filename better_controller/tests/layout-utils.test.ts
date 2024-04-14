import { type IMLayoutJson, Immutable } from 'jimu-core'
import { getVisibleOrderFromLayout } from '../src/runtime/common/layout-utils'

describe('Test utils', () => {
  it('getVisibleOrderFromLayout should work', () => {
    let layout = Immutable({
      id: 'layout_1',
      order: ['1', '0'],
      content: {
        0: {
          type: 'WIDGET',
          widgetId: 'widget_0',
          id: '0'
        },
        1: {
          type: 'WIDGET',
          widgetId: 'widget_1',
          id: '1'
        }
      }
    }) as unknown as IMLayoutJson
    expect(getVisibleOrderFromLayout(layout)).toEqual(['1', '0'])

    layout = Immutable({
      id: 'layout_1',
      order: ['1', '0'],
      content: {
        0: {
          type: 'WIDGET',
          id: '0'
        },
        1: {
          type: 'WIDGET',
          widgetId: 'widget_1',
          id: '1'
        }
      }
    }) as unknown as IMLayoutJson

    expect(getVisibleOrderFromLayout(layout)).toEqual(['1'])
  })
})

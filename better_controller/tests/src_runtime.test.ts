import { Immutable, getAppStore, appActions } from 'jimu-core'
import { getActiveViews, getParentSection } from '../src/runtime/runtime/runtime'
import { getInitState } from 'jimu-for-test'

describe('Test runtime utils', () => {
  it('getActiveViews should work well', () => {
    const sections = Immutable({
      section_1: {
        id: 'section_1',
        views: ['view_1', 'view_2']
      },
      section_2: {
        id: 'section_2',
        views: ['view_3', 'view_4']
      }
    })
    getAppStore().dispatch(appActions.updateStoreState(getInitState().set('appConfig', { sections })))

    let sectionNavInfos

    expect(getActiveViews(sectionNavInfos)).toEqual(['view_1', 'view_3'])

    sectionNavInfos = Immutable({
      section_2: {
        currentViewId: 'view_4'
      }
    }) as any

    expect(getActiveViews(sectionNavInfos)).toEqual(['view_4', 'view_1'])

    sectionNavInfos = Immutable({
      section_1: {
        currentViewId: 'view_1'
      },
      section_2: {
        currentViewId: 'view_4'
      }
    }) as any

    expect(getActiveViews(sectionNavInfos)).toEqual(['view_1', 'view_4'])

    sectionNavInfos = Immutable({
      section_1: {
        currentViewId: 'view_2'
      },
      section_2: {
        currentViewId: 'view_4'
      }
    }) as any

    expect(getActiveViews(sectionNavInfos)).toEqual(['view_2', 'view_4'])
  })

  it('getParentSection should work well', () => {
    const sections = Immutable({
      section_1: {
        id: 'section_1',
        views: ['view_1', 'view_2']
      },
      section_2: {
        id: 'section_2',
        views: ['view_3', 'view_4']
      }
    })
    getAppStore().dispatch(appActions.updateStoreState(getInitState().set('appConfig', { sections })))

    expect(getParentSection('view_2')).toBe('section_1')
    expect(getParentSection('view_1')).toBe('section_1')
    expect(getParentSection('view_4')).toBe('section_2')
    expect(getParentSection('view_3')).toBe('section_2')
  })
})

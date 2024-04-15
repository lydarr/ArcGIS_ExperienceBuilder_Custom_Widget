import { type ImmutableObject } from 'seamless-immutable'
import { type AvatarCardProps } from './runtime/common'
import { type ImmutableArray, type ThemeButtonStylesByState, type Size } from 'jimu-core'

export enum DisplayType {
  Stack = 'STACK',
  SideBySide = 'SIDEBYSIDE'
}

export type WidgetAvatarCard = Pick<AvatarCardProps, 'showLabel' | 'showTooltip' | 'showIndicator' | 'labelGrowth' | 'avatar'> & {
  variant?: ThemeButtonStylesByState
}

export interface SizeMap {
  [x: string]: Size
}

export type IMSizeMap = ImmutableObject<SizeMap>

export interface Config {
  behavior: {
    onlyOpenOne: boolean
    openStarts: ImmutableArray<string>
    arrangement?: 'floating' | 'fixed'
    displayType: DisplayType
    vertical: boolean
    size: SizeMap
  }
  appearance: {
    space: number
    advanced: boolean
    card: WidgetAvatarCard
  }
}

export type IMConfig = ImmutableObject<Config>

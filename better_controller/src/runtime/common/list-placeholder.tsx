import { polished, React } from 'jimu-core'
import { AvatarCard, type AvatarProps, type AvatarSize } from './avatar-card'
import WidgetPlaceHolderOutlined from 'jimu-icons/svg/outlined/brand/widget-place-holder.svg'
import { styled } from 'jimu-theme'

export interface ListPlaceholderProps {
  vertical?: boolean
  space?: number
  size?: AvatarSize
}

const createArray = (length: number) => {
  const arr = []
  while (length > 0) {
    arr.push(length)
    length--
  }
  return arr
}

const PlaceholderRoot = styled('div', {
  shouldForwardProp: (propName: string) => !['vertical', 'space'].includes(propName)
}) <{ vertical: boolean, space: number }>`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: ${props => props.vertical ? 'column' : 'row'};
  .avatar-placeholder {
    &:not(:first-of-type) {
      margin-top: ${props => props.vertical ? polished.rem(props.space) : 'unset'};
      margin-left: ${props => !props.vertical ? polished.rem(props.space) : 'unset'};
    }
  }
`
const dummyData = createArray(3)
const defaultAvatar = { type: 'secondary', size: 'lg', shape: 'circle' } as AvatarProps
export const ListPlaceholder = (props: ListPlaceholderProps) => {
  const { vertical, space, size = 'lg' } = props
  const avatar = React.useMemo(() => ({ ...defaultAvatar, size }), [size])

  return (
    <PlaceholderRoot className='list-placeholder' vertical={vertical} space={space}>
      {dummyData.map((_, idx) => (
        <AvatarCard key={idx} disabled={true} className='avatar-placeholder' icon={WidgetPlaceHolderOutlined} label='' showTooltip={false} avatar={avatar}></AvatarCard>
      ))}
    </PlaceholderRoot>
  )
}

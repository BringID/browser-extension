export type TSize = 'default' | 'small'

export type TProps = {
  value: boolean
  onChange?: (value: boolean) => void
  label?: string
  className?: string
  disabled?: boolean
  size?: TSize
}

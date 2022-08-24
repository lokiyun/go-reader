import React, { FC, HtmlHTMLAttributes, useEffect, useState } from 'react'
import RSelect, { OnChangeValue } from 'react-select'

interface SelectType {
  value: string | number
  label: string
}

interface ISelectProps {
  options: SelectType[]
  defaultValue?: SelectType
  title?: string
  handleChange?: any
}

export type SelectProps = ISelectProps & HtmlHTMLAttributes<HTMLElement>

const Select: FC<SelectProps> = (props) => {
  const {
    title,
    options,
    defaultValue,
    handleChange,
    ...restProps
  } = props

  const [selectedOption, setSelectedOption] = useState<SelectType | null>(null)

  useEffect(() => {
    if (defaultValue) {
      let newSelectedOption = options.find(item => item.value === defaultValue) || options[0]
      setSelectedOption(newSelectedOption)
    }
  }, [])

  const handleChangeOption = (newSelectedOption: OnChangeValue<any, boolean>) => {
    setSelectedOption(newSelectedOption)
    handleChange(newSelectedOption.value)
  }

  return (
    <div className='select-container' {...restProps}>
      <span className='select-container-title'>{title}</span>
      <RSelect
        className='select-container-core'
        name={title}
        value={selectedOption}
        options={options}
        onChange={handleChangeOption}
      />
    </div>
  )
}

export default Select

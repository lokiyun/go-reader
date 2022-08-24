import React, { ChangeEvent, FC, useEffect, useState } from "react"
import "./progress.style.scss"

export interface ProgressProps {
  max: number
  value: number
  handler?: (index: number) => void
}

const Progress: FC<ProgressProps> = (props) => {
  const {
    max,
    value,
    handler
  } = props

  console.log(max);
  

  const [innerValue, setValue] = useState(value)

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setValue(+e.target.value)
    handler && handler(+e.target.value)
  }

  useEffect(() => {
    setValue(value)
  }, [value, handler])

  return (
    <div className="slider-component">
      <div className="slider-body">
        <input type="range" className="range-input"  onChange={handleChange} max={max} step={1} min={0} value={innerValue.toString()} />
      </div>
    </div>
  )
}

export default Progress

import React, { FormEvent, ReactNode, useState } from 'react';
import round from 'lodash/round';
import toNumber from 'lodash/toNumber';
import add from 'lodash/add';
import ceil from 'lodash/ceil';
import { Progress } from 'reactstrap';
import classNames from 'classnames';

type Props = {
  label: string | ReactNode;
  min: number;
  max: number;
  step?: number;
  unit: string;
  value: number;
  className?: string;
  onChange?: (v: number) => void;
  sliderWidth?: string;
};

export function getPrecision(num: number) {
  const str = num.toString();
  if (str.includes('.')) {
    const dec = str.split('.')[1];
    return dec.length;
  } else {
    return 0;
  }
}

export default function SliderInput({
  label,
  min,
  max,
  step = 0.1,
  unit,
  value,
  className = '',
  onChange,
  sliderWidth = '4.5rem',
}: Props) {
  function formatValue(value: number, unit: string) {
    const strValue = unit === '%' ? round(value * 100).toString() : value.toString();
    return `${strValue}${unit}`;
  }

  const handleInput = (e: FormEvent<HTMLInputElement>) => {
    const v = toNumber(e.currentTarget.value);
    if (onChange) onChange(v);
  };

  return (
    <div className={`${className} slider d-flex align-items-center`}>
      <div className='col'>
        <label className={classNames('me-2', { 'icon-label': typeof label !== 'string' })}>{label}</label>
      </div>
      <div className='col-auto'>
        <div className='wrapper' style={{ width: sliderWidth }}>
          <input
            className='slider-input'
            type='range'
            value={value}
            min={min}
            max={max}
            step={step}
            onChange={handleInput}
          />
          <span className='slider-value'>{formatValue(value, unit)}</span>
          <Progress className='slider-progress' color='primary' value={(value * 100) / (max - min)} />
        </div>
      </div>
    </div>
  );
}

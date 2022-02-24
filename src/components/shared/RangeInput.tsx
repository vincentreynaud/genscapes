import React, { FormEvent } from 'react';
import round from 'lodash/round';
import toNumber from 'lodash/toNumber';

type Props = {
  label: string;
  min: number;
  max: number;
  step?: number;
  unit: string;
  value: number;
  onChange?: (v: number) => void;
  className?: string;
};

export default function RangeInput({ label, min, max, step, unit, value, onChange, className = '' }: Props) {
  const handleInput = (e: FormEvent<HTMLInputElement>) => {
    const v = toNumber(e.currentTarget.value);
    if (onChange) onChange(v);
  };

  function formatValue(value: number, unit: string) {
    const strValue = unit === '%' ? round(value * 100).toString() : value.toString();
    return `${strValue}${unit}`;
  }

  return (
    <div className={className}>
      {label ? <label>{label}</label> : null}
      <div className='slider d-flex align-items-center'>
        <input
          type='range'
          className='form-range'
          value={value}
          min={min}
          max={max}
          step={step || 0.1}
          onChange={handleInput}
        />
        <span className='control-value'>{formatValue(value, unit)}</span>
      </div>
    </div>
  );
}

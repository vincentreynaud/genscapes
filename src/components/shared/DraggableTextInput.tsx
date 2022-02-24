import React, { FormEvent, useState } from 'react';
import round from 'lodash/round';
import toNumber from 'lodash/toNumber';
import add from 'lodash/add';
import ceil from 'lodash/ceil';
import { Progress } from 'reactstrap';

type Props = {
  label: string;
  min: number;
  max: number;
  step?: number;
  unit: string;
  value: number;
  className?: string;
  onChange?: (v: number) => void;
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

export default function DraggableRangeInput({
  label,
  min,
  max,
  step = 0.1,
  unit,
  value,
  className = '',
  onChange,
}: Props) {
  const precision = getPrecision(step);
  const [params, setParams] = useState({
    startPos: 0,
    startVal: formatValue(value),
  });

  function formatValue(value: number, op: 'mul' | 'div' = 'mul') {
    if (unit !== '%') {
      return value;
    } else {
      return op === 'mul' ? round(value * 100) : value / 100;
    }
  }

  const handleInput = (e: FormEvent<HTMLInputElement>) => {
    const v = toNumber(e.currentTarget.value);
    if (onChange) onChange(formatValue(v, 'div'));
  };

  // add touch func: https://codepen.io/DarkStar66/pen/eBrdrY?editors=1010
  function handleMouseDown(e) {
    setParams({ ...params, startVal: e.target.value, startPos: e.clientX });
    if (isNaN(params.startVal)) {
      setParams({ ...params, startVal: 0 });
    }
    document.onmousemove = function (e) {
      e.preventDefault();
      const delta = ceil(e.clientX - params.startPos);
      scaledIntCtrl(params.startVal, delta);
    };
    document.onmouseup = function () {
      document.onmousemove = null; // remove mousemove to stop tracking
    };
  }

  function scaledIntCtrl(val: number, delta: number) {
    const incVal = Math.sign(delta) * Math.pow(Math.abs(delta) / 10, 1.6);
    let newVal = add(toNumber(val), toNumber(incVal));
    if (newVal < min) {
      newVal = min;
    } else if (newVal > max) {
      newVal = max;
    }
    newVal = round(toNumber(newVal), precision);
    if (Math.abs(incVal) >= step) {
      if (onChange) onChange(newVal);
    }
  }

  function handleMouseEnter() {}

  return (
    <div className={`${className} draggable-input-range d-flex align-items-center`}>
      <label className='me-2'>{label}</label>
      <div className='control-wrapper'>
        <input
          className='control'
          value={formatValue(value)}
          min={min}
          max={max}
          step={step}
          onChange={handleInput}
          onMouseDown={handleMouseDown}
          onMouseEnter={handleMouseEnter}
        />
        <Progress className='range-bar' value={(value * 100) / (max - min)} />
      </div>
      <span className='control-value'>{unit}</span>
    </div>
  );
}

import { round, toNumber } from "lodash";
import React, { FormEvent, FormEventHandler, useState } from "react";

type Props = {
  label: string;
  min: number;
  max: number;
  step?: number;
  unit: string;
  initValue: number;
  onChange?: (v: number) => void;
};

export default function RangeInput({ label, min, max, step, unit, initValue, onChange }: Props) {
  const handleInput = (e: FormEvent<HTMLInputElement>) => {
    const v = toNumber(e.currentTarget.value);
    setValue(v);
    if (onChange) onChange(v);
  };

  function formatValue(value: number, unit: string) {
    const strValue = unit === "%" ? round(value * 100).toString() : value.toString();
    return `${strValue}${unit}`;
  }

  const [value, setValue] = useState(initValue);

  return (
    <div>
      <label>{label}</label>
      <div className="d-flex align-items-center">
        <input
          type="range"
          className="control"
          value={value}
          min={min}
          max={max}
          step={step || 0.1}
          onInput={handleInput}
        />
        <span className="control-value">{formatValue(value, unit)}</span>
      </div>
    </div>
  );
}

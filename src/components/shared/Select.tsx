import React, { ChangeEvent } from 'react';

type Props = {
  name: string;
  value: string | number;
  options: Record<'value' | 'label', string | number>[];
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  id?: string;
  className?: string;
};

export default function Select({ name, value, options, onChange, id = '', className = '' }: Props) {
  return (
    <select className={`${className}`} name={name} id={id} value={value} onChange={onChange}>
      {options.map(({ value, label }, i) => (
        <option value={value.toString()} key={i}>
          {label.toString()}
        </option>
      ))}
    </select>
  );
}

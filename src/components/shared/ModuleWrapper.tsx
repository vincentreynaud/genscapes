import React, { ReactNode } from 'react';

type Props = {
  id?: string;
  title: string;
  children: ReactNode;
  className?: string;
};

export default function ({ id = '', title, children, className = 'col-auto' }: Props) {
  return (
    <div className={`box ${className}`} id={id}>
      <h2>{title}</h2>
      {children}
    </div>
  );
}

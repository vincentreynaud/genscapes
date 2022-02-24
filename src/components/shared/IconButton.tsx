import classNames from 'classnames';
import React, { ReactNode } from 'react';

type Props = {
  children: ReactNode;
  id?: string;
  className?: string;
  onClick?: any;
  size?: 'md' | 'sm';
  variant?: 'filled' | 'text';
};

export default function IconButton({ children, className, id, onClick, size = 'md', variant = 'text' }: Props) {
  return (
    <button
      className={classNames(`icon-button d-flex align-items-center p-1 ${className}`, {
        'size-sm': size === 'sm',
        'variant-filled': variant === 'filled',
        'variant-text': variant === 'text',
      })}
      id={id}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

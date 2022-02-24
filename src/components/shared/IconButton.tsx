import classNames from 'classnames';
import React, { ReactNode } from 'react';

type Props = {
  children: ReactNode;
  id?: string;
  className?: string;
  onClick?: any;
  size?: 'md' | 'sm';
  variant?: 'filled' | 'text';
  onMouseDown?: Function;
};

export default function IconButton({
  children,
  className,
  id,
  onClick,
  size = 'md',
  variant = 'text',
  onMouseDown = () => {},
}: Props) {
  return (
    <button
      className={classNames(`icon-button d-flex align-items-center p-1 ${className}`, {
        'size-sm': size === 'sm',
        'variant-filled': variant === 'filled',
        'variant-text': variant === 'text',
      })}
      id={id}
      onClick={onClick}
      onMouseDown={(e) => onMouseDown}
    >
      {children}
    </button>
  );
}

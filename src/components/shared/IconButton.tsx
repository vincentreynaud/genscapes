import { ReactNode } from 'react';

type Props = {
  children: ReactNode;
  id?: string;
  className?: string;
  onClick?: any;
};

export default function IconButton({ children, className, id, onClick }: Props) {
  return (
    <button className={`icon-button d-flex align-items-center p-1 ${className}`} id={id} onClick={onClick}>
      {children}
    </button>
  );
}

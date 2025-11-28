import React from 'react';

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const Container: React.FC<ContainerProps> = ({ children, className = '' }) => {
  return (
    <div className={`max-w-md mx-auto w-full px-4 pb-24 pt-8 ${className}`}>
      {children}
    </div>
  );
};
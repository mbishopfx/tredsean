import { ReactNode } from 'react';

interface TabComponentProps {
  isActive: boolean;
  children: ReactNode;
}

export function TabComponent({ isActive, children }: TabComponentProps) {
  // Always render but hide when not active to prevent hook count mismatch
  return (
    <div className={isActive ? 'block' : 'hidden'}>
      {children}
    </div>
  );
} 
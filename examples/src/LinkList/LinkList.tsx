import { ReactNode } from 'react';

export default ({ children }: { children: ReactNode }) => (
  <div style={{ display: 'flex', flexFlow: 'column', padding: 20 }}>
    {children}
  </div>
);

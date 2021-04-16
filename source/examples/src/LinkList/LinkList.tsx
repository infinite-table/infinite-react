import { ReactNode } from 'react';

import styles from './index.module.scss';

console.log(styles);
export default ({ children }: { children: ReactNode }) => (
  <div
    className={styles.linklist}
    style={{ display: 'flex', flexFlow: 'column', padding: 20 }}
  >
    {children}
  </div>
);

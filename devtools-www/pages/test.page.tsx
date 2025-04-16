import { DataSourceData } from '@infinite-table/infinite-react';

import { useEffect, useRef, useState } from 'react';

type Developer = {
  id: number;
  firstName: string;
  lastName: string;
  country: string;
  city: string;
  currency: string;

  email: string;
  preferredLanguage: string;
  stack: string;
  canDesign: 'yes' | 'no';
  hobby: string;
  salary: number;
  age: number;
};
const dataSource: DataSourceData<Developer> = ({}) => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + `/developers50k-sql`).then(
    (r) => r.json(),
  );
};

export default function () {
  const [active, setActive] = useState(false);
  const overlayBgRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!active) {
      overlayRef.current?.classList.remove('infinite-devtools-overlay--active');
      return;
    }

    const onAnimationEnd = () => {
      console.log('animation end!');
      setActive(false);
    };

    console.log(overlayBgRef.current);
    overlayBgRef.current?.addEventListener('animationend', onAnimationEnd);

    overlayRef.current?.classList.add('infinite-devtools-overlay--active');

    return () => {
      overlayBgRef.current?.removeEventListener('animationend', onAnimationEnd);
    };
  }, [active]);
  return (
    <>
      <div
        style={{ position: 'relative', background: 'white', color: 'black' }}
      >
        <button onClick={() => setActive(!active)}>toggle</button>
        <div
          ref={overlayRef}
          className={`infinite-devtools-overlay`}
          style={{
            width: 200,
            height: 200,
            position: 'relative',
            border: '1px solid red',
          }}
        >
          <div className="infinite-devtools-overlay-text">hello</div>
          <div
            ref={overlayBgRef}
            className="infinite-devtools-overlay-bg"
          ></div>
        </div>
      </div>
    </>
  );
}

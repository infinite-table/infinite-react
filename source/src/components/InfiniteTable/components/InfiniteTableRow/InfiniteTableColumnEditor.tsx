import * as React from 'react';
import { useCallback, useRef } from 'react';
import { join } from '../../../../utils/join';
import { absoluteCover, outline } from '../../utilities.css';

import { useInfiniteColumnEditor } from './InfiniteTableColumnCell';

export function InfiniteTableColumnEditor<T>() {
  const { initialValue, setValue, confirmEdit, cancelEdit, readOnly } =
    useInfiniteColumnEditor<T>();

  const domRef = useRef<HTMLInputElement>();
  const refCallback = React.useCallback((node: HTMLInputElement) => {
    domRef.current = node;

    if (node) {
      node.focus();
    }
  }, []);

  const onKeyDown = useCallback((event: React.KeyboardEvent) => {
    const { key } = event;
    if (key === 'Enter' || key === 'Tab') {
      confirmEdit();
    } else if (key === 'Escape') {
      cancelEdit();
    } else {
      event.stopPropagation();
    }
  }, []);

  return (
    <>
      <input
        readOnly={readOnly}
        ref={refCallback}
        onKeyDown={onKeyDown}
        onBlur={() => confirmEdit()}
        className={join(absoluteCover, outline.none)}
        type={'text'}
        defaultValue={initialValue}
        onChange={useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
          setValue(event.target.value);
        }, [])}
      />
    </>
  );
}

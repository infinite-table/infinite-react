import * as React from 'react';
export interface Setter<T> extends React.Dispatch<React.SetStateAction<T>> {}

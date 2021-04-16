import { Dispatch, SetStateAction } from 'react';

export interface Setter<T> extends Dispatch<SetStateAction<T>> {}

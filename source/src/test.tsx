import * as CSS from 'csstype';

const x: CSS.PositionProperty = 'relative';
console.log(x);

import * as PropTypes from 'prop-types';
import { ReactNodeArray } from 'prop-types';

import { Dispatch } from 'react';

const arr: PropTypes.ReactNodeArray = [];
const arr1: ReactNodeArray = [];

const d: Dispatch<string> = (_x: string) => {};

console.log(arr);
console.log(arr1);
console.log(d);

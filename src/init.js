// @ts-check

import Example from './example.js';

export default () => {
  const element = document.getElementById('point');
  const obj = new Example(element);
  obj.init();
};

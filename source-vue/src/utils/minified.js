function checkMinified(arg) {
  /* this is a simple comment */
}

export default checkMinified.toString() !=
  'function checkMinified(arg) { /* this is a simple comment */ }';

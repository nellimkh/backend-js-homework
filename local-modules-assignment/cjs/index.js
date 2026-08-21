const math = require('./utils/math');
const capitalize = require('./utils/strings');

console.log(math.add(5, 3));
console.log(math.subtract(5, 3));
console.log(math.multiply(5, 3));

console.log(capitalize("hello"));
console.log(require.cache);
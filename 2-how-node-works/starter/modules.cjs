console.log(arguments);
console.log(require("module").wrapper);

// module.exports
const C = require("./test-module-1.cjs");
const calc1 = new C();
console.log(calc1.add(2, 5));

// exports
// const calc2 = require("./test-module-2.cjs");
const { add, multiply } = require("./test-module-2.cjs");
console.log(multiply(2, 5));

// caching
require("./test-module-3.cjs")();
require("./test-module-3.cjs")();
require("./test-module-3.cjs")();

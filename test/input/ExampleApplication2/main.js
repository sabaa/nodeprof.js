/**
 * File: main.js
 */

import { exponent } from "./basicmath.js"
// Source.newBuilder("js", new File("exponent.js")).name("module:exponent.js").content("import {exponent} from './basicmath.js'").build();
// new File("exponent.js").name("module:exponent.js").content("import {exponent} from './basicmath.js'");
import { assert } from "./util/Assert.js";
// Source.newBuilder("js", new File("assert.js")).name("module:assert.js").content("import {assert} from './util/Assert.js'").build();
import * as arrayMath from "./arraymath.js";
// Source.newBuilder("js", new File("*.js")).name("module:*.js").content("import * from './arraymath.js'").build();

// context.eval(Source.newBuilder("js", new File("x.js")).name("module:x.js").content("import {x} from 'y.js'").build());

// context.eval("js", "import {x} from 'y.js'");

const res = exponent(4, 5);
assert(1024, res);

(function(v) {
  let test = function (lib, inArr){
    // var math = arrayMath;
    // assert(12, math.add(inArr));
    // assert(60, math.multiply(inArr));
  }
  test(v, [3, 4, 5]);
})(/*arrayMath*/);

'use strict';
const crypto = require('crypto');

// Constant-time Buffer comparison. Same API as buffer-equal-constant-time@1.0.1
// (used by jwa), without the SlowBuffer reference removed in newer Node.js.
function bufferEq(a, b) {
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) return false;
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

bufferEq.install = function () {
  Buffer.prototype.equal = function equal(that) {
    return bufferEq(this, that);
  };
};

const origBufEqual = Buffer.prototype.equal;
bufferEq.restore = function () {
  Buffer.prototype.equal = origBufEqual;
};

module.exports = bufferEq;

/**
 * @file
 * Example 001: Validate webhook message using HMAC
 * @author DocuSign
 */

const crypto = require('crypto');

//ds-snippet-start:Connect1Step1
/**
 * This function computes the hash.
 * @param {object} args parameters for computing the hash.
 * @param {string} args.secret hmac secret key.
 * @param {string} args.payload plain text payload.
 * @return {string} Computed hash.
 */
//ds-snippet-start:Connect1Step1
const computeHash = (args) => {
  const hmac = crypto.createHmac('sha256', args.secret);
  hmac.write(args.payload);
  hmac.end();
  return hmac.read().toString('base64');
};

//ds-snippet-end:Connect1Step1

/**
 * This function validates a webhook message.
 * @param {object} args parameters for validating the message.
 * @param {string} args.verify hash value as base64 string.
 * @param {string} args.secret hmac secret key.
 * @param {string} args.payload plain text payload.
 * @return {boolean} Returns true if the provided hash matches the computed hash, otherwise false.
 */

//ds-snippet-start:Connect1Step1
const isHashValid = (args) => {
  return crypto.timingSafeEqual(Buffer.from(args.verify, 'base64'), Buffer.from(computeHash(args), 'base64'));
};

module.exports = { computeHash, isHashValid };
//ds-snippet-end:Connect1Step1

const { compPrefix: prefix4c } = require('../../../utils/globalConfig');

const button = require('./button');
const checkbox = require('./checkbox');
module.exports = {
  [prefix4c]: { button, checkbox },
};

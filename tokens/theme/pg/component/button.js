const { globalPrefix: prefix4g } = require('../../../utils/globalConfig');
module.exports = {
  'font-size': { value: 2 },

  primary: {
    'background-color': { value: `{${prefix4g}.color.theme.primary.value}` },
    color: { value: `hsl(10, 80, 50)` },
  },
};

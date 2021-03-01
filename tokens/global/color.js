const { globalPrefix: prefix } = require('../utils/globalConfig');
const gColors = {
  color: {
    base: {
      redest: { value: `hsl(10, 80, 50)` },
      white: { value: '#FFFFFF' },
    },
    primary: { value: `{${prefix}.color.theme.primary.value}` },
  },
};

module.exports = {
  [prefix]: gColors,
};

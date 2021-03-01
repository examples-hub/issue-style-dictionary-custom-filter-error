const StyleDictionary = require('style-dictionary');
const transformerBuiltin =
  StyleDictionary.transform['attribute/cti'].transformer;

const { globalPrefix: prefix4g } = require('./tokens/utils/globalConfig');
const { compPrefix: prefix4c } = require('./tokens/utils/globalConfig');

const compTokens = require('./tokens/theme/pg/component');
var propertiesToCTIMap = {
  'background-color': { category: 'color', type: 'background' },
  color: { category: 'color', type: 'font' },
  'font-size': { category: 'size', type: 'font' },
};

// custom transfromer to map tokens to component-cti
StyleDictionary.registerTransform({
  name: 'attribute/cti',
  type: 'attribute',
  transformer: (prop) => {
    // console.log('==, ', JSON.stringify(prop));

    if (prop.path[0] === prefix4c) {
      // if token starts with pg-c，map the last css property to cti
      return propertiesToCTIMap[prop.path[prop.path.length - 1]];
    }

    if (prop.path[0] === prefix4g) {
      // if token starts with pg-g，remove the pg-g then map the rest to cti
      const propPathNew = prop.path.slice(1);

      return transformerBuiltin(Object.assign({}, prop, { path: propPathNew }));
    }

    // Fallback to the original 'attribute/cti' transformer
    return transformerBuiltin(prop);
  },
});

// custom format to output css variables references and renaming `:root`
StyleDictionary.registerFormat({
  name: 'css/variables',
  formatter: function ({ dictionary, options }) {
    return `${this.selectorName} {
      ${dictionary.allProperties
        .map((prop) => {
          console.log('==, ', JSON.stringify(prop));
          // let value = JSON.stringify(prop.value);
          let value = prop.value;

          if (options.outputReferences) {
            if (dictionary.usesReference(prop.original.value)) {
              const reference = dictionary.getReference(prop.original.value);
              // console.log('==||, ', JSON.stringify(reference));
              // console.trace();
              value = reference.name;
              return `  --${prop.name}: var(--${value}, ${prop.value});`;
            }
          }
          return `  --${prop.name}: ${prop.value};`;
        })
        .join('\n')}
    }`;
  },
});

function getSDConfig(themeName) {
  return {
    // default tokens with no component tokens
    include: ['tokens/global/**/*.js', `tokens/theme/pg/*.js`],
    source: [
      `tokens/theme/${themeName}/*.js`, // theme-specific global tokens
      `tokens/theme/${themeName}/component/index.js`, // theme-specific comp tokens
    ],
    platforms: {
      // here outputs all global tokens, working well
      globalCss: {
        transformGroup: 'css',
        buildPath: `dist/`,
        files: [
          {
            destination: `${themeName}.css`,
            format: 'css/variables',
            selectorName: `.${themeName}`,
            options: {
              outputReferences: true,
            },
          },
        ],
      },
      // here outputs all comp tokens, failed
      compCss: {
        transformGroup: 'css',
        buildPath: `dist/${themeName}-comp/`,
        files: Object.keys(compTokens[prefix4c]).map((compType) => {
          return {
            destination: `${compType}.css`,
            format: 'css/variables',
            selectorName: `.${compType}`,
            options: {
              outputReferences: true,
            },
            filter: (prop) => {
              return prop.name.includes(`${prefix4c}-${compType}`);
            },
          };
        }),
      },
      // ... platformN
    },
  };
}

function startBuildMultiThemes() {
  const themeNameArr = ['halfmoon', 'spectrum', 'pg'];
  themeNameArr.forEach((themeName) => {
    console.log('\n==============================================');
    console.log(`\nprocessing:  [${themeName}]`);
    const SD = StyleDictionary.extend(getSDConfig(themeName));
    SD.buildAllPlatforms();
    console.log('\nend processing');
  });
}
console.log('build started');

startBuildMultiThemes();
console.log('\n==============================================');
console.log('\nbuild completed!');

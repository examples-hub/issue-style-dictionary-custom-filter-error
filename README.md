# issue-style-dictionary-custom-filter-error

> repo for this [issue](https://github.com/amzn/style-dictionary/issues/551)

# overview

- [this](https://github.com/examples-hub/issue-style-dictionary-custom-filter-error) is a simplified example repo combining ideas from `multi-brand-multi-platform` and `node-modules-as-config-and-properties`.
  - all tokens are written in commonjs
  - simplified with color only tokens
  - only output css variables with references
  - project is built with style-dictionary v3.0.0-rc.5

- my design system has three themes. 
  - pg is used as the default theme. 
  - halfmoon and spectrum override tokens in pg.

# my goal

- A. output theme-specific global css variables without components
  - all global vars start with `--pg-g` for all themes
- B. output theme-specific component only css variables
  - all comp vars start with `--pg-c` for all themes

## my expected output:

``` 

--dist/
  --pg.css
  --halfmoon.css
  --spectrum.css
  --pg-comp/
    --button.css
    --checkbox.css
  --halfmoon-comp/
  --spectrum-comp/

```

# my problem

- goal A works
- goal B fialed. 
  - I cannot output component only css variablesW

## how to reproduce

- `git clone https://github.com/examples-hub/issue-style-dictionary-custom-filter-error.git`
- `npm i && npm run build`.
  - look at `dist/pg.css`, for `globalCss` platfrom, button comp `--pg-c-button-primary-background-color: var(--pg-g-color-theme-primary, #db3236);` can be outputted
  - but for `compCss` platform, button comp css variables cannot be generated

``` 

==,  {"value":"#db3236","filePath":"tokens/theme/pg/component/index.js","isSource":true,"original":{"value":"{pg-g.color.theme.primary.value}"},"name":"pg-c-button-primary-background-color","attributes":{"category":"color","type":"background"},"path":["pg-c","button","primary","background-color"]}

/build.js:55
              value = reference.name;
                                ^

TypeError: Cannot read property 'name' of undefined

```

# simplified config

``` js
const StyleDictionary = require('style-dictionary');

// custom transfromer to map tokens to component-cti
StyleDictionary.registerTransform({
  name: 'attribute/cti',
  type: 'attribute',
  transformer: (prop) => {

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

StyleDictionary.registerFormat({
  name: 'css/variables',
  formatter: function({ dictionary, options }) {
    return `${this.selectorName} {
      ${dictionary.allProperties
        .map((prop) => {
           // let value = JSON.stringify(prop.value);
          let value = prop.value;

          if (options.outputReferences) {
            if (dictionary.usesReference(prop.original.value)) {
              const reference = dictionary.getReference(prop.original.value);
         
              value = reference.name;
              return `  --${prop.name}: var(--${value}, ${prop.value});`;
            }
          }
          return `--$ { prop.name }: $ { prop.value };
    `;
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
        files: [{
          destination: `${themeName}.css`,
          format: 'css/variables',
          selectorName: `.${themeName}`,
          options: {
            outputReferences: true,
          },
        }, ],
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

startBuildMultiThemes();
```

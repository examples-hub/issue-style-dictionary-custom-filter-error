# issue-style-dictionary-custom-filter-error

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

## Setup
```
# install dependencies
yarn

# docker needs to be running!

# build wasm
yarn tree-sitter build-wasm node_modules/tree-sitter-javascript
yarn tree-sitter build-wasm node_modules/tree-sitter-tsq

# move to public folder so it can be served
mv tree-sitter-javascript.wasm public
mv tree-sitter-tsq.wasm public
```

## Usage

```
yarn dev
```

### Add more grammars
```
# add grammer from npm tree-sitter-X
yarn add -D tree-sitter-javascript

# build wasm
yarn tree-sitter build-wasm node_modules/tree-sitter-javascript

# move to public folder so it can be served
mv tree-sitter-javascript.wasm public

# update App.tsx as per the other parsers
```

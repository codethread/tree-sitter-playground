## Usage

```
yarn dev
```

### build grammers
```
# add grammer
yarn add -D tree-sitter-javascript

# build wasm
yarn tree-sitter build-wasm node_modules/tree-sitter-javascript

# move to public folder so it can be served
mv tree-sitter-javascript.wasm public
```

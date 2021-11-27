import { Component, createResource, Index, Match, Switch } from "solid-js";
import Parser, { Tree } from "web-tree-sitter";
import styles from "./App.module.css";

const App: Component = () => {
  const [parser] = createResource(async () => {
    await Parser.init();
    const lang = await Parser.Language.load("tree-sitter-javascript.wasm");
    const parser = new Parser();
    parser.setLanguage(lang);
    return parser;
  });

  return (
    <div class={styles.App}>
      <Switch fallback={<Page parser={parser() as Parser} />}>
        <Match when={parser.error}>
          <pre>{parser.error}</pre>
        </Match>
        <Match when={parser.loading}>
          <p>loading...</p>
        </Match>
      </Switch>
    </div>
  );
};

const Page: Component<{ parser: Parser }> = ({ parser }) => {
  const code = "let x = 1; console.log(x);";
  const tree = parser.parse(code);
  return (
    <div class={styles.page}>
      <div class={styles.header}>Tree-sitter Playground</div>
      <div class={`${styles.query} ${styles.borderBox}`}>query</div>
      <div class={`${styles.source} ${styles.borderBox}`}>{code}</div>
      <div class={`${styles.tree} ${styles.borderBox}`}>
        {tree.rootNode.toString()}
      </div>
      <div class={`${styles.output} ${styles.borderBox}`}>output</div>
    </div>
  );
};

export default App;

import {
  Component,
  createResource,
  createSignal,
  Index,
  Match,
  Switch,
} from "solid-js";
import Parser from "web-tree-sitter";
import styles from "./App.module.css";
import prettyPrint from "./prettyPrintQueryTree";

const App: Component = () => {
  const [parsers] = createResource(async () => {
    await Parser.init();

    const [js, cl] = await Promise.all([
      Parser.Language.load("tree-sitter-javascript.wasm"),
      Parser.Language.load("tree-sitter-tsq.wasm"),
    ]);

    const jsParser = new Parser();
    jsParser.setLanguage(js);

    const qlParser = new Parser();
    qlParser.setLanguage(cl);

    return [jsParser, qlParser];
  });

  return (
    <div class={styles.App}>
      <Switch fallback={<Page parsers={parsers() as Parser[]} />}>
        <Match when={parsers.error}>
          <pre>{parsers.error}</pre>
        </Match>
        <Match when={parsers.loading}>
          <p>loading...</p>
        </Match>
      </Switch>
    </div>
  );
};

const Page: Component<{ parsers: Parser[] }> = ({
  parsers: [jsParser, qlParser],
}) => {
  const [code, setCode] = createSignal("let x = 'type in here'");
  const trees = () => {
    const jsTree = jsParser.parse(code());
    const qlTree = qlParser.parse(jsTree.rootNode.toString());
    return { jsTree, qlTree };
  };

  return (
    <div class={styles.page}>
      <div class={styles.header}>Tree-sitter Playground</div>
      <div class={`${styles.query} ${styles.borderBox}`}>query</div>
      <div class={`${styles.source} ${styles.borderBox}`}>
        <textarea
          class={styles.textarea}
          onInput={(e) => {
            setCode(e.target.value as string);
          }}
        >
          {code()}
        </textarea>
      </div>
      <div class={`${styles.tree} ${styles.borderBox}`}>
        <p>
          <Index each={prettyPrint(trees().qlTree)}>
            {(line) => <pre>{line}</pre>}
          </Index>
        </p>
      </div>
      <div class={`${styles.output} ${styles.borderBox}`}>output</div>
    </div>
  );
};

export default App;

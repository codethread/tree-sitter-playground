import {
  Component,
  createResource,
  createSignal,
  Index,
  Match,
  Switch,
} from "solid-js";
import Parser, { Query } from "web-tree-sitter";
import styles from "./App.module.css";
import prettyPrint from "./prettyPrintQueryTree";

interface Parsers {
  js: {
    parser: Parser;
    query: (src: string) => Query;
  };
  ql: {
    parser: Parser;
    query: (src: string) => Query;
  };
}

const App: Component = () => {
  const [parsers] = createResource<Parsers>(async () => {
    await Parser.init();

    const [js, ql] = await Promise.all([
      Parser.Language.load("tree-sitter-javascript.wasm"),
      Parser.Language.load("tree-sitter-tsq.wasm"),
    ]);

    const jsParser = new Parser();
    jsParser.setLanguage(js);

    const qlParser = new Parser();
    qlParser.setLanguage(ql);

    // const q = js.query("(variable_declarator (string) @mynum)");

    return {
      js: { parser: jsParser, query: (q: string) => js.query(q) },
      ql: { parser: qlParser, query: (q: string) => ql.query(q) },
    };
  });

  return (
    <div class={styles.App}>
      <Switch fallback={<Page parsers={parsers() as Parsers} />}>
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

const Page: Component<{ parsers: Parsers }> = ({ parsers }) => {
  const [query, setQuery] = createSignal(
    "(variable_declarator (string) @mynum)"
  );
  const [code, setCode] = createSignal("let x = 'type in here'");

  const trees = () => {
    const jsTree = parsers.js.parser.parse(code());
    const qlTree = parsers.ql.parser.parse(jsTree.rootNode.toString());
    return { jsTree, qlTree };
  };

  const match = () => {
    try {
      const myq = parsers.js.query(query());
      console.log(myq.captures(trees().jsTree.rootNode));
      console.log(myq.matches(trees().jsTree.rootNode));
      return myq;
    } catch (e) {
      console.warn(e);
      return null;
    }
  };

  return (
    <div class={styles.page}>
      <div class={styles.header}>Tree-sitter Playground</div>
      <div class={`${styles.query} ${styles.borderBox}`}>
        <textarea
          class={styles.textarea}
          onInput={(e) => {
            setQuery(e.target.value as string);
          }}
        >
          {query()}
        </textarea>
      </div>
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
      <div class={`${styles.output} ${styles.borderBox}`}>
        <Index
          each={
            match()
              ?.matches(trees().jsTree.rootNode)
              .map(
                (n) =>
                  `${n.pattern} : ${n.captures.map(
                    (n) => `${n.name} : ${n.node.text}`
                  )}`
              ) ?? []
          }
        >
          {(line) => <p>{line()}</p>}
        </Index>
      </div>
    </div>
  );
};

export default App;

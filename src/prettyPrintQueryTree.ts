import { Tree, TreeCursor } from "web-tree-sitter";
export default function prettyPrint(tree: Tree): string[] {
  console.log("text:", tree.rootNode.text);
  console.log("tree:", tree.rootNode.toString());
  const cursor = tree.walk();

  const lines: string[] = [""];
  let lastIndex = 1;

  visit(
    cursor,
    (c) => {
      // console.log(c.nodeType, c.nodeText);
      if (c.nodeType === "program") return;
      // if (c.nodeType === "node_name") {
      //   console.log(c.nodeText);
      // }
      if (c.nodeType === "field_name") {
        lines[lastIndex++] = c.nodeText + ":";
        console.log(c.currentFieldName());
      }
      if (c.nodeType === "node_name") {
        console.log(c.nodeText);
        // console.log(c.currentNode().parent?.);
        // console.log(c.currentFieldId());
        console.log("\n");
        // lines[lastIndex - 1] += " " + c.nodeText;
        lines[lastIndex++] = c.nodeText;
      }
      // console.log(c.nodeType, c.currentFieldName(), `"${c.nodeText}"`);
    },
    { namedOnly: true }
  );

  return lines;

  const prog = tree.rootNode;
  debugger;
  if (!prog) throw new Error("nop[e");
  console.log(prog.type);

  return prog.children.reduce<string[]>(
    (lines, node) => {
      console.log("node:", node.text);
      const lastLineN = lines.length - 1;
      let lastLine = lines[lastLineN];

      if (!node.isNamed) {
        lastLine += node.text;
        console.log("l", lastLine);
        return lines;
      }
      return lines;
    },
    [""]
  );
}

const nodeTypes = ["node_name"] as const;
type NodeType = typeof nodeTypes[number];

function visit(
  c: TreeCursor,
  cb: (node: TreeCursor) => void,
  args?: { namedOnly: true }
): null {
  if (!args?.namedOnly || (c.nodeIsNamed && args?.namedOnly)) {
    cb(c);
  }

  const hasChild = c.gotoFirstChild();

  if (hasChild) {
    return visit(c, cb, args);
  } else {
    const hasSibling = c.gotoNextSibling();

    if (hasSibling) {
      return visit(c, cb, args);
    } else {
      const hasAncestor = findAncestorWithUnvistedChild(c);

      if (hasAncestor) {
        return visit(c, cb, args);
      }
    }
  }

  return null;
}

function findAncestorWithUnvistedChild(c: TreeCursor): boolean {
  const hasParent = c.gotoParent();

  if (!hasParent) return false;

  const hasSibling = c.gotoNextSibling();

  if (hasSibling) return true;

  return findAncestorWithUnvistedChild(c);
}

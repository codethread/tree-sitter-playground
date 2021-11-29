import { Tree, TreeCursor } from "web-tree-sitter";

/**
 * Here be dragons
 */
export default function prettyPrint(tree: Tree): string[] {
  console.log("text:", tree.rootNode.text);
  console.log("tree:", tree.rootNode.toString());
  const cursor = tree.walk();

  const lines: string[] = [""];
  let lastIndex = 1;
  let lastDepth = 0;
  let indent = "";

  visit(
    cursor,
    (c, depth = 0) => {
      if (c.nodeType === "program") return;

      if (c.nodeType === "field_name") {
        if (lines[lines.length - 1].endsWith(":")) {
          lines[lines.length - 1] += " " + c.nodeText;
        } else {
          if (depth > lastDepth) {
            indent += " ";
            lastDepth = depth;
          } else if (depth < lastDepth) {
            indent = indent.slice(0, -1);
            lastDepth = depth;
          }
          lines[lastIndex++] = indent + c.nodeText + ":";
        }
      }

      if (c.nodeType === "node_name") {
        if (lines[lines.length - 1].endsWith(":")) {
          lines[lines.length - 1] += " " + c.nodeText;
        } else {
          if (depth > lastDepth) {
            indent += " ";
            lastDepth = depth;
          } else if (depth < lastDepth) {
            indent = indent.slice(0, -1);
            lastDepth = depth;
          }

          lines[lastIndex++] = indent + c.nodeText;
        }
      }
    },
    { namedOnly: true }
  );

  return lines;
}

function visit(
  c: TreeCursor,
  cb: (node: TreeCursor, depth?: number) => void,
  args?: { namedOnly: true },
  depth = 0
): null {
  if (!args?.namedOnly || (c.nodeIsNamed && args?.namedOnly)) {
    cb(c, depth);
  }

  const hasChild = c.gotoFirstChild();

  if (hasChild) {
    return visit(c, cb, args, depth + 1);
  } else {
    const hasSibling = c.gotoNextSibling();

    if (hasSibling) {
      return visit(c, cb, args, depth);
    } else {
      const [hasAncestor, back] = findAncestorWithUnvistedChild(c);

      if (hasAncestor) {
        return visit(c, cb, args, depth - back);
      }
    }
  }

  return null;
}

function findAncestorWithUnvistedChild(
  c: TreeCursor,
  depth = 0
): [hasAncestor: boolean, depth: number] {
  const hasParent = c.gotoParent();

  if (!hasParent) return [false, depth];

  const hasSibling = c.gotoNextSibling();

  if (hasSibling) return [true, depth + 1];

  return findAncestorWithUnvistedChild(c, depth + 1);
}

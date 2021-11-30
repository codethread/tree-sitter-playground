import { Tree, TreeCursor } from "web-tree-sitter";

/**
 * Here be dragons
 */
export default function prettyPrint(tree: Tree): string[] {
  const cursor = tree.walk();

  const lines: string[] = [""];
  let lastIndex = 1;
  let indent = " ";

  visit(
    cursor,
    (c, depth = 0) => {
      if (c.nodeType === "node_name") {
        const fieldName = c.currentNode().parent?.previousNamedSibling?.text;
        const prefix = fieldName ? fieldName + " : " : "";
        lines[lastIndex++] = indent.repeat(depth) + prefix + c.nodeText;
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

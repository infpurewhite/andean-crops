/**
 * Minimal DOM construction helper. Text is always inserted as text nodes,
 * never parsed as HTML, so dataset content cannot inject markup.
 *
 * @module dom
 */

/**
 * Create an element.
 *
 * @param {string} tag Tag name.
 * @param {Record<string, unknown>} [attributes] Attributes. "class" sets
 *   className, "dataset" merges data attributes, functions under "on…" keys
 *   become event listeners, true sets a boolean attribute, and null, undefined
 *   or false are skipped.
 * @param {...(Node|string|number|null|undefined|false|Array)} children Child nodes or text.
 * @returns {HTMLElement}
 */
export function h(tag, attributes = {}, ...children) {
  const element = document.createElement(tag);
  for (const [key, value] of Object.entries(attributes)) {
    if (value === null || value === undefined || value === false) continue;
    if (key === "class") element.className = String(value);
    else if (key === "dataset") Object.assign(element.dataset, value);
    else if (key.startsWith("on") && typeof value === "function") {
      element.addEventListener(key.slice(2).toLowerCase(), value);
    } else if (value === true) element.setAttribute(key, "");
    else element.setAttribute(key, String(value));
  }
  append(element, children);
  return element;
}

/**
 * Append children (nested arrays allowed) to a parent node.
 *
 * @param {Node} parent Parent node.
 * @param {Array} children Children to append.
 * @returns {Node} The parent node.
 */
export function append(parent, children) {
  for (const child of children.flat(Infinity)) {
    if (child === null || child === undefined || child === false) continue;
    parent.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
  return parent;
}

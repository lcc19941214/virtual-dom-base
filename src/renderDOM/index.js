import _ from '../utils';
import Element from '../element';
import { getDefaultKey, setKey, composeKey, decorateArrayElementKey } from './key';
import { setValueForProperty, setValueForInlineStyle } from './property';
import { typeError, checkTypeErrorWithWarning } from '../helper/logTipsHelper';

/**
 * render Element instance to real DOM node, and attach it
 * to given DOMNode
 *
 * @param {*} element
 * @param {HTMLElement} mountPoint
 * @return {HTMLElement}
 */
export function render(element, mountPoint) {
  const defaultKey = getDefaultKey();
  const elem = createDOM(element, defaultKey);
  const root = _.isElement(mountPoint) ? mountPoint : undefined;
  if (root) {
    root.appendChild(elem);
    return elem;
  } else {
    throw new TypeError(typeError('mountPoint', 'an instance of HTMLElement', mountPoint));
  }
}

/**
 * render Element instance to real DOM node.
 * this method receives params of any types and transform them
 * to HTMLElement or Comment
 *
 * @param {*} element
 * @param {string|number} defaultKey
 * @return {HTMLElement}
 */
export function createDOM(element, defaultKey = getDefaultKey, parentKey = '') {
  if (element instanceof Element) {
    return createElement(element, defaultKey, parentKey);
  }

  if (_.isArray(element)) {
    return createDocumentFragment(element, defaultKey, parentKey);
  }

  if (_.isString(element) || _.isNumber(element)) {
    return createTextNode(element, defaultKey, parentKey);
  }

  if (_.isNull(element) || _.isUndef(element)) {
    return createEmptyNode();
  }

  if (_.isObject(element)) {
    checkTypeErrorWithWarning(
      'element',
      'String, Number, Array, undefined, null or an instance of Element',
      element
    );
    return createUnknownNode();
  }

  return createUnknownNode();
}

function createElement(element = {}, defaultKey, parentKey = '') {
  const { tagName = '', props = {} } = element;
  const children = element.children || [];
  let elem;
  try {
    if (tagName === 'script') {
      // Create the script via .innerHTML so its "parser-inserted" flag is
      // set to true and it does not execute
      const div = document.createElement('div');
      div.innerHTML = '<script><' + '/script>';
      elem = div.removeChild(div.firstChild);
    } else {
      elem = document.createElement(tagName);
    }

    // set key
    const { key = defaultKey } = props;
    const finalKey = composeKey(parentKey, key);
    setKey(elem, finalKey);

    // set props
    Object.keys(props).forEach(name => {
      setValueForProperty(elem, name, props[name]);
    });

    // set style
    setValueForInlineStyle(elem, props['style']);

    // render children
    children.forEach((child, idx) => {
      const childEl = createDOM(child, idx + 1, finalKey);
      if (childEl) elem.appendChild(childEl);
    });
  } catch (error) {
    console.error(error);
    elem = createUnknownNode();
  }
  return elem;
}

function createDocumentFragment(child, defaultKey, parentKey) {
  const elem = document.createDocumentFragment();
  child.forEach((subChild, idx) => {
    const finalParentKey = composeKey(parentKey, defaultKey);
    const key = idx + 1;
    const finalKey = decorateArrayElementKey(key);

    const subElem = createDOM(subChild, finalKey, finalParentKey);
    if (subElem) elem.appendChild(subElem);
  });
  return elem;
}

function createTextNode(text, key, parentKey) {
  const node = document.createTextNode(text);
  const finalKey = composeKey(parentKey, key);
  setKey(node, finalKey);
  return node;
}

function createEmptyNode() {
  return document.createComment('empty node');
}

function createUnknownNode() {
  return document.createComment('unknown node');
}

const RenderDOM = {
  render,
  createDOM
};

export default RenderDOM;

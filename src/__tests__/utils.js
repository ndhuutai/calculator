/* eslint-disable no-underscore-dangle */
/* eslint-disable consistent-return */
let changes = [];
function getCircularReplacer() {
  const seen = new WeakSet();
  return (key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return;
      }
      seen.add(value);
    }
    return value;
  };
}
function recordChangesToObjField(obj, field) {
  Object.defineProperty(obj, field, {
    get() {
      return this._current;
    },
    set(value) {
      const valueSchema = new NodeSchema(value);
      changes.push(valueSchema);
      this._current = value;
    },
  });
}
function mountToReactRoot(reactRoot) {
  // Reset changes
  changes = [];
  // Lift parent of react fibers tree
  const parent = reactRoot._reactRootContainer._internalRoot;
  const current = parent.current;
  // Add listener to react fibers tree so changes can be recorded
  recordChangesToObjField(parent, 'current');
  // Reassign react fibers tree to record initial state
  parent.current = current;
  return changes;
}

function traverseWith(fiber, callback) {
  callback(fiber);
  if (fiber.child) {
    traverseWith(fiber.child, callback);
  }
  if (fiber.sibling) {
    traverseWith(fiber.sibling, callback);
  }
}

function flattenTree(tree) {
  // Closured array for storing fibers
  const arr = [];
  // Closured callback for adding to arr
  const callback = (fiber) => {
    arr.push(fiber);
  };
  traverseWith(tree, callback);
  return arr;
}

function checkTime(fiber, threshold) {
  return fiber.selfBaseDuration > threshold;
}

/**
 *
 * @param {number} threshold The rendering time to filter for.
 */
function getAllSlowComponentRenders(threshold, changesArray) {
  const slowRenders = changesArray
    .map(flattenTree) // Flatten tree
    .flat() // Flatten 2d array into 1d array
    .filter((fiber) => checkTime(fiber, threshold)) // filter out all that don't meet threshold
  // Return any times greater than 16ms
  return slowRenders;
}

class NodeSchema {
  constructor(node) {
    this.name = node.type;
    this.selfBaseDuration = node.selfBaseDuration;
  }
}


// module.exports = { mountToReactRoot, getAllSlowComponentRenders, traverseWith, getCircularReplacer };

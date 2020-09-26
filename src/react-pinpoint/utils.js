/* eslint-disable no-underscore-dangle */
/* eslint-disable consistent-return */

// const Tree = require("./tree");

var changes = [];
var processedFibers = new WeakMap();
var fiberMap = new Map();
var testWeakSet = new WeakSet();
var stateNodeWeakSet = new WeakSet();

class TreeNode {
  constructor(fiberNode, uID) {
    this.uID = uID;
    const {
      elementType,
      selfBaseDuration,
      memoizedState,
      memoizedProps,
      effectTag,
      tag,
      ref,
      updateQueue,
      stateNode,
    } = fiberNode;
    this.elementType = elementType;
    this.selfBaseDuration = selfBaseDuration;
    this.memoizedProps = memoizedProps;
    this.memoizedState = memoizedState;
    this.effectTag = effectTag;
    this.ref = ref;
    this.fiberName = getElementName(fiberNode);
    this.updateQueue = updateQueue; // seems to be replaced entirely and since it exists directly under a fiber node, it can't be modified.
    this.tag = tag;
    this.updateList = [];

    // stateNode can contain circular references depends on the fiber node
    if (tag === 5) {
      this.stateNode = "host component";
    } else if (tag === 3) {
      this.stateNode = "host root";
    } else {
      this.stateNode = stateNode;
    }

    // check the fiber and the attach the spy
    // find a way to store the update function variable and result here
    if ((tag === 1 || tag === 5) && this.stateNode && this.stateNode.state) {
      /*
        enqueueReplaceState (inst, payload, callback)
        enqueueForceUpdate (inst, callback)
        enqueueSetState    (inst, payload, callback)
      */
      if (this.stateNode.updater) {
        const cb = (update, payload) => {
          this.updateList.push([update, payload]);
        };
        // spying
        // if (!stateNodeWeakSet.has(this.stateNode)) {
        //   stateNodeWeakSet.add(this.stateNode);
        //   Spy(this.stateNode.updater, "enqueueSetState", cb);
        //   Spy(this.stateNode.updater, "enqueueReplaceState", cb);
        //   Spy(this.stateNode.updater, "enqueueForceUpdate", cb);
        // }
      }
    }

    if (tag === 0 && !stateNode && memoizedState) {
      // pass in "queue" obj to spy on dispatch func
      console.log("attaching a spy", memoizedState.queue);
      // getSet(memoizedState, "baseState");
      // getSet(fiber.memoizedState, "baseUpdate");
      // getSet(fiber.memoizedState, "memoizedState");
      // getSet(fiber.memoizedState, "next");

      const cb = (...args) => {
        this.updateList.push([...args]);
      };
      //type is function and thus it's unique
      // if (!testWeakSet.has(fiberNode.type)) {
      //   testWeakSet.add(fiberNode.type);
      //   SpyUseState(memoizedState.queue, "dispatch", cb);
      //   SpyUseState(memoizedState.queue, "lastRenderedReducer", cb);
      // }
    }
  }

  addChild(treeNode) {
    // remove other uneccessary properties
    this.child = treeNode;
  }

  addSibling(treeNode) {
    // if (!node) return;
    this.sibling = treeNode;
  }

  addParent(node) {
    // if (!node) return;
  }
}

class Tree {
  // uniqueId is used to identify a fiber to then help with counting re-renders
  // componentList
  constructor(rootNode, FiberMap, ProcessedFibers) {
    fiberMap = FiberMap;
    processedFibers = ProcessedFibers;
    this.uniqueId = fiberMap.size;
    this.componentList = [];
    this.effectList = [];
    this.root = null;
    this.processNode(rootNode);
  }

  processNode(fiberNode, previousTreeNode) {
    // id used to reference a fiber in fiberMap
    let id = undefined;
    // using a unique part of each fiber to identify it.
    // both current and alternate only 1 reference to this unique part
    // which we can use to uniquely identify a fiber node even in the case
    // of current and alternate switching per commit/
    let uniquePart = undefined;

    // unique part of a fiber node depends on its type.
    if (fiberNode.tag === 0) {
      uniquePart = fiberNode.elementType;
    } else if (fiberNode.tag === 3) {
      uniquePart = fiberNode.memoizedState.element.type;
    } else {
      uniquePart = fiberNode.stateNode;
    }
    // if this is a unique fiber (that both "current" and "alternate" fiber represents)
    // then add to the processedFiber to make sure we don't re-account this fiber.
    if (!processedFibers.has(uniquePart)) {
      // processedFibers.add(fiberNode);
      // componentMap.set(this.uniqueId, fiberNode);
      id = this.uniqueId;
      this.uniqueId++;

      fiberMap.set(id, fiberNode);
      // if (fiberNode.tag === 0) {
      //   processedFibers.set(fiberNode.elementType, id);
      // } else if (fiberNode.tag === 3) {
      //   processedFibers.set(fiberNode.memoizedState.element.type, id);
      // } else {
      //   processedFibers.set(fiberNode.stateNode, id);
      // }
      processedFibers.set(uniquePart, id);
    } else {
      id = processedFibers.get(uniquePart);
    }

    // If it's a HostRoot with a tag of 3
    // create a new TreeNode
    if (fiberNode.tag === 3) {
      this.root = new TreeNode(fiberNode, id);
      // this.root = new TreeNode(fiberNode, this.uniqueId);
      this.componentList.push({ ...this.root }); // push a copy
      // this.uniqueId++;

      if (fiberNode.child) {
        // const newNode = new TreeNode(fiberNode.child, this.uniqueId);
        // this.root.addChild(newNode);
        // this.componentList.push(newNode);
        // this.uniqueId++;
        this.processNode(fiberNode.child, this.root);
      }
    } else {
      const newNode = new TreeNode(fiberNode, id);
      // const newNode = new TreeNode(fiberNode, this.uniqueId);
      previousTreeNode.addChild(newNode);
      this.componentList.push({ ...newNode });
      // this.uniqueId++;

      if (fiberNode.child) {
        this.processNode(fiberNode.child, newNode);
      }
      if (fiberNode.sibling) {
        this.processSiblingNode(fiberNode.sibling, newNode);
      }
    }
  }

  processSiblingNode(fiberNode, previousTreeNode) {
    let uniquePart = undefined;
    let id = undefined;
    if (fiberNode.tag === 0) {
      uniquePart = fiberNode.elementType;
    } else if (fiberNode.tag === 3) {
      uniquePart = fiberNode.memoizedState.element.type;
    } else {
      uniquePart = fiberNode.stateNode;
    }
    if (!processedFibers.has(uniquePart)) {
      // processedFibers.add(fiberNode);
      // componentMap.set(this.uniqueId, fiberNode);
      id = this.uniqueId;
      this.uniqueId++;
      fiberMap.set(id, fiberNode);
      // if (fiberNode.tag === 0) {
      //   processedFibers.set(fiberNode.elementType, id);
      // } else if (fiberNode.tag === 3) {
      //   processedFibers.set(fiberNode.memoizedState.element.type, id);
      // } else {
      //   processedFibers.set(fiberNode.stateNode, id);
      // }
      processedFibers.set(uniquePart, id);
    } else {
      id = processedFibers.get(uniquePart);
    }

    const newNode = new TreeNode(fiberNode, id);
    // const newNode = new TreeNode(fiberNode, this.uniqueId);
    previousTreeNode.addSibling(newNode);
    this.componentList.push({ ...newNode });
    // this.uniqueId++;

    if (fiberNode.child) {
      this.processNode(fiberNode.child, newNode);
    }
    if (fiberNode.sibling) {
      this.processSiblingNode(fiberNode.sibling, newNode);
    }
  }
}

function mountToReactRoot(reactRoot) {
  // Reset changes
  changes = [];

  function getSet(obj, propName) {
    const newPropName = `_${propName}`;
    obj[newPropName] = obj[propName];
    Object.defineProperty(obj, propName, {
      get() {
        return this[newPropName];
      },
      set(newVal) {
        this[newPropName] = newVal;
        console.log(`${obj} ${propName}`, this[newPropName]);
        changes.push(new Tree(this[newPropName], fiberMap, processedFibers));

        console.log("CHANGES", changes);
        // console.log("Fiber STORE: ", processedFibers);
        // console.log("testweakset after", testWeakSet);
        // console.log("statenodeweakset", stateNodeWeakSet);
        // console.log("fiber map:", fiberMap);
        // getTotalRenderCount();
        // whatChanged();
      },
    });
  }

  // Lift parent of react fibers tree
  const parent = reactRoot._reactRootContainer._internalRoot;

  console.log("ROOT FIBER", parent.current);
  changes.push(new Tree(parent.current, fiberMap, processedFibers));

  // after initial
  // console.log("Initial processed fibers", processedFibers);
  console.log("initial fiberMap", fiberMap);

  // Add listener to react fibers tree so changes can be recorded
  getSet(parent, "current");
  // Reassign react fibers tree to record initial state
  // parent.current = current;
  return changes;
}

/**
 *
 * @param {number} threshold The rendering time to filter for.
 */
function getAllSlowComponentRenders(threshold) {
  let slowRenders = changes.map(commit => {
    return commit.componentList.map(component => {
      delete component.memoizedProps;
      delete component.memoizedState;
      delete component.updateList;
      delete component.updateQueue;
      delete component.ref;
      delete component.elementType;
      delete component.stateNode;

      return {
        ...component,
      };
    });
  });

  slowRenders = slowRenders.map(commit => {
    return commit.filter(component => component.selfBaseDuration >= threshold);
  });

  return slowRenders;
}

// function checkTime(fiber, threshold) {
//   return fiber.selfBaseDuration > threshold;
// }

// function getComponentRenderTime(componentName) {
//   console.log("changes", changes);
//   console.log("component name", componentName);

//   return "what";
// }

function getTotalRenderCount() {
  const componentMap = new Map();

  // loop through each commit
  // for each commit, loop through the array of trees
  // for each tree
  // check if the current component exist in the map before adding on or creating a new key
  changes.forEach((commit, commitIndex) => {
    commit.componentList.forEach((component, componentIndex) => {
      if (!componentMap.has(component.uID)) {
        componentMap.set(component.uID, { renderCount: 1 });
      } else {
        if (
          didFiberRender(
            changes[commitIndex ? commitIndex - 1 : 0].componentList[
              componentIndex
            ],
            component,
          )
        ) {
          componentMap.get(component.uID).renderCount += 1;
        }
      }
    });
  });
  return componentMap;
}

function didFiberRender(prevFiber, nextFiber) {
  switch (nextFiber.tag) {
    case 0:
    case 1:
    case 3:
      // case 5:
      return (nextFiber.effectTag & 1) === 1;
    default:
      return (
        prevFiber.memoizedProps !== nextFiber.memoizedProps ||
        prevFiber.memoizedState !== nextFiber.memoizedState ||
        prevFiber.ref !== nextFiber.ref
      );
  }
}

function didHooksChange(previous, next) {
  if (previous == null || next == null) {
    return false;
  }
  if (
    next.hasOwnProperty("baseState") &&
    next.hasOwnProperty("memoizedState") &&
    next.hasOwnProperty("next") &&
    next.hasOwnProperty("queue")
  ) {
    if (next.memoizedState !== previous.memoizedState) {
      return true;
    } else {
    }
  }
  return false;
}

function getChangedKeys(previous, next) {
  if (prev == null || next == null) {
    return null;
  }
  // We can't report anything meaningful for hooks changes.
  if (
    next.hasOwnProperty("baseState") &&
    next.hasOwnProperty("memoizedState") &&
    next.hasOwnProperty("next") &&
    next.hasOwnProperty("queue")
  ) {
    return null;
  }

  const keys = new Set([...Object.keys(prev), ...Object.keys(next)]);
  const changedKeys = [];
  // eslint-disable-next-line no-for-of-loops/no-for-of-loops
  for (const key of keys) {
    if (prev[key] !== next[key]) {
      changedKeys.push(key);
    }
  }

  return changedKeys;
}

function getElementName(fiber) {
  switch (fiber.tag) {
    case 1:
      return fiber.elementType.name;
    case 3:
      return "Host Root - The element you used to render the React App";
    case 5:
      return `${fiber.elementType}${
        fiber.elementType.className ? `.${fiber.elementType.className}` : ""
      }`;
    default:
      return `${fiber.elementType}`;
  }
}

// module.exports = { mountToReactRoot, getAllSlowComponentRenders };

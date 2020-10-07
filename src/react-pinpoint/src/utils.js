/* eslint-disable no-underscore-dangle */
/* eslint-disable consistent-return */

// const Tree = require("./tree");
import Tree from "./tree";

const changes = [];
const processedFibers = new WeakMap();
const fiberMap = new Map();
// const testWeakSet = new WeakSet();
// const stateNodeWeakSet = new WeakSet();

function mountToReactRoot(reactRoot) {
  // Reset changes
  // changes = [];

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

function removeCircularRefs(changes) {
  // loop through the different commits
  // for every commit check the componentList
  // scrub the circular references and leave the flat one there

  let scrubChanges = changes.map(commit => {
    return commit.componentList.map(component => {
      return component.toSerializable();
    });
  });
  return scrubChanges;
}

/**
 *
 * @param {number} threshold The rendering time to filter for.
 */
function getAllSlowComponentRenders(changes, threshold) {
  // referencing "changes" in the global scope
  let scrubChanges = removeCircularRefs(changes);

  // rework this so that we can use the pre-serialized data
  const result = scrubChanges.map(commit => {
    return commit.filter(
      component => component.self_base_duration >= threshold,
    );
  });

  return result;
}

// function checkTime(fiber, threshold) {
//   return fiber.selfBaseDuration > threshold;
// }

// function getComponentRenderTime(componentName) {
//   console.log("changes", changes);
//   console.log("component name", componentName);

//   return "what";
// }

function getTotalRenderCount(changes) {
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
  // for (const key of keys) {
  //   if (prev[key] !== next[key]) {
  //     changedKeys.push(key);
  //   }
  // }

  keys.forEach(key => {
    if (previous[key] !== next[key]) {
      changedKeys.push(key);
    }
  });

  return changedKeys;
}

function getComponentDataByName(changes, name, serializeOpt = false) {
  // for each commit
  // get the component with the same name
  let result = [];

  for (let i = 0; i < changes.length; i++) {
    result.push(changes[i].getRendersOfComponent(name, serializeOpt));
  }

  return result;
}

module.exports = { mountToReactRoot, getAllSlowComponentRenders };

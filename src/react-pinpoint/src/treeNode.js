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
    this.children = [];
    this.parent = null;
    this.stateNode = stateNode;

    // stateNode can contain circular references depends on the fiber node
    // if (tag === 5) {
    //   this.stateNode = "host component";
    // } else if (tag === 3) {
    //   this.stateNode = "host root";
    // } else {
    //   this.stateNode = stateNode;
    // }

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

  addParent(treeNode) {
    // if (!node) return;
    this.parent = treeNode;
  }

  toSerializable() {
    let newObj = {};
    let omitList = [
      // "memoizedProps",
      // "memoizedState",
      "updateList",
      "updateQueue",
      "ref",
      "elementType",
      // "stateNode",
    ];
    // transform each nested node to just ids where appropriate
    for (let key of Object.getOwnPropertyNames(this)) {
      if (omitList.indexOf(key) < 0) {
        switch (key) {
          case "parent":
            newObj["parent_component_id"] = this[key]
              ? this[key].uID
              : this[key];
            break;
          case "sibling":
            newObj["sibling_component_id"] = this[key].uID;
            break;
          case "selfBaseDuration":
            newObj["self_base_duration"] = this[key];
          case "child": // probably not needed anymore
            // newObj[`${key}ID`] = this[key].uID;
            break;
          case "children":
            newObj[`children_ids`] = this[key].map(treeNode => treeNode.uID);
            break;
          case "memoizedState":
            newObj["component_state"] = this[key];
            break;
          case "memoizedProps":
            if (this[key]) {
              newObj["component_props"] = this[key].hasOwnProperty("children")
                ? serializeMemoizedProps(this[key])
                : this[key];
            } else {
              newObj["component_props"] = this[key];
            }
            // newObj["component_props"] = this[key];
            break;
          case "uID":
            newObj["component_id"] = this[key];
            break;
          case "stateNode":
            let value = null;
            if (this[key]) {
              if (this[key].tag === 5) {
                value = "host component";
              } else if (this[key].tag === 3) {
                value = "host root";
              } else {
                value = "other type";
              }
            }
            newObj["state_node"] = value;
            break;
          default:
            newObj[key] = this[key];
        }
      }
    }

    return newObj;
  }
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

function serializeMemoizedState(obj) {}

function serializeMemoizedProps(obj) {
  if (!obj) return null;

  // list of props to omit from the resulting object in return statement
  const omitList = ["props", "_owner", "_store", "_sef", "_source", "_self"];

  let newObj = null;
  // loop through each prop to check if they exist on omitList
  // if yes then skip, no then include in the object being returned;
  if (Array.isArray(obj)) {
    if (!newObj) newObj = [];
    for (let i = 0; i < obj.length; i++) {
      const nestedChild = {};
      for (const key of Object.getOwnPropertyNames(obj[i])) {
        if (omitList.indexOf(key) < 0) {
          nestedChild[key] = obj[i][key];
        }
      }
      newObj.push(nestedChild);
    }
  } else {
    for (const key of Object.getOwnPropertyNames(obj)) {
      if (omitList.indexOf(key) < 0) {
        if (!newObj) newObj = {};
        if (typeof obj[key] === "object") {
          newObj[key] = serializeMemoizedProps(obj[key]);
        } else if (typeof obj[key] === "symbol") {
          newObj[key] = obj[key].toString();
        } else {
          newObj[key] = obj[key];
        }
      }
    }
  }

  return newObj;
}

// module.exports = TreeNode;

export default TreeNode;

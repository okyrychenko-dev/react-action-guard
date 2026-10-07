import assert from "node:assert/strict";
import { createShallowStore } from "@okyrychenko-dev/react-zustand-toolkit";
import { subscribeWithSelector } from "zustand/middleware";

const { store } = createShallowStore(subscribeWithSelector(() => ({ active: false, reason: "" })));
const seen = [];
const unsubscribe = store.subscribe(
  (state) => state.active,
  (value) => seen.push(value)
);
store.setState({ reason: "metadata only" });
store.setState({ active: true });
store.setState({ reason: "still active" });
store.setState({ active: false });
assert.deepEqual(seen, [true, false], "Toolkit handles retain selector middleware behavior");
unsubscribe();
store.setState({ active: true });
assert.deepEqual(seen, [true, false], "Middleware subscription can be released");

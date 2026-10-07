import assert from "node:assert/strict";
import { cpus, platform, release } from "node:os";
import { readFileSync, writeFileSync } from "node:fs";
import { performance } from "node:perf_hooks";
import { Window } from "happy-dom";
import React, { createElement, StrictMode } from "react";
import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import { createBlockingLifecycle, UIBlockingProvider } from "@okyrychenko-dev/react-action-guard";
import { BooleanConsumer, ButtonConsumer, Capture, InfoConsumer } from "./consumers.mjs";
import { measure, sampleCount, warmups } from "./measure.utils.mjs";

const window = new Window({ url: "http://localhost" });
globalThis.window = window;
globalThis.document = window.document;
globalThis.HTMLElement = window.HTMLElement;
globalThis.MutationObserver = window.MutationObserver;
const development = process.env.NODE_ENV !== "production";
const scenarios = [];

function seed(add, blockers) {
  for (let index = 0; index < blockers; index++) {
    add(`seed-${index}`, {
      scope: index % 2 ? "inventory" : "checkout",
      priority: index % 8,
      timestamp: index,
      reason: `seed-${index}`,
    });
  }
  add("related", { scope: "checkout", priority: 10, reason: "original" });
  add("unrelated", { scope: "inventory", priority: 10, reason: "original" });
}

for (const { blockers, controls, observers } of [
  { blockers: 10, controls: 20, observers: 0 },
  { blockers: 100, controls: 100, observers: 5 },
  { blockers: 500, controls: 200, observers: 5 },
]) {
  console.log(
    `${process.env.NODE_ENV}: ${blockers} seeded blockers, ${controls} controls per kind`
  );
  const workload = { blockers: blockers + 2, controlsPerKind: controls, observers };
  const lifecycle = createBlockingLifecycle();
  seed(lifecycle.add, blockers);
  let events = 0;
  const releases = Array.from({ length: observers }, () => lifecycle.observe(() => events++));
  let publications = 0;
  const unsubscribe = lifecycle.subscribe(() => publications++);
  scenarios.push({
    name: "lifecycle transition including immutable snapshot publication",
    workload,
    ...measure(
      (index) => lifecycle.update("unrelated", { reason: `sample-${index}` }),
      (index) => {
        assert.equal(lifecycle.getSnapshot().length, blockers + 2);
        assert.equal(publications, index + 1);
        assert.equal(events, (index + 1) * observers);
        assert.equal(lifecycle.isBlocked("checkout"), true);
        assert.equal(lifecycle.isBlocked("unused"), false);
      }
    ),
  });
  let snapshot;
  scenarios.push({
    name: "cached snapshot read (1000 reads per sample)",
    workload,
    ...measure(
      () => {
        for (let index = 0; index < 1000; index++) snapshot = lifecycle.getSnapshot();
      },
      () => assert.equal(snapshot.length, blockers + 2)
    ),
  });
  let info;
  scenarios.push({
    name: "scoped metadata filtering and priority sorting (100 reads per sample)",
    workload,
    ...measure(
      () => {
        for (let index = 0; index < 100; index++) info = lifecycle.getBlockingInfo("checkout");
      },
      () => {
        assert.equal(info.length, blockers / 2 + 1);
        assert.equal(info[0].id, "related");
        assert.ok(
          info.every(
            (blocker, index) => index === 0 || info[index - 1].priority >= blocker.priority
          )
        );
      }
    ),
  });
  unsubscribe();
  releases.forEach((dispose) => dispose());
  lifecycle.clear();
  console.log("Lifecycle reads and transitions validated");

  const container = document.createElement("div");
  document.body.append(container);
  let root;
  let store;
  const counts = { boolean: 0, info: 0, button: 0 };
  const children = [
    createElement(Capture, {
      key: "capture",
      capture: (value) => {
        store = value;
      },
    }),
  ];
  for (let index = 0; index < controls; index++) {
    children.push(createElement(BooleanConsumer, { key: `boolean-${index}`, counts }));
    children.push(createElement(InfoConsumer, { key: `info-${index}`, counts }));
    children.push(createElement(ButtonConsumer, { key: `button-${index}`, counts }));
  }
  const tree = createElement(UIBlockingProvider, null, children);
  scenarios.push({
    name: "provider and empty controls mount (fresh root per sample)",
    workload: { ...workload, blockers: 0, observers: 0 },
    ...measure(
      () => {
        root = createRoot(container);
        flushSync(() => root.render(development ? createElement(StrictMode, null, tree) : tree));
      },
      () => {
        assert.equal(container.querySelectorAll("button").length, controls);
        assert.equal(container.querySelectorAll("button:disabled").length, 0);
      },
      () => flushSync(() => root.unmount())
    ),
  });
  root = createRoot(container);
  console.log("Mount samples validated");
  flushSync(() => root.render(development ? createElement(StrictMode, null, tree) : tree));
  assert.ok(store, "Provider exposes a store");
  const { addBlocker, updateBlocker, removeBlocker, clearAllBlockers, observeBlockingEvents } =
    store.getState();
  flushSync(() => seed(addBlocker, blockers));
  const disposeObservers = Array.from({ length: observers }, () => observeBlockingEvents(() => {}));

  for (const target of ["unrelated", "related"]) {
    const renderCounts = [];
    const timings = measure(
      (index) => {
        counts.boolean = counts.info = counts.button = 0;
        flushSync(() => updateBlocker(target, { reason: `render-${index}` }));
      },
      (index) => {
        assert.equal(container.querySelectorAll("button:disabled").length, controls);
        assert.equal(container.querySelectorAll('[data-boolean="true"]').length, controls);
        if (target === "related") {
          assert.equal(
            container.querySelector("button").getAttribute("data-reason"),
            `render-${index}`
          );
          assert.equal(
            container.querySelector("[data-info]").getAttribute("data-reason"),
            `render-${index}`
          );
        }
        if (!development)
          assert.equal(counts.boolean, 0, "Stable boolean consumers must not rerender");
        if (index >= warmups) renderCounts.push({ ...counts });
      }
    );
    scenarios.push({
      name: `${target} metadata update and synchronous React commit`,
      workload,
      renderCounts,
      ...timings,
    });
  }
  // Isolate the availability toggle from the concurrent metadata workload.
  flushSync(() => {
    clearAllBlockers();
    addBlocker("toggle", { scope: "checkout" });
  });
  const renderCounts = [];
  const toggle = measure(
    () => {
      counts.boolean = counts.info = counts.button = 0;
      flushSync(() => removeBlocker("toggle"));
    },
    (index) => {
      assert.equal(container.querySelectorAll("button:disabled").length, 0);
      assert.equal(container.querySelectorAll('[data-boolean="false"]').length, controls);
      assert.equal(container.querySelector("[data-info]").getAttribute("data-info"), "0");
      if (index >= warmups) renderCounts.push({ ...counts });
    },
    () => flushSync(() => addBlocker("toggle", { scope: "checkout" }))
  );
  scenarios.push({
    name: "related availability removal and synchronous React commit",
    workload: { ...workload, blockers: 1 },
    renderCounts,
    ...toggle,
  });
  disposeObservers.forEach((dispose) => dispose());
  flushSync(() => root.unmount());
  container.remove();
  console.log(`${process.env.NODE_ENV}: workload validated`);
}

const lock = JSON.parse(readFileSync("package-lock.json", "utf8"));
const result = {
  environment: {
    timestamp: new Date().toISOString(),
    node: process.version,
    react: React.version,
    mode: process.env.NODE_ENV,
    strictMode: development,
    cpu: cpus()[0]?.model,
    platform: platform(),
    release: release(),
    arch: process.arch,
    versions: Object.fromEntries(
      Object.entries(lock.packages)
        .filter(([name]) => name.startsWith("node_modules/"))
        .map(([name, entry]) => [name, entry.version])
    ),
  },
  method:
    "Built packed public APIs; Happy DOM, not browser paint. performance.now wall clock; validation/reset excluded. 5 warmups and 20 raw samples; fresh-root mount measured separately; transition and flushSync+React commit are distinct workloads, not additive phase estimates. Observation leases are public lifecycle/store observers, not the Devtools panel.",
  sampleCount,
  warmups,
  scenarios,
  finishedAt: performance.now(),
};
writeFileSync(process.argv[2], JSON.stringify(result, null, 2) + "\n");
await window.happyDOM.close();

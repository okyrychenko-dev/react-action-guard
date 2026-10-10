import { readFile, readdir, mkdtemp, writeFile, rm, access } from "node:fs/promises";
import { dirname, resolve, relative, join } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const source = join(root, "packages/docs/src");
const canonicalPages = [
  "getting-started.md",
  "concepts.md",
  "guides/best-practices.md",
  "guides/forms.md",
  "guides/mutations.md",
  "guides/navigation.md",
  "guides/workflows.md",
  "guides/lifecycle.md",
  "advanced/ownership.md",
  "advanced/ssr.md",
  "advanced/observability.md",
  "packages/react-action-guard/guides/provider-pattern.md",
  "packages/react-action-guard/contract.md",
  "packages/react-action-guard/migration.md",
  "packages/react-action-guard-ui/index.md",
  "packages/react-action-guard-ui/reference.md",
  "packages/react-action-guard-router/index.md",
  "packages/react-action-guard-router/reference.md",
  "packages/react-action-guard-router/react-router.md",
  "packages/react-action-guard-router/tanstack-router.md",
  "packages/react-action-guard-router/next-pages.md",
  "packages/react-action-guard-router/next-app.md",
];

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch (error) {
    if (error.code === "ENOENT") return false;
    throw error;
  }
}

async function checkDestination(from, destination) {
  if (/^(https?:|mailto:|#)/.test(destination)) return;
  const path = destination.split(/[?#]/)[0];
  if (!path) return;
  const target = path.startsWith("/") ? resolve(source, "." + path) : resolve(dirname(from), path);
  const candidates = [target + ".md", join(target, "index.md")];
  if (/\.[a-z]+$/i.test(target)) candidates.push(target);
  for (const candidate of candidates) {
    if (await exists(candidate)) return;
  }
  throw new Error(`Missing destination in ${relative(root, from)}: ${destination}`);
}

// Resolve only entries declared by package exports, against their built public declarations.
// These paths are compiler validation inputs, not application aliases or private source imports.
const paths = {};
for (const directory of await readdir(join(root, "packages"))) {
  const packageRoot = join(root, "packages", directory);
  const manifest = JSON.parse(await readFile(join(packageRoot, "package.json"), "utf8"));
  if (!manifest.exports) continue;
  for (const [entry, conditions] of Object.entries(manifest.exports)) {
    const types = conditions.import?.types;
    if (!types) continue;
    const specifier = manifest.name + (entry === "." ? "" : entry.slice(1));
    paths[specifier] = [resolve(packageRoot, types)];
    if (!(await exists(paths[specifier][0]))) {
      throw new Error(`Build packages before docs:check; missing ${paths[specifier][0]}`);
    }
  }
}

// Use the existing router workspace's React/peer dependencies for consumer compilation.
const scratch = await mkdtemp(join(root, "packages/router/.docs-check-"));
const origins = new Map();
let linkCount = 0;
try {
  const files = [];
  let exampleCount = 0;
  for (const page of canonicalPages) {
    const path = join(source, page);
    const markdown = await readFile(path, "utf8");
    for (const match of markdown.matchAll(/```(tsx|ts|typescript)\n([\s\S]*?)```/g)) {
      const filename = join(scratch, `example-${files.length}.tsx`);
      await writeFile(filename, match[2]);
      files.push(filename);
      origins.set(filename, page);
    }
    const prose = markdown.replace(/```[\s\S]*?```/g, "");
    for (const match of prose.matchAll(/\]\(([^)\s]+)\)/g)) {
      await checkDestination(path, match[1]);
      linkCount++;
    }
  }
  exampleCount = files.length;
  // Migrated reference fragments depend on application helpers/state. Verify their public
  // imports separately; full consumer compilation applies to the self-contained guides above.
  const referencePage = "packages/react-action-guard/reference.md";
  const referencePath = join(source, referencePage);
  const reference = await readFile(referencePath, "utf8");
  const imports = [];
  for (const match of reference.matchAll(
    /```(?:tsx|ts|typescript|jsx|javascript)\n([\s\S]*?)```/g
  )) {
    const parsed = ts.createSourceFile(
      "reference.tsx",
      match[1],
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TSX
    );
    for (const statement of parsed.statements) {
      if (ts.isImportDeclaration(statement)) imports.push(statement.getText(parsed));
    }
  }
  // Keep excerpts isolated: separate examples can import the same identifier.
  for (const statement of imports) {
    const filename = join(scratch, `reference-import-${files.length}.tsx`);
    await writeFile(filename, statement);
    files.push(filename);
    origins.set(filename, referencePage);
  }
  const referenceProse = reference.replace(/```[\s\S]*?```/g, "");
  for (const match of referenceProse.matchAll(/\]\(([^)\s]+)\)/g)) {
    await checkDestination(referencePath, match[1]);
    linkCount++;
  }
  const configPath = join(root, "packages/docs/.vitepress/config.mts");
  const config = await readFile(configPath, "utf8");
  for (const match of config.matchAll(/link: "([^"]+)"/g)) {
    await checkDestination(configPath, match[1]);
    linkCount++;
  }
  if (!files.length) throw new Error("No canonical examples found");
  const program = ts.createProgram(files, {
    noEmit: true,
    strict: true,
    skipLibCheck: true,
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.NodeNext,
    moduleResolution: ts.ModuleResolutionKind.NodeNext,
    jsx: ts.JsxEmit.ReactJSX,
    paths,
    types: ["react"],
    typeRoots: [join(root, "packages/router/node_modules/@types")],
  });
  const diagnostics = ts.getPreEmitDiagnostics(program);
  if (diagnostics.length) {
    console.error(
      ts.formatDiagnosticsWithColorAndContext(diagnostics, {
        getCanonicalFileName: (path) => origins.get(path) ?? path,
        getCurrentDirectory: () => root,
        getNewLine: () => "\n",
      })
    );
    process.exitCode = 1;
  } else {
    console.log(
      `Compiled ${exampleCount} canonical examples and ${files.length - exampleCount} migrated reference imports through public exports; checked ${linkCount} documentation/navigation links.`
    );
  }
} finally {
  await rm(scratch, { recursive: true, force: true });
}

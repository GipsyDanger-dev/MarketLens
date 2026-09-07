import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { dirname, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const files = execFileSync("git", ["ls-files", "-z"], {
  cwd: root,
  encoding: "utf8",
})
  .split("\0")
  .filter(Boolean);
const tracked = new Set(files);
const metadata = JSON.parse(
  await readFile(resolve(root, "package.json"), "utf8"),
);
const cli = JSON.parse(
  await readFile(resolve(root, "apps/cli/package.json"), "utf8"),
);
assert.equal(
  cli.version,
  metadata.version,
  "Root and CLI release versions differ",
);
for (const name of ["LICENSE", "LICENSE-MIT"]) {
  const normalize = (text) => text.replaceAll("\r\n", "\n").trim();
  assert.equal(
    normalize(await readFile(resolve(root, name), "utf8")),
    normalize(await readFile(resolve(root, "apps/cli", name), "utf8")),
    `${name} differs in CLI package`,
  );
  assert(cli.files.includes(name), `${name} is missing from package allowlist`);
}
const failures = [];
for (const file of files.filter((file) => /\.md$/i.test(file))) {
  const source = (await readFile(resolve(root, file), "utf8")).replace(
    /```[\s\S]*?```/g,
    "",
  );
  for (const match of source.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
    const link = match[1].split("#")[0];
    if (!link || /^[a-z][a-z0-9+.-]*:/i.test(link) || link.startsWith("//"))
      continue;
    const target = relative(
      root,
      resolve(root, dirname(file), decodeURIComponent(link)),
    )
      .split(sep)
      .join("/");
    if (
      !tracked.has(target) &&
      !files.some((path) => path.startsWith(`${target.replace(/\/$/, "")}/`))
    )
      failures.push(`${file}: ${link} is not a published repository path`);
  }
}
assert.deepEqual(failures, [], "Broken local documentation links");
console.log(
  `Release ${cli.version}: versions, bundled license texts and tracked documentation links passed.`,
);

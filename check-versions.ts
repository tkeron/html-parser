#!/usr/bin/env bun

import { readFileSync } from "fs";
import { join } from "path";

/**
 * Compares two semver versions including pre-release identifiers
 * Returns: 1 if v1 > v2, -1 if v1 < v2, 0 if equal
 */
function compareVersions(v1: string, v2: string): number {
  const parseVersion = (version: string) => {
    const match = version.match(/^(\d+)\.(\d+)\.(\d+)(?:-(.+))?$/);
    if (!match) throw new Error(`Invalid version format: ${version}`);

    const [, major, minor, patch, preRelease] = match;
    if (!major || !minor || !patch)
      throw new Error(`Invalid version format: ${version}`);
    return {
      major: parseInt(major),
      minor: parseInt(minor),
      patch: parseInt(patch),
      preRelease: preRelease || null,
    };
  };

  const v1Parts = parseVersion(v1);
  const v2Parts = parseVersion(v2);

  if (v1Parts.major !== v2Parts.major)
    return v1Parts.major > v2Parts.major ? 1 : -1;
  if (v1Parts.minor !== v2Parts.minor)
    return v1Parts.minor > v2Parts.minor ? 1 : -1;
  if (v1Parts.patch !== v2Parts.patch)
    return v1Parts.patch > v2Parts.patch ? 1 : -1;

  if (!v1Parts.preRelease && !v2Parts.preRelease) return 0;

  if (!v1Parts.preRelease) return 1;
  if (!v2Parts.preRelease) return -1;

  const preReleasePriority: Record<string, number> = {
    alpha: 1,
    beta: 2,
    rc: 3,
    pre: 4,
  };

  const parsePreRelease = (pr: string) => {
    const match = pr.match(/^([a-z]+)\.?(\d+)?$/);
    if (!match) return { type: pr, num: 0 };
    const type = match[1];
    if (!type) return { type: pr, num: 0 };
    return {
      type,
      num: match[2] ? parseInt(match[2]) : 0,
    };
  };

  const pr1 = parsePreRelease(v1Parts.preRelease);
  const pr2 = parsePreRelease(v2Parts.preRelease);

  const priority1 = preReleasePriority[pr1.type] || 999;
  const priority2 = preReleasePriority[pr2.type] || 999;

  if (priority1 !== priority2) return priority1 > priority2 ? 1 : -1;
  if (pr1.num !== pr2.num) return pr1.num > pr2.num ? 1 : -1;

  return v1Parts.preRelease.localeCompare(v2Parts.preRelease);
}

async function checkVersions() {
  try {
    const packageJsonPath = join(process.cwd(), "package.json");
    const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));
    const localVersion = packageJson.version;

    console.log("📦 Package: @tkeron/html-parser\n");
    console.log("🏠 Local version:", localVersion);

    const getDistTag = (version: string): string => {
      if (!version.includes("-")) return "latest";

      const preRelease = version.split("-")[1];
      if (!preRelease) return "latest";
      if (preRelease.startsWith("alpha")) return "alpha";
      if (preRelease.startsWith("beta")) return "beta";
      if (preRelease.startsWith("rc")) return "rc";
      if (preRelease.startsWith("pre")) return "pre";

      return "latest";
    };

    const distTag = getDistTag(localVersion);
    console.log("🏷️  Comparing against tag:", distTag);

    const response = await fetch(
      "https://registry.npmjs.org/@tkeron/html-parser",
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const publishedVersion = data["dist-tags"][distTag];

    if (!publishedVersion) {
      console.log(`\n${"=".repeat(50)}`);
      console.log(`ℹ️  No published version found for tag '${distTag}'`);
      console.log("   → This will be the first version with this tag");
      console.log("=".repeat(50));
      process.exit(0);
    }

    console.log("📡 Published version:", publishedVersion);

    const comparison = compareVersions(localVersion, publishedVersion);

    console.log("\n" + "=".repeat(50));

    if (comparison > 0) {
      console.log("✅ NEW VERSION DETECTED");
      console.log(`   ${localVersion} > ${publishedVersion}`);
      console.log("   → Should publish to npm");
      console.log("=".repeat(50));
      process.exit(0);
    } else if (comparison === 0) {
      console.log("ℹ️  SAME VERSION");
      console.log(`   ${localVersion} = ${publishedVersion}`);
      console.log("   → No need to publish");
      console.log("=".repeat(50));
      process.exit(1);
    } else {
      console.log("⚠️  LOCAL VERSION IS OLDER");
      console.log(`   ${localVersion} < ${publishedVersion}`);
      console.log("   → Should not publish");
      console.log("=".repeat(50));
      process.exit(1);
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("❌ Error:", message);
    process.exit(1);
  }
}

checkVersions();

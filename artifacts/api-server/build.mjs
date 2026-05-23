import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build as esbuild } from "esbuild";
import esbuildPluginPino from "esbuild-plugin-pino";
import { rm, readFile, writeFile } from "node:fs/promises";

// Plugins (e.g. 'esbuild-plugin-pino') may use `require` to resolve dependencies
globalThis.require = createRequire(import.meta.url);

const artifactDir = path.dirname(fileURLToPath(import.meta.url));

async function buildAll() {
  const distDir = path.resolve(artifactDir, "dist");
  await rm(distDir, { recursive: true, force: true });

  await esbuild({
    entryPoints: [path.resolve(artifactDir, "src/index.ts")],
    platform: "node",
    target: ["node20"],
    bundle: true,
    format: "esm",
    outdir: distDir,
    outExtension: { ".js": ".mjs" },
    logLevel: "info",
    // Some packages may not be bundleable, so we externalize them, we can add more here as needed.
    // Some of the packages below may not be imported or installed, but we're adding them in case they are in the future.
    // Examples of unbundleable packages:
    // - uses native modules and loads them dynamically (e.g. sharp)
    // - use path traversal to read files (e.g. @google-cloud/secret-manager loads sibling .proto files)
    external: [
      "*.node",
      "sharp",
      "better-sqlite3",
      "sqlite3",
      "canvas",
      "bcrypt",
      "argon2",
      "fsevents",
      "re2",
      "farmhash",
      "xxhash-addon",
      "bufferutil",
      "utf-8-validate",
      "ssh2",
      "cpu-features",
      "dtrace-provider",
      "isolated-vm",
      "lightningcss",
      "pg-native",
      "oracledb",
      "mongodb-client-encryption",
      "handlebars",
      "knex",
      "typeorm",
      "protobufjs",
      "onnxruntime-node",
      "@tensorflow/*",
      "@prisma/client",
      "@mikro-orm/*",
      "@grpc/*",
      "@swc/*",
      "@aws-sdk/*",
      "@azure/*",
      "@opentelemetry/*",
      "@google-cloud/*",
      "@google/*",
      "googleapis",
      "firebase-admin",
      "@parcel/watcher",
      "@sentry/profiling-node",
      "@tree-sitter/*",
      "aws-sdk",
      "classic-level",
      "dd-trace",
      "ffi-napi",
      "grpc",
      "hiredis",
      "kerberos",
      "leveldown",
      "miniflare",
      "newrelic",
      "odbc",
      "piscina",
      "realm",
      "ref-napi",
      "rocksdb",
      "sass-embedded",
      "sequelize",
      "serialport",
      "snappy",
      "tinypool",
      "usb",
      "workerd",
      "wrangler",
      "zeromq",
      "zeromq-prebuilt",
      "playwright",
      "puppeteer",
      "puppeteer-core",
      "electron",
    ],
    sourcemap: "linked",
    plugins: [
      // pino-pretty è usato solo in dev locale (NODE_ENV=development), non su Railway
      // Omettiamo pino-pretty dai transports per evitare path hardcoded nel bundle
      esbuildPluginPino({ transports: [] })
    ],
    // Make sure packages that are cjs only (e.g. express) but are bundled continue to work in our esm output file
    banner: {
      js: `import { createRequire as __bannerCrReq } from 'node:module';
import __bannerPath from 'node:path';
import __bannerUrl from 'node:url';

globalThis.require = __bannerCrReq(import.meta.url);
globalThis.__filename = __bannerUrl.fileURLToPath(import.meta.url);
globalThis.__dirname = __bannerPath.dirname(globalThis.__filename);
    `,
    },
  });
}

async function patchPinoPath() {
  // esbuild-plugin-pino inietta un path assoluto hardcoded della macchina locale.
  // Lo sostituiamo con import.meta.url che funziona correttamente su qualsiasi macchina.
  const bundlePath = path.resolve(artifactDir, "dist/index.mjs");
  let src = await readFile(bundlePath, "utf8");

  const replacement = "function pinoBundlerAbsolutePath(p) {\n      return new URL(p, import.meta.url).pathname;\n    }";
  const signature = "function pinoBundlerAbsolutePath(p)";
  let result = "";
  let searchFrom = 0;

  while (true) {
    const sigIdx = src.indexOf(signature, searchFrom);
    if (sigIdx === -1) {
      result += src.slice(searchFrom);
      break;
    }
    // Find the opening brace of the function body
    const braceStart = src.indexOf("{", sigIdx + signature.length);
    if (braceStart === -1) {
      result += src.slice(searchFrom);
      break;
    }
    // Count braces to find the matching closing brace
    let depth = 0;
    let i = braceStart;
    for (; i < src.length; i++) {
      if (src[i] === "{") depth++;
      else if (src[i] === "}") depth--;
      if (depth === 0) break;
    }
    // Replace the entire function (from signature start to closing brace)
    result += src.slice(searchFrom, sigIdx) + replacement;
    searchFrom = i + 1;
  }

  src = result;
  await writeFile(bundlePath, src, "utf8");
  console.log("✓ pino worker paths patched to use import.meta.url");
}

buildAll()
  .then(patchPinoPath)
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

#!/bin/bash
# N-API build: one binary per platform runs on every Node and Electron version.
# The Node version comes from setup-node in CI; ELECTRON_VERSION comes from the workflow.
: "${ELECTRON_VERSION:?set ELECTRON_VERSION}"
rm -rf ./build/ ./prebuilds/
npx prebuildify -t "$(node -v)" -t "electron@$ELECTRON_VERSION" --napi=true --tag-uv --tag-armv --tag-libc --strip -n fsxattr

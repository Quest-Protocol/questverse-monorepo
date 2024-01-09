#!/bin/bash
set -e

RUSTFLAGS='-C link-arg=-s' cargo build --target wasm32-unknown-unknown --release
ls ../out
mkdir -p ../out
cp target/wasm32-unknown-unknown/release/*.wasm ../out

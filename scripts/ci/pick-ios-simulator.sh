#!/bin/sh
# Prints the UDID of a plain iPhone simulator (e.g. "iPhone 16", no Pro/Plus/SE/e)
# on the newest installed iOS runtime, creating one if the image has none.
set -eu

PICK=$(python3 -c '
import json, re, subprocess

def simctl(*args):
    return json.loads(subprocess.check_output(["xcrun", "simctl", "list", *args, "-j"]))

def plain(name):
    return re.fullmatch(r"iPhone \d+", name) is not None

def model(name):
    return int(name.split()[1])

runtimes = [r for r in simctl("runtimes", "available")["runtimes"] if r["platform"] == "iOS"]
runtime = max(runtimes, key=lambda r: [int(p) for p in r["version"].split(".")])
devices = [d for d in simctl("devices", "available")["devices"].get(runtime["identifier"], []) if plain(d["name"])]
if devices:
    print(max(devices, key=lambda d: model(d["name"]))["udid"])
else:
    types = [t for t in runtime["supportedDeviceTypes"] if plain(t["name"])]
    print("create", max(types, key=lambda t: model(t["name"]))["identifier"], runtime["identifier"])
')

case "$PICK" in
  create\ *)
    set -- $PICK
    UDID=$(xcrun simctl create detox-ci "$2" "$3")
    ;;
  *)
    UDID=$PICK
    ;;
esac

echo "Picked simulator: $(xcrun simctl list devices | grep "$UDID")" >&2
echo "$UDID"

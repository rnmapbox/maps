#!/bin/sh
# Prints the UDID of a plain iPhone simulator (e.g. "iPhone 16", no Pro/Plus/SE/e)
# on the newest installed iOS runtime, creating one if the image has none.
# IOS_SIMULATOR_DEVICE and IOS_SIMULATOR_RUNTIME (e.g. "iPhone 17" and "26.5") pin both instead,
# failing if the runner image lacks them.
set -eu

PICK=$(python3 -c '
import json, os, re, subprocess, sys

def simctl(*args):
    return json.loads(subprocess.check_output(["xcrun", "simctl", "list", *args, "-j"]))

def plain(name):
    return re.fullmatch(r"iPhone \d+", name) is not None

def model(name):
    return int(name.split()[1])

def version(runtime):
    return [int(p) for p in runtime["version"].split(".")]

pinned_device = os.environ.get("IOS_SIMULATOR_DEVICE")
pinned_runtime = os.environ.get("IOS_SIMULATOR_RUNTIME")
runtimes = [r for r in simctl("runtimes", "available")["runtimes"] if r["platform"] == "iOS"]
if pinned_runtime:
    matching = [r for r in runtimes if (r["version"] + ".").startswith(pinned_runtime + ".")]
    if not matching:
        available = ", ".join(r["version"] for r in runtimes)
        sys.exit(f"The iOS {pinned_runtime} simulator runtime is not on this runner image, it has: {available}. Update IOS_SIMULATOR_RUNTIME.")
    runtimes = matching
runtime = max(runtimes, key=version)
types = [t for t in runtime["supportedDeviceTypes"] if (t["name"] == pinned_device if pinned_device else plain(t["name"]))]
if not types:
    available = ", ".join(t["name"] for t in runtime["supportedDeviceTypes"] if t["name"].startswith("iPhone"))
    wanted = pinned_device or "plain iPhone"
    found = runtime["version"]
    sys.exit(f"The iOS {found} simulator runtime has no {wanted}, it has: {available}. Update IOS_SIMULATOR_DEVICE.")
device_type = types[0] if pinned_device else max(types, key=lambda t: model(t["name"]))
devices = [d for d in simctl("devices", "available")["devices"].get(runtime["identifier"], [])
           if d["deviceTypeIdentifier"] == device_type["identifier"]]
if devices:
    print(devices[0]["udid"])
else:
    print("create", device_type["identifier"], runtime["identifier"])
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

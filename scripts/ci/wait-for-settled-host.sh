#!/bin/sh
# Waits up to MAX_WAIT seconds for the 1-minute load average to drop below LOAD_LIMIT; never fails.
set -eu

MAX_WAIT=${MAX_WAIT:-180}
LOAD_LIMIT=${LOAD_LIMIT:-$(($(sysctl -n hw.ncpu) * 8))}
START=$(date +%s)

while :; do
  ELAPSED=$(($(date +%s) - START))
  LOAD=$(sysctl -n vm.loadavg | awk '{print $2}')
  FREE_MB=$(vm_stat | awk '/Pages free/ {print int($3 * 16384 / 1048576)}')
  SIM_PROCS=$(ps -Ao command | grep -c 'CoreSimulator/Volumes/' || true)
  echo "${ELAPSED}s load=${LOAD} free=${FREE_MB}MB simulator_processes=${SIM_PROCS}"

  if awk -v l="$LOAD" -v m="$LOAD_LIMIT" 'BEGIN { exit !(l < m) }'; then
    echo "Settled after ${ELAPSED}s (load < ${LOAD_LIMIT})"
    exit 0
  fi
  if [ "$ELAPSED" -ge "$MAX_WAIT" ]; then
    echo "::warning::Runner still busy after ${ELAPSED}s (load=${LOAD}, limit ${LOAD_LIMIT}), running the tests anyway"
    exit 0
  fi
  sleep 10
done

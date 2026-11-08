#!/bin/sh
# Waits, up to MAX_WAIT seconds, until the 1-minute load average stays below twice the CPU count,
# as a freshly booted simulator renders posters and widgets for minutes and swaps the runner.
set -eu

MAX_WAIT=${MAX_WAIT:-600}
INTERVAL=10
SETTLED_SAMPLES=3

CPUS=$(sysctl -n hw.ncpu)
LIMIT=$((CPUS * 2))
START=$(date +%s)
settled=0

while :; do
  ELAPSED=$(($(date +%s) - START))
  LOAD=$(sysctl -n vm.loadavg | awk '{print $2}')
  FREE_MB=$(vm_stat | awk '/Pages free/ {gsub("\\.", "", $3); print int($3 * 16384 / 1048576)}')
  SIM_PROCS=$(ps -Ao command | grep -c 'CoreSimulator/Volumes/' || true)
  echo "${ELAPSED}s load=${LOAD} free=${FREE_MB}MB simulator_processes=${SIM_PROCS}"

  if awk -v l="$LOAD" -v m="$LIMIT" 'BEGIN { exit !(l < m) }'; then
    settled=$((settled + 1))
    if [ "$settled" -ge "$SETTLED_SAMPLES" ]; then
      echo "Settled after ${ELAPSED}s (load < ${LIMIT})"
      exit 0
    fi
  else
    settled=0
  fi

  if [ "$ELAPSED" -ge "$MAX_WAIT" ]; then
    echo "::warning::Runner still busy after ${ELAPSED}s (load=${LOAD}, limit ${LIMIT}), running the tests anyway"
    exit 0
  fi
  sleep "$INTERVAL"
done

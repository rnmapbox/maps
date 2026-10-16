"""Native touch regression. With the example app running, execute:

    python3 example/e2e/longPressCamera.android.py [adb serial]

Uses only Python's standard library and adb. Open Camera > Long Press Camera
first, or leave the app at its main menu. Keep the device in portrait mode.
"""

import json
import os
import re
import subprocess
import sys
import time
import xml.etree.ElementTree as ET

ADB = [os.environ.get('ADB', 'adb')]
positions = {}
if len(sys.argv) > 1:
    ADB += ['-s', sys.argv[1]]


def adb(*args):
    return subprocess.check_output(ADB + list(args), text=True, timeout=45)


def tree():
    adb('shell', 'rm', '-f', '/sdcard/long-press-camera.xml')
    adb('shell', 'uiautomator', 'dump', '/sdcard/long-press-camera.xml')
    xml = adb('exec-out', 'cat', '/sdcard/long-press-camera.xml')
    return list(ET.fromstring(xml).iter('node'))


def bounds(node):
    return [int(n) for n in re.findall(r'\d+', node.attrib['bounds'])]


def tap(label):
    key = 'mode' if label.casefold().startswith('mode:') else label
    if key not in positions:
        nodes = tree()
        node = next((n for n in nodes if label.casefold() in (
            n.get('text', '').casefold(), n.get('content-desc', '').casefold()
        )), None)
        assert node is not None, (label, [n.get('text') or n.get('content-desc') for n in nodes])
        positions[key] = bounds(node)
    left, top, right, bottom = positions[key]
    adb('shell', 'input', 'tap', str((left + right) // 2), str((top + bottom) // 2))


def read():
    node = next(n for n in tree() if n.get('resource-id') == 'long-press-result')
    return json.loads(node.attrib['text'])


def difference(a, b):
    return max(abs(x - y) for x, y in zip(a, b))


def press(dx):
    node = next(n for n in tree() if n.get('resource-id') == 'long-press-map')
    left, top, right, bottom = bounds(node)
    x, y = left + (right - left) * 3 // 4, top + (bottom - top) * 2 // 3
    adb('shell', 'input', 'swipe', str(x), str(y), str(x + dx), str(y), '4000')
    held = read()
    tap('Read camera')
    released = read()
    return held, released, (x, y)


def main():
    nodes = tree()
    if not any(n.get('resource-id') == 'long-press-result' for n in nodes):
        tap('Camera')
        tap('Long Press Camera')
    time.sleep(2)
    for _ in range(6):
        mode_button = next(n for n in tree() if n.get('content-desc', '').startswith('MODE: '))
        title = mode_button.get('content-desc')
        if title == 'MODE: FLYTO':
            break
        tap(title)
    else:
        raise AssertionError('Could not select flyTo')
    for mode in ['flyTo', 'easeTo', 'moveTo', 'moveBy', 'scaleBy', 'none']:
        tap('Reset camera')
        time.sleep(0.3)
        stationary, _, _ = press(0)
        if mode == 'scaleBy':
            assert abs(stationary['zoom'] - 17) < 1e-4, stationary
        elif mode != 'none':
            assert difference(stationary['center'], [-0.15, 51.51]) > 1e-5, stationary
        tap('Reset camera')
        time.sleep(0.3)
        held, released, (x, y) = press(24)
        expected = held['target'] if mode in ['flyTo', 'easeTo', 'moveTo'] else held['center']
        error = max(difference(held['center'], expected), difference(released['center'], expected))
        print(mode, json.dumps({'held': held, 'released': released, 'error': error}), flush=True)
        if mode == 'none':
            assert difference(released['center'], [-0.15, 51.51]) > 1e-5, released
        else:
            # A jump can finish before the asynchronous gesture-end callback.
            if mode != 'moveTo':
                assert not held['gestureActive'], held
            assert error < 1e-6, held
            assert abs(held['zoom'] - stationary['zoom']) < 1e-4, held
            adb('shell', 'input', 'swipe', str(x), str(y), str(x - 100), str(y), '250')
            tap('Read camera')
            assert difference(read()['center'], released['center']) > 1e-5
        tap('Mode: ' + mode)
    print('All held-touch camera regressions passed', flush=True)


if __name__ == '__main__':
    main()

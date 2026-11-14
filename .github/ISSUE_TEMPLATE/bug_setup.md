---
name: 🪲 Setup/installation error
about: This template should be used for reporting bugs and defects with project setup
labels: 'bug-setup 🪲'
assignees: ''
---

**Requirements:** This library requires Mapbox Maps SDK v11 and React Native 0.79+ with New Architecture (Fabric/TurboModules).

**For sponsors-only support and resources:** https://github.com/rnmapbox/maps/wiki/SponsorsRepo
**Become a sponsor for special support:** https://github.com/sponsors/rnmapbox

---

## Environment
- Dev OS: [e.g. OSX 11.0.1, Win10]
- @rnmapbox/maps version: [eg. 10.3.0]
- React Native version: [eg. 0.79.0]
- Expo version: [eg. 54.0.0]


## Steps to reproduce

<!--- We don't troubleshoot existing projects, please reproduce the issue in a brand new project. If you can't then create a new working project and compare with the one you're having trouble with.  --->

```sh
npx @react-native-community/cli init sample
cd sample
npm install @rnmapbox/maps --save
npx react-native run-android
```


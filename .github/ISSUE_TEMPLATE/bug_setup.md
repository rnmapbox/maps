---
name: 🪲 Setup/installation error
about: This template should be used for reporting bugs and defects with project setup
labels: 'bug-setup 🪲'
assignees: ''
---

⚠️ **Deprecation Notice** ⚠️

**v10.x and old architecture (Paper/bridge) issues are deprecated and will not receive attention.**

Please upgrade to v11+ with new architecture (Fabric/TurboModules) for active support.

**For sponsors-only support and resources:** https://github.com/rnmapbox/maps/wiki/SponsorsRepo
**Become a sponsor for special support:** https://github.com/sponsors/rnmapbox

---

## Environment
- Dev OS: [e.g. OSX 11.0.1, Win10]
- @rnmapbox/maps version: [eg. 10.0.15]
- React Native version: [eg. 0.72.6]
- React Native Architecture: [New Architecture (Fabric/TurboModules) / Old Architecture (Paper/bridge)]
- Expo version: [eg. 49.0.0]


## Steps to reproduce

<!--- We don't troubleshoot existing projects, please reproduce the issue in a brand new project. If you can't then create a new working project and compare with the one you're having trouble with.  --->

```sh
react-native init sample --version react-native@0.60.5
cd sample
npm install rnmapbox/maps#main --save
# or released version `npm install @rnmapbox/maps@8.0.0-rc1 --save`
react-native run-android
```


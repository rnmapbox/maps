export const expoTemplateBuildGradle = `
import org.apache.tools.ant.taskdefs.condition.Os

// Top-level build file where you can add configuration options common to all sub-projects/modules.

buildscript {
    ext {
        buildToolsVersion = findProperty('android.buildToolsVersion') ?: '31.0.0'
        minSdkVersion = Integer.parseInt(findProperty('android.minSdkVersion') ?: '21')
        compileSdkVersion = Integer.parseInt(findProperty('android.compileSdkVersion') ?: '31')
        targetSdkVersion = Integer.parseInt(findProperty('android.targetSdkVersion') ?: '31')
        if (findProperty('android.kotlinVersion')) {
            kotlinVersion = findProperty('android.kotlinVersion')
        }
        frescoVersion = findProperty('expo.frescoVersion') ?: '2.5.0'

        if (System.properties['os.arch'] == 'aarch64') {
            // For M1 Users we need to use the NDK 24 which added support for aarch64
            ndkVersion = '24.0.8215888'
        } else {
            // Otherwise we default to the side-by-side NDK version from AGP.
            ndkVersion = '21.4.7075529'
        }
    }
    repositories {
        google()
        mavenCentral()
    }
    dependencies {
        classpath 'com.google.gms:google-services:4.3.3'
        classpath('com.android.tools.build:gradle:7.0.4')
        classpath('com.facebook.react:react-native-gradle-plugin')
        classpath('de.undercouch:gradle-download-task:4.1.2')
        // NOTE: Do not place your application dependencies here; they belong
        // in the individual module build.gradle files
    }
}

def REACT_NATIVE_VERSION = new File(['node', '--print',"JSON.parse(require('fs').readFileSync(require.resolve('react-native/package.json'), 'utf-8')).version"].execute(null, rootDir).text.trim())

allprojects {
    configurations.all {
        resolutionStrategy {
            force "com.facebook.react:react-native:" + REACT_NATIVE_VERSION
        }
    }

    repositories {
        mavenLocal()
        maven {
            // All of React Native (JS, Obj-C sources, Android binaries) is installed from npm
            url(new File(['node', '--print', "require.resolve('react-native/package.json')"].execute(null, rootDir).text.trim(), '../android'))
        }
        maven {
            // Android JSC is installed from npm
            url(new File(['node', '--print', "require.resolve('jsc-android/package.json')"].execute(null, rootDir).text.trim(), '../dist'))
        }

        google()
        mavenCentral {
            // We don't want to fetch react-native from Maven Central as there are
            // older versions over there.
            content {
                excludeGroup 'com.facebook.react'
            }
        }
        maven { url 'https://www.jitpack.io' }
    }
}
`;

export const expoTemplateBuildGradleWithExpoCamera = `
${expoTemplateBuildGradle}
// @generated begin expo-camera-import - expo prebuild (DO NOT MODIFY) sync-f244f4f3d8bf7229102e8f992b525b8602c74770
def expoCameraMavenPath = new File(["node", "--print", "require.resolve('expo-camera/package.json')"].execute(null, rootDir).text.trim(), "../android/maven")
allprojects { repositories { maven { url(expoCameraMavenPath) } } }
// @generated end expo-camera-import
`;

export const expoTemplateBuildGradleWithoutMavenLocal =
  expoTemplateBuildGradle.replace(`        mavenLocal()\n`, ``);

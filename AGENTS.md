# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the React Native Mapbox Maps SDK (@rnmapbox/maps) - a community-supported library for building maps with Mapbox Maps SDK for iOS and Android in React Native applications.

## Prerequisites

- **Node.js**: This project requires Node.js v22.16.0 (see .nvmrc)
  - The project has been updated to use Node.js 22 with the new import syntax
  - Use `nvm use` to switch to the correct version

## Common Development Commands

### Building and Running
```bash
# Install dependencies
yarn install

# Run the example app
cd example
yarn ios  # iOS: runs on iPhone SE (3rd generation) simulator
yarn android  # Android

# Web development (experimental)
yarn web  # or: npx expo start -c --web

# Install iOS pods
yarn pod:install
```

### Testing and Quality
```bash
# Run tests
yarn test  # Runs lint and unit tests
yarn unittest  # Just unit tests
yarn unittest:single "test name"  # Run specific test

# Code quality
yarn lint  # ESLint check
yarn lint:fix  # Auto-fix ESLint issues
yarn type:check  # TypeScript type checking

# In example app
cd example && yarn type:check
```

### Code Generation
```bash
# IMPORTANT: Run after making changes to components or style properties
yarn generate

# This updates:
# - TypeScript definitions from style-spec
# - iOS/Android native style setters
# - Component documentation
# - Codepart replacements
```

### Building for Different Configurations

#### Mapbox v11 (Beta)
```bash
# iOS
cd example/ios
RNMBX11=1 pod update MapboxMaps

# Android
# Edit example/android/gradle.properties: RNMBX11=true
```

#### New Architecture/Fabric
```bash
# iOS
cd example/ios
RCT_NEW_ARCH_ENABLED=1 pod update MapboxMaps

# Android
# Edit example/android/gradle.properties: newArchEnabled=true
```

## Architecture Overview

### Component Structure
- **Components** (`src/components/`): React Native components that wrap native Mapbox functionality
  - Layer components: `BackgroundLayer`, `CircleLayer`, `FillLayer`, `LineLayer`, etc.
  - Source components: `VectorSource`, `ShapeSource`, `RasterSource`, etc.
  - Core components: `MapView`, `Camera`, `UserLocation`, `MarkerView`, `PointAnnotation`
  - Each component extends either `AbstractLayer` or `AbstractSource` for common functionality

### Native Bridge
- **Specs** (`src/specs/`): TurboModule/Fabric component specs for new architecture
- **Native Components**: Each component has corresponding native implementations:
  - iOS: `ios/RNMBX/RNMBX*.swift` and `RNMBX*ComponentView.mm`
  - Android: `android/src/main/java/` (generated from specs)

### Module Organization
- **location**: Location management and custom location providers
- **offline**: Offline map pack management and tile store
- **snapshot**: Map snapshot generation

### Style System
- Styles are defined in `style-spec/v8.json` (Mapbox style specification)
- TypeScript definitions generated in `utils/MapboxStyles.d.ts`
- Native style setters generated for iOS/Android

## Key Development Patterns

### Adding/Modifying Components
1. Update TypeScript component in `src/components/`
2. Update or create specs in `src/specs/` if needed
3. Run `yarn generate` to update generated code
4. Implement native changes if required
5. Add example in `example/src/examples/`
6. Update tests in `__tests__/`

### Working with Styles
- Layer styles use the Mapbox Style Specification
- Style props are validated and converted through `StyleValue` utilities
- Dynamic styles can use expressions and data-driven styling

### Testing Approach
- Unit tests use Jest with React Native preset
- Components are tested with mocked native modules
- Example app serves as integration testing ground
- Use `yarn test` before committing

### Documentation
- Component docs are auto-generated from JSDoc comments
- Don't edit `.md` files in `docs/` directly - edit source files and run `yarn generate`
- Examples in `example/src/examples/` are used for documentation

## Important Notes

- Always run `yarn generate` after modifying components or styles
- The example app is the primary way to test changes
- Native changes require rebuilding the app
- Web support is experimental and may have limited functionality
- Support both old and new React Native architectures
import React, { useState, useRef, memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MapView, Camera } from '@rnmapbox/maps';

// Component WITHOUT any optimization - will re-render on every parent update
function WithoutOptimization({ label, count }) {
  const renderCount = useRef(0);
  renderCount.current += 1;

  return (
    <View style={[styles.section, styles.sectionRed]}>
      <Text style={styles.label}>❌ NO Optimization: {label}</Text>
      <Text style={styles.renderCount}>Renders: {renderCount.current}</Text>
      <Text style={styles.value}>Count prop: {count}</Text>
    </View>
  );
}

// Component WITH React.memo (manual memoization) - will only re-render when props change
const WithReactMemo = memo(function WithReactMemo({ label, count }) {
  const renderCount = useRef(0);
  renderCount.current += 1;

  return (
    <View style={[styles.section, styles.sectionYellow]}>
      <Text style={styles.label}>⚡ React.memo (Manual): {label}</Text>
      <Text style={styles.renderCount}>Renders: {renderCount.current}</Text>
      <Text style={styles.value}>Count prop: {count}</Text>
    </View>
  );
});

// Component WITH React Compiler optimization - should behave similar to React.memo
function WithCompiler({ label, count }) {
  'use memo'; // Tell React Compiler to optimize this

  const renderCount = useRef(0);
  renderCount.current += 1;

  return (
    <View style={[styles.section, styles.sectionGreen]}>
      <Text style={styles.label}>✅ React Compiler: {label}</Text>
      <Text style={styles.renderCount}>Renders: {renderCount.current}</Text>
      <Text style={styles.value}>Count prop: {count}</Text>
    </View>
  );
}

export default function CompilerTestExample() {
  const [triggerCount, setTriggerCount] = useState(0);
  const [propsCount, setPropsCount] = useState(0);

  return (
    <View style={styles.container}>
      <MapView style={styles.map}>
        <Camera
          defaultSettings={{
            centerCoordinate: [-74.006, 40.7128],
            zoomLevel: 10,
          }}
        />
      </MapView>

      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>React Compiler Test</Text>
          <Text style={styles.instructions}>
            Test if React Compiler is optimizing components by watching render counts:
          </Text>

          <TouchableOpacity
            style={styles.button}
            onPress={() => setTriggerCount(triggerCount + 1)}
          >
            <Text style={styles.buttonText}>
              🔄 Trigger Parent Re-render ({triggerCount})
            </Text>
          </TouchableOpacity>

          <Text style={styles.helperText}>
            ↑ This changes parent state but NOT component props
          </Text>

          <WithoutOptimization label="Test" count={propsCount} />
          <WithReactMemo label="Test" count={propsCount} />
          <WithCompiler label="Test" count={propsCount} />

          <TouchableOpacity
            style={[styles.button, styles.buttonSecondary]}
            onPress={() => setPropsCount(propsCount + 1)}
          >
            <Text style={styles.buttonText}>
              📝 Update Props ({propsCount})
            </Text>
          </TouchableOpacity>

          <Text style={styles.helperText}>
            ↑ This changes the "count" prop - all should re-render
          </Text>

          <View style={styles.explanation}>
            <Text style={styles.explanationTitle}>Expected Behavior:</Text>
            <Text style={styles.explanationText}>
              When clicking "Trigger Parent Re-render":{'\n'}
              • ❌ NO Optimization: Renders increase{'\n'}
              • ⚡ React.memo: Renders stay the same{'\n'}
              • ✅ React Compiler: Should behave like React.memo
            </Text>
            <Text style={styles.explanationText}>
              {'\n'}If React Compiler renders match "NO Optimization", try changing{' '}
              <Text style={styles.codeText}>compilationMode</Text> to{' '}
              <Text style={styles.codeText}>'all'</Text> in babel.config.js
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 20,
    left: 10,
    right: 10,
    maxHeight: '80%',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  instructions: {
    fontSize: 12,
    color: '#666',
    marginBottom: 15,
    lineHeight: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  buttonSecondary: {
    backgroundColor: '#34C759',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  section: {
    backgroundColor: '#f5f5f5',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    borderLeftWidth: 4,
  },
  sectionRed: {
    borderLeftColor: '#FF3B30',
    backgroundColor: '#FFF5F5',
  },
  sectionYellow: {
    borderLeftColor: '#FFCC00',
    backgroundColor: '#FFFBF0',
  },
  sectionGreen: {
    borderLeftColor: '#34C759',
    backgroundColor: '#F0FFF4',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 5,
    color: '#333',
  },
  renderCount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF3B30',
    marginBottom: 3,
  },
  value: {
    fontSize: 12,
    color: '#666',
  },
  helperText: {
    fontSize: 10,
    color: '#999',
    marginTop: -5,
    marginBottom: 10,
    fontStyle: 'italic',
  },
  explanation: {
    marginTop: 15,
    padding: 12,
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  explanationTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 8,
  },
  explanationText: {
    fontSize: 11,
    color: '#555',
    lineHeight: 17,
  },
  codeText: {
    fontFamily: 'Courier',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 4,
    fontSize: 11,
    color: '#E91E63',
  },
});

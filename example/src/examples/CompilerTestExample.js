import React, { useState, useRef, memo, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MapView, Camera } from '@rnmapbox/maps';

// Expensive calculation function
const expensiveCalculation = (input) => {
  let result = 0;
  for (let i = 0; i < 10000000; i++) {
    result += i * input;
  }
  return result % 1000;
};

// Component WITHOUT any optimization - recalculates on every render
function WithoutOptimization({ count }) {
  const renderCount = useRef(0);
  renderCount.current += 1;

  // This expensive calculation runs on EVERY render
  const expensiveValue = expensiveCalculation(count);

  return (
    <View style={[styles.section, styles.sectionRed]}>
      <Text style={styles.label}>❌ NO Optimization</Text>
      <Text style={styles.renderCount}>Renders: {renderCount.current}</Text>
      <Text style={styles.value}>Expensive value: {expensiveValue}</Text>
      <Text style={styles.note}>⚠️ Recalculates every render!</Text>
    </View>
  );
}

// Component WITH manual useMemo - only recalculates when count changes
function WithUseMemo({ count }) {
  const renderCount = useRef(0);
  renderCount.current += 1;

  // Manually memoized - only recalculates when count changes
  const expensiveValue = useMemo(() => expensiveCalculation(count), [count]);

  return (
    <View style={[styles.section, styles.sectionYellow]}>
      <Text style={styles.label}>⚡ Manual useMemo</Text>
      <Text style={styles.renderCount}>Renders: {renderCount.current}</Text>
      <Text style={styles.value}>Expensive value: {expensiveValue}</Text>
      <Text style={styles.note}>✓ Only recalcs when count changes</Text>
    </View>
  );
}

// Component WITH React Compiler - should auto-memoize like useMemo
function WithCompiler({ count }) {
  'use memo'; // React Compiler should auto-memoize expensive work

  const renderCount = useRef(0);
  renderCount.current += 1;

  // Compiler should automatically memoize this (no manual useMemo needed)
  const expensiveValue = expensiveCalculation(count);

  return (
    <View style={[styles.section, styles.sectionGreen]}>
      <Text style={styles.label}>✅ React Compiler</Text>
      <Text style={styles.renderCount}>Renders: {renderCount.current}</Text>
      <Text style={styles.value}>Expensive value: {expensiveValue}</Text>
      <Text style={styles.note}>✓ Auto-memoized by compiler</Text>
    </View>
  );
}

export default function CompilerTestExample() {
  // Parent component state (doesn't affect child props)
  const [parentState, setParentState] = useState(0);

  // State passed to children as props
  const [countValue, setCountValue] = useState(0);

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
          <Text style={styles.title}>React Compiler Test (Mode: infer)</Text>
          <Text style={styles.instructions}>
            Test how React Compiler auto-memoizes expensive calculations.
            {'\n'}Parent state: {parentState}
          </Text>

          <TouchableOpacity
            style={styles.button}
            onPress={() => setParentState(parentState + 1)}
          >
            <Text style={styles.buttonText}>
              🔄 Update Parent State ({parentState})
            </Text>
          </TouchableOpacity>

          <Text style={styles.helperText}>
            ↑ Changes parent state, props stay the same (count={countValue})
          </Text>

          <WithoutOptimization count={countValue} />
          <WithUseMemo count={countValue} />
          <WithCompiler count={countValue} />

          <TouchableOpacity
            style={[styles.button, styles.buttonSecondary]}
            onPress={() => setCountValue(countValue + 1)}
          >
            <Text style={styles.buttonText}>
              📝 Change Count Value ({countValue})
            </Text>
          </TouchableOpacity>

          <Text style={styles.helperText}>
            ↑ Changes props - all MUST recalculate
          </Text>

          <View style={styles.explanation}>
            <Text style={styles.explanationTitle}>How It Works:</Text>
            <Text style={styles.explanationText}>
              Click "Update Parent State" repeatedly:{'\n\n'}
              • ❌ NO Optimization: Recalculates (SLOW){'\n'}
              • ⚡ useMemo: Skips recalculation (FAST){'\n'}
              • ✅ React Compiler: Should skip too (FAST)
            </Text>
            <Text style={styles.explanationText}>
              {'\n'}💡 All components re-render, but optimized ones skip the expensive work since count prop didn't change!
            </Text>
            <Text style={styles.explanationText}>
              {'\n'}Click "Change Count Value" to see all recalculate.
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
  note: {
    fontSize: 10,
    color: '#888',
    marginTop: 4,
    fontStyle: 'italic',
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

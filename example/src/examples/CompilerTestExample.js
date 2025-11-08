import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MapView, Camera } from '@rnmapbox/maps';

// Component WITHOUT React Compiler optimization
function WithoutCompiler({ label }) {
  const renderCount = useRef(0);
  renderCount.current += 1;

  const expensiveCalculation = () => {
    // Simulate some work
    let result = 0;
    for (let i = 0; i < 1000; i++) {
      result += i;
    }
    return result;
  };

  const value = expensiveCalculation();

  return (
    <View style={styles.section}>
      <Text style={styles.label}>WITHOUT Compiler: {label}</Text>
      <Text style={styles.renderCount}>Renders: {renderCount.current}</Text>
      <Text style={styles.value}>Value: {value}</Text>
    </View>
  );
}

// Component WITH React Compiler optimization
function WithCompiler({ label }) {
  'use memo'; // React Compiler optimizes this component

  const renderCount = useRef(0);
  renderCount.current += 1;

  const expensiveCalculation = () => {
    // Simulate some work
    let result = 0;
    for (let i = 0; i < 1000; i++) {
      result += i;
    }
    return result;
  };

  // React Compiler should automatically memoize this
  const value = expensiveCalculation();

  return (
    <View style={styles.section}>
      <Text style={styles.label}>WITH Compiler: {label}</Text>
      <Text style={styles.renderCount}>Renders: {renderCount.current}</Text>
      <Text style={styles.value}>Value: {value}</Text>
    </View>
  );
}

export default function CompilerTestExample() {
  const [counter, setCounter] = useState(0);
  const [mapCounter, setMapCounter] = useState(0);

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
            Tap buttons below. The "WITH Compiler" component should re-render
            less often than "WITHOUT Compiler" when you tap "Trigger Re-render".
          </Text>

          <TouchableOpacity
            style={styles.button}
            onPress={() => setCounter(counter + 1)}
          >
            <Text style={styles.buttonText}>
              Trigger Re-render (Count: {counter})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonSecondary]}
            onPress={() => setMapCounter(mapCounter + 1)}
          >
            <Text style={styles.buttonText}>
              Update Map State (Count: {mapCounter})
            </Text>
          </TouchableOpacity>

          <WithoutCompiler label="Static Props" />
          <WithCompiler label="Static Props" />

          <View style={styles.explanation}>
            <Text style={styles.explanationText}>
              💡 Both components receive the same props. Without compiler
              optimization, the component re-renders on every parent state
              change. With 'use memo', React Compiler automatically optimizes it
              to skip unnecessary re-renders.
            </Text>
            <Text style={styles.explanationText}>
              🔍 Watch the "Renders" counter difference when clicking "Trigger
              Re-render"!
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
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
    color: '#333',
  },
  renderCount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF3B30',
    marginBottom: 3,
  },
  value: {
    fontSize: 12,
    color: '#666',
  },
  explanation: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#FFF9E6',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FFD700',
  },
  explanationText: {
    fontSize: 11,
    color: '#666',
    lineHeight: 16,
    marginBottom: 5,
  },
});

// Debug helper utilities for OSDU Data Explorer
export class DebugHelper {
  static isDebugMode() {
    return process.env.NODE_ENV === 'development' || window.location.search.includes('debug=true');
  }

  static log(message, ...args) {
    if (this.isDebugMode()) {
      console.log(`[OSDU Debug] ${message}`, ...args);
    }
  }

  static error(message, error) {
    console.error(`[OSDU Error] ${message}`, error);
  }

  static warn(message, ...args) {
    if (this.isDebugMode()) {
      console.warn(`[OSDU Warning] ${message}`, ...args);
    }
  }

  static logComponentRender(componentName, props = {}) {
    if (this.isDebugMode()) {
      console.log(`[OSDU Render] ${componentName}`, props);
    }
  }

  static logPerformance(label, startTime) {
    if (this.isDebugMode()) {
      const endTime = performance.now();
      console.log(`[OSDU Performance] ${label}: ${(endTime - startTime).toFixed(2)}ms`);
    }
  }

  static inspectEntity(entity) {
    if (this.isDebugMode()) {
      console.group(`[OSDU Entity] ${entity?.name || 'Unknown'}`);
      console.log('Full entity:', entity);
      console.log('Schema keys:', entity?.schema ? Object.keys(entity.schema) : 'No schema');
      console.log('Example keys:', entity?.example ? Object.keys(entity.example) : 'No example');
      console.log('PUML content length:', entity?.pumlContent?.length || 0);
      console.groupEnd();
    }
  }
}

// Global debug helpers for console access
if (typeof window !== 'undefined') {
  window.osduDebug = DebugHelper;
}
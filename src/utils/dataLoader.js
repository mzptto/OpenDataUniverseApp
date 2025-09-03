// Utility for loading and managing large OSDU data sets
export class DataLoader {
  static async loadOsduEntitiesLazy() {
    try {
      // Use dynamic import to load data only when needed
      const { osduEntities } = await import('../data/osduEntities.js');
      return osduEntities || [];
    } catch (error) {
      console.warn('Failed to load OSDU entities:', error);
      // Fallback to sample data
      const { sampleEntities } = await import('../data/sampleData.js');
      return sampleEntities;
    }
  }

  static chunkArray(array, chunkSize = 50) {
    const chunks = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }

  static async loadEntitiesInChunks(entities, onChunkLoaded) {
    const chunks = this.chunkArray(entities, 50);
    let loadedEntities = [];

    for (const chunk of chunks) {
      loadedEntities = [...loadedEntities, ...chunk];
      if (onChunkLoaded) {
        onChunkLoaded(loadedEntities);
      }
      // Allow UI to update between chunks
      await new Promise(resolve => setTimeout(resolve, 10));
    }

    return loadedEntities;
  }
}
self.idb = {
  deleteDatabase(...args) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.deleteDatabase(...args);
      request.onerror = reject;
      request.onsuccess = resolve;
    });
  },

  open(name, version, onUpgrade) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(name, version);
      request.onsuccess = (event) => resolve(event.target.result);
      request.onerror = reject;
      request.onupgradeneeded = (event) => onUpgrade(event.target.result);
    });
  },

  add(database, storeName, item) {
    return new Promise((resolve, reject) => {
      const transaction = database.transaction([storeName], 'readwrite');
      transaction.oncomplete = () => resolve();
      transaction.onerror = reject;
      transaction.objectStore(storeName).add(item);
    });
  },

  getAll(database, storeName) {
    const entryValues = [];

    return new Promise((resolve, reject) => {
      const cursor = database
        .transaction(storeName)
        .objectStore(storeName)
        .openCursor();

      cursor.onerror = reject;

      cursor.onsuccess = (event) => {
        const entry = event.target.result;

        if (entry) {
          entryValues.push(entry.value);
          entry.continue();
        } else {
          resolve(entryValues);
        }
      };
    });
  },
};

// Polyfills for server-side rendering
if (typeof window === 'undefined') {
  // Mock indexedDB for server-side rendering
  global.indexedDB = {
    open: () => ({
      addEventListener: () => {},
      removeEventListener: () => {},
      result: {
        createObjectStore: () => ({}),
        transaction: () => ({
          objectStore: () => ({
            get: () => ({ addEventListener: () => {} }),
            put: () => ({ addEventListener: () => {} }),
            delete: () => ({ addEventListener: () => {} }),
            clear: () => ({ addEventListener: () => {} }),
          }),
        }),
      },
    }),
    deleteDatabase: () => {},
  } as any;

  // Mock IDBKeyRange
  global.IDBKeyRange = {
    bound: () => ({}),
    only: () => ({}),
    lowerBound: () => ({}),
    upperBound: () => ({}),
  } as any;

  // Mock crypto.subtle if not available
  if (typeof global.crypto === 'undefined') {
    global.crypto = {
      subtle: {
        digest: () => Promise.resolve(new ArrayBuffer(0)),
        encrypt: () => Promise.resolve(new ArrayBuffer(0)),
        decrypt: () => Promise.resolve(new ArrayBuffer(0)),
        sign: () => Promise.resolve(new ArrayBuffer(0)),
        verify: () => Promise.resolve(false),
        generateKey: () => Promise.resolve({} as any),
        importKey: () => Promise.resolve({} as any),
        exportKey: () => Promise.resolve(new ArrayBuffer(0)),
        deriveBits: () => Promise.resolve(new ArrayBuffer(0)),
        deriveKey: () => Promise.resolve({} as any),
      },
      getRandomValues: (arr: any) => {
        for (let i = 0; i < arr.length; i++) {
          arr[i] = Math.floor(Math.random() * 256);
        }
        return arr;
      },
    } as any;
  }
}

export {};

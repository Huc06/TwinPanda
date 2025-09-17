// Utility functions to manage WalletConnect safely
let isWalletConnectInitialized = false;

export function markWalletConnectAsInitialized() {
  isWalletConnectInitialized = true;
}

export function isWalletConnectReady() {
  return isWalletConnectInitialized;
}

// Prevent multiple initializations in development
export function preventDoubleInitialization() {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    if ((window as any).__WALLETCONNECT_INITIALIZED) {
      return true; // Already initialized
    }
    (window as any).__WALLETCONNECT_INITIALIZED = true;
  }
  return false;
}

// Reset on hot reload in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  const originalConsoleWarn = console.warn;
  console.warn = (...args: any[]) => {
    // Suppress the WalletConnect double initialization warning in development
    if (
      args[0] && 
      typeof args[0] === 'string' && 
      args[0].includes('WalletConnect Core is already initialized')
    ) {
      return; // Suppress this warning
    }
    originalConsoleWarn.apply(console, args);
  };
}

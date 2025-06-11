interface Window {
  ethereum?: {
    isMetaMask?: boolean;
    request: (args: { method: string; params?: any[] }) => Promise<any>;
    on?: (event: string, handler: (...args: any[]) => void) => void;
    removeListener?: (event: string, handler: (...args: any[]) => void) => void;
    addEventListener?: (
      event: string,
      handler: (...args: any[]) => void
    ) => void;
    removeEventListener?: (
      event: string,
      handler: (...args: any[]) => void
    ) => void;
    enable?: () => Promise<string[]>;
    selectedAddress?: string;
    chainId?: string;
    networkVersion?: string;
  };
}

declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on?: (event: string, handler: (...args: any[]) => void) => void;
      removeListener?: (
        event: string,
        handler: (...args: any[]) => void
      ) => void;
      addEventListener?: (
        event: string,
        handler: (...args: any[]) => void
      ) => void;
      removeEventListener?: (
        event: string,
        handler: (...args: any[]) => void
      ) => void;
      enable?: () => Promise<string[]>;
      selectedAddress?: string;
      chainId?: string;
      networkVersion?: string;
    };
  }
}

export {};

"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { ethers } from "ethers";
import { useToast } from "@/hooks/use-toast";

interface Web3ContextType {
  account: string | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  provider: ethers.BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
  chainId: number | null;
  isConnecting: boolean;
  isConnected: boolean;
  user: any;
  tokenBalance: number;
  checkUserProfile: () => Promise<void>;
  refreshTokenBalance: () => Promise<void>;
  isLoading: boolean;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

// Storage keys for persistent connection
const STORAGE_KEYS = {
  WALLET_CONNECTED: "skillloop_wallet_connected",
  WALLET_ADDRESS: "skillloop_wallet_address",
  CONNECTION_TIMESTAMP: "skillloop_connection_timestamp",
  USER_DATA: "skillloop_user_data",
};

// Connection expiry time (6 hours in milliseconds)
const CONNECTION_EXPIRY = 6 * 60 * 60 * 1000; // 6 hours

export const Web3Provider = ({ children }: { children: ReactNode }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [user, setUser] = useState<any>(null);
  const [tokenBalance, setTokenBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();
  const router = useRouter();

  // Check if connection has expired
  const isConnectionExpired = (): boolean => {
    if (typeof window === "undefined") return true;

    const timestamp = localStorage.getItem(STORAGE_KEYS.CONNECTION_TIMESTAMP);
    if (!timestamp) return true;

    const connectionTime = parseInt(timestamp);
    const now = Date.now();
    return now - connectionTime > CONNECTION_EXPIRY;
  };

  // Save connection to localStorage
  const saveConnection = (address: string, userData?: any) => {
    if (typeof window === "undefined") return;

    localStorage.setItem(STORAGE_KEYS.WALLET_CONNECTED, "true");
    localStorage.setItem(STORAGE_KEYS.WALLET_ADDRESS, address);
    localStorage.setItem(
      STORAGE_KEYS.CONNECTION_TIMESTAMP,
      Date.now().toString()
    );

    if (userData) {
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
    }
  };

  // Load connection from localStorage
  const loadConnection = (): {
    address: string | null;
    userData: any | null;
  } => {
    if (typeof window === "undefined") return { address: null, userData: null };

    const isConnectedStored =
      localStorage.getItem(STORAGE_KEYS.WALLET_CONNECTED) === "true";
    const address = localStorage.getItem(STORAGE_KEYS.WALLET_ADDRESS);
    const userDataStr = localStorage.getItem(STORAGE_KEYS.USER_DATA);

    if (!isConnectedStored || !address || isConnectionExpired()) {
      clearConnection();
      return { address: null, userData: null };
    }

    let userData = null;
    try {
      userData = userDataStr ? JSON.parse(userDataStr) : null;
    } catch (error) {
      console.warn("Failed to parse stored user data:", error);
    }

    return { address, userData };
  };

  // Clear connection from localStorage
  const clearConnection = () => {
    if (typeof window === "undefined") return;

    localStorage.removeItem(STORAGE_KEYS.WALLET_CONNECTED);
    localStorage.removeItem(STORAGE_KEYS.WALLET_ADDRESS);
    localStorage.removeItem(STORAGE_KEYS.CONNECTION_TIMESTAMP);
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
  };

  const refreshTokenBalance = async () => {
    if (!account) {
      setTokenBalance(0);
      return;
    }

    try {
      const res = await fetch(`/api/users/${account}`);
      if (res.ok) {
        const data = await res.json();
        setTokenBalance(data.user.tokenBalance || 0);
      }
    } catch (error) {
      console.error("Error fetching token balance:", error);
    }
  };

  const checkUserProfile = async () => {
    if (!account) return;

    try {
      const res = await fetch(`/api/users/${account}`);

      if (res.status === 404) {
        // User doesn't exist - create new user and redirect to profile
        console.log("New user detected, creating profile...");

        const createRes = await fetch("/api/users", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            address: account,
          }),
        });

        if (createRes.ok) {
          const data = await createRes.json();
          setUser(data.user);
          setTokenBalance(data.user.tokenBalance || 200);

          // Save user data to localStorage
          saveConnection(account, data.user);

          toast({
            title: "Welcome to SkillLoop!",
            description: "You've received 200 SKL tokens to get started!",
          });

          // Redirect to profile page for new users
          router.push("/profile");
        } else {
          throw new Error("Failed to create user profile");
        }
      } else if (res.ok) {
        // User exists - load their data
        const data = await res.json();
        setUser(data.user);
        setTokenBalance(data.user.tokenBalance || 0);

        // Save user data to localStorage
        saveConnection(account, data.user);

        // Check if profile is incomplete (no username)
        if (!data.user.username) {
          toast({
            title: "Complete your profile",
            description: "Please complete your profile information.",
          });
          router.push("/profile");
        }
      } else {
        throw new Error("Failed to fetch user profile");
      }
    } catch (error) {
      console.error("Error checking user profile:", error);
      toast({
        title: "Profile Error",
        description: "There was an issue with your profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      toast({
        title: "MetaMask not found",
        description:
          "Please install MetaMask extension to use this application",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsConnecting(true);

      const ethereum = window.ethereum;

      // Request account access
      let accounts;
      try {
        accounts = await ethereum.request({
          method: "eth_requestAccounts",
        });
      } catch (requestError) {
        console.warn(
          "eth_requestAccounts failed, trying legacy enable:",
          requestError
        );
        try {
          // Fallback to legacy enable method with proper type checking
          if (ethereum.enable && typeof ethereum.enable === "function") {
            accounts = await ethereum.enable();
          } else {
            throw new Error("No available method to request accounts");
          }
        } catch (enableError) {
          console.error("Both request methods failed:", enableError);
          throw new Error(
            "Failed to connect to MetaMask. Please try refreshing the page."
          );
        }
      }

      if (accounts && accounts.length > 0) {
        const selectedAccount = accounts[0];

        // Get chain ID
        let currentChainId;
        try {
          const chainIdHex = await ethereum.request({
            method: "eth_chainId",
          });
          currentChainId = parseInt(chainIdHex, 16);
        } catch (chainError) {
          console.warn("Failed to get chain ID:", chainError);
          currentChainId = 1;
        }

        // Set connection state
        setAccount(selectedAccount);
        setChainId(currentChainId);
        setIsConnected(true);

        // Save connection to localStorage
        saveConnection(selectedAccount);

        toast({
          title: "Wallet connected",
          description: `Connected to ${selectedAccount.slice(0, 6)}...${selectedAccount.slice(-4)}`,
        });

        // Create ethers provider
        setTimeout(async () => {
          try {
            const newProvider = new ethers.BrowserProvider(window.ethereum!);
            const newSigner = await newProvider.getSigner();

            setProvider(newProvider);
            setSigner(newSigner);

            console.log("Ethers provider created successfully");
          } catch (providerError) {
            console.warn(
              "Ethers provider creation failed, but wallet is connected:",
              providerError
            );
          }
        }, 1000);

        // Check user profile after successful connection
        setTimeout(() => {
          checkUserProfile();
        }, 1500);
      } else {
        throw new Error("No accounts returned from MetaMask");
      }
    } catch (error: any) {
      console.error("Error connecting wallet:", error);

      let errorMessage = "Failed to connect wallet";
      if (error.message.includes("User rejected")) {
        errorMessage = "Connection rejected by user";
      } else if (error.message.includes("addListener")) {
        errorMessage =
          "MetaMask compatibility issue. Please try refreshing the page or updating MetaMask.";
      }

      toast({
        title: "Connection failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setChainId(null);
    setIsConnected(false);
    setUser(null);
    setTokenBalance(0);

    // Clear localStorage
    clearConnection();

    toast({
      title: "Wallet disconnected",
      description: "Your wallet has been disconnected",
    });

    // Redirect to home page after disconnect
    router.push("/");
  };

  // Auto-connect on mount if connection exists and hasn't expired
  useEffect(() => {
    const autoConnect = async () => {
      if (!window.ethereum) {
        setIsLoading(false);
        return;
      }

      try {
        // Check for stored connection
        const { address: storedAddress, userData } = loadConnection();

        if (storedAddress) {
          console.log("Found stored connection, attempting to restore...");

          // Check if MetaMask still has this account connected
          const ethereum = window.ethereum;
          const accounts = await ethereum.request({ method: "eth_accounts" });

          if (accounts && accounts.includes(storedAddress)) {
            // Restore connection
            setAccount(storedAddress);
            setIsConnected(true);

            if (userData) {
              setUser(userData);
              setTokenBalance(userData.tokenBalance || 0);
            }

            // Get chain ID
            try {
              const chainIdHex = await ethereum.request({
                method: "eth_chainId",
              });
              setChainId(parseInt(chainIdHex, 16));
            } catch (error) {
              console.warn(
                "Failed to get chain ID during auto-connect:",
                error
              );
            }

            // Create provider
            setTimeout(async () => {
              try {
                const newProvider = new ethers.BrowserProvider(ethereum);
                const newSigner = await newProvider.getSigner();

                setProvider(newProvider);
                setSigner(newSigner);
              } catch (error) {
                console.warn(
                  "Provider creation failed during auto-connect:",
                  error
                );
              }
            }, 500);

            // Refresh user profile and token balance
            setTimeout(async () => {
              await checkUserProfile();
              await refreshTokenBalance();
            }, 1000);

            console.log("Connection restored successfully");
          } else {
            // Stored connection is invalid, clear it
            console.log("Stored connection is invalid, clearing...");
            clearConnection();
          }
        }
      } catch (error) {
        console.error("Error during auto-connect:", error);
        clearConnection();
      } finally {
        setIsLoading(false);
      }
    };

    // Delay auto-connect to avoid conflicts
    const timer = setTimeout(autoConnect, 100);
    return () => clearTimeout(timer);
  }, []);

  // Handle MetaMask events
  useEffect(() => {
    if (!window.ethereum || !isConnected) return;

    const ethereum = window.ethereum;

    const handleAccountsChanged = (accounts: string[]) => {
      console.log("Accounts changed:", accounts);

      if (accounts && accounts.length > 0) {
        const selectedAccount = accounts[0];
        setAccount(selectedAccount);
        setUser(null);
        setTokenBalance(0);

        // Update stored connection
        saveConnection(selectedAccount);

        // Reset and recreate provider
        setProvider(null);
        setSigner(null);

        setTimeout(async () => {
          try {
            const newProvider = new ethers.BrowserProvider(ethereum);
            const newSigner = await newProvider.getSigner();

            setProvider(newProvider);
            setSigner(newSigner);

            // Check profile for new account
            checkUserProfile();
          } catch (error) {
            console.warn(
              "Provider recreation failed after account change:",
              error
            );
          }
        }, 500);
      } else {
        disconnectWallet();
      }
    };

    const handleChainChanged = (chainIdHex: string) => {
      console.log("Chain changed:", chainIdHex);

      const newChainId = parseInt(chainIdHex, 16);
      setChainId(newChainId);

      // Reset provider on chain change
      setProvider(null);
      setSigner(null);

      // Recreate provider after chain change
      setTimeout(async () => {
        try {
          const newProvider = new ethers.BrowserProvider(ethereum);
          const newSigner = await newProvider.getSigner();

          setProvider(newProvider);
          setSigner(newSigner);
        } catch (error) {
          console.warn("Provider recreation after chain change failed:", error);
        }
      }, 1000);
    };

    // Add event listeners
    const addListeners = () => {
      try {
        if (typeof ethereum.on === "function") {
          ethereum.on("accountsChanged", handleAccountsChanged);
          ethereum.on("chainChanged", handleChainChanged);
          return "on";
        } else if (typeof ethereum.addEventListener === "function") {
          ethereum.addEventListener("accountsChanged", handleAccountsChanged);
          ethereum.addEventListener("chainChanged", handleChainChanged);
          return "addEventListener";
        }
      } catch (error) {
        console.warn("Failed to add event listeners:", error);
      }
      return null;
    };

    const listenerMethod = addListeners();

    // Cleanup function
    return () => {
      try {
        if (
          listenerMethod === "on" &&
          typeof ethereum.removeListener === "function"
        ) {
          ethereum.removeListener("accountsChanged", handleAccountsChanged);
          ethereum.removeListener("chainChanged", handleChainChanged);
        } else if (
          listenerMethod === "addEventListener" &&
          typeof ethereum.removeEventListener === "function"
        ) {
          ethereum.removeEventListener(
            "accountsChanged",
            handleAccountsChanged
          );
          ethereum.removeEventListener("chainChanged", handleChainChanged);
        }
      } catch (error) {
        console.warn("Failed to remove event listeners:", error);
      }
    };
  }, [isConnected]);

  // Periodically check if connection has expired
  useEffect(() => {
    if (!isConnected) return;

    const checkExpiry = () => {
      if (isConnectionExpired()) {
        console.log("Connection expired, disconnecting...");
        disconnectWallet();
      }
    };

    // Check every 5 minutes
    const interval = setInterval(checkExpiry, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [isConnected]);

  return (
    <Web3Context.Provider
      value={{
        account,
        connectWallet,
        disconnectWallet,
        provider,
        signer,
        chainId,
        isConnecting,
        isConnected,
        user,
        tokenBalance,
        checkUserProfile,
        refreshTokenBalance,
        isLoading,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = (): Web3ContextType => {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error("useWeb3 must be used within a Web3Provider");
  }
  return context;
};

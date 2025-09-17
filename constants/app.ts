export const APP_CONFIG = {
  name: "PawnShop",
  description: "Mint Real World Assets as NFTs using Augmented Reality technology",
  defaultChainId: 2484, // U2U Testnet
  loanToValueRatio: 0.7, // 70% LTV
} as const;

export const CONTRACT_CONFIG = {
  address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`,
  abi: [
    {
      inputs: [
        { internalType: "address", name: "to", type: "address" },
        { internalType: "string", name: "metadataURI", type: "string" },
        { internalType: "string", name: "itemName", type: "string" },
        { internalType: "string", name: "serialNumber", type: "string" },
      ],
      name: "mintNFT",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "nonpayable",
      type: "function",
    },
  ] as const,
} as const;

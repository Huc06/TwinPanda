#!/bin/bash

# AR NFT RWA Demo Setup Script
# This script helps set up the development environment

echo "🚀 Setting up AR NFT RWA Demo..."

# Check Node.js version
echo "📋 Checking Node.js version..."
node_version=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$node_version" -lt 18 ]; then
    echo "❌ Node.js 18+ required. Current version: $(node -v)"
    echo "Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi
echo "✅ Node.js version: $(node -v)"

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install frontend dependencies"
    exit 1
fi
echo "✅ Frontend dependencies installed"

# Install contract dependencies
echo "📦 Installing contract dependencies..."
cd contracts
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install contract dependencies"
    exit 1
fi
cd ..
echo "✅ Contract dependencies installed"

# Create environment files
echo "📝 Creating environment files..."

# Frontend .env.local
if [ ! -f ".env.local" ]; then
    cat > .env.local << EOF
# Contract address (update after deployment)
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...

# U2U Testnet RPC URL
NEXT_PUBLIC_U2U_RPC_URL=https://rpc-nebulas-testnet.uniultra.xyz
EOF
    echo "✅ Created .env.local"
else
    echo "⚠️  .env.local already exists"
fi

# Contracts .env
if [ ! -f "contracts/.env" ]; then
    cat > contracts/.env << EOF
# Private key for deployment (KEEP SECRET!)
PRIVATE_KEY=your_private_key_here

# U2U Testnet RPC URL
U2U_RPC_URL=https://rpc-nebulas-testnet.uniultra.xyz

# Optional: Etherscan API key for verification
ETHERSCAN_API_KEY=your_api_key_here
EOF
    echo "✅ Created contracts/.env"
else
    echo "⚠️  contracts/.env already exists"
fi

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Update contracts/.env with your private key"
echo "2. Get U2U testnet tokens from faucet"
echo "3. Deploy smart contract: cd contracts && npm run deploy"
echo "4. Update .env.local with contract address"
echo "5. Start development server: npm run dev"
echo ""
echo "📚 Read README.md for detailed instructions"

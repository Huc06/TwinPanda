# AR NFT RWA Demo - Foundry Contracts

Smart contracts cho dự án AR NFT RWA Demo sử dụng Foundry.

## 🚀 Cài đặt và Sử dụng

### 1. Cài đặt Foundry (nếu chưa có)
```bash
curl -L https://foundry.paradigm.xyz | bash
source ~/.bashrc  # hoặc ~/.zshrc
foundryup
```

### 2. Cài đặt Dependencies
```bash
forge install
```

### 3. Compile Contracts
```bash
forge build
```

### 4. Chạy Tests
```bash
forge test
```

### 5. Deploy Contract

#### Bước 1: Cấu hình Environment
Tạo file `.env` với nội dung:
```env
PRIVATE_KEY=your_private_key_here
U2U_RPC_URL=https://rpc-nebulas-testnet.uniultra.xyz
NETWORK=u2u_testnet
```

#### Bước 2: Deploy lên U2U Testnet
```bash
forge script script/Deploy.s.sol --rpc-url u2u_testnet --broadcast --verify
```

#### Bước 3: Deploy Local (để test)
```bash
# Terminal 1: Chạy local node
anvil

# Terminal 2: Deploy
forge script script/Deploy.s.sol --rpc-url local --broadcast
```

## 📋 Contract Functions

### `mintNFT(address to, string metadataURI, string itemName, string serialNumber)`
- Mint NFT mới cho RWA
- Returns: Token ID

### `getRWAMetadata(uint256 tokenId)`
- Lấy metadata của RWA NFT
- Returns: RWAMetadata struct

### `totalSupply()`
- Lấy tổng số NFT đã mint
- Returns: uint256

### `tokenURI(uint256 tokenId)`
- Lấy URI metadata của token
- Returns: string

## 🔧 Configuration

### foundry.toml
```toml
[profile.default]
src = "src"
out = "out"
libs = ["lib"]
solc = "0.8.20"
optimizer = true
optimizer_runs = 200

[rpc_endpoints]
u2u_testnet = "https://rpc-nebulas-testnet.uniultra.xyz"
local = "http://127.0.0.1:8545"
```

## 🧪 Testing

Chạy tất cả tests:
```bash
forge test
```

Chạy test với gas report:
```bash
forge test --gas-report
```

Chạy test cụ thể:
```bash
forge test --match-test testMintNFT
```

## 📦 Dependencies

- **OpenZeppelin Contracts v5.4.0**: ERC-721 implementation
- **Forge Std**: Testing utilities

## 🔗 Network Information

### U2U Testnet
- **Chain ID**: 2484
- **RPC URL**: https://rpc-nebulas-testnet.uniultra.xyz
- **Explorer**: https://testnet.u2uscan.xyz
- **Faucet**: https://faucet.uniultra.xyz

## ⚠️ Lưu ý

1. **Private Key**: Chỉ dùng cho testnet, không bao giờ commit vào git
2. **Gas Fees**: Cần U2U tokens để deploy và tương tác
3. **Security**: Contract chưa được audit, chỉ dùng cho demo

## 🆘 Troubleshooting

### Lỗi "Insufficient funds"
- Lấy U2U tokens từ faucet: https://faucet.uniultra.xyz

### Lỗi "Invalid private key"
- Kiểm tra format private key (không có 0x prefix)

### Lỗi "Network not found"
- Kiểm tra RPC URL trong foundry.toml
- Đảm bảo network đang hoạt động
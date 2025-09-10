# AR + NFT RWA + Tiệm cầm độ Việt Nam

Một ứng dụng demo kết hợp Augmented Reality (AR) và Non-Fungible Token (NFT) cho Real World Assets (RWA) trên U2U testnet.

## Tính năng

- **AR Camera**: Sử dụng camera để phát hiện vật phẩm thật (đồng hồ)
- **3D Visualization**: Hiển thị overlay AR với Three.js
- **Smart Contract**: ERC-721 contract trên U2U testnet
- **Wallet Integration**: Kết nối với MetaMask
- **NFT Minting**: Mint NFT cho Real World Assets

## Yêu cầu hệ thống

- Node.js 18+ 
- npm hoặc yarn
- MetaMask browser extension
- Camera-enabled device (desktop/mobile)
- U2U testnet tokens

## Cài đặt và Chạy

### 1. Clone Repository

\`\`\`bash
git clone <repository-url>
cd ar-nft-rwa-demo
\`\`\`

### 2. Frontend Setup

\`\`\`bash
# Cài đặt dependencies
npm install

# Tạo file environment
cp .env.example .env.local

# Chạy development server
npm run dev
\`\`\`

Ứng dụng sẽ chạy tại `http://localhost:3000`

### 3. Smart Contract Deployment

\`\`\`bash
# Di chuyển vào thư mục contracts
cd contracts

# Cài đặt dependencies
npm install

# Tạo file environment cho contracts
cp .env.example .env
\`\`\`

## Hướng dẫn Deploy Smart Contract Chi Tiết

### Bước 1: Chuẩn bị Wallet và Testnet

#### 1.1 Tạo và cấu hình MetaMask

1. Cài đặt MetaMask extension
2. Tạo wallet mới hoặc import existing wallet
3. Lưu private key an toàn (sẽ cần cho deployment)

#### 1.2 Thêm U2U Testnet vào MetaMask

**Cách 1: Thêm thủ công**
- Network Name: `U2U Testnet`
- RPC URL: `https://rpc-nebulas-testnet.uniultra.xyz`
- Chain ID: `2484`
- Currency Symbol: `U2U`
- Block Explorer: `https://testnet.u2uscan.xyz`

**Cách 2: Sử dụng ứng dụng (tự động)**
- Kết nối wallet trong ứng dụng sẽ tự động thêm network

#### 1.3 Lấy U2U Testnet Tokens

1. Truy cập U2U testnet faucet: `https://faucet.uniultra.xyz`
2. Nhập địa chỉ wallet của bạn
3. Request tokens (thường 1-10 U2U)
4. Chờ tokens được gửi đến wallet

### Bước 2: Cấu hình Environment Variables

#### 2.1 Tạo file `.env` trong thư mục `contracts/`

\`\`\`env
# Private key của wallet (KHÔNG SHARE với ai)
PRIVATE_KEY=your_private_key_here

# U2U Testnet RPC URL
U2U_RPC_URL=https://rpc-nebulas-testnet.uniultra.xyz

# Optional: Etherscan API key cho verification
ETHERSCAN_API_KEY=your_api_key_here
\`\`\`

#### 2.2 Cập nhật `contracts/hardhat.config.js`

\`\`\`javascript
require("@nomicfoundation/hardhat-toolbox")
require("dotenv").config()

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    u2u_testnet: {
      url: process.env.U2U_RPC_URL || "https://rpc-nebulas-testnet.uniultra.xyz",
      chainId: 2484,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gasPrice: 20000000000, // 20 gwei
    },
    localhost: {
      url: "http://127.0.0.1:8545",
    },
  },
  etherscan: {
    apiKey: {
      u2u_testnet: process.env.ETHERSCAN_API_KEY || "your-api-key",
    },
    customChains: [
      {
        network: "u2u_testnet",
        chainId: 2484,
        urls: {
          apiURL: "https://testnet.u2uscan.xyz/api",
          browserURL: "https://testnet.u2uscan.xyz",
        },
      },
    ],
  },
}
\`\`\`

### Bước 3: Deploy Smart Contract

#### 3.1 Compile Contract

\`\`\`bash
cd contracts
npm run compile
\`\`\`

Kiểm tra output:
- Không có compilation errors
- ABI files được tạo trong `artifacts/`

#### 3.2 Deploy to U2U Testnet

\`\`\`bash
npm run deploy
\`\`\`

Hoặc chạy trực tiếp:

\`\`\`bash
npx hardhat run scripts/deploy.js --network u2u_testnet
\`\`\`

#### 3.3 Lưu thông tin deployment

Sau khi deploy thành công, bạn sẽ thấy output như:

\`\`\`
Deploying RWANFTContract to U2U testnet...
RWANFTContract deployed to: 0x1234567890123456789012345678901234567890
Network: u2u_testnet
Chain ID: 2484
\`\`\`

**LƯU LẠI CONTRACT ADDRESS** - bạn sẽ cần nó cho frontend!

### Bước 4: Cấu hình Frontend

#### 4.1 Cập nhật Environment Variables

Tạo file `.env.local` trong root directory:

\`\`\`env
# Contract address từ deployment
NEXT_PUBLIC_CONTRACT_ADDRESS=0x1234567890123456789012345678901234567890

# U2U Testnet RPC URL
NEXT_PUBLIC_U2U_RPC_URL=https://rpc-nebulas-testnet.uniultra.xyz
\`\`\`

#### 4.2 Verify Contract (Optional)

\`\`\`bash
cd contracts
npx hardhat verify --network u2u_testnet 0x1234567890123456789012345678901234567890
\`\`\`

### Bước 5: Test Deployment

#### 5.1 Chạy Frontend

\`\`\`bash
npm run dev
\`\`\`

#### 5.2 Test Workflow

1. Mở `http://localhost:3000`
2. Click "Connect Wallet"
3. Chấp nhận kết nối MetaMask
4. Kiểm tra network (phải là U2U Testnet)
5. Click "Start AR Camera"
6. Chờ detection confidence > 70%
7. Click "Mint NFT RWA"
8. Confirm transaction trong MetaMask
9. Chờ transaction complete

## Cấu trúc Project

\`\`\`
├── app/
│   ├── page.tsx          # Main AR interface
│   ├── layout.tsx        # App layout
│   └── globals.css       # Global styles
├── components/ui/        # UI components (shadcn/ui)
├── lib/
│   └── blockchain.ts     # Blockchain integration service
├── contracts/
│   ├── RWANFTContract.sol # ERC-721 smart contract
│   ├── hardhat.config.js  # Hardhat configuration
│   ├── scripts/deploy.js  # Deployment script
│   └── package.json       # Contract dependencies
├── public/
│   └── luxury-watch-*.jpg # Sample RWA images
├── package.json          # Frontend dependencies
└── README.md
\`\`\`

## Smart Contract API

### Core Functions

#### `mintNFT(address to, string metadataURI, string itemName, string serialNumber)`
- **Mô tả**: Mint NFT mới cho RWA
- **Parameters**:
  - `to`: Địa chỉ nhận NFT
  - `metadataURI`: URI chứa metadata JSON
  - `itemName`: Tên vật phẩm (ví dụ: "Luxury Watch")
  - `serialNumber`: Số serial (ví dụ: "LW-2024-001")
- **Returns**: Token ID của NFT mới
- **Events**: Emit `NFTMinted` event

#### `getRWAMetadata(uint256 tokenId)`
- **Mô tả**: Lấy thông tin metadata của RWA NFT
- **Returns**: Struct chứa itemName, serialNumber, mintTimestamp, originalOwner

#### `totalSupply()`
- **Mô tả**: Lấy tổng số NFT đã mint
- **Returns**: Số lượng NFT

### Events

#### `NFTMinted(uint256 indexed tokenId, address indexed to, string itemName, string serialNumber, string metadataURI)`
- Được emit khi mint NFT thành công

## Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **3D/AR**: Three.js, React Three Fiber, React Three Drei
- **Blockchain**: Ethers.js v6, Hardhat
- **Smart Contract**: Solidity 0.8.19, OpenZeppelin Contracts
- **UI**: Tailwind CSS v4, shadcn/ui
- **Network**: U2U Testnet (Chain ID: 2484)

## Security Considerations

### Smart Contract
- Sử dụng OpenZeppelin's audited contracts
- Input validation cho tất cả parameters
- Access control với Ownable pattern
- Reentrancy protection

### Frontend
- Private key không bao giờ được expose
- Environment variables cho sensitive data
- Proper error handling cho blockchain interactions
- User confirmation cho tất cả transactions

## Troubleshooting

### Camera Issues

**Camera không hoạt động**
- ✅ Kiểm tra browser permissions
- ✅ Sử dụng HTTPS hoặc localhost
- ✅ Thử trên mobile device
- ✅ Kiểm tra camera hardware

**AR detection không hoạt động**
- ✅ Đảm bảo lighting đủ sáng
- ✅ Giữ camera ổn định
- ✅ Chờ confidence level > 70%

### Wallet Connection Issues

**MetaMask không kết nối**
- ✅ Kiểm tra MetaMask đã cài đặt
- ✅ Unlock MetaMask wallet
- ✅ Refresh page và thử lại
- ✅ Kiểm tra browser console cho errors

**Wrong network**
- ✅ Thêm U2U testnet vào MetaMask
- ✅ Switch sang U2U testnet
- ✅ Kiểm tra Chain ID = 2484

**Insufficient funds**
- ✅ Lấy U2U tokens từ faucet
- ✅ Kiểm tra balance trong MetaMask
- ✅ Đảm bảo có đủ gas fees

### Smart Contract Issues

**Contract deployment failed**
- ✅ Kiểm tra private key trong `.env`
- ✅ Đảm bảo có đủ U2U tokens cho gas
- ✅ Kiểm tra network configuration
- ✅ Verify RPC URL đang hoạt động

**Minting failed**
- ✅ Kiểm tra contract address đúng
- ✅ Verify contract đã deploy thành công
- ✅ Kiểm tra wallet có đủ gas
- ✅ Confirm transaction trong MetaMask

**Transaction stuck**
- ✅ Kiểm tra gas price
- ✅ Speed up transaction trong MetaMask
- ✅ Chờ network confirmation
- ✅ Check transaction trên block explorer

### Development Issues

**Build errors**
- ✅ Chạy `npm install` để cài dependencies
- ✅ Kiểm tra Node.js version (18+)
- ✅ Clear cache: `npm run build --clean`
- ✅ Kiểm tra TypeScript errors

**Environment variables không load**
- ✅ Kiểm tra file name: `.env.local` (có dấu chấm)
- ✅ Restart development server
- ✅ Kiểm tra syntax trong .env file
- ✅ Đảm bảo không có spaces around `=`

## Production Deployment

### Frontend (Vercel/Netlify)

1. **Build và test local**
\`\`\`bash
npm run build
npm start
\`\`\`

2. **Deploy to Vercel**
\`\`\`bash
npm install -g vercel
vercel --prod
\`\`\`

3. **Cấu hình environment variables**
- Add `NEXT_PUBLIC_CONTRACT_ADDRESS`
- Add `NEXT_PUBLIC_U2U_RPC_URL`

### Smart Contract (Mainnet)

⚠️ **CẢNH BÁO**: Đây là testnet demo. Để deploy lên mainnet:

1. Audit smart contract
2. Test thoroughly trên testnet
3. Chuẩn bị mainnet tokens
4. Update network configuration
5. Deploy với extra caution

## Roadmap và Cải tiến

### Phase 1 (Current)
- ✅ Basic AR detection (simulated)
- ✅ ERC-721 NFT minting
- ✅ MetaMask integration
- ✅ U2U testnet support

### Phase 2 (Future)
- 🔄 Real computer vision for object detection
- 🔄 Multiple RWA types support
- 🔄 IPFS metadata storage
- 🔄 Mobile app version

### Phase 3 (Advanced)
- 🔄 AI-powered authenticity verification
- 🔄 Marketplace integration
- 🔄 Cross-chain support
- 🔄 Enterprise features

## Contributing

1. Fork repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

## License

MIT License - xem file LICENSE để biết thêm chi tiết.

## Support

Nếu gặp vấn đề:
1. Kiểm tra Troubleshooting section
2. Search existing GitHub issues
3. Create new issue với detailed description
4. Include error logs và screenshots

## Disclaimer

- Đây là MVP demo cho mục đích học tập
- Smart contract chưa được professional audit
- Không sử dụng cho production mà không có proper testing
- AR detection hiện tại được simulate, không phải computer vision thật

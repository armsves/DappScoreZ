import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const popularSolanaDapps = [
  {
    name: 'Phantom',
    description: 'The most popular Solana wallet, providing secure storage and seamless interaction with Solana dApps.',
    category: 'Wallet',
    website: 'https://phantom.app',
    x: 'phantom',
    github: 'https://github.com/phantom-labs',
    activated: true,
    blockchain: 'solana'
  },
  {
    name: 'Magic Eden',
    description: 'The leading NFT marketplace on Solana, featuring millions of NFTs across various collections.',
    category: 'NFT Marketplace',
    website: 'https://magiceden.io',
    x: 'MagicEden',
    github: 'https://github.com/metaplex-foundation',
    activated: true,
    blockchain: 'solana'
  },
  {
    name: 'Jupiter',
    description: 'The best swap aggregator on Solana, finding the most efficient routes across all DEXs.',
    category: 'DeFi',
    website: 'https://jup.ag',
    x: 'JupiterExchange',
    github: 'https://github.com/jup-ag/jupiter-core',
    activated: true,
    blockchain: 'solana'
  },
  {
    name: 'Raydium',
    description: 'An automated market maker (AMM) and liquidity provider built on Solana for fast and low-cost trades.',
    category: 'DeFi',
    website: 'https://raydium.io',
    x: 'RaydiumProtocol',
    github: 'https://github.com/raydium-io/raydium-sdk',
    activated: true,
    blockchain: 'solana'
  },
  {
    name: 'Orca',
    description: 'A user-friendly decentralized exchange (DEX) on Solana with concentrated liquidity pools.',
    category: 'DeFi',
    website: 'https://www.orca.so',
    x: 'orca_so',
    github: 'https://github.com/orca-so',
    activated: true,
    blockchain: 'solana'
  },
  {
    name: 'Solscan',
    description: 'A comprehensive blockchain explorer for Solana, providing detailed transaction and account information.',
    category: 'Explorer',
    website: 'https://solscan.io',
    x: 'solscanofficial',
    github: 'https://github.com/solana-labs',
    activated: true,
    blockchain: 'solana'
  },
  {
    name: 'Metaplex',
    description: 'The standard protocol for creating and managing NFTs on Solana, powering most NFT projects.',
    category: 'NFT',
    website: 'https://www.metaplex.com',
    x: 'metaplex',
    github: 'https://github.com/metaplex-foundation/metaplex-program-library',
    activated: true,
    blockchain: 'solana'
  },
  {
    name: 'Pyth Network',
    description: 'A decentralized oracle network providing high-fidelity financial market data to Solana applications.',
    category: 'Oracle',
    website: 'https://pyth.network',
    x: 'PythNetwork',
    github: 'https://github.com/pyth-network',
    activated: true,
    blockchain: 'solana'
  },
  {
    name: 'Helium',
    description: 'A decentralized wireless network infrastructure (DePIN) running on Solana for IoT connectivity.',
    category: 'Infrastructure',
    website: 'https://www.helium.com',
    x: 'helium',
    github: 'https://github.com/helium',
    activated: true,
    blockchain: 'solana'
  },
  {
    name: 'Drift Protocol',
    description: 'A decentralized perpetuals exchange on Solana offering leveraged trading with up to 20x leverage.',
    category: 'DeFi',
    website: 'https://www.drift.trade',
    x: 'DriftProtocol',
    github: 'https://github.com/drift-labs',
    activated: true,
    blockchain: 'solana'
  },
  {
    name: 'Solend',
    description: 'A decentralized lending and borrowing protocol on Solana, allowing users to earn interest on deposits.',
    category: 'DeFi',
    website: 'https://solend.fi',
    x: 'solendprotocol',
    github: 'https://github.com/solendprotocol',
    activated: true,
    blockchain: 'solana'
  },
  {
    name: 'SolanaFM',
    description: 'An advanced blockchain explorer for Solana with analytics, token tracking, and detailed on-chain data.',
    category: 'Explorer',
    website: 'https://solana.fm',
    x: 'solanafm',
    github: 'https://github.com/solana-fm',
    activated: true,
    blockchain: 'solana'
  }
]

async function main() {
  console.log('🗑️  Deleting all existing projects...')
  
  // Delete all existing projects
  const deleteResult = await prisma.project.deleteMany({})
  console.log(`✅ Deleted ${deleteResult.count} projects`)
  
  console.log('\n📝 Creating 12 popular Solana dApps...')
  
  // Create new projects
  for (const dapp of popularSolanaDapps) {
    try {
      const project = await prisma.project.create({
        data: dapp
      })
      console.log(`✅ Created: ${project.name}`)
    } catch (error: any) {
      console.error(`❌ Failed to create ${dapp.name}:`, error.message)
    }
  }
  
  console.log('\n✨ Database population complete!')
}

main()
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })


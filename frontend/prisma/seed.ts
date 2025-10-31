import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database with sample Solana projects...')

  const projects = [
    {
      name: 'DeFi Kingdom',
      description: 'A revolutionary decentralized finance platform built on Solana offering yield farming, NFT marketplace, and gaming features.',
      category: 'DeFi',
      icon: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=100&h=100&fit=crop&crop=center',
      website: 'https://defikingdom.example.com',
      x: '@DeFiKingdom',
      github: 'https://github.com/defikingdom/contracts',
      programId: '11111111111111111111111111111112',
      activated: true,
      blockchain: 'solana'
    },
    {
      name: 'SolanaSwap',
      description: 'Lightning-fast decentralized exchange with minimal fees and maximum liquidity.',
      category: 'DeFi',
      icon: 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=100&h=100&fit=crop&crop=center',
      website: 'https://solanaswap.example.com',
      x: '@SolanaSwap',
      github: 'https://github.com/solanaswap/dex',
      programId: '22222222222222222222222222222223',
      activated: true,
      blockchain: 'solana'
    },
    {
      name: 'NFT Marketplace Pro',
      description: 'Premium NFT marketplace featuring rare collectibles and interactive art pieces.',
      category: 'NFT',
      icon: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&h=100&fit=crop&crop=center',
      website: 'https://nftmarketpro.example.com',
      x: '@NFTMarketPro',
      github: 'https://github.com/nftmarketpro/marketplace',
      programId: '33333333333333333333333333333334',
      activated: false, // Pending activation
      blockchain: 'solana'
    },
    {
      name: 'Solana Staking Pool',
      description: 'Secure and efficient staking protocol with automated rewards distribution.',
      category: 'Infrastructure',
      icon: 'https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=100&h=100&fit=crop&crop=center',
      website: 'https://solanastaking.example.com',
      x: '@SolanaStaking',
      github: 'https://github.com/solanastaking/protocol',
      programId: '44444444444444444444444444444445',
      activated: true,
      blockchain: 'solana'
    },
    {
      name: 'GameFi Universe',
      description: 'Play-to-earn gaming ecosystem with tokenized in-game assets and rewards.',
      category: 'Gaming',
      icon: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=100&h=100&fit=crop&crop=center',
      website: 'https://gamefi.example.com',
      x: '@GameFiUniverse',
      github: 'https://github.com/gamefi/universe',
      programId: '55555555555555555555555555555556',
      activated: false, // Pending activation
      blockchain: 'solana'
    },
    {
      name: 'Social Crypto',
      description: 'Decentralized social platform where users earn tokens for quality content.',
      category: 'Social',
      icon: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=100&h=100&fit=crop&crop=center',
      website: 'https://socialcrypto.example.com',
      x: '@SocialCrypto',
      github: 'https://github.com/socialcrypto/platform',
      programId: '66666666666666666666666666666667',
      activated: true,
      blockchain: 'solana'
    }
  ]

  for (const project of projects) {
    try {
      const created = await prisma.project.create({
        data: project
      })
      console.log(`✅ Created project: ${created.name}`)
    } catch {
      console.log(`⚠️ Project ${project.name} might already exist, skipping...`)
    }
  }

  console.log('🎉 Seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

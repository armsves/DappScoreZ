import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔄 Updating existing projects with categories...')

  const updates = [
    { name: 'DeFi Kingdom', category: 'DeFi' },
    { name: 'SolanaSwap', category: 'DeFi' },
    { name: 'NFT Marketplace Pro', category: 'NFT' },
    { name: 'Solana Staking Pool', category: 'Infrastructure' },
    { name: 'GameFi Universe', category: 'Gaming' },
    { name: 'Social Crypto', category: 'Social' }
  ]

  for (const update of updates) {
    try {
      const result = await prisma.project.updateMany({
        where: { name: update.name },
        data: { category: update.category }
      })
      if (result.count > 0) {
        console.log(`✅ Updated ${update.name} with category: ${update.category}`)
      } else {
        console.log(`⚠️ Project ${update.name} not found`)
      }
    } catch (error) {
      console.error(`❌ Error updating ${update.name}:`, error)
    }
  }

  console.log('🎉 Category updates completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Use favicon service and known reliable logo URLs
const dappIcons: Record<string, { icon?: string; logo_url?: string }> = {
  'Phantom': {
    icon: 'https://logo.clearbit.com/phantom.app',
    logo_url: 'https://logo.clearbit.com/phantom.app'
  },
  'Magic Eden': {
    icon: 'https://logo.clearbit.com/magiceden.io',
    logo_url: 'https://logo.clearbit.com/magiceden.io'
  },
  'Jupiter': {
    icon: 'https://logo.clearbit.com/jup.ag',
    logo_url: 'https://logo.clearbit.com/jup.ag'
  },
  'Raydium': {
    icon: 'https://logo.clearbit.com/raydium.io',
    logo_url: 'https://logo.clearbit.com/raydium.io'
  },
  'Orca': {
    icon: 'https://logo.clearbit.com/orca.so',
    logo_url: 'https://logo.clearbit.com/orca.so'
  },
  'Solscan': {
    icon: 'https://logo.clearbit.com/solscan.io',
    logo_url: 'https://logo.clearbit.com/solscan.io'
  },
  'Metaplex': {
    icon: 'https://logo.clearbit.com/metaplex.com',
    logo_url: 'https://logo.clearbit.com/metaplex.com'
  },
  'Pyth Network': {
    icon: 'https://logo.clearbit.com/pyth.network',
    logo_url: 'https://logo.clearbit.com/pyth.network'
  },
  'Helium': {
    icon: 'https://logo.clearbit.com/helium.com',
    logo_url: 'https://logo.clearbit.com/helium.com'
  },
  'Drift Protocol': {
    icon: 'https://logo.clearbit.com/drift.trade',
    logo_url: 'https://logo.clearbit.com/drift.trade'
  },
  'Solend': {
    icon: 'https://logo.clearbit.com/solend.fi',
    logo_url: 'https://logo.clearbit.com/solend.fi'
  },
  'SolanaFM': {
    icon: 'https://logo.clearbit.com/solana.fm',
    logo_url: 'https://logo.clearbit.com/solana.fm'
  }
}

async function main() {
  console.log('🖼️  Updating icons to use Clearbit logo service (reliable and fast)...\n')
  
  const projects = await prisma.project.findMany()
  
  for (const project of projects) {
    const iconData = dappIcons[project.name]
    
    if (iconData) {
      try {
        await prisma.project.update({
          where: { id: project.id },
          data: {
            icon: iconData.icon,
            logo_url: iconData.logo_url
          }
        })
        console.log(`✅ Updated ${project.name}`)
        console.log(`   Icon: ${iconData.icon}`)
        console.log(`   Logo: ${iconData.logo_url}\n`)
      } catch (error: any) {
        console.error(`❌ Failed to update ${project.name}:`, error.message)
      }
    } else {
      console.log(`⚠️  No icon data found for: ${project.name}`)
    }
  }
  
  console.log('✨ Icon update complete!')
  console.log('\n📝 All icons now use Clearbit logo service which provides reliable logos.')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())


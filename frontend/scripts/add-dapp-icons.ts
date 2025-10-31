import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Use website favicons and known logo URLs
const dappIcons: Record<string, { icon?: string; logo_url?: string }> = {
  'Phantom': {
    icon: 'https://phantom.app/img/phantom-logo.svg',
    logo_url: 'https://phantom.app/img/phantom-logo.svg'
  },
  'Magic Eden': {
    icon: 'https://magiceden.io/favicon.ico',
    logo_url: 'https://magiceden.io/favicon.ico'
  },
  'Jupiter': {
    icon: 'https://jup.ag/favicon.ico',
    logo_url: 'https://jup.ag/jupiter-logo.svg'
  },
  'Raydium': {
    icon: 'https://raydium.io/favicon.ico',
    logo_url: 'https://raydium.io/favicon.ico'
  },
  'Orca': {
    icon: 'https://www.orca.so/favicon.ico',
    logo_url: 'https://www.orca.so/favicon.ico'
  },
  'Solscan': {
    icon: 'https://solscan.io/favicon.ico',
    logo_url: 'https://solscan.io/favicon.ico'
  },
  'Metaplex': {
    icon: 'https://www.metaplex.com/favicon.ico',
    logo_url: 'https://www.metaplex.com/favicon.ico'
  },
  'Pyth Network': {
    icon: 'https://pyth.network/favicon.ico',
    logo_url: 'https://pyth.network/favicon.ico'
  },
  'Helium': {
    icon: 'https://www.helium.com/favicon.ico',
    logo_url: 'https://www.helium.com/favicon.ico'
  },
  'Drift Protocol': {
    icon: 'https://www.drift.trade/favicon.ico',
    logo_url: 'https://www.drift.trade/favicon.ico'
  },
  'Solend': {
    icon: 'https://solend.fi/favicon.ico',
    logo_url: 'https://solend.fi/favicon.ico'
  },
  'SolanaFM': {
    icon: 'https://solana.fm/favicon.ico',
    logo_url: 'https://solana.fm/favicon.ico'
  }
}

async function main() {
  console.log('🖼️  Updating icons for all dApps...\n')
  
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
        console.log(`✅ Updated icons for: ${project.name}`)
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
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())

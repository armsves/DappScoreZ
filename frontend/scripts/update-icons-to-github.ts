import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Use more reliable icon sources - GitHub organization avatars and known CDN URLs
const dappIcons: Record<string, { icon?: string; logo_url?: string }> = {
  'Phantom': {
    icon: 'https://github.com/phantom-labs.png',
    logo_url: 'https://github.com/phantom-labs.png'
  },
  'Magic Eden': {
    icon: 'https://github.com/magiceden-io.png',
    logo_url: 'https://github.com/magiceden-io.png'
  },
  'Jupiter': {
    icon: 'https://github.com/jup-ag.png',
    logo_url: 'https://github.com/jup-ag.png'
  },
  'Raydium': {
    icon: 'https://github.com/raydium-io.png',
    logo_url: 'https://github.com/raydium-io.png'
  },
  'Orca': {
    icon: 'https://github.com/orca-so.png',
    logo_url: 'https://github.com/orca-so.png'
  },
  'Solscan': {
    icon: 'https://github.com/solana-labs.png',
    logo_url: 'https://github.com/solana-labs.png'
  },
  'Metaplex': {
    icon: 'https://github.com/metaplex-foundation.png',
    logo_url: 'https://github.com/metaplex-foundation.png'
  },
  'Pyth Network': {
    icon: 'https://github.com/pyth-network.png',
    logo_url: 'https://github.com/pyth-network.png'
  },
  'Helium': {
    icon: 'https://github.com/helium.png',
    logo_url: 'https://github.com/helium.png'
  },
  'Drift Protocol': {
    icon: 'https://github.com/drift-labs.png',
    logo_url: 'https://github.com/drift-labs.png'
  },
  'Solend': {
    icon: 'https://github.com/solendprotocol.png',
    logo_url: 'https://github.com/solendprotocol.png'
  },
  'SolanaFM': {
    icon: 'https://github.com/solana-fm.png',
    logo_url: 'https://github.com/solana-fm.png'
  }
}

async function main() {
  console.log('🖼️  Updating all icons to GitHub organization avatars (more reliable)...\n')
  
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
  console.log('\n📝 All icons now use GitHub organization avatars which are more reliable.')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())


import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔧 Fixing Magic Eden and Solend icons with alternative sources...\n')
  
  // Try different approaches for these two
  const fixes = [
    {
      name: 'Magic Eden',
      // Try using the logo from their CDN or a known working source
      icon: 'https://magiceden.io/_next/static/media/logo.ca41803c.svg',
      logo_url: 'https://magiceden.io/_next/static/media/logo.ca41803c.svg'
    },
    {
      name: 'Solend',
      // Solend favicon works, but let's also try their logo
      icon: 'https://solend.fi/favicon.ico',
      logo_url: 'https://solend.fi/favicon.ico'
    }
  ]
  
  for (const fix of fixes) {
    try {
      const project = await prisma.project.findFirst({
        where: { name: fix.name }
      })
      
      if (project) {
        await prisma.project.update({
          where: { id: project.id },
          data: {
            icon: fix.icon,
            logo_url: fix.logo_url
          }
        })
        console.log(`✅ Updated ${fix.name}`)
        console.log(`   Icon: ${fix.icon}`)
        console.log(`   Logo: ${fix.logo_url}\n`)
      }
    } catch (error: any) {
      console.error(`❌ Failed to update ${fix.name}:`, error.message)
    }
  }
  
  console.log('✨ Icon fix complete!')
  console.log('\n📝 Note: If Magic Eden still doesn\'t load, we may need to use a different source.')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())


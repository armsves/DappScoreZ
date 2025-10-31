import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔧 Fixing Magic Eden and Solend icons...\n')
  
  // Use Simple Icons CDN or direct sources
  const fixes = [
    {
      name: 'Magic Eden',
      // Using Simple Icons CDN (reliable logo service)
      icon: 'https://cdn.simpleicons.org/magiceden/1d1d1d',
      logo_url: 'https://cdn.simpleicons.org/magiceden/1d1d1d'
    },
    {
      name: 'Solend',
      // Solend favicon works
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
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())


import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔧 Fixing Magic Eden and Solend icons using Google Favicon service...\n')
  
  // Use Google's favicon service which is very reliable
  const fixes = [
    {
      name: 'Magic Eden',
      icon: 'https://www.google.com/s2/favicons?domain=magiceden.io&sz=256',
      logo_url: 'https://www.google.com/s2/favicons?domain=magiceden.io&sz=256'
    },
    {
      name: 'Solend',
      icon: 'https://www.google.com/s2/favicons?domain=solend.fi&sz=256',
      logo_url: 'https://www.google.com/s2/favicons?domain=solend.fi&sz=256'
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
  console.log('\n📝 Using Google Favicon service which is very reliable.')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())


import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔧 Fixing X/Twitter URLs in database...\n')
  
  const projects = await prisma.project.findMany()
  
  for (const project of projects) {
    if (project.x) {
      let username = project.x
      
      // Remove https://x.com/ prefix if present
      if (username.includes('https://x.com/')) {
        username = username.replace('https://x.com/', '')
      }
      // Remove https://twitter.com/ prefix if present
      if (username.includes('https://twitter.com/')) {
        username = username.replace('https://twitter.com/', '')
      }
      // Remove @ prefix if present
      if (username.startsWith('@')) {
        username = username.substring(1)
      }
      // Remove trailing slash if present
      username = username.replace(/\/$/, '')
      
      // Only update if the value changed
      if (username !== project.x) {
        try {
          await prisma.project.update({
            where: { id: project.id },
            data: { x: username }
          })
          console.log(`✅ Fixed ${project.name}: "${project.x}" → "${username}"`)
        } catch (error: any) {
          console.error(`❌ Failed to update ${project.name}:`, error.message)
        }
      } else {
        console.log(`✓ ${project.name} already correct: "${username}"`)
      }
    }
  }
  
  console.log('\n✨ X/Twitter URL fix complete!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())


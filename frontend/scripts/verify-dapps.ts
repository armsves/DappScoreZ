import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const projects = await prisma.project.findMany({
    orderBy: { name: 'asc' }
  })
  
  console.log(`\n📊 Found ${projects.length} projects in database:\n`)
  
  projects.forEach((project, index) => {
    console.log(`${index + 1}. ${project.name}`)
    console.log(`   Category: ${project.category || 'N/A'}`)
    console.log(`   Website: ${project.website || 'N/A'}`)
    console.log(`   Twitter: ${project.x || 'N/A'}`)
    console.log(`   GitHub: ${project.github || 'N/A'}`)
    console.log(`   Activated: ${project.activated ? '✅' : '❌'}`)
    console.log('')
  })
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())


import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const activatedParam = searchParams.get('activated')
    
    let whereClause = {}
    if (activatedParam === 'true') {
      whereClause = { activated: true }
    } else if (activatedParam === 'false') {
      whereClause = { activated: false }
    }
    // If no activated param, return all projects
    
    const projects = await prisma.project.findMany({
      where: whereClause,
      orderBy: {
        created_at: 'desc'
      }
    })
    
    return NextResponse.json(projects)
  } catch (error) {
    console.error('Error fetching projects:', error)
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, category, icon, website, x, github, programId } = body
    
    if (!name || !description || !programId) {
      return NextResponse.json(
        { error: 'Name, description, and programId are required' },
        { status: 400 }
      )
    }
    
    const project = await prisma.project.create({
      data: {
        name,
        description,
        category,
        icon,
        website,
        x,
        github,
        programId,
        activated: false, // New projects start as inactive
        blockchain: 'solana'
      }
    })
    
    return NextResponse.json(project, { status: 201 })
  } catch (error) {
    console.error('Error creating project:', error)
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Get project by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const projectId = parseInt(id)
    
    if (isNaN(projectId)) {
      return NextResponse.json({ error: 'Invalid project ID' }, { status: 400 })
    }
    
    const project = await prisma.project.findUnique({
      where: { id: projectId }
    })
    
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }
    
    return NextResponse.json(project)
  } catch (error) {
    console.error('Error fetching project:', error)
    return NextResponse.json({ error: 'Failed to fetch project' }, { status: 500 })
  }
}

// Update project (for admin activation/deactivation)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const projectId = parseInt(id)
    const body = await request.json()
    const { activated, walletAddress } = body
    
    if (isNaN(projectId)) {
      return NextResponse.json({ error: 'Invalid project ID' }, { status: 400 })
    }
    
    // Check if wallet is admin (you'll need to set this in your .env)
    const adminWallet = process.env.ADMIN_WALLET_ADDRESS
    if (!adminWallet || walletAddress !== adminWallet) {
      return NextResponse.json({ error: 'Unauthorized: Admin wallet required' }, { status: 403 })
    }
    
    const project = await prisma.project.update({
      where: { id: projectId },
      data: { activated }
    })
    
    return NextResponse.json(project)
  } catch (error) {
    console.error('Error updating project:', error)
    return NextResponse.json({ error: 'Failed to update project' }, { status: 500 })
  }
}

// Delete project (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const projectId = parseInt(id)
    const { searchParams } = new URL(request.url)
    const walletAddress = searchParams.get('wallet')
    
    if (isNaN(projectId)) {
      return NextResponse.json({ error: 'Invalid project ID' }, { status: 400 })
    }
    
    // Check if wallet is admin
    const adminWallet = process.env.ADMIN_WALLET_ADDRESS
    if (!adminWallet || walletAddress !== adminWallet) {
      return NextResponse.json({ error: 'Unauthorized: Admin wallet required' }, { status: 403 })
    }
    
    await prisma.project.delete({
      where: { id: projectId }
    })
    
    return NextResponse.json({ message: 'Project deleted successfully' })
  } catch (error) {
    console.error('Error deleting project:', error)
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 })
  }
}

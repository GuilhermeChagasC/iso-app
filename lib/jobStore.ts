import { prisma } from './prisma'

type CreateJobData = {
  filePath: string
}

export async function createJob(id: string, data: CreateJobData) {
  return await prisma.job.create({
    data: {
      id,
      status: 'pending',
      filePath: data.filePath,
      isPaid: false,
    },
  })
}

export async function getJob(id: string | undefined) {
  if (!id) return null
  return await prisma.job.findUnique({
    where: { id },
  })
}

export async function updateJob(id: string, data: any) {
  return await prisma.job.update({
    where: { id },
    data: {
      ...data,
      updatedAt: new Date(),
    },
  })
}

export async function deleteJob(id: string) {
  return await prisma.job.delete({
    where: { id },
  })
}

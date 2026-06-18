import { prisma } from './prisma.js'

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } })
}

export async function createUser(user: { name: string; email: string; password: string; phone: string; address: string; role?: string }) {
  return prisma.user.create({ data: user })
}

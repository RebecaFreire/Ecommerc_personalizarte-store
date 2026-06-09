import prisma from '@/lib/prisma';

class UserRepository {
  async findByEmail(email) {
    return await prisma.user.findUnique({
      where: { email }
    });
  }

  async findById(id) {
    return await prisma.user.findUnique({
      where: { id }
    });
  }

  async create(userData) {
    return await prisma.user.create({
      data: userData
    });
  }

  async update(id, userData) {
    return await prisma.user.update({
      where: { id },
      data: userData
    });
  }

  async delete(id) {
    return await prisma.user.delete({
      where: { id }
    });
  }

  async findAll() {
    return await prisma.user.findMany();
  }
}

export default new UserRepository();

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.user.deleteMany()
  await prisma.product.deleteMany()
  await prisma.promotion.deleteMany()

  await prisma.user.createMany({
    data: [
      { name: 'Admin Delipop', email: 'admin@delipop.com', password: 'admin123', phone: '+123 456 789', address: 'Sucursal principal', role: 'admin' },
      { name: 'Cliente Ejemplo', email: 'cliente@delipop.com', password: 'cliente123', phone: '+123 987 654', address: 'Av. Ejemplo 456', role: 'client' },
    ],
  })

  await prisma.product.createMany({
    data: [
      { name: 'Vainilla Artesanal', description: 'Helado clásico de vainilla', price: 3.5, category: 'Clásicos', stock: 20, featured: true },
      { name: 'Fresa Natural', description: 'Fresa fresca en cada cucharada', price: 3.5, category: 'Frutales', stock: 18, featured: true },
      { name: 'Chocolate Intenso', description: 'Chocolate belga con textura suave', price: 3.8, category: 'Clásicos', stock: 12, featured: true },
      { name: 'Mango Tropical', description: 'Dulce y refrescante sabor de mango', price: 3.5, category: 'Frutales', stock: 16, featured: true },
      { name: 'Coco Vegano', description: 'Hecho con leche de coco natural', price: 3.8, category: 'Veganos', stock: 10, featured: false },
    ],
  })

  await prisma.promotion.createMany({
    data: [
      { name: '2x1 Conos', description: 'Compra 1 y llévate otro cono gratis.', discount: 50 },
      { name: 'Descuento Delivery', description: '15% de descuento en pedidos a domicilio.', discount: 15 },
      { name: 'Combo Familiar', description: '4 sabores por un precio especial.', discount: 25 },
    ],
  })
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error)
    await prisma.$disconnect()
    process.exit(1)
  })

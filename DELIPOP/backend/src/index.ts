import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'
import { mkdir } from 'fs/promises'
import { prisma } from './lib/prisma.js'
import { findUserByEmail, createUser } from './lib/auth.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = Number(process.env.PORT) || 3000
const TAX_RATE = 0.12

// Crear directorio de uploads si no existe
const uploadsDir = path.join(__dirname, '../public/uploads')
await mkdir(uploadsDir, { recursive: true })

// Configurar multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    const ext = path.extname(file.originalname)
    cb(null, 'product-' + uniqueSuffix + ext)
  }
})

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Solo se permiten imágenes (JPEG, PNG, GIF, WebP)'))
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
})

app.use(cors())
app.use(express.json())
app.use(express.static(path.join(__dirname, '../public')))

async function getUserFromRequest(req: express.Request) {
  const email = req.header('x-user-email')
  if (!email) return null
  return findUserByEmail(email)
}

async function requireAdmin(req: express.Request, res: express.Response) {
  const user = await getUserFromRequest(req)
  if (!user) {
    res.status(401).json({ error: 'Se requiere autenticación de administrador' })
    return null
  }
  if (user.role !== 'admin') {
    res.status(403).json({ error: 'Acceso denegado' })
    return null
  }
  return user
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true })
})

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body

    if (!name || !email || !password || !phone || !address) {
      res.status(400).json({ error: 'Faltan datos de registro' })
      return
    }

    const existing = await findUserByEmail(email)
    if (existing) {
      res.status(409).json({ error: 'El correo ya está registrado' })
      return
    }

    const user = await createUser({ name, email, password, phone, address, role: 'client' })
    res.status(201).json({ id: user.id, name: user.name, email: user.email, role: user.role })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'No se pudo registrar el usuario' })
  }
})

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      res.status(400).json({ error: 'Faltan credenciales' })
      return
    }

    const user = await findUserByEmail(email)
    if (!user || user.password !== password) {
      res.status(401).json({ error: 'Correo o contraseña incorrectos' })
      return
    }

    res.json({ id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone, address: user.address })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al iniciar sesión' })
  }
})

app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body
    if (!email) {
      res.status(400).json({ error: 'Falta el correo' })
      return
    }

    const user = await findUserByEmail(email)
    if (!user) {
      res.status(404).json({ error: 'Correo no registrado' })
      return
    }

    res.json({ message: 'Enlace de recuperación enviado (simulado)' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error en recuperación de contraseña' })
  }
})

app.get('/api/products', async (req, res) => {
  try {
    const { category, search, sort, featured } = req.query

    const products = await prisma.product.findMany({
      where: {
        ...(category ? { category: String(category) } : {}),
        ...(featured === 'true' ? { featured: true } : {}),
        ...(search
          ? {
              OR: [
                { name: { contains: String(search) } },
                { description: { contains: String(search) } },
              ],
            }
          : {}),
      },
      orderBy:
        sort === 'price_asc'
          ? { price: 'asc' }
          : sort === 'price_desc'
            ? { price: 'desc' }
            : { id: 'asc' },
    })

    res.json(products)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'No se pudieron obtener los productos' })
  }
})

app.get('/api/products/:id', async (req, res) => {
  try {
    const id = Number(req.params.id)
    const product = await prisma.product.findUnique({ where: { id } })

    if (!product) {
      res.status(404).json({ error: 'Producto no encontrado' })
      return
    }

    res.json(product)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'No se pudo obtener el producto' })
  }
})

app.post('/api/products', upload.single('image'), async (req, res) => {
  try {
    const admin = await requireAdmin(req, res)
    if (!admin) return

    const { name, description, price, category, stock, featured } = req.body
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null

    const product = await prisma.product.create({
      data: { 
        name, 
        description, 
        price: Number(price), 
        category, 
        stock: Number(stock), 
        featured: Boolean(featured),
        imageUrl
      },
    })
    res.status(201).json(product)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'No se pudo crear el producto' })
  }
})

app.put('/api/products/:id', upload.single('image'), async (req, res) => {
  try {
    const admin = await requireAdmin(req, res)
    if (!admin) return

    const id = Number(req.params.id)
    const { name, description, price, category, stock, featured } = req.body
    
    const existingProduct = await prisma.product.findUnique({ where: { id } })
    if (!existingProduct) {
      res.status(404).json({ error: 'Producto no encontrado' })
      return
    }

    const imageUrl = req.file ? `/uploads/${req.file.filename}` : existingProduct.imageUrl

    const product = await prisma.product.update({
      where: { id },
      data: { 
        name, 
        description, 
        price: Number(price), 
        category, 
        stock: Number(stock), 
        featured: Boolean(featured),
        imageUrl
      },
    })
    res.json(product)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'No se pudo actualizar el producto' })
  }
})

app.delete('/api/products/:id', async (req, res) => {
  try {
    const admin = await requireAdmin(req, res)
    if (!admin) return

    const id = Number(req.params.id)
    await prisma.product.delete({ where: { id } })
    res.status(204).end()
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'No se pudo eliminar el producto' })
  }
})

const promotionPackageMap: Record<number, number> = {
  1: 1,
  2: 2,
  3: 3,
}

app.get('/api/promotions', async (_req, res) => {
  try {
    const promotions = await prisma.promotion.findMany({ orderBy: { id: 'asc' } })
    const productIds = Object.values(promotionPackageMap)
    const products = await prisma.product.findMany({ where: { id: { in: productIds } } })
    const productMap = new Map(products.map((product) => [product.id, product]))

    const promotionsWithPackage = promotions.map((promotion) => ({
      ...promotion,
      packageProduct: productMap.get(promotionPackageMap[promotion.id] ?? productIds[0]) || null,
    }))

    res.json(promotionsWithPackage)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'No se pudieron obtener las promociones' })
  }
})

app.get('/api/promotions/:id', async (req, res) => {
  try {
    const id = Number(req.params.id)
    const promotion = await prisma.promotion.findUnique({ where: { id } })

    if (!promotion) {
      res.status(404).json({ error: 'Promoción no encontrada' })
      return
    }

    const productId = promotionPackageMap[promotion.id]
    const packageProduct = productId
      ? await prisma.product.findUnique({ where: { id: productId } })
      : null

    res.json({
      ...promotion,
      packageProduct,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'No se pudo obtener la promoción' })
  }
})

app.post('/api/promotions', async (req, res) => {
  try {
    const admin = await requireAdmin(req, res)
    if (!admin) return

    const { name, description, discount } = req.body
    if (!name || !description || discount == null) {
      res.status(400).json({ error: 'Faltan datos de la promoción' })
      return
    }

    const discountNumber = Number(discount)
    if (!Number.isFinite(discountNumber) || discountNumber < 0 || discountNumber > 100) {
      res.status(400).json({ error: 'Descuento inválido' })
      return
    }

    const promotion = await prisma.promotion.create({
      data: {
        name,
        description,
        discount: discountNumber,
      },
    })

    res.status(201).json(promotion)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'No se pudo crear la promoción' })
  }
})

app.delete('/api/promotions/:id', async (req, res) => {
  try {
    const admin = await requireAdmin(req, res)
    if (!admin) return

    const id = Number(req.params.id)
    await prisma.promotion.delete({ where: { id } })
    res.status(204).end()
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'No se pudo eliminar la promoción' })
  }
})

app.post('/api/orders', async (req, res) => {
  try {
    const {
      customerName,
      phone,
      email,
      address,
      deliveryType,
      paymentMethod,
      items,
      userId,
    } = req.body

    if (!customerName || !phone || !email || !address || !deliveryType || !paymentMethod) {
      res.status(400).json({ error: 'Faltan datos del cliente' })
      return
    }

    if (!Array.isArray(items) || items.length === 0) {
      res.status(400).json({ error: 'El pedido debe incluir al menos un producto' })
      return
    }

    const productIds = items.map((item: { productId: number }) => Number(item.productId))
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    })

    const productMap = new Map(products.map((product) => [product.id, product]))
    let subtotal = 0

    const orderItems = items.map((item: { productId: number; quantity: number }) => {
      const product = productMap.get(Number(item.productId))
      const quantity = Number(item.quantity)

      if (!product || !Number.isFinite(quantity) || quantity < 1) {
        throw new Error('Producto o cantidad inválida')
      }

      if (product.stock < quantity) {
        throw new Error(`Stock insuficiente para ${product.name}`)
      }

      subtotal += Number(product.price) * quantity

      return {
        productId: product.id,
        quantity,
        price: Number(product.price),
      }
    })

    const tax = Number((subtotal * TAX_RATE).toFixed(2))
    const total = Number((subtotal + tax).toFixed(2))

    const order = await prisma.order.create({
      data: {
        customerName,
        phone,
        email,
        address,
        deliveryType,
        paymentMethod,
        subtotal,
        tax,
        total,
        userId: userId ? Number(userId) : undefined,
        items: {
          create: orderItems,
        },
      },
      include: {
        items: {
          include: { product: true },
        },
      },
    })

    await Promise.all(
      items.map(async (item: { productId: number; quantity: number }) => {
        await prisma.product.update({
          where: { id: Number(item.productId) },
          data: { stock: { decrement: Number(item.quantity) } },
        })
      }),
    )

    res.status(201).json(order)
  } catch (error) {
    console.error(error)
    res.status(400).json({ error: error instanceof Error ? error.message : 'No se pudo crear el pedido' })
  }
})

app.get('/api/orders', async (req, res) => {
  try {
    const { email } = req.query
    const filters = email ? { email: String(email) } : {}
    const orders = await prisma.order.findMany({
      where: filters,
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
    })
    res.json(orders)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'No se pudieron obtener los pedidos' })
  }
})

app.delete('/api/orders/:id', async (req, res) => {
  try {
    const user = await getUserFromRequest(req)
    if (!user) {
      res.status(401).json({ error: 'Se requiere autenticación' })
      return
    }

    const id = Number(req.params.id)
    const order = await prisma.order.findUnique({ where: { id }, include: { items: true } })
    if (!order) {
      res.status(404).json({ error: 'Pedido no encontrado' })
      return
    }

    if (user.role !== 'admin' && order.email !== user.email) {
      res.status(403).json({ error: 'Acceso denegado' })
      return
    }

    // Restaurar stock de los productos del pedido
    await Promise.all(
      order.items.map(async (it) => {
        await prisma.product.update({ where: { id: it.productId }, data: { stock: { increment: it.quantity } } })
      }),
    )

    await prisma.order.delete({ where: { id } })
    res.status(204).end()
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'No se pudo eliminar el pedido' })
  }
})

app.put('/api/orders/:id', async (req, res) => {
  try {
    const user = await getUserFromRequest(req)
    if (!user) {
      res.status(401).json({ error: 'Se requiere autenticación' })
      return
    }

    const id = Number(req.params.id)
    const { status } = req.body
    if (!status || typeof status !== 'string') {
      res.status(400).json({ error: 'Falta el estado' })
      return
    }

    const allowed = ['pending', 'paid', 'cancelled']
    if (!allowed.includes(status)) {
      res.status(400).json({ error: 'Estado no permitido' })
      return
    }

    const order = await prisma.order.findUnique({ where: { id }, include: { items: true } })
    if (!order) {
      res.status(404).json({ error: 'Pedido no encontrado' })
      return
    }

    if (user.role !== 'admin' && order.email !== user.email) {
      res.status(403).json({ error: 'Acceso denegado' })
      return
    }

    // Si se cancela el pedido, restaurar stock (solo si no estaba ya cancelado)
    if (status === 'cancelled' && order.status !== 'cancelled') {
      await Promise.all(
        order.items.map(async (it) => {
          await prisma.product.update({ where: { id: it.productId }, data: { stock: { increment: it.quantity } } })
        }),
      )
    }

    const updated = await prisma.order.update({ where: { id }, data: { status } })
    res.json(updated)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'No se pudo actualizar el pedido' })
  }
})

app.get('/api/users', async (req, res) => {
  try {
    const admin = await requireAdmin(req, res)
    if (!admin) return

    const users = await prisma.user.findMany({ select: { id: true, name: true, email: true, phone: true, address: true, role: true } })
    res.json(users)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'No se pudieron obtener los usuarios' })
  }
})

app.get('/api/reports/sales', async (req, res) => {
  try {
    const admin = await requireAdmin(req, res)
    if (!admin) return

    const orders = await prisma.order.findMany({ include: { items: { include: { product: true } } } })
    const totalSales = orders.reduce((sum, order) => sum + Number(order.total), 0)
    const totalOrders = orders.length
    const topProducts = await prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5,
    })

    const productIds = topProducts.map((row) => row.productId)
    const products = await prisma.product.findMany({ where: { id: { in: productIds } } })
    const topSelling = topProducts.map((row) => ({
      productId: row.productId,
      quantity: row._sum.quantity,
      product: products.find((product) => product.id === row.productId)?.name ?? 'Desconocido',
    }))

    res.json({ totalSales, totalOrders, topSelling })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'No se pudo generar el reporte de ventas' })
  }
})

app.listen(PORT, () => {
  console.log(`DELIPOP API en http://localhost:${PORT}`)
})

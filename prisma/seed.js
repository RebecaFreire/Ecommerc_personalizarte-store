const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@personalizarte.com' },
    update: {},
    create: {
      email: 'admin@personalizarte.com',
      password: hashedPassword,
      name: 'Administrador',
      role: 'admin',
    },
  });
  console.log('Created admin user:', admin.email);

  // Create categories
  const categories = [
    { name: 'Batizado', slug: 'batizado', description: 'Produtos para batizado' },
    { name: 'Casamento', slug: 'casamento', description: 'Produtos para casamento' },
    { name: 'Maternidade', slug: 'maternidade', description: 'Produtos para maternidade' },
    { name: 'Empresarial', slug: 'empresarial', description: 'Produtos empresariais' },
    { name: 'Kits com Desconto', slug: 'kits-com-desconto', description: 'Kits promocionais' },
    { name: 'Necessaire', slug: 'necessaire', description: 'Necessaires personalizadas' },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    });
  }
  console.log('Created categories');

  // Get categories
  const batizadoCat = await prisma.category.findUnique({ where: { slug: 'batizado' } });
  const casamentoCat = await prisma.category.findUnique({ where: { slug: 'casamento' } });
  const maternidadeCat = await prisma.category.findUnique({ where: { slug: 'maternidade' } });
  const empresarialCat = await prisma.category.findUnique({ where: { slug: 'empresarial' } });
  const kitsCat = await prisma.category.findUnique({ where: { slug: 'kits-com-desconto' } });
  const necessaireCat = await prisma.category.findUnique({ where: { slug: 'necessaire' } });

  // Create products
  const products = [
    {
      name: 'Kit Batizado Menino',
      description: 'Kit completo para batizado com itens personalizados',
      price: 149.90,
      image: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=400',
      categoryId: batizadoCat.id,
      stock: 20,
    },
    {
      name: 'Kit Batizado Menina',
      description: 'Kit completo para batizado com itens personalizados',
      price: 149.90,
      image: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=400',
      categoryId: batizadoCat.id,
      stock: 20,
    },
    {
      name: 'Convite Casamento',
      description: 'Convites personalizados para casamento',
      price: 4.50,
      image: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=400',
      categoryId: casamentoCat.id,
      stock: 100,
    },
    {
      name: 'Kit Maternidade',
      description: 'Kit especial para maternidade com itens personalizados',
      price: 199.90,
      image: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=400',
      categoryId: maternidadeCat.id,
      stock: 15,
    },
    {
      name: 'Caneta Empresarial',
      description: 'Canetas personalizadas para empresas',
      price: 2.50,
      image: 'https://images.unsplash.com/photo-1585336261022-680e295ce3fe?w=400',
      categoryId: empresarialCat.id,
      stock: 200,
    },
    {
      name: 'Kit Promocional',
      description: 'Kit com vários itens promocionais personalizados',
      price: 89.90,
      image: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=400',
      categoryId: kitsCat.id,
      stock: 30,
    },
    {
      name: 'Necessaire Personalizada',
      description: 'Necessaire com nome personalizado',
      price: 35.00,
      image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400',
      categoryId: necessaireCat.id,
      stock: 50,
    },
    {
      name: 'Necessaire Luxo',
      description: 'Necessaire de luxo com personalização',
      price: 79.90,
      image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400',
      categoryId: necessaireCat.id,
      stock: 25,
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { name: product.name },
      update: {},
      create: product,
    });
  }
  console.log('Created products');

  // Create test orders
  const testUser = await prisma.user.findUnique({ where: { email: 'admin@personalizarte.com' } });
  const allProducts = await prisma.product.findMany();
  
  if (testUser && allProducts.length > 0) {
    const testProduct1 = allProducts[0];
    const testProduct2 = allProducts[1] || allProducts[0];

    try {
      await prisma.order.create({
        data: {
          userId: testUser.id,
          status: 'pending',
          total: testProduct1.price + (testProduct2?.price || 0),
          paymentMethod: 'credit_card',
          shippingAddress: 'Rua Teste, 123 - Centro - São Paulo - SP',
          orderItems: {
            create: [
              {
                productId: testProduct1.id,
                quantity: 1,
                price: testProduct1.price,
                customization: 'Nome: João'
              }
            ]
          }
        }
      });

      if (testProduct2) {
        await prisma.order.create({
          data: {
            userId: testUser.id,
            status: 'delivered',
            total: testProduct2.price,
            paymentMethod: 'pix',
            shippingAddress: 'Rua Teste, 123 - Centro - São Paulo - SP',
            orderItems: {
              create: [
                {
                  productId: testProduct2.id,
                  quantity: 1,
                  price: testProduct2.price,
                  customization: ''
                }
              ]
            }
          }
        });
      }

      console.log('Created test orders');
    } catch (error) {
      console.log('Test orders may already exist, skipping...');
    }
  }

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

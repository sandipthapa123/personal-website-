import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database with default Super Admin user...');

  // 1. Create Default Tenant
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'default' },
    update: {},
    create: {
      slug: 'default',
      name: 'Sandip Thapa Personal CMS',
      domain: 'thapasandip.com.np',
      is_active: true,
    },
  });

  // 2. Create Super Admin Role & Permissions
  const superAdminRole = await prisma.role.upsert({
    where: { name: 'SUPER_ADMIN' },
    update: {},
    create: {
      name: 'SUPER_ADMIN',
      description: 'Super Administrator with full permissions across all platform engines',
    },
  });

  const managePagesPermission = await prisma.permission.upsert({
    where: { action: 'pages:manage' },
    update: {},
    create: {
      action: 'pages:manage',
      resource: 'pages',
      description: 'Full page management access',
    },
  });

  await prisma.rolePermission.upsert({
    where: {
      role_id_permission_id: {
        role_id: superAdminRole.id,
        permission_id: managePagesPermission.id,
      },
    },
    update: {},
    create: {
      role_id: superAdminRole.id,
      permission_id: managePagesPermission.id,
    },
  });

  // 3. Create Super Admin User (lafasandip15@gmail.com / Sandip@123)
  const passwordHash = await bcrypt.hash('Sandip@123', 10);

  const adminUser = await prisma.user.upsert({
    where: { email: 'lafasandip15@gmail.com' },
    update: {
      password_hash: passwordHash,
      first_name: 'Sandip',
      last_name: 'Thapa',
    },
    create: {
      email: 'lafasandip15@gmail.com',
      password_hash: passwordHash,
      first_name: 'Sandip',
      last_name: 'Thapa',
      status: 'ACTIVE',
    },
  });

  // 4. Assign Super Admin Role
  await prisma.userRole.upsert({
    where: {
      user_id_role_id: {
        user_id: adminUser.id,
        role_id: superAdminRole.id,
      },
    },
    update: {},
    create: {
      user_id: adminUser.id,
      role_id: superAdminRole.id,
    },
  });

  console.log(`Successfully seeded Super Admin user: ${adminUser.email}`);
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

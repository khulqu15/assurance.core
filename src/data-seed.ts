import 'dotenv/config';
import { DataSource, In } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { join } from 'path';

import { User } from './modules/users/entities/user.entity';
import { Role } from './modules/users/entities/role.entity';
import { UserRole } from './modules/users/entities/user-role.entity';
import { UserToken } from './modules/users/entities/user-token.entity';
import { UserSettings } from './modules/users/entities/user-settings.entity';

import { Claim } from './modules/claims/entities/claim.entity';
import { ClaimStatus } from './modules/claims/entities/claim-status.entity';
import { ClaimStatusHistory } from './modules/claims/entities/claim-status-history.entity';
import { ClaimAttachment } from './modules/claims/entities/claim-attachment.entity';
import { ClaimComment } from './modules/claims/entities/claim-comment.entity';
import { IdempotencyKey } from './modules/claims/entities/idempotency-key.entity';

import { RoleCode } from './common/enums/role.enum';
import { ClaimStatusCode } from './common/enums/claim-status.enum';

const resolveSqlitePath = () => {
  if (process.env.SQLITE_PATH) {
    return process.env.SQLITE_PATH;
  }

  if (process.env.RAILWAY_VOLUME_MOUNT_PATH) {
    return join(process.env.RAILWAY_VOLUME_MOUNT_PATH, 'database.sqlite');
  }

  return join(process.cwd(), 'data', 'database.sqlite');
};

const dataSource = new DataSource({
  type: 'better-sqlite3',
  database: resolveSqlitePath(),
  entities: [
    User,
    Role,
    UserRole,
    UserToken,
    UserSettings,
    Claim,
    ClaimStatus,
    ClaimStatusHistory,
    ClaimAttachment,
    ClaimComment,
    IdempotencyKey,
  ],
  synchronize: false,
  logging: false,
});

const SEEDED_USER_EMAILS = [
  'budi@example.com',
  'citra@example.com',
  'dewi@example.com',
  'verifier@example.com',
  'approver@example.com',
  'superadmin@example.com',
];

const SEEDED_CLAIM_NUMBERS = [
  'CLM-20260410-0001',
  'CLM-20260410-0002',
  'CLM-20260410-0003',
  'CLM-20260410-0004',
  'CLM-20260410-0005',
  'CLM-20260410-0006',
  'CLM-20260410-0007',
  'CLM-20260410-0008',
  'CLM-20260410-0009',
  'CLM-20260410-0010',
];

async function ensureMasterData() {
  const roleRepo = dataSource.getRepository(Role);
  const statusRepo = dataSource.getRepository(ClaimStatus);

  const roleSeeds = [
    { id: 1, code: RoleCode.USER, name: 'User' },
    { id: 2, code: RoleCode.VERIFIER, name: 'Verifier' },
    { id: 3, code: RoleCode.APPROVER, name: 'Approver' },
    { id: 4, code: RoleCode.SUPERADMIN, name: 'Super Admin' },
  ];

  for (const item of roleSeeds) {
    const exists = await roleRepo.findOne({ where: { code: item.code } });
    if (!exists) {
      await roleRepo.save(roleRepo.create(item));
    }
  }

  const statusSeeds = [
    { id: 1, code: ClaimStatusCode.DRAFT, name: 'Draft', sequence: 1 },
    { id: 2, code: ClaimStatusCode.SUBMITTED, name: 'Submitted', sequence: 2 },
    { id: 3, code: ClaimStatusCode.REVIEWED, name: 'Reviewed', sequence: 3 },
    { id: 4, code: ClaimStatusCode.APPROVED, name: 'Approved', sequence: 4 },
    { id: 5, code: ClaimStatusCode.REJECTED, name: 'Rejected', sequence: 5 },
  ];

  for (const item of statusSeeds) {
    const exists = await statusRepo.findOne({ where: { code: item.code } });
    if (!exists) {
      await statusRepo.save(statusRepo.create(item));
    }
  }
}

async function ensureUserSettings(user: User) {
  const settingsRepo = dataSource.getRepository(UserSettings);

  const exists = await settingsRepo.findOne({
    where: { user: { id: user.id } },
  });

  if (!exists) {
    await settingsRepo.save(
      settingsRepo.create({
        user,
        emailNotification: true,
        pushNotification: false,
        claimStatusNotification: true,
        approvalDecisionNotification: true,
        weeklySummary: true,
        theme: 'light',
        language: 'en',
        defaultPage: 'dashboard',
        rowsPerPage: 25,
        rememberSession: true,
        twoFactorAuth: false,
        loginAlert: true,
        autoLogout: true,
      }),
    );
  }
}

async function runSeed() {
  const roleRepo = dataSource.getRepository(Role);
  const userRepo = dataSource.getRepository(User);
  const userRoleRepo = dataSource.getRepository(UserRole);
  const claimRepo = dataSource.getRepository(Claim);
  const statusRepo = dataSource.getRepository(ClaimStatus);
  const historyRepo = dataSource.getRepository(ClaimStatusHistory);

  const userRole = await roleRepo.findOneByOrFail({ code: RoleCode.USER });
  const verifierRole = await roleRepo.findOneByOrFail({ code: RoleCode.VERIFIER });
  const approverRole = await roleRepo.findOneByOrFail({ code: RoleCode.APPROVER });
  const superadminRole = await roleRepo.findOneByOrFail({ code: RoleCode.SUPERADMIN });

  const passwordHash = await bcrypt.hash('password123', 10);

  const userSeeds = [
    {
      fullName: 'Budi Santoso',
      email: 'budi@example.com',
      role: userRole,
      phoneNumber: '081234567890',
      nik: '3515123456789001',
      birthPlace: 'Surabaya',
      birthDate: '1999-05-12',
      address: 'Jl. Melati No. 10 RT 01 RW 02',
      city: 'Surabaya',
      province: 'Jawa Timur',
      postalCode: '60231',
    },
    {
      fullName: 'Citra Rahma',
      email: 'citra@example.com',
      role: userRole,
      phoneNumber: '081234567891',
      nik: '3515123456789002',
      birthPlace: 'Sidoarjo',
      birthDate: '2000-02-20',
      address: 'Jl. Anggrek No. 21 RT 03 RW 01',
      city: 'Sidoarjo',
      province: 'Jawa Timur',
      postalCode: '61211',
    },
    {
      fullName: 'Dewi Anggraini',
      email: 'dewi@example.com',
      role: userRole,
      phoneNumber: '081234567892',
      nik: '3515123456789003',
      birthPlace: 'Gresik',
      birthDate: '1998-08-15',
      address: 'Jl. Kenanga No. 5 RT 02 RW 04',
      city: 'Gresik',
      province: 'Jawa Timur',
      postalCode: '61121',
    },
    {
      fullName: 'Sinta Verifier',
      email: 'verifier@example.com',
      role: verifierRole,
      phoneNumber: '081234567893',
      nik: '3515123456789004',
      birthPlace: 'Malang',
      birthDate: '1995-11-03',
      address: 'Jl. Mawar No. 8 RT 01 RW 05',
      city: 'Malang',
      province: 'Jawa Timur',
      postalCode: '65111',
    },
    {
      fullName: 'Andi Approver',
      email: 'approver@example.com',
      role: approverRole,
      phoneNumber: '081234567894',
      nik: '3515123456789005',
      birthPlace: 'Pasuruan',
      birthDate: '1994-01-25',
      address: 'Jl. Dahlia No. 18 RT 04 RW 02',
      city: 'Pasuruan',
      province: 'Jawa Timur',
      postalCode: '67112',
    },
    {
      fullName: 'Super Admin',
      email: 'superadmin@example.com',
      role: superadminRole,
      phoneNumber: '081234567899',
      nik: '3515123456789999',
      birthPlace: 'Jakarta',
      birthDate: '1990-09-09',
      address: 'Jl. Sudirman No. 1',
      city: 'Jakarta Selatan',
      province: 'DKI Jakarta',
      postalCode: '12190',
    },
  ];

  const createdUsers: User[] = [];

  for (const item of userSeeds) {
    let user = await userRepo.findOne({
      where: { email: item.email },
      relations: ['userRoles', 'userRoles.role'],
    });

    if (!user) {
      user = await userRepo.save(
        userRepo.create({
          fullName: item.fullName,
          email: item.email,
          passwordHash,
          phoneNumber: item.phoneNumber,
          nik: item.nik,
          birthPlace: item.birthPlace,
          birthDate: item.birthDate,
          address: item.address,
          city: item.city,
          province: item.province,
          postalCode: item.postalCode,
          emailVerifiedAt: new Date(),
          isActive: true,
        }),
      );

      await userRoleRepo.save(
        userRoleRepo.create({
          user,
          role: item.role,
        }),
      );
    }

    await ensureUserSettings(user);
    createdUsers.push(user);
  }

  const draft = await statusRepo.findOneByOrFail({ code: ClaimStatusCode.DRAFT });
  const submitted = await statusRepo.findOneByOrFail({ code: ClaimStatusCode.SUBMITTED });
  const reviewed = await statusRepo.findOneByOrFail({ code: ClaimStatusCode.REVIEWED });
  const approved = await statusRepo.findOneByOrFail({ code: ClaimStatusCode.APPROVED });
  const rejected = await statusRepo.findOneByOrFail({ code: ClaimStatusCode.REJECTED });

  const budi = createdUsers.find((u) => u.email === 'budi@example.com')!;
  const citra = createdUsers.find((u) => u.email === 'citra@example.com')!;
  const dewi = createdUsers.find((u) => u.email === 'dewi@example.com')!;
  const verifier = createdUsers.find((u) => u.email === 'verifier@example.com')!;
  const approver = createdUsers.find((u) => u.email === 'approver@example.com')!;

  const claimSeeds = [
    { no: 'CLM-20260410-0001', user: budi, title: 'Klaim Rawat Jalan', amount: '350000.00', date: '2026-04-08', status: draft },
    { no: 'CLM-20260410-0002', user: budi, title: 'Klaim Perawatan Gigi', amount: '750000.00', date: '2026-04-07', status: approved },
    { no: 'CLM-20260410-0003', user: citra, title: 'Klaim Kacamata', amount: '1200000.00', date: '2026-04-06', status: rejected },
    { no: 'CLM-20260410-0004', user: dewi, title: 'Klaim Obat Rawat Jalan', amount: '280000.00', date: '2026-04-05', status: submitted },
    { no: 'CLM-20260410-0005', user: budi, title: 'Klaim Pemeriksaan Mata', amount: '500000.00', date: '2026-04-04', status: reviewed },
    { no: 'CLM-20260410-0006', user: citra, title: 'Klaim Konsultasi Umum', amount: '200000.00', date: '2026-04-03', status: approved },
    { no: 'CLM-20260410-0007', user: dewi, title: 'Klaim Medical Checkup', amount: '950000.00', date: '2026-04-02', status: draft },
    { no: 'CLM-20260410-0008', user: budi, title: 'Klaim Laboratorium', amount: '430000.00', date: '2026-04-01', status: submitted },
    { no: 'CLM-20260410-0009', user: citra, title: 'Klaim Fisioterapi', amount: '680000.00', date: '2026-03-31', status: reviewed },
    { no: 'CLM-20260410-0010', user: dewi, title: 'Klaim Obat Spesialis', amount: '315000.00', date: '2026-03-30', status: approved },
  ];

  for (const item of claimSeeds) {
    let claim = await claimRepo.findOne({
      where: { claimNumber: item.no },
      relations: ['currentStatus'],
      withDeleted: true,
    });

    if (!claim) {
      claim = claimRepo.create({
        claimNumber: item.no,
        user: item.user,
        title: item.title,
        description: `${item.title} description`,
        claimAmount: item.amount,
        incidentDate: item.date,
        currentStatus: item.status,
        submittedAt:
          item.status.code !== ClaimStatusCode.DRAFT ? new Date('2026-04-10T09:00:00Z') : null,
        reviewedAt:
          [ClaimStatusCode.REVIEWED, ClaimStatusCode.APPROVED, ClaimStatusCode.REJECTED].includes(
            item.status.code as ClaimStatusCode,
          )
            ? new Date('2026-04-10T10:00:00Z')
            : null,
        decidedAt:
          [ClaimStatusCode.APPROVED, ClaimStatusCode.REJECTED].includes(
            item.status.code as ClaimStatusCode,
          )
            ? new Date('2026-04-10T10:30:00Z')
            : null,
        reviewedBy:
          [ClaimStatusCode.REVIEWED, ClaimStatusCode.APPROVED, ClaimStatusCode.REJECTED].includes(
            item.status.code as ClaimStatusCode,
          )
            ? verifier
            : null,
        decidedBy:
          [ClaimStatusCode.APPROVED, ClaimStatusCode.REJECTED].includes(
            item.status.code as ClaimStatusCode,
          )
            ? approver
            : null,
        rejectionReason:
          item.status.code === ClaimStatusCode.REJECTED
            ? 'Exceeded annual benefit limit'
            : null,
      });

      claim = await claimRepo.save(claim);

      await historyRepo.save(
        historyRepo.create({
          claim,
          fromStatus: null,
          toStatus: draft,
          actionBy: item.user,
          actionRole: RoleCode.USER,
          note: 'Claim created as draft',
        }),
      );

      if (item.status.code !== ClaimStatusCode.DRAFT) {
        await historyRepo.save(
          historyRepo.create({
            claim,
            fromStatus: draft,
            toStatus: submitted,
            actionBy: item.user,
            actionRole: RoleCode.USER,
            note: 'Claim submitted',
          }),
        );
      }

      if (
        [ClaimStatusCode.REVIEWED, ClaimStatusCode.APPROVED, ClaimStatusCode.REJECTED].includes(
          item.status.code as ClaimStatusCode,
        )
      ) {
        await historyRepo.save(
          historyRepo.create({
            claim,
            fromStatus: submitted,
            toStatus: reviewed,
            actionBy: verifier,
            actionRole: RoleCode.VERIFIER,
            note: 'Claim reviewed',
          }),
        );
      }

      if (item.status.code === ClaimStatusCode.APPROVED) {
        await historyRepo.save(
          historyRepo.create({
            claim,
            fromStatus: reviewed,
            toStatus: approved,
            actionBy: approver,
            actionRole: RoleCode.APPROVER,
            note: 'Claim approved',
          }),
        );
      }

      if (item.status.code === ClaimStatusCode.REJECTED) {
        await historyRepo.save(
          historyRepo.create({
            claim,
            fromStatus: reviewed,
            toStatus: rejected,
            actionBy: approver,
            actionRole: RoleCode.APPROVER,
            note: 'Claim rejected',
          }),
        );
      }
    }
  }

  console.log('✅ Seed run completed');
}

async function resetSeed() {
  const userRepo = dataSource.getRepository(User);
  const claimRepo = dataSource.getRepository(Claim);
  const historyRepo = dataSource.getRepository(ClaimStatusHistory);
  const attachmentRepo = dataSource.getRepository(ClaimAttachment);
  const commentRepo = dataSource.getRepository(ClaimComment);
  const idempotencyRepo = dataSource.getRepository(IdempotencyKey);
  const userRoleRepo = dataSource.getRepository(UserRole);
  const userTokenRepo = dataSource.getRepository(UserToken);
  const userSettingsRepo = dataSource.getRepository(UserSettings);

  const users = await userRepo.find({
    where: { email: In(SEEDED_USER_EMAILS) },
  });

  const claims = await claimRepo.find({
    where: { claimNumber: In(SEEDED_CLAIM_NUMBERS) },
    withDeleted: true,
  });

  const userIds = users.map((u) => u.id);
  const claimIds = claims.map((c) => c.id);

  if (claimIds.length > 0) {
    await historyRepo.delete({ claim: { id: In(claimIds) } as any });
    await attachmentRepo.delete({ claim: { id: In(claimIds) } as any });
    await commentRepo.delete({ claim: { id: In(claimIds) } as any });
    await claimRepo.delete({ id: In(claimIds) as any });
  }

  if (userIds.length > 0) {
    await idempotencyRepo.delete({ actor: { id: In(userIds) } as any });
    await userTokenRepo.delete({ user: { id: In(userIds) } as any });
    await userSettingsRepo.delete({ user: { id: In(userIds) } as any });
    await userRoleRepo.delete({ user: { id: In(userIds) } as any });
    await userRepo.delete({ id: In(userIds) as any });
  }

  console.log('🗑️ Seed reset completed');
}

async function revertSeed() {
  await resetSeed();
  console.log('↩️ Seed revert completed');
}

async function restartSeed() {
  await resetSeed();
  await runSeed();
  console.log('🔁 Seed restart completed');
}

async function main() {
  const command = process.argv[2] ?? 'run';

  await dataSource.initialize();

  try {
    await ensureMasterData();

    if (command === 'run') {
      await runSeed();
    } else if (command === 'reset') {
      await resetSeed();
    } else if (command === 'restart') {
      await restartSeed();
    } else if (command === 'revert') {
      await revertSeed();
    } else {
      console.log(`Unknown seed command: ${command}`);
      console.log('Use one of: run | reset | restart | revert');
      process.exitCode = 1;
    }
  } finally {
    await dataSource.destroy();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
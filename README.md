# Insurance Approval System API

A production-oriented backend service for managing insurance claims, review workflow, approval decisions, user administration, email notifications, and regulated document attachments.

<div align="center">

![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![TypeORM](https://img.shields.io/badge/TypeORM-E83524?style=for-the-badge&logo=typeorm&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Railway](https://img.shields.io/badge/Railway-0B0D0E?style=for-the-badge&logo=railway&logoColor=white)

</div>

---

## Executive Summary

This project is a modular backend API for an insurance claim approval platform. It supports claimant account management, claim submission, reviewer and approver workflow, superadmin administration, document attachment handling, email verification, password reset, and system notification broadcasting.

The implementation is designed to balance **business clarity**, **maintainability**, and **deployment readiness**. The codebase uses a modular monolith structure with a layered service architecture, backed by PostgreSQL and TypeORM migrations.

---

## Project Snapshot

| Area                   |          Value |
| ---------------------- | -------------: |
| Runtime                |    Node.js 20+ |
| Framework              |         NestJS |
| Language               |     TypeScript |
| Database               |     PostgreSQL |
| ORM                    |        TypeORM |
| Authentication         | JWT + Passport |
| Roles                  |              4 |
| Claim Lifecycle States |              5 |
| Passing Test Suites    |             10 |
| Passing Unit Tests     |             40 |
| Statement Coverage     |         35.36% |
| Branch Coverage        |         38.08% |
| Function Coverage      |         22.95% |
| Line Coverage          |         34.90% |

### Core Roles

- **User / Claimer**
- **Verifier / Reviewer**
- **Approver**
- **Superadmin**

### Claim Lifecycle

```text
Draft → Submitted → Reviewed → Approved / Rejected
```

---

## Main Features

### Authentication and Identity

- User registration
- Login with JWT access token
- Email verification flow
- Forgot password and reset password
- Profile retrieval for authenticated users

### Insurance User Profile

- Full name
- Email
- Phone number
- National identity number (NIK)
- Place of birth
- Date of birth
- Address, city, province, postal code

### Claim Workflow

- Claim draft creation
- Claim update and deletion while in draft state
- Claim submission by claimant
- Claim review by verifier
- Final approval or rejection by approver
- Claim history trail for auditability

### Collaboration and Evidence

- Claim comments
- Attachment upload and metadata management
- Support for PDF, DOCX, and DOC files

### Administration

- Superadmin user management
- Role reassignment
- Password administrative reset
- Claim status master data management
- System-wide broadcast email updates

### Platform Quality

- Role-based access control
- DTO validation
- Unit tests
- Migration-based database setup
- Docker-based deployment path for Railway

---

## Technology Stack

| Layer         | Technology              |
| ------------- | ----------------------- |
| API Framework | NestJS                  |
| Language      | TypeScript              |
| ORM           | TypeORM                 |
| Database      | PostgreSQL              |
| Auth          | JWT, Passport           |
| Email         | Nodemailer, Nest Mailer |
| File Upload   | Multer                  |
| Testing       | Jest                    |
| Deployment    | Docker, Railway         |

---

## Architecture

This backend uses a **modular monolith architecture** with a **layered service design**.

That means the application is split into business-focused modules, while each module keeps a clear separation between:

- **Controllers** for HTTP input/output
- **Services** for business logic and workflow rules
- **Entities and repositories** for persistence
- **Infrastructure concerns** such as email, file upload, JWT, and migrations

### Why this architecture fits the project

Insurance workflows are highly structured. They need:

- clear permission boundaries
- deterministic state transitions
- strong auditability
- explicit data modeling
- maintainable code as features expand

A modular monolith is a strong fit because it keeps the project simple to deploy while still being easy to scale in code organization.

### Writing and design approach

This project follows a **Controller–Service–Repository style layered backend architecture**.

In practical terms:

- controllers receive requests and return responses
- services contain workflow rules and business decisions
- repositories/entities persist and read relational data

This is conceptually close to MVC in responsibility separation, but for NestJS backend projects the most accurate description is:

> **a modular, layered backend architecture with domain-oriented modules and service-centered business logic**

This approach was chosen because it makes the codebase easier to test, easier to review, and easier to extend without introducing unnecessary early microservice complexity.

---

## Module Structure

```bash
src/
  common/
    decorators/
    enums/
    guards/

  modules/
    users/
    claims/
    email/

  database/
    migrations/
    data-source.ts

  seed.ts
  main.ts
  app.module.ts
```

### Module Responsibilities

#### `users`

Handles:

- registration
- login
- profile information
- JWT user resolution
- email verification token flow
- forgot/reset password
- admin user management

#### `claims`

Handles:

- claim CRUD
- state transitions
- history records
- comments
- attachments
- claim status master data

#### `email`

Handles:

- email verification emails
- password reset emails
- claim status notifications
- system update broadcasts

#### `common`

Contains shared building blocks such as:

- guards
- decorators
- enums
- cross-module helper patterns

---

## Database Design

The application uses a **relational PostgreSQL schema** with explicit relations between core entities.

### Key relational entities

- `users`
- `roles`
- `user_roles`
- `user_tokens`
- `claims`
- `claim_statuses`
- `claim_status_histories`
- `claim_comments`
- `claim_attachments`
- `idempotency_keys`

### Relationship principles

- a user can have one or more assigned roles
- a claim belongs to one claimant
- a claim has one current status
- a claim can have many histories, comments, and attachments
- each workflow action records the acting user and role

This structure keeps business state explicit and auditable, which is important for insurance and approval systems.

---

## ORM Usage

This project uses **TypeORM** as the ORM layer.

### Why TypeORM was selected

- strong integration with NestJS
- entity-driven schema modeling
- repository pattern support
- migration support
- PostgreSQL compatibility
- practical balance between development speed and maintainability

### How it is used in this project

- entities define the relational model
- repositories are injected into services
- migrations are used to manage schema evolution
- `synchronize: false` is used for safer environment parity

This aligns with the technical assessment requirement to use a proper ORM and to keep the data model clear and maintainable.

---

## Security Approach

This project includes the following core security measures:

### Authentication

- JWT-based authentication for protected routes
- password hashing using bcrypt
- email verification support
- reset-password tokens with expiration and used-state checks

### Authorization

- role-based access control with guards
- owner scope checks for user-owned claims, comments, and attachments
- reviewer and approver separation across workflow stages
- superadmin override only where intended

### Input Validation

- DTO-based validation using class-validator
- request payload constraints for auth, claims, comments, attachments, and admin operations
- file extension, MIME type, and size restriction for attachments

### Data Handling

- explicit identity fields for insurance users
- structured audit history for claim transitions
- no direct unrestricted status mutation outside the workflow endpoints

### Recommended future security upgrades

- rate limiting
- refresh tokens
- field-level encryption for highly sensitive identity data
- object storage with signed URLs for attachments
- structured audit logs for admin actions

---

## Quality and Engineering Standards

The codebase is written to meet common backend quality expectations in a technical assessment and in a maintainable team environment.

### Code Quality Characteristics

- modular folder structure
- strong TypeScript usage
- DTO validation
- clear role boundaries
- service-oriented workflow logic
- readable endpoint naming
- repository-backed persistence
- environment-driven configuration

### Maintainability Characteristics

- modules are business-scoped
- responsibilities are separated cleanly
- migration-first database changes reduce hidden schema drift
- seeder commands support repeatable local setup
- Dockerized deployment path reduces machine-specific issues

### Best Practice Highlights

- layered architecture
- migration-based schema control
- unit testing for core logic
- route protection through guards
- claim workflow enforced through controlled service methods

---

## Testing Summary

The project already includes a working unit test suite.

### Current Test Result

```text
Test Suites: 10 passed, 10 total
Tests:       40 passed, 40 total
Snapshots:   0 total
Time:        5.978 s
```

### Current Coverage Snapshot

| Metric     | Coverage |
| ---------- | -------: |
| Statements |   35.36% |
| Branches   |   38.08% |
| Functions  |   22.95% |
| Lines      |   34.90% |

### Coverage Interpretation

The current suite gives meaningful confidence around:

- authentication flow
- role guards
- claim service rules
- comment and attachment ownership behavior
- email service behavior
- selected module-level service logic

Coverage can still be improved for:

- controllers
- migration-level behavior
- bootstrap/config files
- additional negative-path workflow tests

That said, the current tests already provide a strong foundation for regression safety on the business-critical flows.

---

## API and Workflow Summary

### Claimant Flow

1. Register account
2. Verify email
3. Log in
4. Create claim draft
5. Add supporting attachments and comments
6. Submit claim
7. Track status and history

### Reviewer Flow

1. Log in
2. View submitted claims queue
3. Inspect claim details and attachments
4. Add review notes if needed
5. Mark claim as reviewed

### Approver Flow

1. Log in
2. View reviewed claims queue
3. Inspect claim details and review notes
4. Approve or reject claim
5. Claim owner receives email notification

### Superadmin Flow

1. Log in
2. Manage users and roles
3. Manage claim status master data
4. Monitor and inspect platform data
5. Broadcast system-wide information

---

## Installation

### Requirements

- Node.js 20+
- PostgreSQL 14+
- npm

### 1. Install dependencies

```bash
npm install
```

### 2. Create environment file

Create a `.env` file in the project root.

```env
PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=insurance_approval

JWT_SECRET=supersecretjwtkey

MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your_email@gmail.com
MAIL_PASS=your_app_password
MAIL_FROM="Insurance Approval <your_email@gmail.com>"

APP_BASE_URL=http://localhost:8100
API_BASE_URL=http://localhost:3000
```

### 3. Run database migrations

```bash
npm run migration:run
```

### 4. Seed development data

```bash
npm run seed:run
```

### 5. Start development server

```bash
npm run start:dev
```

The API will usually be available at:

```text
http://localhost:3000
```

---

## Database Migration Commands

### Run migrations

```bash
npm run migration:run
```

### Revert last migration

```bash
npm run migration:revert
```

### Generate migration

```bash
npm run migration:generate
```

---

## Seeder Commands

### Run seed data

```bash
npm run seed:run
```

### Reset only seed data

```bash
npm run seed:reset
```

### Reset and seed again

```bash
npm run seed:restart
```

### Revert seed

```bash
npm run seed:revert
```

These commands are useful for consistent local setup, QA verification, and repeatable demo preparation.

---

## Running in Production Mode

### Build

```bash
npm run build
```

### Start

```bash
npm run start:prod
```

---

## Docker Deployment

### Build Docker image

```bash
docker build -t insurance-approval-api .
```

### Run container locally

```bash
docker run -p 3000:3000 --env-file .env insurance-approval-api
```

The Docker container is configured to run database migrations automatically before starting the application.

---

## Railway Deployment Notes

This project is suitable for deployment to Railway using Docker.

### Recommended deployment setup

- deploy the API as a Docker service
- use Railway PostgreSQL for the database
- configure environment variables in the Railway dashboard
- let the container run migrations at startup

### Important note on file attachments

The current local file upload implementation is useful for development, but **Railway local filesystem is not suitable for long-term production document persistence**.

For production-grade attachment handling, use object storage such as:

- AWS S3
- Cloudflare R2
- MinIO
- Google Cloud Storage

The API can remain on Railway while files are stored in durable external storage.

---

## Demo and Seeded Accounts

Default development seed examples may include:

- claimant user accounts
- verifier account
- approver account
- superadmin account
- sample claims in multiple workflow states

Use these seeded accounts and claims to verify the end-to-end flow quickly during technical review or demonstration.

---

## Engineering Notes

### What the implementation does well

- uses a suitable ORM
- models the relational database clearly
- applies authentication and access control
- supports modular maintenance
- includes a repeatable setup path
- includes automated tests
- supports deployment through Docker

### Where it can grow further

- object storage for file uploads
- Swagger/OpenAPI generation
- refresh token support
- queue-based email sending
- rate limiting
- structured logging and monitoring
- stronger encryption strategy for highly sensitive fields

---

## Conclusion

This backend is designed as a clean, modular, and practical insurance workflow API. It uses a maintainable NestJS structure, explicit relational modeling with PostgreSQL and TypeORM, role-based workflow control, unit-tested business logic, and a deployment path that is suitable for technical assessment and real product evolution.

It is intentionally written to be understandable during code review, extensible for future requirements, and safe enough to serve as a solid foundation for a regulated approval workflow domain.

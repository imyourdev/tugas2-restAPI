
import swaggerAutogen from 'swagger-autogen';

const doc = {
  info: {
    title: 'Review Kantin API',
    version: '1.0.0',
    description:
      'REST API Review Kantin dengan Zod Validation, JWT Authentication, dan Role-Based Authorization',
  },

  host: 'localhost:3000',
  schemes: ['http'],

  securityDefinitions: {
    bearerAuth: {
      type: 'apiKey',
      name: 'Authorization',
      in: 'header',
      description:
        'Masukkan Bearer diikuti spasi dan token JWT hasil login',
    },
  },

  definitions: {
    // POST /stalls dan PUT /stalls/:id
    // ownerId otomatis diambil dari JWT
    StallInput: {
      $name: 'Warung Baru',
      category: 'Nasi',
      location: 'Kantin FK',
      description: '',
    },

    // Model lama untuk POST /users (Tugas 2)
    UserInput: {
      $name: 'Nama Pengguna',
      $email: 'user@example.test',
      $passwordHash: 'hash-yang-sudah-dibuat-aplikasi',
      $role: 'customer',
    },

    // POST /auth/register
    RegisterInput: {
      $name: 'Budi Santoso',
      $email: 'budi@example.com',
      $password: 'Password123!',
    },

    // POST /auth/login
    LoginInput: {
      $email: 'budi@example.com',
      $password: 'Password123!',
    },

    // Model lama untuk menu (Tugas 2)
    MenuItemInput: {
      $stallId: 1,
      $name: 'Menu Baru',
      $price: 15000,
      isAvailable: true,
    },

    // Model lama untuk POST /reviews (Tugas 2)
    ReviewInput: {
      $stallId: 1,
      $userId: 12,
      $rating: 5,
      comment: 'Enak',
    },

    // POST /stalls/:id/reviews (Tugas 3)
    // userId dari JWT dan stallId dari URL
    StallReviewInput: {
      $rating: 5,
      comment: 'Makanannya enak',
    },

    LikeInput: {
      $reviewId: 1,
    },

    FlagStatusInput: {
      $status: 'resolved',
    },

    AuditLogInput: {
      $userId: 1,
      $action: 'UPDATE',
      $targetTable: 'FLAGS',
      $targetId: 1,
      metadata: '{"status":"resolved"}',
    },
  },
};

const outputFile = './swagger-output.json';
const endpointsFiles = ['./src/index.ts'];

swaggerAutogen()(outputFile, endpointsFiles, doc);

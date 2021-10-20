import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import * as forge from 'node-forge';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(404);
  });

  it('/api/message/transaction-key (POST)', () => {
    const keyPair = forge.pki.rsa.generateKeyPair(1024);
    const publicKeyPem = forge.pki.publicKeyToPem(keyPair.publicKey);

    return request(app.getHttpServer())
      .post('/')
      .send({ publicKey: publicKeyPem })
      .expect(200);
  });

  afterAll(async () => {
    await app.close();
  });
});

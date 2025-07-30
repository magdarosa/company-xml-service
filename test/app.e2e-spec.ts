import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('Companies API (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/companies/1 (GET) - should return company data', () => {
    return request(app.getHttpServer())
      .get('/companies/1')
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('name');
        expect(res.body).toHaveProperty('description');
        expect(typeof res.body.id).toBe('number');
        expect(typeof res.body.name).toBe('string');
        expect(typeof res.body.description).toBe('string');
      });
  });

  it('/companies/2 (GET) - should return company data', () => {
    return request(app.getHttpServer())
      .get('/companies/2')
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('name');
        expect(res.body).toHaveProperty('description');
      });
  });

  it('/companies/999 (GET) - should return 404 for non-existent company', () => {
    return request(app.getHttpServer())
      .get('/companies/999')
      .expect(404)
      .expect((res) => {
        expect(res.body).toHaveProperty('error');
        expect(res.body).toHaveProperty('error_description');
        expect(res.body.error).toBe('Not Found');
      });
  });

  it('/companies/invalid (GET) - should return 400 for invalid ID', () => {
    return request(app.getHttpServer()).get('/companies/invalid').expect(400);
  });
});

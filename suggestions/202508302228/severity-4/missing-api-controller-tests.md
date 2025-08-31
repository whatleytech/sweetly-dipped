# Missing API Controller Tests

**Severity:** 4  
**File:** `packages/api/src/controllers/form-data-controller.ts`

## Problem

The API controllers contain critical business logic but lack comprehensive test coverage. The form-data-controller.ts file has no corresponding test file, violating the project's testing standards.

```typescript
// packages/api/src/controllers/form-data-controller.ts
// No corresponding test file exists
```

## Why It's Problematic

- API controllers contain critical business logic without test coverage
- No validation of request/response handling edge cases
- Risk of regressions when modifying controller logic
- Violates the project's testing standards requiring 80% coverage for API layers
- Missing validation of error handling paths
- No integration testing of API endpoints

## Suggested Fix

Create comprehensive test files for all API controllers:

```typescript
// packages/api/src/controllers/form-data-controller.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../api';
import { formDataStore } from './form-data-controller';

describe('Form Data Controller', () => {
  beforeEach(() => {
    // Clear in-memory store before each test
    formDataStore.clear();
  });

  describe('POST /api/form-data', () => {
    it('creates new form data successfully', async () => {
      const formData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '123-456-7890',
        communicationMethod: 'email',
        packageType: 'medium',
        riceKrispies: 2,
        oreos: 1,
        pretzels: 0,
        marshmallows: 1,
        colorScheme: 'Blue',
        eventType: 'Birthday',
        theme: 'Superhero',
        additionalDesigns: '',
        pickupDate: '2025-01-15',
        pickupTime: '2:00 PM',
        rushOrder: false,
        referralSource: 'Social Media',
        termsAccepted: true,
        visitedSteps: ['lead', 'communication']
      };

      const response = await request(app)
        .post('/api/form-data')
        .send({
          formData,
          currentStep: 0
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.formData.firstName).toBe('John');
      expect(response.body.currentStep).toBe(0);
      expect(response.body.formData.visitedSteps).toEqual(['lead', 'communication']);
    });

    it('returns 400 when form data is missing', async () => {
      const response = await request(app)
        .post('/api/form-data')
        .send({ currentStep: 0 })
        .expect(400);

      expect(response.body.error).toBe('Form data is required');
    });

    it('handles malformed visitedSteps gracefully', async () => {
      const formData = {
        firstName: 'John',
        lastName: 'Doe',
        visitedSteps: null // Invalid value
      };

      const response = await request(app)
        .post('/api/form-data')
        .send({ formData })
        .expect(201);

      expect(response.body.formData.visitedSteps).toEqual(['lead']);
    });
  });

  describe('GET /api/form-data/:id', () => {
    it('retrieves existing form data', async () => {
      // First create form data
      const createResponse = await request(app)
        .post('/api/form-data')
        .send({
          formData: { firstName: 'Jane', lastName: 'Doe' }
        });

      const formId = createResponse.body.id;

      // Then retrieve it
      const response = await request(app)
        .get(`/api/form-data/${formId}`)
        .expect(200);

      expect(response.body.formData.firstName).toBe('Jane');
      expect(response.body.id).toBe(formId);
    });

    it('returns 404 for non-existent form data', async () => {
      await request(app)
        .get('/api/form-data/nonexistent')
        .expect(404);
    });
  });

  describe('PUT /api/form-data/:id', () => {
    it('updates existing form data', async () => {
      // First create form data
      const createResponse = await request(app)
        .post('/api/form-data')
        .send({
          formData: { firstName: 'John', lastName: 'Doe' }
        });

      const formId = createResponse.body.id;

      // Then update it
      const response = await request(app)
        .put(`/api/form-data/${formId}`)
        .send({
          formData: { firstName: 'Jane', lastName: 'Doe' },
          currentStep: 2
        })
        .expect(200);

      expect(response.body.formData.firstName).toBe('Jane');
      expect(response.body.currentStep).toBe(2);
    });

    it('returns 404 when updating non-existent form data', async () => {
      await request(app)
        .put('/api/form-data/nonexistent')
        .send({
          formData: { firstName: 'Jane' }
        })
        .expect(404);
    });
  });

  describe('DELETE /api/form-data/:id', () => {
    it('deletes existing form data', async () => {
      // First create form data
      const createResponse = await request(app)
        .post('/api/form-data')
        .send({
          formData: { firstName: 'John', lastName: 'Doe' }
        });

      const formId = createResponse.body.id;

      // Then delete it
      await request(app)
        .delete(`/api/form-data/${formId}`)
        .expect(204);

      // Verify it's deleted
      await request(app)
        .get(`/api/form-data/${formId}`)
        .expect(404);
    });

    it('returns 404 when deleting non-existent form data', async () => {
      await request(app)
        .delete('/api/form-data/nonexistent')
        .expect(404);
    });
  });

  describe('GET /api/form-data', () => {
    it('lists all form data', async () => {
      // Create multiple form data entries
      await request(app)
        .post('/api/form-data')
        .send({
          formData: { firstName: 'John', lastName: 'Doe' }
        });

      await request(app)
        .post('/api/form-data')
        .send({
          formData: { firstName: 'Jane', lastName: 'Smith' }
        });

      const response = await request(app)
        .get('/api/form-data')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
      expect(response.body[0].formData.firstName).toBe('John');
      expect(response.body[1].formData.firstName).toBe('Jane');
    });
  });
});
```

## Why This Helps

- Ensures API endpoints work correctly under various conditions
- Validates error handling and edge cases
- Provides confidence when refactoring controller logic
- Maintains the project's testing standards
- Catches regressions early in development
- Documents expected API behavior
- Enables safe refactoring and feature additions

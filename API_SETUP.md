# API Setup Documentation

## Overview

The application has been migrated from localStorage to a backend API for form data persistence. This provides better data management, persistence across sessions, and a foundation for future enhancements.

## Architecture

### Backend API
- **Location**: `server/` directory
- **Framework**: Express.js with TypeScript
- **Storage**: In-memory (Map-based storage)
- **Port**: 3001

### Frontend Integration
- **State Management**: React Query (@tanstack/react-query)
- **API Client**: `src/api/formDataApi.ts`
- **Custom Hook**: `src/hooks/useFormData.ts`

## API Endpoints

### Base URL: `http://localhost:3001/api`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check endpoint |
| POST | `/order/number` | Generate a new order number |
| POST | `/form-data` | Create new form data |
| GET | `/form-data/:id` | Get form data by ID |
| PUT | `/form-data/:id` | Update form data |
| DELETE | `/form-data/:id` | Delete form data |
| GET | `/form-data` | List all form data (debug) |

## Running the Application

### Development Mode

1. **Start API Server**:
   ```bash
   yarn dev:api
   ```

2. **Start Frontend** (in separate terminal):
   ```bash
   yarn dev
   ```

3. **Start Both Simultaneously**:
   ```bash
   yarn dev:full
   ```

### API Health Check

Verify the API is running:
```bash
curl http://localhost:3001/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-01-15T10:00:00Z"
}
```

## Data Flow

1. **Form Initialization**: When a user starts the form, a new form entry is created via POST `/form-data`
2. **Form Updates**: As users fill out the form, data is updated via PUT `/form-data/:id`
3. **Step Navigation**: Current step is tracked and persisted with each update
4. **Order Submission**: Order number is generated and stored when form is submitted
5. **Data Cleanup**: Form data is deleted when user returns to home from thank you page

## Migration from localStorage

### What Changed
- **DesignPackagePage**: Now uses `useFormData` hook instead of direct localStorage
- **ConfirmationPage**: Loads data from API instead of localStorage
- **ThankYouPage**: Displays order confirmation from API data
- **Form ID Storage**: Only the form ID is stored in localStorage (`sweetly-dipped-form-id`)

### Backward Compatibility
- The application gracefully handles missing form data by redirecting to the form start
- Error states are properly handled with user-friendly messages
- Loading states provide feedback during API operations

## Testing

### API Tests
```bash
yarn test src/api/formDataApi.test.ts
```

### Hook Tests (Note: JSX issue to be resolved)
```bash
yarn test src/hooks/useFormData.test.ts
```

## Future Enhancements

1. **Database Integration**: Replace in-memory storage with PostgreSQL/MongoDB
2. **Authentication**: Add user accounts and form ownership
3. **Form Versioning**: Track form changes and allow draft saving
4. **Email Notifications**: Send confirmation emails when orders are submitted
5. **Admin Dashboard**: View and manage all submitted orders
6. **File Uploads**: Support image uploads for custom designs

## Troubleshooting

### API Server Not Starting
- Check if port 3001 is available
- Verify all dependencies are installed: `yarn install`
- Check for TypeScript compilation errors

### Frontend Not Connecting to API
- Ensure API server is running on port 3001
- Check browser console for CORS errors
- Verify API base URL in `src/api/formDataApi.ts`

### Form Data Not Persisting
- Check browser localStorage for form ID
- Verify API endpoints are responding correctly
- Check React Query DevTools for query states

## Development Notes

- The API uses CORS middleware to allow frontend connections
- Form data includes Set serialization/deserialization for `visitedSteps`
- React Query provides automatic caching and background refetching
- Error boundaries handle API failures gracefully

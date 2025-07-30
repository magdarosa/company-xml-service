# 🏢 Companies XML Service

Hey there! 👋 This is a NestJS application that transforms XML company data into beautiful JSON format. Built with love for the MWNZ technical assessment! ✨


## 🚀 What This App Does


1. **Receives HTTP requests** for company data by ID
2. **Fetches XML data** from the backend service  
3. **Transforms XML to shiny JSON** 
4. **Handles errors** with HTTP status codes
5. **Includes tests** for both success and error scenarios - caring about quality! 🧪

## 📚 API Specification

### GET /companies/{id}

**Request:**
```http
GET /companies/1
```

**Success Response (200):**
```json
{
  "id": 1,
  "name": "MWNZ",
  "description": "..is awesome"
}
```

**Error Responses:**

**404 Not Found** – When the company ID doesn’t exist:
```json
{
  "error": "Not Found", 
  "error_description": "Company with ID 99 not found"
}
```

**503 Service Unavailable** – When the XML service is unreachable or returns invalid data:
```json
{
  "error": "Service Unavailable",
  "error_description": "Unable to retrieve company data from XML service"
}
```

## 🏃‍♂️ Let's Get You Started!

### Option 1: Docker 🐳 (Recommended - Super easy - No Node.js Required)

**Prerequisites:**
- Docker
- Docker Compose (usually included with Docker)

**Run with Docker:**
```bash
# Clone the repository
git clone 
cd company-xml-service

# Install dependencies first
npm install

# Start with Docker Compose
docker-compose up --build -d

# Verify service is running
docker-compose ps
docker-compose logs

# Test endpoints
curl http://localhost:3000/companies/1
curl http://localhost:3000/companies/2
curl http://localhost:3000/companies/999

# Stop environment
docker-compose down

# OR build and run manually
docker build -t company-xml-service .
docker run -p 3000:3000 company-xml-service
```

### Option 2: Local Development 💻

**Prerequisites:**
- Node.js 18+
- npm


**Installation & Running:**
```bash
# Install dependencies
npm install

# Run in development mode
npm run start:dev

# Build and run in production mode  
npm run build
npm run start:prod
```

**Both options will start the application on `http://localhost:3000`** 🎊 

## 📚 API Documentation
After starting the app, interactive Swagger documentation is available at: `http://localhost:3000/api`


## 🧪 Testing


### Docker Testing 🐳
```bash
# Run tests in Docker environment
docker-compose up --build -d
docker-compose exec company-api npm run test

# Run tests with coverage in Docker
docker-compose exec company-api npm run test:cov

# Run end-to-end tests in Docker
docker-compose exec company-api npm run test:e2e

# Stop environment after testing
docker-compose down
```

### Local Testing
```bash
# Run all tests
npm run test

# Run tests with coverage
npm run test:cov

# Run tests in watch mode
npm run test:watch
```


### Test Coverage
The application includes tests for:
- ✅ **Green Path**: Successful XML fetching and transformation (IDs 1, 2) 
- ✅ **Red Path**: 404 errors, network failures, malformed XML
- ✅ **Edge Cases**: Missing fields, empty responses


## Project Structure

```
src/
├── companies/
│   ├── dto/                    # Data transfer objects
│   │   ├── company.dto.ts      # Company response format
│   │   └── error.dto.ts        # Error response format
│   ├── types/                  # Type definitions
│   │   └── xml.types.ts        # XML parsing interfaces
│   ├── companies.controller.ts # HTTP endpoint handler
│   ├── companies.service.ts    # XML fetching & transformation logic
│   ├── companies.module.ts     # NestJS module configuration
│   └── *.spec.ts              # Unit tests
├── utils/                      # Shared utilities
│   ├── field-parsers.ts        # XML field parsing functions
│   └── error-handler.ts        # HTTP error handling utilities
├── app.module.ts              # Root application module
└── main.ts                    # Application bootstrap
```

## 🛠️ Technical Approach

### 🧱 Framework Choice
- **NestJS**: Provides structure, dependency injection, and excellent TypeScript support
- **TypeScript**: Type safety for better development experience
- **Swagger**: Auto-generated API documentation

### 🐳 Containerization
- **Docker**: Multi-stage build for optimized production images
- **Docker Compose**: Makes it simple to start everything up locally or deploy the service with one easy command.


### 🚨 Error Handling Strategy
- **404 Not Found**: When the XML service returns 404 for a company ID
- **503 Service Unavailable**: When the XML service is unreachable or returns invalid data
- **500 Internal Server Error**: For unexpected errors (automatically handled by NestJS)

### 📦 Dependencies
- `@nestjs/axios`: HTTP client for fetching XML data
- `xml2js`: XML parsing library
- `@nestjs/swagger`: API documentation generation

## 💡 Technical Decisions - Why I Made These Choices

### Why NestJS?
- **Structure**: Super organized! Everything has its place as it provides clear separation of concerns with modules, controllers and services  
- **TypeScript First**: Excellent TypeScript support out of the box
- **Testing**: Built-in testing utilities for easy mocking
- **Documentation**: Swagger integration for automatic API documentation

### Testing Strategy 🧩 
- **Unit Tests**: Focus on testing the core business logic in isolation
- **Dependency Mocking**: Mock external HTTP calls
- **Edge Cases**: Test both happy path and error scenarios

---
---

👩‍💻 **By**: Magda

🏢  **Built for**: Middleware New Zealand Technical Assessment

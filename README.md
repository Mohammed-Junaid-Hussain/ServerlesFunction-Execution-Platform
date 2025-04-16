# Serverless Function Execution Platform

A platform for executing serverless functions with support for multiple virtualization technologies.

## Features

- Function metadata storage and management
- Multiple virtualization technologies support:
  - Docker containers
  - Firecracker MicroVMs (simulated)
- Function execution with timeout enforcement
- Comprehensive metrics collection and visualization
- Web-based management interface built with Streamlit
- Support for Python and JavaScript functions
- Real-time performance monitoring
- Environment variable support
- Auto-scaling capabilities (planned)

## Project Structure

```
.
├── src/
│   ├── api/           # Backend API server
│   │   ├── models/    # Database models
│   │   ├── routes/    # API routes
│   │   └── server.js  # Express server
│   ├── core/          # Core execution engine
│   ├── virtualization/ # Virtualization implementations
│   │   ├── docker.js
│   │   └── firecracker.js
│   ├── metrics/       # Metrics collection and storage
│   └── frontend/      # Streamlit web interface
├── tests/            # Test files
└── docs/            # Documentation
```

## Prerequisites

- Node.js 16 or later
- Python 3.9 or later
- MongoDB
- Docker
- (Optional) Firecracker

## Setup

1. Install Node.js dependencies:
```bash
npm install
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Start MongoDB:
```bash
mongod
```

5. Start the API server:
```bash
npm run dev
```

6. Start the frontend:
```bash
cd src/frontend
streamlit run app.py
```

## Development

- `npm run dev`: Start development server
- `npm test`: Run tests
- `npm run lint`: Run linter

## API Endpoints

### Functions
- `GET /api/functions`: List all functions
- `POST /api/functions`: Create a function
- `GET /api/functions/:id`: Get function details
- `PUT /api/functions/:id`: Update a function
- `DELETE /api/functions/:id`: Delete a function

### Executions
- `POST /api/executions/:functionId`: Execute a function
- `GET /api/executions/:functionId/history`: Get execution history

### Metrics
- `GET /api/metrics/system`: Get system-wide metrics
- `GET /api/metrics/functions/:functionId`: Get function-specific metrics

## Environment Variables

- `PORT`: API server port (default: 3000)
- `MONGODB_URI`: MongoDB connection string
- `MAX_EXECUTION_TIME`: Default function timeout in ms
- `MAX_MEMORY`: Default memory limit in MB

## License

MIT 
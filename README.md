# Serverless Function Execution Platform

A platform for executing serverless functions with support for multiple virtualization technologies.

## Features

- Function metadata storage and management
- Multiple virtualization technologies support (Docker, Firecracker)
- Function execution with timeout enforcement
- Metrics collection and visualization
- Web-based management interface

## Project Structure

```
.
├── src/
│   ├── api/           # Backend API server
│   ├── core/          # Core execution engine
│   ├── virtualization/ # Virtualization implementations
│   └── metrics/       # Metrics collection and storage
├── tests/            # Test files
└── docs/            # Documentation
```

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

3. Start the development server:
```bash
npm run dev
```

## Development

- `npm run dev`: Start development server
- `npm test`: Run tests
- `npm run lint`: Run linter

## License

MIT 
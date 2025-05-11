# Proof of Contribution

A tool for analyzing projects across different package ecosystems and calculating their "TEA Rank" - a metric that measures a project's influence and contribution value based on its dependency relationships.

## Overview

Proof of Contribution is a Node.js application that analyzes open-source packages from various package managers (npm, PyPI, Crates.io, RubyGems) to determine their contribution value within the ecosystem. It uses a TEA (Trust, Engagement, Authority) ranking algorithm that considers both direct and indirect dependent relationships.

Key features:
- Support for multiple package managers (npm, PyPI, Crates.io, RubyGems)
- Dynamic dependency graph building
- TEA Rank calculation based on project dependencies and dependents
- Spam detection to identify potential attack patterns
- RESTful API for easy integration

## Installation

```bash
# Clone the repository
git clone git@github.com:doyinDev1/proof-of-contribution.git
cd oss-tea-web33

# Install dependencies
npm install
```

## Configuration

No additional configuration is needed for basic usage. The application uses these default parameters:
- `kappa`: 0.15 (Self-influence parameter)
- `delta`: 7 (Time period for impact measurement)

You can modify these parameters in the constructor of the `ProofOfContribution` class if needed.

## Usage

### Starting the Server

```bash
npm start
```

The server will start on the default port (3000) unless specified otherwise by environment variables.

### API Endpoints

#### Analyze a Project

Request:
```bash
curl -X POST http://localhost:3000/analyze \
  -H "Content-Type: application/json" \
  -d '{"projectName": "your-project-name", "packageManager": "npm"}'
```

Response:
```json
{
  "status": "success",
  "data": {
    "name": "your-project-name",
    "teaRank": 65.23,
    "treeLimit": 3,
    "widthLimit": 42,
    "isSpam": false,
    "dependents": 42,
    "dependencies": 5
  }
}
```

### Supported Package Managers

The application currently supports the following package managers:

| Package Manager | Ecosystem |
|----------------|-----------|
| npm            | JavaScript/Node.js |
| pypi           | Python |
| crates         | Rust |
| rubygems       | Ruby |

## How It Works

### TEA Rank Algorithm

The TEA Rank is calculated based on:
1. Self-influence factor (kappa)
2. Influence from dependents
3. Number of dependent projects

The algorithm runs multiple iterations to ensure convergence and then applies logarithmic compression to normalize scores between 0-100.

### Spam Detection

The system detects two potential attack vectors:
- Tree attacks: Excessive dependency depth
- Width attacks: Unusual number of direct dependents

Projects that exceed defined thresholds are flagged as potential spam.

## Project Structure

```
├── models/
│   └── Project.js         # Project model definition
├── services/
│   ├── PackageManagerService.js  # Service for interacting with package registries
│   └── ProofOfContribution.js    # Core algorithm implementation
├── routes/
│   └── api.js             # API route definitions
├── app.js                 # Express application setup
└── server.js              # Server entry point
```

## Error Handling

The application implements robust error handling for:
- Unsupported package managers
- Failed API requests
- Invalid project names
- Network issues

## Limitations

- Data is fetched in real-time and not cached
- Analysis of very large dependency graphs may be time-consuming
- Rate limiting might affect results from certain package managers

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

[MIT](LICENSE)# proof-of-contribution

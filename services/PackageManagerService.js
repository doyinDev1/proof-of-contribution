const axios = require('axios');

class PackageManagerService {
  constructor() {
    this.supportedManagers = {
      npm: 'https://registry.npmjs.org',
      crates: 'https://crates.io/api/v1',
      pypi: 'https://pypi.org/pypi',
      rubygems: 'https://rubygems.org/api/v1'
    };
  }

  async fetchProjectData(packageManager, projectName) {
    if (!this.supportedManagers[packageManager]) {
      throw new Error(`Unsupported package manager: ${packageManager}`);
    }

    try {
      const baseUrl = this.supportedManagers[packageManager];
      console.log(`[DEBUG] Fetching project data from ${baseUrl}/${projectName}`);
      const response = await axios.get(`${baseUrl}/${projectName}`);
      console.log(`[DEBUG] Raw response for ${projectName}:`, response.data);
      return this.parseResponse(packageManager, response.data);
    } catch (error) {
      console.error(`Error fetching data for ${projectName} from ${packageManager}:`, error.message);
      return null;
    }
  }

  async fetchDependents(packageManager, projectName) {
    try {
      console.log(`[DEBUG] Fetching dependents for ${projectName} from ${packageManager}`);
      switch (packageManager) {
        case 'npm':
          // Use the npm registry API to get dependents
          const response = await axios.get(`https://registry.npmjs.org/-/v1/search?text=${projectName}&size=100`);
          console.log(`[DEBUG] Raw dependents response for ${projectName}:`, response.data);
          return response.data.objects.map(pkg => ({
            name: pkg.package.name,
            version: pkg.package.version,
            description: pkg.package.description
          }));

        case 'pypi':
          // Use PyPI's JSON API
          const pypiResponse = await axios.get(`https://pypi.org/pypi/${projectName}/json`);
          console.log(`[DEBUG] Raw dependents response for ${projectName}:`, pypiResponse.data);
          return pypiResponse.data.info.requires_dist || [];

        case 'crates':
          // Use crates.io API
          const cratesResponse = await axios.get(`https://crates.io/api/v1/crates/${projectName}`);
          console.log(`[DEBUG] Raw dependents response for ${projectName}:`, cratesResponse.data);
          return cratesResponse.data.versions || [];

        default:
          console.warn(`Dependent fetching not implemented for ${packageManager}`);
          return [];
      }
    } catch (error) {
      console.error(`Error fetching dependents for ${projectName}:`, error.message);
      return [];
    }
  }

  parseResponse(packageManager, data) {
    try {
      switch (packageManager) {
        case 'npm':
          return {
            name: data.name,
            version: data['dist-tags']?.latest,
            description: data.description,
            dependencies: data.versions?.[data['dist-tags']?.latest]?.dependencies || {},
            maintainers: data.maintainers || [],
            time: data.time || {}
          };

        case 'pypi':
          return {
            name: data.info.name,
            version: data.info.version,
            description: data.info.description,
            dependencies: data.info.requires_dist || [],
            maintainers: data.info.maintainers || []
          };

        case 'crates':
          return {
            name: data.crate.name,
            version: data.crate.max_version,
            description: data.crate.description,
            dependencies: data.crate.dependencies || [],
            maintainers: data.crate.owners || []
          };

        default:
          return data;
      }
    } catch (error) {
      console.error(`Error parsing response for ${packageManager}:`, error.message);
      return null;
    }
  }
}

module.exports = PackageManagerService;

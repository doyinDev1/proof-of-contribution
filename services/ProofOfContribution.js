const Project = require('../models/Project');
const PackageManagerService = require('./PackageManagerService');

class ProofOfContribution {
  constructor(kappa = 0.15, delta = 7) {
    this.kappa = kappa; // Self-influence parameter
    this.delta = delta; // Time period for impact measurement
    this.projects = new Map();
    this.packageManagerService = new PackageManagerService();
  }

  async addProject(name, packageManager) {
    if (this.projects.has(name)) {
      return this.projects.get(name);
    }

    console.log(`[DEBUG] Fetching project data for ${name} from ${packageManager}`);
    const projectData = await this.packageManagerService.fetchProjectData(packageManager, name);
    console.log(`[DEBUG] Project data for ${name}:`, projectData);
    if (!projectData) return null;

    const project = new Project(name, packageManager, projectData);
    this.projects.set(name, project);
    return project;
  }

  async buildDependencyGraph(projectName) {
    const project = this.projects.get(projectName);
    if (!project) return;

    // Fetch and add dependencies
    console.log(`[DEBUG] Fetching dependents for ${projectName}`);
    const dependencies = await this.packageManagerService.fetchDependents(project.packageManager, projectName);
    console.log(`[DEBUG] Dependents for ${projectName}:`, dependencies);
    for (const dep of dependencies) {
      const dependencyProject = await this.addProject(dep.name, project.packageManager);
      if (dependencyProject) {
        project.addDependency(dependencyProject);
        dependencyProject.addDependent(project);
      }
    }
  }

  calculateTeaRanks() {
    // Implement the teaRank calculation algorithm
    const projects = Array.from(this.projects.values());
    
    // Initial pass
    projects.forEach(project => {
      project.calculateTeaRank(this.kappa);
    });

    // Iterative refinement
    for (let i = 0; i < 10; i++) { // 10 iterations for convergence
      projects.forEach(project => {
        project.calculateTeaRank(this.kappa);
      });
    }

    // Apply compression
    this.compressTeaRanks(projects);
  }

  compressTeaRanks(projects) {
    // Apply logarithmic compression to reduce disparity
    const maxRank = Math.max(...projects.map(p => p.teaRank));
    const minRank = Math.min(...projects.map(p => p.teaRank));
    
    projects.forEach(project => {
      const normalizedRank = (project.teaRank - minRank) / (maxRank - minRank);
      project.teaRank = Math.log10(normalizedRank * 9 + 1) * 100; // Scale to 0-100
    });
  }

  detectSpam(project) {
    // Implement spam detection based on tree and width limits
    const treeAttackThreshold = 10; // Example threshold
    const widthAttackThreshold = 1000; // Example threshold

    if (project.treeLimit > treeAttackThreshold) {
      console.warn(`Potential tree attack detected for project: ${project.name}`);
      return true;
    }

    if (project.widthLimit > widthAttackThreshold) {
      console.warn(`Potential width attack detected for project: ${project.name}`);
      return true;
    }

    return false;
  }

  async analyzeProject(projectName, packageManager) {
    console.log(`[DEBUG] Analyzing project: ${projectName} (${packageManager})`);
    const project = await this.addProject(projectName, packageManager);
    if (!project) {
      console.log(`[DEBUG] Project not found: ${projectName}`);
      return null;
    }

    await this.buildDependencyGraph(projectName);
    this.calculateTeaRanks();

    const isSpam = this.detectSpam(project);
    if (isSpam) {
      console.warn(`Project ${projectName} flagged as potential spam`);
    }

    return {
      name: project.name,
      teaRank: project.teaRank,
      treeLimit: project.treeLimit,
      widthLimit: project.widthLimit,
      isSpam,
      dependents: project.dependents.size,
      dependencies: project.dependencies.size
    };
  }
}

module.exports = ProofOfContribution;

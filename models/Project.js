class Project {
    constructor(name, packageManager, metadata = {}) {
      this.name = name;
      this.packageManager = packageManager;
      this.metadata = metadata;
      this.dependents = new Set();
      this.dependencies = new Set();
      this.teaRank = 0;
      this.treeLimit = 0;
      this.widthLimit = 0;
      this.creationDate = new Date();
    }
  
    addDependent(project) {
      this.dependents.add(project);
      this.updateWidthLimit();
    }
  
    addDependency(project) {
      this.dependencies.add(project);
      this.updateTreeLimit();
    }
  
    updateWidthLimit() {
      this.widthLimit = this.dependents.size;
    }
  
    updateTreeLimit() {
      // Calculate the longest dependency path
      const visited = new Set();
      const maxDepth = this.calculateMaxDepth(visited);
      this.treeLimit = maxDepth;
    }
  
    calculateMaxDepth(visited, depth = 0) {
      if (visited.has(this)) return depth;
      visited.add(this);
  
      let maxDepth = depth;
      for (const dependency of this.dependencies) {
        const currentDepth = dependency.calculateMaxDepth(visited, depth + 1);
        maxDepth = Math.max(maxDepth, currentDepth);
      }
  
      return maxDepth;
    }
  
    calculateTeaRank(kappa = 0.15) {
      // Basic teaRank calculation using the formula from the documentation
      const selfInfluence = this.teaRank * kappa;
      const dependentInfluence = Array.from(this.dependents)
        .reduce((sum, dependent) => sum + (dependent.teaRank / dependent.dependents.size), 0) * (1 - kappa);
      
      this.teaRank = selfInfluence + dependentInfluence;
      return this.teaRank;
    }
  }
  
  module.exports = Project;
const express = require('express');
const ProofOfContribution = require('./services/ProofOfContribution');

const app = express();
app.use(express.json());

const poc = new ProofOfContribution();

// API endpoint to analyze a project
app.post('/analyze', async (req, res) => {
  try {
    const { projectName, packageManager } = req.body;
    
    if (!projectName || !packageManager) {
      return res.status(400).json({ error: 'Project name and package manager are required' });
    }

    const analysis = await poc.analyzeProject(projectName, packageManager);
    if (!analysis) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json(analysis);
  } catch (error) {
    console.error('Error analyzing project:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// API endpoint to get project details
app.get('/project/:name', (req, res) => {
  const project = poc.projects.get(req.params.name);
  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }
  res.json({
    name: project.name,
    teaRank: project.teaRank,
    dependents: project.dependents.size,
    dependencies: project.dependencies.size
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
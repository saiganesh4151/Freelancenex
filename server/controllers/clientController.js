import Project from '../models/Project.js';

import mongoose from 'mongoose';
import Client from '../models/client.js';








export const addProject = async (req, res) => {
    try {
        const { title, description, budget, deadline, requiredSkills, customSkills, client, category, experienceLevel } = req.body;

        console.log('Received project data:', req.body);

        // Validate required fields
        if (!title || !description || !budget || !deadline || !requiredSkills || !client || !category || !experienceLevel) {
            console.log('Missing required fields:', { title, description, budget, deadline, requiredSkills, client, category, experienceLevel });
            return res.status(400).json({ message: 'All fields are required', received: req.body });
        }

        // Validate that client ID is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(client)) {
            console.log('Invalid client ID format:', client);
            return res.status(400).json({ message: 'Invalid client ID format' });
        }

        // Check if client exists in database
        const Client = mongoose.model('Client');
        const clientExists = await Client.findById(client);
        if (!clientExists) {
            console.log('Client not found in database:', client);
            return res.status(400).json({ message: 'Client not found in database' });
        }

        console.log('Creating project with data:', {
            title,
            description,
            budget: Number(budget),
            deadline: new Date(deadline),
            requiredSkills,
            customSkills,
            client,
            category,
            experienceLevel
        });

        // Create a new project
        const newProject = new Project({
            title,
            description,
            budget: Number(budget),
            deadline: new Date(deadline),
            requiredSkills,
            customSkills: customSkills || [], // Default to empty array if not provided
            client,
            category,
            experienceLevel,
        });

        // Save the project to the database
        const savedProject = await newProject.save();
        console.log('Project saved successfully:', savedProject);
        res.status(201).json({ message: 'Project created successfully', project: savedProject });
    } catch (error) {
        console.error('Error in addProject:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


export const getProjectsByClientID = async (req, res) => {
    const clientId = req.params.id;
    try{
     
         const projects = await Project.find({ client: clientId });
         if (!projects || projects.length === 0) {
              return res.status(404).json({ message: 'No projects found for this client' });
         }
         res.status(200).json({ message: `Projects for client ID ${clientId} retrieved successfully`, projects });
    }catch (error) {
         res.status(500).json({ message: 'Server error', error: error.message });
    }
}

export const deleteProject = async (req, res) => {
    const projectId = req.params.id;
    try{
         const project = await Project.findByIdAndDelete(projectId);
         if (!project) {
              return res.status(404).json({ message: 'Project not found' });
         }
         res.status(200).json({ message: 'Project deleted successfully' });
    }catch (error) {
         res.status(500).json({ message: 'Server error', error: error.message });
    }
}

export const profileData = async (req, res) => {
    const clientId = req.params.id;
    try {
        const client = await Client.findById(clientId).select('-password -__v');
        console.log(client)
        if (!client) {
            return res.status(404).json({ message: 'Client profile not found' });
        }
        res.status(200).json({ message: 'Client profile retrieved successfully', client });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}

export const profileUpdate = async (req, res) => {
    const clientId = req.params.id;
    const updatedData = req.body;
    try {
        const updatedClient = await Client.findByIdAndUpdate(clientId, updatedData, { new: true , runValidators: true }).select('-password -__v');
        if (!updatedClient) {
            return res.status(404).json({ message: 'Client profile not found' });
        }
        res.status(200).json({ message: 'Client profile updated successfully', client: updatedClient });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}



router.get('/client/proposals', async (req, res) => {
  try {
    const clientId = req.query.clientId; // Expect clientId from query
    if (!clientId) return res.status(400).json({ message: 'clientId is required' });
    const proposals = await Proposal.find({ clientId }).sort({ submittedAt: -1 });
    res.json(proposals);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching proposals', error });
  }
});

router.put('/client/proposals/:id/accept', async (req, res) => {
  try {
    const clientId = req.body.clientId; // Expect clientId from body
    if (!clientId) return res.status(400).json({ message: 'clientId is required' });
    const proposal = await Proposal.findOneAndUpdate(
      { _id: req.params.id, clientId, status: 'pending' },
      { status: 'accepted' },
      { new: true }
    );
    if (!proposal) return res.status(404).json({ message: 'Proposal not found or already processed' });
    res.json(proposal);
  } catch (error) {
    res.status(500).json({ message: 'Error accepting proposal', error });
  }
});

router.put('/client/proposals/:id/decline', async (req, res) => {
  try {
    const clientId = req.body.clientId; // Expect clientId from body
    if (!clientId) return res.status(400).json({ message: 'clientId is required' });
    const proposal = await Proposal.findOneAndUpdate(
      { _id: req.params.id, clientId, status: 'pending' },
      { status: 'declined' },
      { new: true }
    );
    if (!proposal) return res.status(404).json({ message: 'Proposal not found or already processed' });
    res.json(proposal);
  } catch (error) {
    res.status(500).json({ message: 'Error declining proposal', error });
  }
});

export default router;


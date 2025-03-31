const express = require('express');
const router = express.Router();
const { Firestore } = require('@google-cloud/firestore');
const controlScraper = require('../services/controlScraper');
const multer = require('multer');

const firestore = new Firestore();
const upload = multer({ storage: multer.memoryStorage() });

// Get controls for a specific framework
router.get('/:framework', async (req, res) => {
  try {
    const { framework } = req.params;
    const controlsSnapshot = await firestore
      .collection('frameworks')
      .doc(framework)
      .collection('controls')
      .get();

    const controls = [];
    controlsSnapshot.forEach(doc => {
      controls.push({
        id: doc.id,
        ...doc.data()
      });
    });

    res.json(controls);
  } catch (error) {
    console.error('Error fetching controls:', error);
    res.status(500).json({ error: 'Failed to fetch controls' });
  }
});

// Get all frameworks and their metadata
router.get('/', async (req, res) => {
  try {
    const frameworksSnapshot = await firestore
      .collection('frameworks')
      .get();

    const frameworks = [];
    frameworksSnapshot.forEach(doc => {
      frameworks.push({
        id: doc.id,
        ...doc.data()
      });
    });

    res.json(frameworks);
  } catch (error) {
    console.error('Error fetching frameworks:', error);
    res.status(500).json({ error: 'Failed to fetch frameworks' });
  }
});

// Upload custom controls
router.post('/custom', upload.single('file'), async (req, res) => {
  try {
    const { file, body } = req;
    const { frameworkName } = body;

    if (!file || !frameworkName) {
      return res.status(400).json({ error: 'File and framework name are required' });
    }

    let controls = [];
    const fileContent = file.buffer.toString();

    // Parse file based on type
    if (file.mimetype === 'application/json') {
      controls = JSON.parse(fileContent);
    } else if (file.mimetype === 'text/csv') {
      controls = parseCSV(fileContent);
    } else {
      return res.status(400).json({ error: 'Unsupported file type' });
    }

    // Validate controls
    if (!validateControls(controls)) {
      return res.status(400).json({ error: 'Invalid control format' });
    }

    // Store in Firestore with custom framework identifier
    const frameworkId = `custom-${frameworkName.toLowerCase().replace(/\s+/g, '-')}`;
    await storeCustomControls(frameworkId, controls);

    res.json({
      message: 'Custom controls uploaded successfully',
      frameworkId,
      controlCount: controls.length
    });
  } catch (error) {
    console.error('Error uploading custom controls:', error);
    res.status(500).json({ error: 'Failed to upload custom controls' });
  }
});

// Helper functions
function validateControls(controls) {
  return controls.every(control => 
    control.id && 
    control.name && 
    control.description &&
    typeof control.id === 'string' &&
    typeof control.name === 'string' &&
    typeof control.description === 'string'
  );
}

async function storeCustomControls(frameworkId, controls) {
  const batch = firestore.batch();
  const frameworkRef = firestore.collection('frameworks').doc(frameworkId);
  const controlsRef = frameworkRef.collection('controls');

  // Update framework metadata
  batch.set(frameworkRef, {
    name: frameworkId,
    type: 'custom',
    lastUpdated: new Date().toISOString(),
    controlCount: controls.length
  });

  // Store each control
  controls.forEach(control => {
    const controlRef = controlsRef.doc(control.id);
    batch.set(controlRef, {
      ...control,
      framework: frameworkId,
      lastUpdated: new Date().toISOString()
    });
  });

  await batch.commit();
}

function parseCSV(content) {
  const lines = content.split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  
  return lines.slice(1)
    .filter(line => line.trim())
    .map(line => {
      const values = line.split(',').map(v => v.trim());
      return headers.reduce((obj, header, index) => {
        obj[header] = values[index] || '';
        return obj;
      }, {});
    });
}

module.exports = router; 
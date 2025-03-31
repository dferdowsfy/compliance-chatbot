const axios = require('axios');
const xlsx = require('xlsx');
const cheerio = require('cheerio');
const { Storage } = require('@google-cloud/storage');
const { Firestore } = require('@google-cloud/firestore');

class ControlScraperService {
  constructor() {
    this.firestore = new Firestore();
    this.storage = new Storage();
    this.sources = {
      'fedramp-moderate': {
        url: 'https://www.fedramp.gov/assets/resources/documents/FedRAMP_Moderate_Security_Controls.xlsx',
        type: 'xlsx',
        checkInterval: 24 * 60 * 60 * 1000, // 24 hours
      },
      'nist-800-53': {
        url: 'https://csrc.nist.gov/publications/detail/sp/800-53/rev-5/final',
        type: 'html',
        checkInterval: 24 * 60 * 60 * 1000,
      },
      'iso-27001': {
        url: 'https://www.iso.org/standard/27001',
        type: 'api',
        checkInterval: 24 * 60 * 60 * 1000,
      },
      // Add more framework sources
    };
  }

  async startMonitoring() {
    // Monitor each framework source
    Object.entries(this.sources).forEach(([framework, config]) => {
      this.monitorFramework(framework, config);
    });
  }

  async monitorFramework(framework, config) {
    const checkForUpdates = async () => {
      try {
        console.log(`Checking for updates: ${framework}`);
        const lastUpdate = await this.getLastUpdate(framework);
        const hasChanged = await this.checkForChanges(framework, config, lastUpdate);

        if (hasChanged) {
          console.log(`Updates found for ${framework}`);
          const controls = await this.scrapeControls(framework, config);
          await this.updateControls(framework, controls);
        }
      } catch (error) {
        console.error(`Error monitoring ${framework}:`, error);
      }
    };

    // Initial check
    await checkForUpdates();
    
    // Set up periodic checking
    setInterval(checkForUpdates, config.checkInterval);
  }

  async scrapeControls(framework, config) {
    switch (config.type) {
      case 'xlsx':
        return this.scrapeXLSX(config.url);
      case 'html':
        return this.scrapeHTML(config.url);
      case 'api':
        return this.scrapeAPI(config.url);
      default:
        throw new Error(`Unsupported source type: ${config.type}`);
    }
  }

  async scrapeXLSX(url) {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const workbook = xlsx.read(response.data);
    const controls = [];

    // Process each sheet
    workbook.SheetNames.forEach(sheetName => {
      const sheet = workbook.Sheets[sheetName];
      const data = xlsx.utils.sheet_to_json(sheet);

      data.forEach(row => {
        if (row.ControlID && row.Title) {
          controls.push({
            id: row.ControlID,
            name: row.Title,
            description: row.Description || '',
            family: row.Family || '',
            requirements: row.Requirements || '',
            guidance: row.Guidance || '',
            lastUpdated: new Date().toISOString(),
          });
        }
      });
    });

    return controls;
  }

  async scrapeHTML(url) {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    const controls = [];

    // Example HTML scraping (adjust selectors based on actual page structure)
    $('.control-item').each((i, elem) => {
      controls.push({
        id: $(elem).find('.control-id').text(),
        name: $(elem).find('.control-name').text(),
        description: $(elem).find('.control-description').text(),
        family: $(elem).find('.control-family').text(),
        lastUpdated: new Date().toISOString(),
      });
    });

    return controls;
  }

  async scrapeAPI(url) {
    // Implement API-specific scraping
    // This would vary based on the API structure
    const response = await axios.get(url);
    return response.data.controls;
  }

  async updateControls(framework, controls) {
    const batch = this.firestore.batch();
    const frameworkRef = this.firestore.collection('frameworks').doc(framework);
    const controlsRef = frameworkRef.collection('controls');

    // Update framework metadata
    batch.set(frameworkRef, {
      lastUpdated: new Date().toISOString(),
      controlCount: controls.length,
    });

    // Update controls
    controls.forEach(control => {
      const controlRef = controlsRef.doc(control.id);
      batch.set(controlRef, {
        ...control,
        framework,
        lastUpdated: new Date().toISOString(),
      });
    });

    await batch.commit();
  }

  async getLastUpdate(framework) {
    const doc = await this.firestore.collection('frameworks').doc(framework).get();
    return doc.exists ? doc.data().lastUpdated : null;
  }

  async checkForChanges(framework, config, lastUpdate) {
    try {
      const response = await axios.head(config.url);
      const lastModified = response.headers['last-modified'];
      
      if (!lastUpdate || new Date(lastModified) > new Date(lastUpdate)) {
        return true;
      }
      
      return false;
    } catch (error) {
      console.error(`Error checking for changes in ${framework}:`, error);
      return false;
    }
  }
}

module.exports = new ControlScraperService(); 
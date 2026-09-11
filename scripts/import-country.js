#!/usr/bin/env node

/**
 * GeoJSON Import Automation Script
 * 
 * This script automates the process of:
 * 1. Downloading administrative area data from DIVA-GIS
 * 2. Extracting ZIP files
 * 3. Converting shapefiles to GeoJSON
 * 4. Organizing files for the puzzle system
 * 
 * Usage:
 *   npm run import-country -- --country "United States" --level 1
 *   npm run import-country -- --zip path/to/file.zip --country "Canada"
 */

const fs = require('fs-extra');
const path = require('path');
const yauzl = require('yauzl');
const shapefile = require('shapefile');
const axios = require('axios');
const { promisify } = require('util');

// Configuration
const TEMP_DIR = path.join(__dirname, '../temp');
const OUTPUT_DIR = path.join(__dirname, '../public');
const DIVA_GIS_BASE_URL = 'https://biogeo.ucdavis.edu/data/diva/adm';

// Country name mapping for DIVA-GIS URLs
const COUNTRY_CODE_MAP = {
    'india': 'IND',
    'united states': 'USA',
    'canada': 'CAN',
    'australia': 'AUS',
    'brazil': 'BRA',
    'germany': 'DEU',
    'france': 'FRA',
    'spain': 'ESP',
    'italy': 'ITA',
    'united kingdom': 'GBR',
    'china': 'CHN',
    'japan': 'JPN',
    'mexico': 'MEX',
    'argentina': 'ARG',
    'south africa': 'ZAF',
    'russia': 'RUS',
    'indonesia': 'IDN',
    'turkey': 'TUR',
    'poland': 'POL',
    'netherlands': 'NLD',
    'belgium': 'BEL',
    'sweden': 'SWE',
    'norway': 'NOR',
    'denmark': 'DNK',
    'finland': 'FIN',
    'greece': 'GRC',
    'portugal': 'PRT',
    'czech republic': 'CZE',
    'romania': 'ROU',
    'hungary': 'HUN',
    'thailand': 'THA',
    'vietnam': 'VNM',
    'philippines': 'PHL',
    'malaysia': 'MYS',
    'singapore': 'SGP',
    'new zealand': 'NZL',
    'chile': 'CHL',
    'colombia': 'COL',
    'peru': 'PER',
    'venezuela': 'VEN',
    'ecuador': 'ECU',
    'bolivia': 'BOL',
    'paraguay': 'PRY',
    'uruguay': 'URY'
};

/**
 * Get country code from country name
 */
function getCountryCode(countryName) {
    const normalized = countryName.toLowerCase().trim();
    return COUNTRY_CODE_MAP[normalized] || null;
}

/**
 * Download file from URL
 */
async function downloadFile(url, outputPath) {
    console.log(`📥 Downloading from ${url}...`);
    const writer = fs.createWriteStream(outputPath);
    
    const response = await axios({
        url,
        method: 'GET',
        responseType: 'stream',
        timeout: 300000 // 5 minutes timeout
    });

    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
        writer.on('finish', () => {
            console.log(`✅ Download complete: ${outputPath}`);
            resolve();
        });
        writer.on('error', reject);
    });
}

/**
 * Extract ZIP file
 */
function extractZip(zipPath, outputDir) {
    return new Promise((resolve, reject) => {
        yauzl.open(zipPath, { lazyEntries: true }, (err, zipfile) => {
            if (err) return reject(err);

            zipfile.readEntry();
            const extractedFiles = [];

            zipfile.on('entry', (entry) => {
                if (/\/$/.test(entry.fileName)) {
                    // Directory entry
                    zipfile.readEntry();
                } else {
                    // File entry
                    zipfile.openReadStream(entry, (err, readStream) => {
                        if (err) return reject(err);

                        const filePath = path.join(outputDir, entry.fileName);
                        fs.ensureDirSync(path.dirname(filePath));

                        const writeStream = fs.createWriteStream(filePath);
                        readStream.pipe(writeStream);

                        writeStream.on('close', () => {
                            extractedFiles.push(filePath);
                            zipfile.readEntry();
                        });
                    });
                }
            });

            zipfile.on('end', () => {
                console.log(`✅ Extracted ${extractedFiles.length} files`);
                resolve(extractedFiles);
            });

            zipfile.on('error', reject);
        });
    });
}

/**
 * Convert shapefile to GeoJSON
 */
async function convertShapefileToGeoJSON(shpPath, outputPath) {
    console.log(`🔄 Converting ${path.basename(shpPath)} to GeoJSON...`);
    
    try {
        const source = await shapefile.open(shpPath);
        const features = [];
        
        let result = await source.read();
        while (!result.done) {
            features.push(result.value);
            result = await source.read();
        }

        const geoJson = {
            type: 'FeatureCollection',
            features: features
        };

        await fs.writeJson(outputPath, geoJson, { spaces: 2 });
        console.log(`✅ Converted to GeoJSON: ${path.basename(outputPath)}`);
        
        return geoJson;
    } catch (error) {
        console.error(`❌ Error converting ${shpPath}:`, error.message);
        throw error;
    }
}

/**
 * Find shapefile in directory
 */
function findShapefile(dir) {
    const files = fs.readdirSync(dir);
    const shpFile = files.find(f => f.endsWith('.shp'));
    if (!shpFile) {
        throw new Error('No .shp file found in extracted directory');
    }
    return path.join(dir, shpFile);
}

/**
 * Sanitize filename for puzzle system
 */
function sanitizeFilename(name) {
    return name
        .replace(/[^a-zA-Z0-9]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '');
}

/**
 * Process all shapefiles in a directory
 */
async function processShapefiles(extractedDir, countryName, adminLevel = 1) {
    const shapefilePath = findShapefile(extractedDir);
    const baseName = path.basename(shapefilePath, '.shp');
    
    console.log(`📊 Processing shapefile: ${baseName}`);
    
    // Read the shapefile to get feature names
    const source = await shapefile.open(shapefilePath);
    const features = [];
    
    let result = await source.read();
    while (!result.done) {
        features.push(result.value);
        result = await source.read();
    }

    // Determine the name field based on common patterns
    const nameFields = ['NAME_1', 'NAME_2', 'NAME', 'name', 'NAME_EN', 'VARNAME_1'];
    let nameField = null;
    
    if (features.length > 0) {
        const props = features[0].properties;
        nameField = nameFields.find(field => props[field]);
    }

    if (!nameField) {
        console.warn('⚠️  Could not find name field, using feature index');
    }

    // Convert each feature to a separate GeoJSON file
    const outputFiles = [];
    
    for (let i = 0; i < features.length; i++) {
        const feature = features[i];
        const featureName = nameField 
            ? feature.properties[nameField] 
            : `Region_${i + 1}`;
        
        const sanitizedName = sanitizeFilename(featureName);
        const outputFileName = `${sanitizedName}.geojson`;
        const outputPath = path.join(OUTPUT_DIR, outputFileName);

        const geoJson = {
            type: 'FeatureCollection',
            features: [feature]
        };

        await fs.writeJson(outputPath, geoJson, { spaces: 2 });
        outputFiles.push({
            originalName: featureName,
            fileName: outputFileName,
            path: outputPath
        });
        
        console.log(`  ✓ Created: ${outputFileName}`);
    }

    return outputFiles;
}

/**
 * Generate puzzle configuration
 */
function generatePuzzleConfig(countryName, files, center, zoom, bounds) {
    const countryKey = countryName.toLowerCase().replace(/\s+/g, '_');
    const emoji = getCountryEmoji(countryName);
    
    return {
        [countryKey]: {
            name: countryName,
            title: `${countryName} Puzzle`,
            emoji: emoji,
            files: files.map(f => f.fileName),
            center: center,
            zoom: zoom,
            bounds: bounds
        }
    };
}

/**
 * Get country emoji (simplified)
 */
function getCountryEmoji(countryName) {
    const emojiMap = {
        'india': '🇮🇳',
        'united states': '🇺🇸',
        'canada': '🇨🇦',
        'australia': '🇦🇺',
        'brazil': '🇧🇷',
        'germany': '🇩🇪',
        'france': '🇫🇷',
        'spain': '🇪🇸',
        'italy': '🇮🇹',
        'united kingdom': '🇬🇧',
        'china': '🇨🇳',
        'japan': '🇯🇵',
        'mexico': '🇲🇽'
    };
    return emojiMap[countryName.toLowerCase()] || '🗺️';
}

/**
 * Calculate map bounds from GeoJSON features
 */
function calculateBounds(files) {
    // This is a simplified calculation - you might want to load actual GeoJSON
    // For now, return a placeholder that should be updated manually
    return {
        latMin: 0,
        latMax: 90,
        lngLeft: [-180, -90],
        lngRight: [90, 180]
    };
}

/**
 * Main import function
 */
async function importCountry(options) {
    const { country, zipPath, level = 1, center, zoom } = options;

    try {
        // Ensure directories exist
        await fs.ensureDir(TEMP_DIR);
        await fs.ensureDir(OUTPUT_DIR);

        let zipFilePath;

        // Download or use provided ZIP
        if (zipPath) {
            if (!fs.existsSync(zipPath)) {
                throw new Error(`ZIP file not found: ${zipPath}`);
            }
            zipFilePath = zipPath;
            console.log(`📦 Using provided ZIP file: ${zipPath}`);
        } else if (country) {
            const countryCode = getCountryCode(country);
            if (!countryCode) {
                throw new Error(`Country code not found for: ${country}. Please provide ZIP file path instead.`);
            }

            const zipUrl = `${DIVA_GIS_BASE_URL}/${countryCode}_adm${level}.zip`;
            zipFilePath = path.join(TEMP_DIR, `${countryCode}_adm${level}.zip`);

            await downloadFile(zipUrl, zipFilePath);
        } else {
            throw new Error('Please provide either --country or --zip option');
        }

        // Extract ZIP
        console.log(`📂 Extracting ZIP file...`);
        const extractedDir = path.join(TEMP_DIR, `extracted_${Date.now()}`);
        await fs.ensureDir(extractedDir);
        await extractZip(zipFilePath, extractedDir);

        // Process shapefiles
        console.log(`🔄 Converting shapefiles to GeoJSON...`);
        const outputFiles = await processShapefiles(extractedDir, country || 'Unknown', level);

        // Generate configuration
        const config = generatePuzzleConfig(
            country || 'Unknown',
            outputFiles,
            center || [0, 0],
            zoom || 4,
            calculateBounds(outputFiles)
        );

        // Save configuration
        const configPath = path.join(__dirname, '../puzzle-config.json');
        let existingConfig = {};
        if (fs.existsSync(configPath)) {
            existingConfig = await fs.readJson(configPath);
        }
        
        Object.assign(existingConfig, config);
        await fs.writeJson(configPath, existingConfig, { spaces: 2 });

        console.log(`\n✅ Import complete!`);
        console.log(`📁 ${outputFiles.length} GeoJSON files created in ${OUTPUT_DIR}`);
        console.log(`⚙️  Configuration saved to ${configPath}`);
        console.log(`\n📝 Next steps:`);
        console.log(`   1. Review the generated files in ${OUTPUT_DIR}`);
        console.log(`   2. Update puzzle-config.json with correct center, zoom, and bounds`);
        console.log(`   3. Add the puzzle config to public/app.js PUZZLE_CONFIGS`);

        // Cleanup
        await fs.remove(TEMP_DIR);

    } catch (error) {
        console.error(`\n❌ Error: ${error.message}`);
        if (error.code === 'ETIMEDOUT' || error.code === 'ECONNREFUSED') {
            console.error(`\n💡 Tip: DIVA-GIS downloads may require manual download.`);
            console.error(`   1. Visit https://diva-gis.org/data.html`);
            console.error(`   2. Select your country and "Administrative areas"`);
            console.error(`   3. Download the ZIP file`);
            console.error(`   4. Run: npm run import-country -- --zip <path-to-zip> --country "${options.country || 'Your Country'}"`);
        }
        if (process.env.DEBUG) {
            console.error(error.stack);
        }
        process.exit(1);
    }
}

// Parse command line arguments
function parseArgs() {
    const args = process.argv.slice(2);
    const options = {};

    // Debug: log received arguments
    if (process.env.DEBUG) {
        console.log('Received arguments:', args);
    }

    // Handle positional arguments (fallback for when npm strips -- flags)
    // Format: [country, level] or [zipPath, country, level]
    if (args.length > 0 && !args[0].startsWith('--')) {
        // Check if first arg looks like a file path
        if (args[0].endsWith('.zip') || args[0].includes('\\') || args[0].includes('/')) {
            options.zipPath = args[0];
            if (args[1]) options.country = args[1];
            if (args[2]) options.level = parseInt(args[2]);
        } else {
            // Positional: country, level
            options.country = args[0];
            if (args[1]) options.level = parseInt(args[1]);
        }
    }

    // Parse named arguments (standard format)
    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--country' && args[i + 1]) {
            options.country = args[i + 1];
            i++;
        } else if (args[i] === '--zip' && args[i + 1]) {
            options.zipPath = args[i + 1];
            i++;
        } else if (args[i] === '--level' && args[i + 1]) {
            options.level = parseInt(args[i + 1]);
            i++;
        } else if (args[i] === '--center' && args[i + 1]) {
            const coords = args[i + 1].split(',');
            options.center = [parseFloat(coords[0]), parseFloat(coords[1])];
            i++;
        } else if (args[i] === '--zoom' && args[i + 1]) {
            options.zoom = parseInt(args[i + 1]);
            i++;
        } else if (args[i] === '--help' || args[i] === '-h') {
            console.log(`
Usage: npm run import-country -- [options]

Options:
  --country <name>     Country name (e.g., "United States", "Canada")
  --zip <path>         Path to ZIP file (alternative to --country)
  --level <number>     Administrative level (1=states/provinces, 2=counties, etc.) [default: 1]
  --center <lat,lng>   Map center coordinates (e.g., "40.0,-100.0")
  --zoom <number>      Initial zoom level [default: 4]
  --help, -h           Show this help message

Examples:
  npm run import-country -- --country "United States" --level 1
  npm run import-country -- --zip ./downloads/USA_adm1.zip --country "United States"
  npm run import-country -- --country "Canada" --level 1 --center "56.0,-96.0" --zoom 3

Alternative (if -- flags don't work):
  node scripts/import-country.js --country "United States" --level 1
  node scripts/import-country.js --zip ./USA_adm1.zip --country "United States"
            `);
            process.exit(0);
        }
    }

    // Set defaults
    if (!options.level) options.level = 1;

    return options;
}

// Run if called directly
if (require.main === module) {
    const options = parseArgs();
    importCountry(options);
}

module.exports = { importCountry, getCountryCode };

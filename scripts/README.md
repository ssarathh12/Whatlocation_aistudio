# GeoJSON Import Automation Scripts

This directory contains scripts to automate the process of downloading geographic data from DIVA-GIS and converting it to GeoJSON format for use in the puzzle game.

## Overview

The automation process:
1. **Downloads** administrative area data from [DIVA-GIS](https://diva-gis.org/data.html)
2. **Extracts** ZIP files containing shapefiles
3. **Converts** shapefiles (.shp) to GeoJSON format
4. **Organizes** files for the puzzle system
5. **Generates** puzzle configuration

## Prerequisites

Install dependencies:
```bash
npm install
```

## Usage

### Option 1: Download from DIVA-GIS (Automatic)

```bash
npm run import-country -- --country "United States" --level 1
```

### Option 2: Use Local ZIP File

If you've already downloaded the ZIP file from DIVA-GIS:

```bash
npm run import-country -- --zip ./downloads/USA_adm1.zip --country "United States"
```

### Options

- `--country <name>` - Country name (e.g., "United States", "Canada", "India")
- `--zip <path>` - Path to local ZIP file (alternative to --country)
- `--level <number>` - Administrative level:
  - `1` = States/Provinces (recommended for puzzles)
  - `2` = Counties/Districts
  - `3` = Municipalities
- `--center <lat,lng>` - Map center coordinates (optional)
- `--zoom <number>` - Initial zoom level (optional, default: 4)

## Examples

### Import USA States
```bash
npm run import-country -- --country "United States" --level 1 --center "39.5,-98.35" --zoom 4
```

### Import Canadian Provinces
```bash
npm run import-country -- --country "Canada" --level 1 --center "56.0,-96.0" --zoom 3
```

### Import from Local File
```bash
npm run import-country -- --zip ./my-downloads/BRA_adm1.zip --country "Brazil" --level 1
```

## Supported Countries

The script includes a mapping for common countries. If your country isn't listed, you can:

1. **Use the ZIP file option** - Download manually from DIVA-GIS and use `--zip`
2. **Add to COUNTRY_CODE_MAP** - Edit `scripts/import-country.js` and add your country

## Output

After running the script:

1. **GeoJSON files** are created in `public/` directory
2. **Configuration** is saved to `puzzle-config.json`
3. **Console output** shows progress and file names

## Next Steps After Import

1. **Review generated files** in `public/` directory
2. **Update puzzle-config.json** with correct:
   - Map center coordinates
   - Zoom level
   - Bounds (latMin, latMax, lngLeft, lngRight)
3. **Add to app.js** - Copy the config from `puzzle-config.json` to `public/app.js` in the `PUZZLE_CONFIGS` object
4. **Test the puzzle** - Start the server and try the new puzzle!

## Manual Process (Reference)

If you prefer to do it manually:

1. Visit https://diva-gis.org/data.html
2. Select country → Subject: "Administrative areas" → Format: "grd" (for DIVA-GIS)
3. Download the ZIP file
4. Extract the ZIP
5. Convert .shp files to GeoJSON using tools like:
   - [Mapshaper](https://mapshaper.org/)
   - [GDAL/OGR](https://gdal.org/)
   - [QGIS](https://qgis.org/)

## Troubleshooting

### "Country code not found"
- Use the `--zip` option with a manually downloaded file
- Or add your country to `COUNTRY_CODE_MAP` in the script

### "No .shp file found"
- Make sure the ZIP contains shapefiles
- Check that you selected "Administrative areas" on DIVA-GIS

### Download timeout
- Large files may take time to download
- Try downloading manually and using `--zip` option

### Conversion errors
- Ensure shapefiles are valid
- Check that all required shapefile components (.shp, .shx, .dbf) are present

## Notes

- The script automatically cleans up temporary files
- Generated GeoJSON files use sanitized names (spaces → underscores)
- Each administrative region becomes a separate GeoJSON file
- The script attempts to detect the name field automatically

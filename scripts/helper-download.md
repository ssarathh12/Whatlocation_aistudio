# Manual Download Helper Guide

Since DIVA-GIS may require form submissions or have dynamic URLs, here's how to manually download and use the automation script:

## Step-by-Step Manual Process

### 1. Download from DIVA-GIS

1. Visit https://diva-gis.org/data.html
2. Select your country from the dropdown
3. Select Subject: **"Administrative areas"**
4. Select Format: **"grd" (for DIVA-GIS)** - This gives you shapefiles
5. Click download
6. Save the ZIP file (e.g., `USA_adm1.zip`)

### 2. Use the Automation Script

Once you have the ZIP file, use the script:

```bash
npm run import-country -- --zip path/to/USA_adm1.zip --country "United States" --level 1
```

### 3. Alternative: Direct URL Download

If you know the direct download URL, you can also download it first:

```bash
# Example for USA (you'll need to find the actual URL)
curl -o temp/USA_adm1.zip "https://biogeo.ucdavis.edu/data/diva/adm/USA_adm1.zip"

# Then use the script
npm run import-country -- --zip temp/USA_adm1.zip --country "United States"
```

## Finding DIVA-GIS URLs

The URL pattern is typically:
```
https://biogeo.ucdavis.edu/data/diva/adm/{COUNTRY_CODE}_adm{LEVEL}.zip
```

Where:
- `COUNTRY_CODE` is the ISO 3166-1 alpha-3 code (e.g., USA, CAN, IND)
- `LEVEL` is the administrative level (1, 2, 3)

### Common Country Codes

- USA - United States
- CAN - Canada  
- AUS - Australia
- BRA - Brazil
- IND - India
- DEU - Germany
- FRA - France
- GBR - United Kingdom
- CHN - China
- JPN - Japan
- MEX - Mexico

## Quick Test

To test if a URL works:

```bash
# Test download (replace with actual URL)
curl -I "https://biogeo.ucdavis.edu/data/diva/adm/USA_adm1.zip"
```

If you get a `200 OK` response, the file exists and can be downloaded.

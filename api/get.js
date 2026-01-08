import { list, put } from '@vercel/blob';
import { GaiaClient } from '@amedia/gaia-client';

// Ikke ha dette her!
const colors = [
  {
    name: "Hoved",
    cetera: 'localcss.menu.background.color',
    css: 'newspaper',
  },
  {
    name: "Debatt",
    cetera: 'localcss.opinion.background.color',
    css: 'opinion',
  },
  {
    name: "Global",
    cetera: 'localcss.global.background.color',
    css: 'global',
  },
  {
    name: "Tilpasset 1",
    cetera: 'localcss.customOne.background.color',
    css: 'custom-one',
  },
  {
    name: "Tilpasset 2",
    cetera: 'localcss.customTwo.background.color',
    css: 'custom-two',
  },
  {
    name: "Tilpasset 3",
    cetera: 'localcss.customThree.background.color',
    css: 'custom-three',
  }
];

const siteConfigUrl = "https://varnish-local.api.no/gaia/api/public/v1/siteconfig?status=active"

const luma = (hex) => {
  if (!hex) {
    return null;
  }

  const c = hex.substring(1);
  const rgb = parseInt(c, 16);
  const r = (rgb >> 16) & 0xff;
  const g = (rgb >> 8) & 0xff;
  const b = (rgb >> 0) & 0xff;
  const max = 255;

  const lumaCo = r * 0.2126 + g * 0.7152 + b * 0.0722;
  return (lumaCo / max) * 100;
}

const exclude = [
  "Avisnavn DK",
  "Salsaposten",
  "Tangotidende",
  "Avisnavn",
  "iVerdal",
  "Finnmarken",
  "Finnmark Dagblad",
  "FreestyleFolkeblad",
  "MinMenuett",
  "Oslodebatten",
  "Polkaposten",
  "Rumbarapporten",
  "Vise"
]

const getSites = async () => {
  try {
    const getSites = await fetch(siteConfigUrl);
    const sites = await getSites.json();
    console.log("Got " + sites.length + " sites from siteconfig.")
    const filtered = sites
      .filter((site) => site.config.hasOwnProperty("theme") && !exclude.includes(site.name.full))
      .map(site => ({
        name: site.name.full,
        key: site.key,
        escenicKey: site.config?.escenic?.backendKey,
        url: site.domains.main,
        theme: site.config.theme
      }));
    console.log("Filtered out " + (sites.length - filtered.length) + " sites.")
    return filtered;
  } catch (error) {
    console.log(`Error fetchSites: ${error}`);
    return [];
  }
}

const getCSS = async (publications, fields = []) => {
  const gaiaClient = new GaiaClient('http://varnish-local.api.no/gaia');
  let delay = 0;
  const x = await Promise.all(publications.map((p, i) => {
    delay += 50;
    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        try {          
          console.log("Fetching CSS for:", p.url);
          const properties = await gaiaClient.getProperties(p.url, colors.map((color) => color.cetera));
          const exportedProperties = Object.entries(properties).flatMap(([key, value]) => {
            const fgValue = luma(value) < 50 ? 'white' : '#292827';
            const bgName = colors.find((color) => color.cetera === key)?.css;
            return [
              {
                [bgName]: value,
              },
              {
                [bgName + '-fg']: fgValue,
              },
            ];
          }).reduce((acc, curr) => {
            return {
              ...acc,
              ...curr,
            };
          }, {});
          resolve(exportedProperties);
        } catch (error) {
          console.error("Error fetching CSS for", p.url, error);
          resolve({});
        }
      }, delay);
    });
  }))
  .then(finished => {
    console.log("Finished:", finished.length)
    console.log("Finished items:", finished[0]);
    let pubs = publications.map((p,i) => {
      p.css = finished[i];
      return p;
    })
    let output = {
      updated: new Date().toISOString(),
      publications: pubs,
      filteredOut: exclude
    }
    return output;
  })
  return x;
}

export default async (req, res) => {

  /* SERVER */

  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST')
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version')

  // Enable cache
  res.setHeader('Cache-Control', 's-maxage=86400') // 24 hours

  const force = req.query.force === 'true';
  if (!force) {
    const { blobs } = await list();
    const saved = blobs.find(b => b.pathname === "publications.json");
    
    // If the file is less than 24 hours old, use the saved data
    if (saved && saved.uploadedAt > new Date().getTime() - 86_400_000) {
      const savedData = await fetch(saved.downloadUrl);
      const savedDataJson = await savedData.json();
      console.log("Using saved data")
      res.status(200).send(savedDataJson);
      return;
    }
  }

  console.log('Getting Gaia properties...');
  const fields = req.query.fields ? req.query.fields.split(",") : []

  let start = performance.now();
  const sites = await getSites()
  if (sites.length > 0) {
    const output = await getCSS(sites, fields)
    if (output) {
      console.log("Updated in", (performance.now() - start).toFixed(0), "ms")
      try {
        const blob = await put('publications.json', JSON.stringify(output), {
          access: 'public',
          allowOverwrite: true
        });
        console.log('Uploaded to blob storage:', blob.url);
      } catch (error) {
        console.error('Error uploading to blob storage:', error);
      }
      res.status(200).send(output);
    }
  }
  else
    res.status(500).send(`Error fetchSites: ${error}`);
}
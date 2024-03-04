const cssBaseUrl = "https://services.api.no/api/css-config/v1/css-publication-vars?json=true&publication="
const siteConfigUrl = "https://varnish-local.api.no/gaia/api/public/v1/siteconfig?status=active"

const exclude = [
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
  let delay = 0;
  const x = await Promise.all(publications.map((p, i) => {
    delay += 50;
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        fetch(cssBaseUrl + p.url)
          .then(res => {
            console.log("Parsing:", res.url, res.status);
            if (!res.ok) return resolve({});
            return res.json().then(resolve).catch(reject);
          })
          .catch(reject);
      }, delay);
    });
  }))
  .then(finished => {
    console.log("Finished:", finished.length)
    let pubs = publications.map((p,i) => {
      if (!fields.length) p.css = finished[i]
      else {
        p.css = {}
        for (const field of fields) {
          p.css[field] = finished[i][field]
        }
      }
      return p
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
  res.setHeader('Cache-Control', 's-maxage=259200') // 72 hours

  const fields = req.query.fields ? req.query.fields.split(",") : []

  let start = performance.now();
  const sites = await getSites()
  if (sites.length > 0) {
    const output = await getCSS(sites, fields)
    if (output) {
      console.log("Updated in", (performance.now() - start).toFixed(0), "ms")
      res.status(200).send(output);
    }
  }
  else
    res.status(500).send(`Error fetchSites: ${error}`);
}
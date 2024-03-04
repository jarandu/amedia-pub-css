const cssBaseUrl = "https://services.api.no/api/css-config/v1/css-publication-vars?json=true&publication="
const siteConfigUrl = "https://varnish-local.api.no/gaia/api/public/v1/siteconfig?status=active"

const getSites = async () => {
  try {
    const getSites = await fetch(siteConfigUrl);
    const sites = await getSites.json();
    const filtered = sites
      .filter((site) => site.config.theme !== undefined)
      .map(site => ({
        name: site.name.full,
        url: site.domains.main,
        theme: site.config.theme
      }));
    console.log("Got " + filtered.length + " sites from siteconfig.")
    return filtered;
  } catch (error) {
    console.log(`Error fetchSites: ${error}`);
    return [];
  }
}

const getCSS = async (publications) => {
  let delay = 0;
  Promise.all(publications.map((p, i) => {
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
    let pubs = publications.map((p,i) => {
      p.css = finished[i]
      return p
    })
    let output = {
      updated: new Date().toISOString(),
      publications: pubs
    }
    return output;
  })
}

export default async (req, res) => {
  const sites = await getSites()
  if (sites.length > 0) {
    const output = await getCSS(sites)
    if (output)
      res.status(200).json(output);
  }
  else
    res.status(500).send(`Error fetchSites: ${error}`);
}
export default async (req, res) => {
  try {
    const getSites = await fetch(
      'https://varnish-local.api.no/gaia/api/public/v1/siteconfig?status=active'
    );
    const sites = await getSites.json();
    const newList = sites
      .filter((site) => site.config.theme !== undefined)
      .map(site => ({
        URL: site.domains.main,
        Theme: site.config.theme
      }));
    console.log("Got " + newList.length + " sites from siteconfig.")
    let output = {
      updated: new Date().toISOString(),
      sites: newList
    }
    res.status(200).send(JSON.stringify(output));
  } catch (error) {
    console.log(`Error fetchSites: ${error}`);
    res.status(500).send(`Error fetchSites: ${error}`);
  }
}
<script>
  import css from "./assets/all.json"
  let merged = css.map(p => {
    let attributes = p.CSS.reduce((flat, obj) => {
      if (obj.name) flat[obj.name] = obj.value;
      return flat;
    }, {});
    return {
      Navn: p.Navn,
      URL: p.URL,
      ...attributes
    }
  }).sort((a,b) => a.Navn.localeCompare(b.Navn))
  const colorCheck = (obj, colorName) => {
    let color = obj[colorName]
    if (!color) return false
    return ![
      '#ffffff',
      'rgb(255,255,255)',
      'rgb(255, 255, 255)',
      obj["--newspaper-color"].toLowerCase()
    ].includes(color.toLowerCase())
  }
</script>

<div class="info"><div>i</div><div>Viser tilpassede farger, med mindre den er hvit eller lik hovedfargen.</div></div>
<div class="container">
  {#each merged as pub}
    <div class="pub" style="
    background: {pub["--newspaper-color"]}; 
    color: {pub["--newspaper-color-inverted"]};">
      <a href="https://{pub.URL}" target="_blank">
        <h2>{pub.Navn}</h2>
      </a>
      <span>{pub["--newspaper-color"].toLowerCase()}</span>
      <div class="aside">
        {#if colorCheck(pub, "--custom-background-color-one")}<div style="background: {pub["--custom-background-color-one"]}; color: {pub["--custom-background-color-one-front"]}">1</div>{/if}
        {#if colorCheck(pub, "--custom-background-color-two")}<div style="background: {pub["--custom-background-color-two"]}; color: {pub["--custom-background-color-two-front"]}">2</div>{/if}
      </div>
    </div>
  {/each}
</div>

<style>
  .info {
    padding: 1em;
    display: flex;
    gap: .5em;
    align-items: center;
  }
  .info div:first-child {
    display: inline-flex;
    font-size: .9em;
    font-weight: 500;
    justify-content: center;
    align-items: center;
    min-width: 1.2em;
    height: 1.2em;
    line-height: 1;
    border-radius: 50%;
    color: white;
    background-color: #333;
  }
  .container {
    display: flex;
    flex-wrap: wrap;
    gap: 1em;
    padding: 1em;
  }
  .pub {
    display: flex;
    position: relative;
    min-width: 160px;
    height: 100px;
    flex: 1;
    padding: 1em;
    border-radius: 3px;
    word-wrap: break-word;
    hyphens: auto;
  }
  a {
    text-decoration: none;
    color: inherit;
  }
  h2 {
    font-size: 1.2em;
    font-weight: 500;
    margin: 0 0 5px 0;
  }
  .aside {
    display: flex;
    gap: 5px;
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: 100%;
    justify-content: flex-end;
    align-items: flex-end;
    padding: 10px;
  }
  .aside div {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 2em;
    width: 2em;
    border-radius: 50%;
    border: 1px solid white;
    font-size: .8em;
    line-height: 1;
  }
  
</style>
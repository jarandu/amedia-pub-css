<script>
  import css from "./assets/all.json"
  import themes from "./assets/themes.json"
  let preventCopy

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

  let sorted = "name"

  const waysOfSorting = {
    name: function (a,b) {
      return a.Navn.localeCompare(b.Navn)
    },
    theme: function (a,b) {
      return a.Theme.localeCompare(b.Theme)
    }
  }

  $: merged = css.publications
    .filter(p => !exclude.includes(p.Navn))
    .map(p => {
      // let attributes = p.CSS.reduce((flat, obj) => {
      //   if (obj.name) flat[obj.name] = obj.value;
      //   return flat;
      // }, {});
      let theme = themes.sites.find(site => p.URL == site.URL).Theme
      return {
        Navn: p.Navn,
        URL: p.URL,
        Theme: theme,
        Attributes: p.CSS
      }
    })
    .sort(waysOfSorting[sorted])
  
  $: console.log(merged)
  
  const colorCheck = (obj, colorName) => {
    let color = obj[colorName]
    if (!color) return false
    return ![
      '#ffffff',
      'rgb(255,255,255)',
      'rgb(255, 255, 255)',
      obj["newspaper-color"].toLowerCase()
    ].includes(color.toLowerCase())
  }

  const copy = (event) => {
    let el = event.target
    let origValue = el.innerText
    navigator.clipboard.writeText(origValue)
    el.innerText = "Kopiert!"
    preventCopy = true
    el.classList.add("no-deco")
    setTimeout(() => { 
      preventCopy = false
      el.innerText = origValue 
      el.classList.remove("no-deco")
    }, 1500)
  }

  const getDate = (date) => {
    let d = new Date(date)
    return d.toLocaleString('nb-NO', { month: 'short', year: 'numeric', day: 'numeric' })
  }
  


</script>

<div class="info">
  <div>i</div>
  <div>{merged.length} publikasjoner i lista, sortert på <select bind:value={sorted}><option value="name">navn</option><option value="theme">tema</option></select>. Viser tilpassede farger, med mindre den er hvit eller lik hovedfargen. Tema oppdatert {getDate(themes.updated)}. CSS oppdatert {getDate(css.updated)}</div>
</div>
<div class="container">
  {#each merged as pub,i}
    {#if sorted == "theme" && (pub.Theme != merged[i-1]?.Theme || i == 0)}
    {@const count = merged.filter(p => p.Theme == pub.Theme).length}
    <div class=divider>{pub.Theme} ({count} publikasjon{count > 1 ? "er" : ""})</div>
    {/if}
    <div class="pub {pub.Theme}-theme" style="
    background: {pub.Attributes["newspaper-color"]}; 
    color: {pub.Attributes["newspaper-color-inverted"]};">
      <a href="https://{pub.URL}" target="_blank">
        <h2>{pub.Navn}</h2>
      </a>
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <span on:click={(e) => { if (!preventCopy) copy(e) }}>{pub.Attributes["newspaper-color"].toLowerCase()}</span>
      <div class="aside">
        {#if sorted != "theme"}<div style="background: transparent; border-style: dotted;">{pub.Theme.substring(0,1).toUpperCase()}</div>{/if}
        {#if colorCheck(pub.Attributes, "custom-background-color-one")}<div style="background: {pub.Attributes["custom-background-color-one"]}; color: {pub.Attributes["custom-background-color-one-front"]}">1</div>{/if}
        {#if colorCheck(pub.Attributes, "custom-background-color-two")}<div style="background: {pub.Attributes["custom-background-color-two"]}; color: {pub.Attributes["custom-background-color-two-front"]}">2</div>{/if}
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
  select {
    border: none;
    border-bottom: 1px solid black;
    font-size: inherit;
  }
  .container {
    display: flex;
    flex-wrap: wrap;
    gap: 1em;
    padding: 1em;
  }
  .divider {
    width: 100%;
    font-size: 1.6em;
    margin-top: 1em;
    font-weight: 500;
  }
  .pub {
    display: flex;
    flex-direction: column;
    gap: .1em;
    position: relative;
    min-width: 180px;
    max-width: 380px;
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
  a:hover {
    text-decoration: underline;
  }
  span {
    width: fit-content;
  }
  span:not(.no-deco):hover {
    cursor: pointer;
    background: white;
    color: black; 
  }
  h2 {
    font-size: 1.2em;
    margin: 0 0 5px 0;
    font-family: var(--article--fonts-title);
  }
  .aside {
    position: absolute;
    bottom: 0;
    right: 0;
    display: flex;
    gap: 5px;
    min-width: fit-content;
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
<script>
  import { onMount } from "svelte";

  let data
  let publications = []
  let preventCopy
  let sorted = "name"

  const waysOfSorting = {
    name: function (a,b) {
      return a.name.localeCompare(b.name)
    },
    theme: function (a,b) {
      return a.theme.localeCompare(b.theme)
    }
  }


  $: if (data) publications = data.publications.sort(waysOfSorting[sorted])
  
  const colorCheck = (obj, colorName) => {
    const rgbToHex = (r, g, b) => {
      r = r.toString(16);
      g = g.toString(16);
      b = b.toString(16);
      if (r.length == 1) r = "0" + r;
      if (g.length == 1) g = "0" + g;
      if (b.length == 1) b = "0" + b;
      return "#" + r + g + b;
    }
    let color = obj[colorName]
    if (!color) return false
    if (color.startsWith("rgb")) {
      let [r, g, b] = color.match(/\d+/g)
      color = rgbToHex(r, g, b)
    }
    return ![
      '#ffffff',
      '#dcd8d8',
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

  onMount(async () => {
    const fields = [
      "newspaper-color",
      "newspaper-color-inverted",
      "custom-background-color-one",
      "custom-background-color-one-front",
      "custom-background-color-two",
      "custom-background-color-two-front",
      "custom-background-color-three",
      "custom-background-color-three-front",
      "opinion-background-color",
      "opinion-color-front",
    ]
    const host = window.location.hostname == 'localhost' ? 'http://localhost:3000/' : './'
    const url = host + 'api/get?fields=' + fields.join(',')
    const res = await fetch(url)
    if (res.ok) data = await res.json()
  })

  $: console.log(publications)

</script>

{#if publications.length}
<div class="info">
  <div>i</div>
  <div>{publications.length} publikasjoner i lista, sortert på <select bind:value={sorted}><option value="name">navn</option><option value="theme">tema</option></select>. Viser tilpassede farger, med mindre den er a) hvit, b) default-grå, eller c) lik hovedfargen. Oppdatert {getDate(data.updated)}.</div>
</div>
<div class="container">
  {#each publications as pub,i}
    {#if sorted == "theme" && (pub.theme != publications[i-1]?.theme || i == 0)}
    {@const count = publications.filter(p => p.theme == pub.theme).length}
    <div class=divider>{pub.theme} ({count} publikasjon{count > 1 ? "er" : ""})</div>
    {/if}
    <div class="pub {pub.theme}-theme" style="background: {pub.css["newspaper-color"]}; color: {pub.css["newspaper-color-inverted"]};">
      <a href="https://{pub.url}" target="_blank">
        <h2>{pub.name}</h2>
      </a>
      {#if sorted != "theme"}{pub.theme.charAt(0).toUpperCase() + pub.theme.slice(1)}{/if}
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <span on:click={(e) => { if (!preventCopy) copy(e) }}>{pub.css["newspaper-color"].toLowerCase()}</span>
      <div class="aside">
        <div class:warning={!colorCheck(pub.css, "custom-background-color-one")} style="background: {pub.css["custom-background-color-one"]}; color: {pub.css["custom-background-color-one-front"]}">1</div>
        <div class:warning={!colorCheck(pub.css, "custom-background-color-two")} style="background: {pub.css["custom-background-color-two"]}; color: {pub.css["custom-background-color-two-front"]}">2</div>
        <div class:warning={!colorCheck(pub.css, "custom-background-color-three")} style="background: {pub.css["custom-background-color-three"]}; color: {pub.css["custom-background-color-three-front"]}">3</div>
        <div class:warning={!colorCheck(pub.css, "opinion-background-color")} style="background: {pub.css["opinion-background-color"]}; color: {pub.css["opinion-color-front"]}">O</div>
      </div>
    </div>
  {/each}
</div>
{:else}
  <div>Hei! Bare sitt i ro, du. Laster inn tema og css-variabler. Tar cirka 10 sek.</div>
  <div class="loading">
    <div></div>
  </div>
{/if}

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
    min-width: 280px;
    max-width: 100%;
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
    font-size: 1.25em;
    margin: 0 0 5px 0;
    font-family: var(--article--fonts-title);
  }
  .aside {
    position: absolute;
    top: 10px;
    right: 10px;
    display: flex;
    height: calc(100% - 20px);
    min-width: fit-content;
    justify-content: flex-end;
    align-items: flex-end;
    border-radius: 3px;
    overflow: hidden;
  }
  .aside div {
    display: flex;
    justify-content: center;
    align-items: flex-end;
    height: 100%;
    width: 2em;
    padding-bottom: 0.5em;
    font-size: .8em;
    line-height: 1;
    position: relative;
  }
  .aside div.warning::after {
    display: block;
    content: "";
    position: absolute;
    top: 4px;
    left: 4px;
    right: 4px;
    aspect-ratio: 1/1;
    background-size: contain;
    background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAACXBIWXMAAAsTAAALEwEAmpwYAAACnUlEQVR4nOWWS2gTQRzGv6RJE1OSQAwFGyltWjfNqxepULF68ZAeFDF66kGsWDxozbXWoxQtHtWKCrUaDRZFaQVrq94LetCCxUcLRqwPqKAV0hcZ+S87i3F3k127EcSBD2Z3Zr7fzH+ewD+WGgAcA3BUyv+VdATAKgAmaQXA4XJDYwCWd2/1sLnhsKhdrR6CLwGIlBP8eL2ngs3fjTL2qFkU5ekfgIlyQfdSaC8cD8hQrvPdAR72PWZDHQDeROucbOVhXAFeHY+z5qCTwDMAnGaCe2lE42eCCijXk7NBPuoes6ABAAv7tns1oVzJNi+BFwDUmAFOOystbDbdVBL87maYuRxWgg+tFdoKIH+yo7oklKu3o5rAeQDb/hRqBTAZ8NvZj/uxAvO315rY/h1eUTPXCyNBdakNgKeSh+HUSYvlxolaxaieXxL4QmJTVwRFebqnlpcfMAp1A5hrjbhYfkIZzldXQzL49VBIUU5t2uJVVP4JgMcIuN9qAZs816i5iDg4mwmr1nk2sImRB4DTeqF02yweavdpLqDPtyMy+MudiGa9zoSPn+OCHvCo22UVLwAtw28jURn8fSRWtIPeKvEcv1cKupPM+rs2FN0yy2NxtllYJ4ryxeqSl9TJhBbUBmCqoaaSLT4obmZES2NxJmx0EPglALsaOEU9Gz1Vp8uQ38d66pKnNOru36E+APOJFrcuI9rHtgoLs9ssqvtYTYkWN4G/AvD/Cr5IJtODyj2ppheXBRFqBDw9GBLrAxjg0EZ6Q6WSfkNz93E4IspIm1TSz6T3mvhApLjrnq+16MOtcMFcd9HHe40TyExlMzJYfJUGAeTat7jLCs9mwnyB5QDU83k+KP1gZVZO7caql0LQJx3sZqpP8pZH+v+ln3wCWQv5336jAAAAAElFTkSuQmCC");
  }

  .loading {
    border: 2px solid #333;
    padding: 2px;
  }
  .loading div {
    width: 0;
    height: 10px;
    background-color: rgb(9, 135, 224);
    animation: loading 100s;
  }
  @keyframes loading {
    0% { width: 0; }
    10% { width: 90%; }
    20% { width: 98%; }
    100% { width: 100%; }
  }
  
</style>
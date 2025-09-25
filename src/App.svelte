<script>
  import { onMount } from "svelte";
  import * as d3 from 'd3';
  import Buttons from "./Buttons.svelte";
  import Scales from "./Scales.svelte";
  import { getSection, getColorFamily, colorFields, addHueToPublications } from "./utils";
  import Maps from "./Maps.svelte";


  let data;
  let publications = [];
  let preventCopy;
  let sorted = "color";
  let section = getSection();

  const waysOfSorting = {
    name: function (a,b) {
      return a.name.localeCompare(b.name)
    },
    theme: function (a,b) {
      return a.theme.localeCompare(b.theme)
    },
    color: function (a,b) {
      const colorA = d3.hsl(a.css["newspaper-color"]);
      const colorB = d3.hsl(b.css["newspaper-color"]);
      
      // Håndter NaN hue-verdier (grå/svarte farger)
      const hueA = isNaN(colorA.h) ? 0 : colorA.h;
      const hueB = isNaN(colorB.h) ? 0 : colorB.h;
      
      // Først: sorter etter fargefamilie
      const familyA = getColorFamily(hueA, colorA.s, colorA.l);
      const familyB = getColorFamily(hueB, colorB.s, colorB.l);
      
      if (familyA !== familyB)
        return familyA - familyB;
      
      // Samme familie: sorter etter hue
      if (Math.abs(hueA - hueB) > 1) 
        return hueA - hueB;
      
      // Samme hue: sorter etter saturation (høyere først)
      if (Math.abs(colorA.s - colorB.s) > 0.05) 
        return colorB.s - colorA.s;
      
      // Til slutt: sorter etter lightness
      return colorA.l - colorB.l;
    }
  }

  const sortOptions = {
    name: "Navn",
    theme: "Tema",
    color: "Farge"
  }

  const sections = {
    colors: "Farger",
    scales: "Skaler",
    buttons: "Knapper",
    maps: "Kart"
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
    let d;
    if (window.location.hostname == 'localhost') {
      d = await import('./assets/local.json');
    } else {
      const url = './api/get?fields=' + Object.values(colorFields).join(',')
      const res = await fetch(url);
      if (res.ok) d = await res.json();
    }
    data = addHueToPublications(d);
  });

  const changeSection = (key) => {
    section = key;
    window.history.pushState({}, '', `?section=${key}`);
  }

  $: if (data) {
    publications = data.publications.sort(waysOfSorting[sorted]);
  };

</script>

{#if publications.length}
  <header>
    <nav>
      {#each Object.entries(sections) as [key, value]}
        <button class:active={section == key} on:click={() => changeSection(key)}>{value}</button>
      {/each}
    </nav>
    <div>{publications.length} publikasjoner i lista, sortert på 
      <select bind:value={sorted}> 
        {#each Object.entries(sortOptions) as [key, value]}
          <option value={key}>{value}</option>
        {/each}
      </select>. Oppdatert {getDate(data.updated)}.</div>
  </header>
  {#if section == "colors"}
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
            <div style="background: {pub.css["custom-background-color-one"]}; color: {pub.css["custom-background-color-one-front"]}">1</div>
            <div style="background: {pub.css["custom-background-color-two"]}; color: {pub.css["custom-background-color-two-front"]}">2</div>
            <div style="background: {pub.css["custom-background-color-three"]}; color: {pub.css["custom-background-color-three-front"]}">3</div>
            <div style="background: {pub.css["opinion-background-color"]}; color: {pub.css["opinion-color-front"]}">O</div>
          </div>
        </div>
      {/each}
    </div>
  {:else if section == "buttons"}
    <Buttons {publications} />
  {:else if section == "scales"}
    <Scales {publications} />
  {:else if section == "maps"}
    <Maps {publications} />
  {/if}
{:else}
  <div>Hei! Bare sitt i ro, du. Laster inn tema og css-variabler. Tar cirka 10 sek.</div>
  <div class="loading">
    <div></div>
  </div>
{/if}

<style>
  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1em;
  }
  nav {
    display: flex;
    gap: .5em;
  }
  nav button {
    border: none;
    background: #ddd;
    cursor: pointer;
    padding: 0.25em .6em;
    border-radius: 3px;
  }
  nav button:hover {
    background: #ccc;
  }
  nav button.active {
    background: #efefef;
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
  /* .aside div.warning::after {
    display: block;
    content: "";
    position: absolute;
    top: 4px;
    left: 4px;
    right: 4px;
    aspect-ratio: 1/1;
    background-size: contain;
    background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAACXBIWXMAAAsTAAALEwEAmpwYAAACnUlEQVR4nOWWS2gTQRzGv6RJE1OSQAwFGyltWjfNqxepULF68ZAeFDF66kGsWDxozbXWoxQtHtWKCrUaDRZFaQVrq94LetCCxUcLRqwPqKAV0hcZ+S87i3F3k127EcSBD2Z3Zr7fzH+ewD+WGgAcA3BUyv+VdATAKgAmaQXA4XJDYwCWd2/1sLnhsKhdrR6CLwGIlBP8eL2ngs3fjTL2qFkU5ekfgIlyQfdSaC8cD8hQrvPdAR72PWZDHQDeROucbOVhXAFeHY+z5qCTwDMAnGaCe2lE42eCCijXk7NBPuoes6ABAAv7tns1oVzJNi+BFwDUmAFOOystbDbdVBL87maYuRxWgg+tFdoKIH+yo7oklKu3o5rAeQDb/hRqBTAZ8NvZj/uxAvO315rY/h1eUTPXCyNBdakNgKeSh+HUSYvlxolaxaieXxL4QmJTVwRFebqnlpcfMAp1A5hrjbhYfkIZzldXQzL49VBIUU5t2uJVVP4JgMcIuN9qAZs816i5iDg4mwmr1nk2sImRB4DTeqF02yweavdpLqDPtyMy+MudiGa9zoSPn+OCHvCo22UVLwAtw28jURn8fSRWtIPeKvEcv1cKupPM+rs2FN0yy2NxtllYJ4ryxeqSl9TJhBbUBmCqoaaSLT4obmZES2NxJmx0EPglALsaOEU9Gz1Vp8uQ38d66pKnNOru36E+APOJFrcuI9rHtgoLs9ssqvtYTYkWN4G/AvD/Cr5IJtODyj2ppheXBRFqBDw9GBLrAxjg0EZ6Q6WSfkNz93E4IspIm1TSz6T3mvhApLjrnq+16MOtcMFcd9HHe40TyExlMzJYfJUGAeTat7jLCs9mwnyB5QDU83k+KP1gZVZO7caql0LQJx3sZqpP8pZH+v+ln3wCWQv5336jAAAAAElFTkSuQmCC");
  } */

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
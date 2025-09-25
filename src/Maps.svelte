<script>
  import { colorFields } from "./utils";
  import * as d3 from 'd3';

  export let publications = [];

  let saturationCompensation = 0;

  const elements = {
    textBg: "white",
    textFg: "black",
    markerBg: "newspaper-color",
    markerFg: "newspaper-color-inverted",
  };

  const getShade = (color, lightness) => {
    const hsl = d3.hsl(color);
    return d3.hsl(hsl.h, hsl.s, lightness).toString();
  };

  const changeProperty = (e) => {
    elements[e.target.name] = e.target.value;
  };

  const propertyOptions = {
    ...colorFields,
    'hvit': 'white',
    'svart': 'black',
  };

  $: publications = publications.map((publication) => {
    publication.css = {
      ...publication.css,
      'white': 'white',
      'black': 'black',
    }
    return publication;
  });
</script>

<nav>
  <div>
    {#each Object.entries(elements) as [key, value]}
      <label for={key}>
        {key}
        <select name={key} on:change={changeProperty} {value}>
          {#each Object.entries(propertyOptions) as [key, value]}
            <option value={value}>{key}</option>
          {/each}
        </select>
      </label>
    {/each}
  </div>

</nav>

<div class="container">
  {#each publications as publication}
    <div class="pub" 
      style:--textBg={publication.css[elements.textBg]}
      style:--textFg={publication.css[elements.textFg]}
      style:--markerBg={publication.css[elements.markerBg]}
      style:--markerFg={publication.css[elements.markerFg]}
      >
      <div class="map">
        <div class="background" />
        <div class="marker">
          <div class="label">
            {publication.name}
          </div>
          <div class="symbol" />
        </div>
      </div>
    </div>
  {/each}
</div>

<style>
  nav div {
    display: flex;
    flex-wrap: wrap;
    gap: 1em;
    padding: 0.5em 1em 1em;
  }
  nav label {
    display: flex;
    flex-direction: column;
    gap: 0.25em;
  }
  .container {
    display: flex;
    flex-wrap: wrap;
    gap: 1em;
    padding: 1em;
    background: #efefef;
  }
  .pub {
    background: white;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    position: relative;
    min-width: 360px;
    aspect-ratio: 1/1;
    max-width: 100%;
    flex: 1;
    padding: 1em;
    border-radius: 3px;
    word-wrap: break-word;
    hyphens: auto;
  }
  .map {
    position: relative;
    width: 100%;
    height: 100%;
  }
  .background {
    position: absolute;
    top: 0;
    left: 0;
    background-image: url('./assets/kanvas.png');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    width: 100%;
    height: 100%;
  }
  .marker {
    position: absolute;
    top: 40%;
    left: 50%;
    transform: translate(-50%, -100%);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }
  .label {
    width: fit-content;
    background: var(--textBg);
    color: var(--textFg);
    padding: 0.45em 0.7em;
    font-size: 0.925rem;
  }
  .symbol {
    background: var(--markerBg);
    color: var(--markerFg);
    width: 1rem;
    height: 1rem;
    border-radius: 50%;
  }
</style>
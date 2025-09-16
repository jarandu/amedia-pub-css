<script>
  import { Delaunay } from 'd3-delaunay';
  import * as d3 from 'd3';
  import { onMount } from 'svelte';

  export let publications = [];

  const numSteps = 10;
  const width = 800;
  const height = 800;
  const numPolygons = 20;
  let polygons = [];
  let field = 'newspaper-color';
  let saturationCompensation = 0;
  let lightnessMax = 95;
  let lightnessMin = 5;

  function generateRandomPoints() {
    return d3.range(numPolygons).map(() => [
      Math.random() * width * 0.8 + width * 0.1,
      Math.random() * height * 0.8 + height * 0.1,
    ]);
  }

  function generatePolygons() {
    const points = generateRandomPoints();
    const delaunay = Delaunay.from(points);
    const voronoi = delaunay.voronoi([0, 0, width, height]);
    polygons = points.map((_, i) => voronoi.cellPolygon(i));
  }

  function generateScale(baseColor, lightnessStart = 90, lightnessEnd = 10, saturationCompensation = 0) {
    const hsl = d3.hsl(baseColor);
    return d3.range(numSteps).map((i) => {
      const t = i / (numSteps - 1); // Interpolation factor
      const lightness = lightnessStart + t * (lightnessEnd - lightnessStart);
      return d3.hsl(hsl.h, hsl.s + saturationCompensation / 100, lightness / 100).toString(); // Convert back to string
    });
  }

  // input is either hex or rgb, check if values ar the same (has saturation)
  const isGreyish = (color) => {
    const values = color.startsWith('#') && color.length == 7 ? color.match(/\w{2}/g) : color.startsWith('#') && color.length == 4 ? color.match(/\w{1}/g) : color.match(/\d+/g);
    return values[0] === values[1] && values[1] === values[2];
  }

  const isSaturated = (color) => {
    return d3.hsl(color).s > 0.05;
  }

  $: items = publications.map((pub) => {
    const baseColor = pub.css[field];
    const color = isSaturated(baseColor) ? baseColor : pub.css['custom-background-color-one'];
    const scale = generateScale(color, lightnessMax, lightnessMin, saturationCompensation);
    return { ...pub, scale };
  });

  onMount(() => {
    generatePolygons();
  });

  $: console.log('items', items);
</script>

<nav>
  <label for="saturation">Saturation compensation</label>
  <input id=saturation type="range" min="-50" max="50" step="5" bind:value={saturationCompensation} />
  {saturationCompensation}%
  <label for="lightnesmax">Maks L</label>
  <input id=lightnessmax type="range" min="50" max="100" step="5" bind:value={lightnessMax} />
  {lightnessMax}%
  <label for="lightnesmin">Min L</label>
  <input id=lightnessmin type="range" min="0" max="50" step="5" bind:value={lightnessMin} />
  {lightnessMin}%
</nav>

<div class="container">
  {#each items as pub}
    <div class="item">
      <h2>{pub.name}</h2>
      <div
        class="color-sample"
        style="background-color: {pub.css[field]}; width: 100%; height: 20px;"
      ></div>
      <div class="color-bar">
        {#each pub.scale as color}
          <div
            class="color-box"
            style="background-color: {color};"
          ></div>
        {/each}
      </div>
      <div class="map">
        <svg {width} {height} viewBox="0 0 {width} {height}">
          <g>
            {#each polygons as polygon, i}
              <path
                d={d3.line()(polygon)}
                fill={pub.scale[Math.floor(i * numSteps / numPolygons)]}
              />
            {/each}
          </g>
        </svg>
      </div>
    </div>
  {/each}
</div>

<style>
  nav {
    padding: 0.5rem 1rem;
    position: sticky;
    z-index: 2;
    top: 0;
    display: grid;
    background: white;
    gap: 0.2rem;
    grid-template-columns: auto 1fr auto;
  }
  .container {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    padding: 1rem;
  }
  .item {
    display: grid;
    grid-template-columns: 20px 1fr;
    row-gap: 0.5rem;
    column-gap: 1rem;
    align-items: center;
    position: relative;
    min-width: 200px;
    max-width: 100%;
    flex: 1;
    padding: 1em;
    border-radius: 3px;
    word-wrap: break-word;
    hyphens: auto;
    border: 1px solid #ddd;
    overflow: hidden;
  }
  h2 {
    margin: 0;
    grid-column: span 2;
  }
  .color-sample {
    border-radius: 50%;
  }
  .color-bar {
    display: flex;
    height: 100%;
  }
  .color-box {
    flex: 1;
    height: 100%;
  }
  .map {
    width: 100%;
    height: auto;
    grid-column: span 2;
  }
  svg {
    width: 100%;
    height: auto;
  }
</style>

<script>
  import * as d3 from 'd3';

  export let publications = [];

  let field = 'newspaper-color';

  const numSteps = 10; // Antall farger i skalaen

  function generateScale(baseColor, lightnessStart = 90, lightnessEnd = 10) {
    // Convert base color to HSL
    const hsl = d3.hsl(baseColor);

    // Generate a scale by interpolating between the specified lightness levels
    return d3.range(numSteps).map((i) => {
      const t = i / (numSteps - 1); // Interpolation factor
      const lightness = lightnessStart + t * (lightnessEnd - lightnessStart);
      return d3.hsl(hsl.h, hsl.s, lightness / 100).toString(); // Convert back to string
    });
  }
</script>

<div class="container">
  {#each publications as pub}
    <div class="item">
      <h2>{pub.name}</h2>
      <div
        class="color-sample"
        style="background-color: {pub.css[field]}; width: 100%; height: 20px;"
      ></div>
      <div class="color-bar">
        {#each generateScale(pub.css[field], 95, 5) as scaleColor}
          <div
            class="color-box"
            style="background-color: {scaleColor};"
          ></div>
        {/each}
      </div>
    </div>
  {/each}
</div>

<style>
  .container {
    display: flex;
    flex-wrap: wrap;
    gap: 1em;
    padding: 1em;
  }
  .item {
    display: grid;
    grid-template-columns: 20px 1fr;
    row-gap: 0.5rem;
    column-gap: 1rem;
    align-items: center;
    position: relative;
    min-width: 280px;
    max-width: 100%;
    height: 100px;
    flex: 1;
    padding: 1em;
    border-radius: 3px;
    word-wrap: break-word;
    hyphens: auto;
    border: 1px solid #ddd;
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
</style>

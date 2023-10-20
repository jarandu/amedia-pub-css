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
  })
</script>

<div class="container">
  {#each merged as pub}
    <a class="pub" href="https://{pub.URL}" target="_blank" style="
    background: {pub["--newspaper-color"]}; 
    color: {pub["--newspaper-color-inverted"]};">
      <h2>{pub.Navn}</h2>
      <span>{pub["--newspaper-color"]}</span>
      <div class="aside">
        {#if pub["--custom-background-color-one"]}<div style="background: {pub["--custom-background-color-one"]}"></div>{/if}
        {#if pub["--custom-background-color-two"]}<div style="background: {pub["--custom-background-color-two"]}"></div>{/if}
      </div>
    </a>
  {/each}
</div>

<style>
  .container {
    display: flex;
    flex-wrap: wrap;
    gap: 1em;
    padding: 1em;
    font-size: 14px;
  }
  .pub {
    display: block;
    position: relative;
    font-family: "National 2", national2;
    min-width: 160px;
    height: 100px;
    flex: 1;
    padding: 1em;
    border-radius: 3px;
    word-wrap: break-word;
    hyphens: auto;
    text-decoration: none;
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
    height: 20px;
    width: 20px;
    border-radius: 50%;
    border: 1px solid white;
  }
  
</style>
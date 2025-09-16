<script>
  export let publications = [];
  export let properties = [];

  const elements = {
    background:  "hvit",
    buttonBackground: "newspaper-color",
    buttonColor: "newspaper-color-inverted",
  }

  const changeProperty = (e) => {
    elements[e.target.name] = e.target.value;
  }

  $: properties = [
    ...properties,
    'lys grå',
    'grå',
    'hvit',
    'svart',
  ]

  $: publications = publications.map((publication) => {
    publication.css = {
      ...publication.css,
      'lys grå': '#efefef',
      'grå': '#ccc',
      'hvit': 'white',
      'svart': 'black',
    }
    return publication;
  })
</script>

<nav>
{#each Object.entries(elements) as [key, value]}
  <label for="{key}">{key}</label>
  <select name={key} on:change={changeProperty} {value}>
    {#each properties as property}
      <option value={property}>{property}</option>
    {/each}
  </select>
{/each}
</nav>

<div class="container">
  {#each publications as publication}
    <div class="pub" 
      style:--background={publication.css[elements.background]}
      style:--buttonBackground={publication.css[elements.buttonBackground]}
      style:--buttonColor={publication.css[elements.buttonColor]}
      >
      <h2>{publication.name}</h2>
      <button>Trykk på denne</button>
    </div>
  {/each}
</div>

<style>
  nav {
    display: flex;
    flex-wrap: wrap;
    gap: 1em;
    padding: 1em;
    background: #efefef;
  }
  .container {
    display: flex;
    flex-wrap: wrap;
    gap: 1em;
    padding: 1em;
    background: #efefef;
  }
  .pub {
    background: var(--background);
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    position: relative;
    min-width: 200px;
    max-width: 100%;
    flex: 1;
    padding: 1em;
    border-radius: 3px;
    word-wrap: break-word;
    hyphens: auto;
  }
  h2 {
    margin: 0 0 0.5rem;
    font-size: 1.1rem;
  }
  button {
    width: 100%;
    font-size: 1.1rem;
    background: var(--buttonBackground);
    color: var(--buttonColor);
    padding: 0.4em 0.8em;
    border-radius: 99px;
    border: none;
    margin: 0;
    cursor: pointer;
  }
</style>
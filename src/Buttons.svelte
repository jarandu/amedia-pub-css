<script>
  import { colors } from "./utils";
  export let publications = [];

  const elements = {
    background:  "white",
    buttonBackground: "newspaper",
    buttonColor: "newspaper-fg",
  }

  const changeProperty = (e) => {
    elements[e.target.name] = e.target.value;
  }

  const propertyOptions = {
    ...colors.map((color) => ({ [color.name]: color.css })),
    'lys grå': 'light-grey',
    'grå': 'grey',
    'hvit': 'white',
    'svart': 'black',
  };

  $: publications = publications.map((publication) => {
    publication.css = {
      ...publication.css,
      'light-grey': '#efefef',
      'grey': '#ccc',
      'white': 'white',
      'black': 'black',
    }
    return publication;
  })
</script>

<nav>
  <div>
    {#each Object.entries(elements) as [key, value]}
      <label>
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
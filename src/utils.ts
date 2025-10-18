import * as d3 from 'd3';

export const colors = [
  {
    name: "Hoved",
    cetera: 'localcss.menu.background.color',
    css: 'newspaper',
  },
  {
    name: "Debatt",
    cetera: 'localcss.opinion.background.color',
    css: 'opinion',
  },
  {
    name: "Global",
    cetera: 'localcss.global.background.color',
    css: 'global',
  },
  {
    name: "Tilpasset 1",
    cetera: 'localcss.customOne.background.color',
    css: 'custom-one',
  },
  {
    name: "Tilpasset 2",
    cetera: 'localcss.customTwo.background.color',
    css: 'custom-two',
  },
  {
    name: "Tilpasset 3",
    cetera: 'localcss.customThree.background.color',
    css: 'custom-three',
  }
];

export const getSection = () => {
  const parameters = new URLSearchParams(window.location.search);
  return parameters.get("section") || "colors";
}

export const getColorFamily = (hue, saturation, lightness) => {
  // Svarte og mørke farger først
  if (lightness < 0.15) return 0; // Svart/mørk
  
  // Grå farger
  if (saturation < 0.1) return 1; // Grå
  
  // Fargefamilier basert på hue
  if (hue < 15 || hue >= 345) return 2; // Rød
  if (hue < 45) return 3; // Oransje
  if (hue < 75) return 4; // Gul
  if (hue < 105) return 5; // Lime
  if (hue < 135) return 6; // Grønn
  if (hue < 165) return 7; // Mint
  if (hue < 195) return 8; // Cyan
  if (hue < 225) return 9; // Blå
  if (hue < 255) return 10; // Indigo
  if (hue < 285) return 11; // Lilla
  if (hue < 315) return 12; // Magenta
  return 13; // Rosa
}

export const addHueToPublications = (data) => {
  return {
    ...data,
    publications: data.publications.map(p => {
      if (p.css.hasOwnProperty("newspaper")) {
        return {
          ...p,
          hue: d3.hsl(p.css?.["newspaper"]).h
        }
      }
      console.log("No newspaper color found for", p.name);
      return p;
    })
  };
};
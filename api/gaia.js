import { GaiaClient } from '@amedia/gaia-client';

const luma = (hex) => {
  if (!hex) {
    return null;
  }

  const c = hex.substring(1);
  const rgb = parseInt(c, 16);
  const r = (rgb >> 16) & 0xff;
  const g = (rgb >> 8) & 0xff;
  const b = (rgb >> 0) & 0xff;
  const max = 255;

  const lumaCo = r * 0.2126 + g * 0.7152 + b * 0.0722;
  return (lumaCo / max) * 100;
}

export default async (req, res) => {

  const pub = req.query.publication;
  if (!pub) {
    res.status(400).send('Publication is required');
    return;
  }

  const gaiaClient = new GaiaClient('http://varnish-local.api.no/gaia');

  const colors = [
    {
      cetera: 'localcss.menu.background.color',
      css: 'newspaper',
    },
    {
      cetera: 'localcss.opinion.background.color',
      css: 'opinion',
    },
    {
      cetera: 'localcss.global.background.color',
      css: 'global',
    },
    {
      cetera: 'localcss.customOne.background.color',
      css: 'custom-one',
    },
    {
      cetera: 'localcss.customTwo.background.color',
      css: 'custom-two',
    },
    {
      cetera: 'localcss.customThree.background.color',
      css: 'custom-three',
    }
  ];
  
  const properties = await gaiaClient
    .getProperties(pub, colors.map((color) => color.cetera));

  const exportedProperties = Object.entries(properties).flatMap(([key, value]) => {
    const fgValue = luma(value) > 50 ? 'white' : '#292827';
    const bgName = colors.find((color) => color.cetera === key)?.css;
    return [
      {
        [bgName]: value,
      },
      {
        [bgName + '-fg']: fgValue,
      },
    ];
  }).reduce((acc, curr) => {
    return {
      ...acc,
      ...curr,
    };
  }, {});

  res.status(200).send(exportedProperties);
}
const parseRSS = (str) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(str, 'text/xml');

  const parseError = doc.querySelector('parsererror');
  if (parseError != null) {
    const divs = parseError.querySelectorAll('div');
    throw new Error ([...divs].map(div=>div.textContent).join('\n'));
  }
  
  const channel = doc.querySelector('channel');
  const items = [...channel.querySelectorAll('item')].map((item) => {
    return {
      title: item.querySelector('title').textContent,
      link: item.querySelector('link').textContent,
    }
  });

  return {
    feed: {
      title: channel.querySelector('title').textContent,
      description: channel.querySelector('description').textContent,
    },
    items: items,
  };
};

export default parseRSS;

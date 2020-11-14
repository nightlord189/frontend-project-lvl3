const parseRSS = (str) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(str, 'text/xml');
  const channel = doc.querySelector('channel');

  const posts = [];
  const items = channel.querySelectorAll('item');
  items.forEach((item) => {
    const post = {
      title: item.querySelector('title').textContent,
      link: item.querySelector('link').textContent,
    };
    posts.push(post);
  });

  return {
    feed: {
      title: channel.querySelector('title').textContent,
      description: channel.querySelector('description').textContent,
    },
    posts,
  };
};

export default parseRSS;

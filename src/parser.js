
const parseRSS = (str) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(str, "text/xml");
    const channel = doc.querySelector('channel');

    const posts = [];
    const items = channel.querySelectorAll('item');
    for (let item of items) {
        const post = {
            title: item.querySelector('title').textContent,
            link: item.querySelector('link').textContent,
        }
        posts.push(post);
    }

    return {
        feed: {
            title: channel.querySelector('title').textContent,
            description: channel.querySelector('description').textContent,
        },
        posts: posts,
    };
}

export default parseRSS;
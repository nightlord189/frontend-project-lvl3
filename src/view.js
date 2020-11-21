import i18next from 'i18next';

const feedback = document.querySelector('.feedback');
const input = document.querySelector('#rss-feed-input');
const feedsParent = document.querySelector('.feeds');
const postsParent = document.querySelector('.posts');

const renderForm = (state) => {
  if (state.errors.length === 0) {
    feedback.className = 'feedback text-success';
    feedback.textContent = i18next.t('success');
  } else if (state.errors.length > 0) {
    feedback.className = 'feedback text-danger';
    feedback.textContent = state.errors.map((err) => i18next.t(err, err)).join('\n');
  } else {
    feedback.className = 'feedback';
    feedback.textContent = '';
  }

  input.value = state.currentURL;
  input.disabled = state.status !== 'filling';
  if (state.errors.includes('url')) {
    input.classList.add('is-invalid');
  } else {
    input.classList.remove('is-invalid');
  }

  document.querySelector('.btn-primary').disabled = state.status !== 'filling';
};

const renderFeeds = (state) => {
  feedsParent.innerHTML = '';
  if (state.feeds.length > 0) {
    const h2 = document.createElement('h2');
    h2.textContent = i18next.t('feedsHeader');
    feedsParent.append(h2);
    const ul = document.createElement('ul');
    ul.className = 'list-group mb-5';
    feedsParent.append(ul);
    state.feeds.forEach((feed) => {
      const li = document.createElement('li');
      li.className = 'list-group-item';
      const h3 = document.createElement('h3');
      h3.textContent = feed.title;
      li.append(h3);
      const p = document.createElement('p');
      p.textContent = feed.description;
      li.append(p);
      ul.append(li);
    });
  }
};

const renderPosts = (state) => {
  postsParent.innerHTML = '';
  if (state.posts.length > 0) {
    const h2 = document.createElement('h2');
    h2.textContent = i18next.t('postsHeader');
    postsParent.append(h2);
    const ul = document.createElement('ul');
    ul.className = 'list-group';
    postsParent.append(ul);
    state.posts.forEach((post) => {
      const li = document.createElement('li');
      li.className = 'list-group-item';
      const a = document.createElement('a');
      a.setAttribute('href', post.link);
      a.textContent = post.title;
      li.append(a);
      ul.append(li);
    });
  }
};

export { renderFeeds, renderPosts, renderForm };

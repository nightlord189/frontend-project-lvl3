import i18next from 'i18next';

const renderForm = (state, elements) => {
  const { feedback, input, button } = elements;
  if (state.errors.length === 0) {
    feedback.className = 'feedback text-success';
    feedback.textContent = i18next.t('success');
  } else if (state.errors.length > 0) {
    feedback.className = 'feedback text-danger';
    feedback.textContent = state.errors.map((err) => i18next.t(err, err)).join('\n');
  }

  input.value = state.currentURL;
  input.disabled = state.status !== 'filling';
  if (state.errors.includes('url')) {
    input.classList.add('is-invalid');
  } else {
    input.classList.remove('is-invalid');
  }

  button.disabled = state.status !== 'filling';
};

const renderFeeds = (state, elements) => {
  const { feeds } = elements;
  feeds.innerHTML = '';
  if (state.feeds.length > 0) {
    const h2 = document.createElement('h2');
    h2.textContent = i18next.t('feedsHeader');
    feeds.append(h2);
    const ul = document.createElement('ul');
    ul.className = 'list-group mb-5';
    feeds.append(ul);
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

const renderPosts = (state, elements) => {
  const { posts } = elements;
  posts.innerHTML = '';
  if (state.posts.length > 0) {
    const h2 = document.createElement('h2');
    h2.textContent = i18next.t('postsHeader');
    posts.append(h2);
    const ul = document.createElement('ul');
    ul.className = 'list-group';
    posts.append(ul);
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

import i18next from 'i18next';

const renderForm = (form) => {
  const feedback = document.querySelector('.feedback');
  if (form.feedback === i18next.t('form.success')) {
    feedback.className = 'feedback text-success';
  } else if (form.feedback != null) {
    feedback.className = 'feedback text-danger';
  } else {
    feedback.className = 'feedback';
  }
  feedback.textContent = form.feedback;

  const input = document.querySelector('#rss-feed-input');
  input.value = form.currentURL;
  input.disabled = form.state !== 'filling';
  if (form.isURLValid) {
    input.classList.remove('is-invalid');
  } else {
    input.classList.add('is-invalid');
  }

  document.querySelector('.btn-primary').disabled = form.state !== 'filling';
};

const renderFeeds = (body) => {
  const parentNode = document.querySelector('.feeds');
  parentNode.innerHTML = '';
  if (body.feeds.length > 0) {
    const h2 = document.createElement('h2');
    h2.textContent = i18next.t('body.feedsHeader');
    parentNode.append(h2);
    const ul = document.createElement('ul');
    ul.className = 'list-group mb-5';
    parentNode.append(ul);
    body.feeds.forEach((feed) => {
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

const renderPosts = (body) => {
  const parentNode = document.querySelector('.posts');
  parentNode.innerHTML = '';
  if (body.posts.length > 0) {
    const h2 = document.createElement('h2');
    h2.textContent = i18next.t('body.postsHeader');
    parentNode.append(h2);
    const ul = document.createElement('ul');
    ul.className = 'list-group';
    parentNode.append(ul);
    body.posts.forEach((post) => {
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

const renderContent = (body) => {
  renderFeeds(body);
  renderPosts(body);
};

export { renderContent, renderForm };

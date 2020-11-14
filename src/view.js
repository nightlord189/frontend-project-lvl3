const renderForm = (form) => {
  const feedback = document.querySelector('.feedback');
  if (form.feedback === 'Rss has been loaded') {
    feedback.className = 'feedback text-success';
  } else if (form.feedback != null) {
    feedback.className = 'feedback text-danger';
  } else {
    feedback.className = 'feedback';
  }
  feedback.textContent = form.feedback;

  const input = document.querySelector('#rss-feed-input');
  input.value = form.currentURL;
  if (form.isURLValid) {
    input.classList.remove('is-invalid');
  } else {
    input.classList.add('is-invalid');
  }
};

const renderFeeds = (body) => {
  const parentNode = document.querySelector('.feeds');
  parentNode.innerHTML = '';
  if (body.feeds.length > 0) {
    const h2 = document.createElement('h2');
    h2.textContent = 'Feeds';
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
    h2.textContent = 'Posts';
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

const renderBody = (body) => {
  console.log(body);
  renderFeeds(body);
  renderPosts(body);
};

export { renderBody, renderForm };

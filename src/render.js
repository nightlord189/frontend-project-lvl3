
const renderForm = (form) => {
    const feedback = document.querySelector('.feedback');
    if (form.feedback == 'Rss has been loaded') {
        feedback.className = 'feedback text-success';       
    } else if (form.feedback != null) {
        feedback.className = 'feedback text-danger'; 
    } else {
        feedback.className = 'feedback';
    }
    feedback.textContent = form.feedback;

    const input = document.querySelector('#rss-feed-input');
    if (form.isURLValid) {
        input.classList.remove('is-invalid');
    } else {
        input.classList.add('is-invalid');
    }
}

const render = (state) => {
    console.log('render');
    //const inputField = document.querySelector('#rss-feed-input');
    //inputField.value = state.currentURL;
}

export {render, renderForm}
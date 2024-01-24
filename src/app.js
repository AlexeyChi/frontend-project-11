import * as yup from 'yup';
import watcher from './view.js';

const validate = (url, feeds) => {
  const urlShema = yup
    .string()
    .url('invalid URL')
    .notOneOf(feeds, 'not uniq URL');

  return urlShema.validate(url);
};

export default () => {
  const elements = {
    form: document.querySelector('form'),
    inputEl: document.querySelector('#url-input'),
    feedback: document.querySelector('.feedback'),
    submitBtn: document.querySelector('button[type=submit]'),
  };

  const state = {
    form: {
      formStatus: 'filling',
      errors: '',
    },
    feeds: [],
    posts: [],
  };

  const watchedState = watcher(elements, state);

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();

    const newData = new FormData(e.target);
    const url = newData.get('url');

    validate(url, watchedState.feeds)
      .then((feed) => {
        console.log(feed);
        watchedState.form.formStatus = 'sent';
        watchedState.form.errors = null;
        state.feeds.push(feed);
      })
      .catch((err) => {
        watchedState.form.errors = err.message;
        watchedState.form.formStatus = 'error';
      });
  });
};

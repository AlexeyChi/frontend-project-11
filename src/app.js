import * as yup from 'yup';
import i18next from 'i18next';
import axios from 'axios';
import resources from './locales/index.js';
import watcher from './view.js';
import urlParser from './parsers/parser.js';

let uniqId = 1;
const validate = (url, feeds) => {
  const urlShema = yup
    .string()
    .url('invalid URL')
    .notOneOf(feeds, 'not uniq URL');
  return urlShema.validate(url, { abortEarly: false });
};

const routes = {
  fetchUrl: (url) => `https://allorigins.hexlet.app/get?url=${encodeURIComponent(`${url}`)}`,
};

const makeParsedResponse = (data) => {
  return axios.get(routes.fetchUrl(data))
    .then((response) => urlParser(response.data.contents))
    .catch((e) => {
      if (e.message === 'Network error') {
        throw new Error(`networkError`)
      }
      throw e;
    });
};

const makeNewData = (data, url) => {
  const { feed, posts } = data;
  const { title, description } = feed;
  const newFeed = { id: uniqId, link: url, ...{ title, description } };
  uniqId += 1;
  const newPosts = [...posts].map((post) => {
    post.id = uniqId;
    uniqId += 1;
    post.feedId = newFeed.id;
    return post;
  });
  return { newFeed, newPosts };
};

export default () => {
  const defaultLenguage = 'ru';

  const i18nInstance = i18next.createInstance();
  i18nInstance.init({
    lng: defaultLenguage,
    debug: true,
    resources,
  }).then(() => {
    yup.setLocale({
      string: {
        url: 'errors.invalidURL',
      },
      mixed: {
        notOneOf: 'errors.notUniqURL',
      },
    });
  }).catch((err) => console.log('something went wrong loading', err));

  const elements = {
    form: document.querySelector('form'),
    inputEl: document.querySelector('#url-input'),
    feedbackEl: document.querySelector('.feedback'),
    submitBtn: document.querySelector('button[type=submit]'),
    feedsContainer: document.querySelector('div.feeds'),
    postsContainer: document.querySelector('div.posts'),
  };

  const state = {
    form: {
      formStatus: 'filling',
      errors: '',
    },
    feeds: [],
    posts: [],
  };

  const watchedState = watcher(elements, state, i18nInstance);

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();

    const newData = new FormData(e.target);
    const url = newData.get('url');
    const uniqFeeds = state.feeds.map(({ link }) => link);

    validate(url, uniqFeeds)
      .then((url) => {
        watchedState.form.formStatus = 'sent';
        return makeParsedResponse(url);
      })
      .then((data) => {
        watchedState.form.errors = null;
        const { newFeed, newPosts } = makeNewData(data, url);
        watchedState.feeds.push(newFeed);
        watchedState.posts.push(...newPosts);
        console.log(state)
      })
      .catch((err) => {
        watchedState.form.formStatus = 'error';
        watchedState.form.errors = err.message;
        console.log(state)
      });
  });
};

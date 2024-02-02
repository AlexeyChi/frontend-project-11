import * as yup from 'yup';
import i18next from 'i18next';
import axios from 'axios';
import resources from './locales/index.js';
import render from './view.js';
import urlParser from './parsers/parser.js';

let uniqId = 1;
const validate = (url, feeds) => {
  const urlShema = yup
    .string()
    .required()
    .url('invalid URL')
    .notOneOf(feeds, 'not uniq URL');
  return urlShema.validate(url, { abortEarly: false });
};

const routes = {
  fetchUrl: (url) => `https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(`${url}`)}`,
};

const makeParsedResponse = (data) => {
  const fetchResponse = axios.get(routes.fetchUrl(data))
    .then((response) => urlParser(response.data.contents))
    .catch((e) => {
      if (axios.isAxiosError(e)) {
        throw new Error('networkError');
      }
      throw e;
    });
  return fetchResponse;
};

const makeNewFeed = (data, url) => {
  const { feed } = data;
  const updatedFeed = { id: uniqId, link: url, ...feed };
  uniqId += 1;
  return updatedFeed;
};

const makeNewPosts = (feed, data) => {
  const { posts } = data;
  return [...posts].map((post) => {
    const updatedPost = { id: uniqId, feedId: feed.id, ...post };
    uniqId += 1;
    return updatedPost;
  });
};

const addNewPosts = (watchedState) => {
  const usedUrls = watchedState.feeds.map(({ link }) => link);

  const promises = usedUrls.map((url, index) => makeParsedResponse(url)
    .then((data) => {
      const { posts } = data;
      const oldPosts = watchedState.posts.map(({ title }) => title);

      const addedPosts = posts.filter(({ title }) => !oldPosts.includes(title))
        .map((post) => {
          const { id } = watchedState.feeds[index];
          const addedPost = { id: uniqId, feedId: id, ...post };
          uniqId += 1;
          return addedPost;
        });

      watchedState.posts.unshift(...addedPosts);
    })
    .catch((err) => watchedState.form.errors.push(err)));

  Promise.allSettled(promises).finally(() => setTimeout(() => addNewPosts(watchedState), 5000));
};

export default () => {
  const defaultLenguage = 'ru';

  yup.setLocale({
    string: {
      url: 'errors.invalidURL',
    },
    mixed: {
      notOneOf: 'errors.notUniqURL',
      required: 'notEmpty',
    },
  });

  const elements = {
    form: document.querySelector('form'),
    inputEl: document.querySelector('#url-input'),
    feedbackEl: document.querySelector('.feedback'),
    submitBtn: document.querySelector('button[type=submit]'),
    feedsContainer: document.querySelector('div.feeds'),
    postsContainer: document.querySelector('div.posts'),
    modal: document.querySelector('.modal'),
  };

  const state = {
    form: {
      formStatus: 'filling',
      errors: false,
    },
    uiState: {
      touchedLinkId: '',
      readLinks: new Set(),
    },
    feeds: [],
    posts: [],
  };

  const i18nInstance = i18next.createInstance();
  i18nInstance.init({
    lng: defaultLenguage,
    debug: false,
    resources,
  });

  const watchedState = render(elements, state, i18nInstance);
  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const newData = new FormData(e.target);
    const url = newData.get('url');
    const uniqFeeds = state.feeds.map(({ link }) => link);
    validate(url, uniqFeeds)
      .then((validUrl) => {
        watchedState.form.formStatus = 'sent';
        return makeParsedResponse(validUrl);
      })
      .then((data) => {
        watchedState.form.errors = null;
        const newFeed = makeNewFeed(data, url);
        const newPosts = makeNewPosts(newFeed, data);
        watchedState.feeds.push(newFeed);
        watchedState.posts.push(...newPosts);
      })
      .catch((err) => {
        watchedState.form.formStatus = 'error';
        watchedState.form.errors = err.message;
      });
  });

  elements.postsContainer.addEventListener('click', (e) => {
    const tagName = e.target.tagName.toLowerCase();
    const { id } = e.target.dataset;

    if (tagName === 'a' || tagName === 'button') {
      watchedState.uiState.touchedLinkId = +id;
      watchedState.uiState.readLinks.add(+id);
    }
  });

  setTimeout(() => addNewPosts(watchedState), 5000);
};

export default (response) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(response, "application/xml");
    if (doc.querySelector('parsererror')) {
      throw new Error(`notContainValidRss`);
    }
    const title = doc.querySelector('title').textContent;
    const description = doc.querySelector('description').textContent;
    const items = doc.querySelectorAll('item');
    const posts = [...items].map((item) => {
      const title = item.querySelector('title').textContent;
      const description = item.querySelector('description').textContent;
      const link = item.querySelector('link').textContent;
      return { title, description, link };
    });
    return { feed: { title, description }, posts };
  };
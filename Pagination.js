const mainElement = document.querySelector('main');
const getLastPostElement = () => mainElement.querySelector('article:last-of-type');
const parser = new DOMParser();

let nextPageUrl = document.getElementById('next-link')?.href;

const callback = (entries, observer) => {
  if ([...entries].every(({ isIntersecting }) => !isIntersecting)) return;
  observer.disconnect();
  mainElement.setAttribute('aria-busy', 'true');

  fetch(nextPageUrl)
    .then(response => response.text())
    .then(responseText => {
      const responseDocument = parser.parseFromString(responseText, 'text/html');
      const articles = [...responseDocument.querySelectorAll('main > article')];
      const postIds = articles.map(({ id }) => id);

      mainElement.append(...articles);
      Tumblr.LikeButton.get_status_by_post_ids(postIds);

      mainElement.setAttribute('aria-busy', 'false');
      nextPageUrl = responseDocument.getElementById('next-link')?.href;
      if (nextPageUrl) observer.observe(getLastPostElement());
    })
    .catch(exception => {
      console.error(exception);
      mainElement.removeAttribute('aria-busy');
    });
};

if (nextPageUrl && mainElement.getAttribute('role') === 'feed' && location.pathname !== "/customize_preview_receiver.html") {
  const observer = new IntersectionObserver(callback);
  mainElement.setAttribute('aria-busy', 'false');
  observer.observe(getLastPostElement());
}

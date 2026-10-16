/** @typedef {import('./state.js').Filters} Filters */

/**
 * C3. Повертає поточні значення форми фільтрів #filters. Поки C3 не виконано, фільтрів немає,
 * і список показує всі серіали. Специфікація — ТЗ, C3.
 *
 * @returns {Filters}
 */
export function readFilters() {
  const query = document.querySelector('#filter-query');
  const genre = document.querySelector('#filter-genre');
  const mine = document.querySelector('#filter-mine');

  if (!(query instanceof HTMLInputElement)) throw new Error('Не знайдено поле #filter-query');
  if (!(genre instanceof HTMLSelectElement)) throw new Error('Не знайдено поле #filter-genre');
  if (!(mine instanceof HTMLInputElement)) throw new Error('Не знайдено поле #filter-mine');

  return {
    query: query.value,
    genre: genre.value,
    mine: mine.checked,
  };
}

/**
 * C3. Підключає форму фільтрів: після кожної зміни — refresh(). main.js викликає цю функцію
 * один раз. Специфікація — ТЗ, C3.
 *
 * @param {() => void} refresh перемальовує список для поточних фільтрів
 */
export function initFilters(refresh) {
  const form = document.querySelector('#filters');
  const query = document.querySelector('#filter-query');
  const genre = document.querySelector('#filter-genre');
  const mine = document.querySelector('#filter-mine');

  if (!(form instanceof HTMLFormElement)) throw new Error('Не знайдено форму #filters');
  if (!(query instanceof HTMLInputElement)) throw new Error('Не знайдено поле #filter-query');
  if (!(genre instanceof HTMLSelectElement)) throw new Error('Не знайдено поле #filter-genre');
  if (!(mine instanceof HTMLInputElement)) throw new Error('Не знайдено поле #filter-mine');

  query.addEventListener('input', refresh);
  genre.addEventListener('change', refresh);
  mine.addEventListener('change', refresh);
  form.addEventListener('submit', (event) => event.preventDefault());
  form.addEventListener('reset', () => queueMicrotask(refresh));
}

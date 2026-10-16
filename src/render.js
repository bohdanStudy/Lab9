/** @typedef {import('./state.js').Show} Show */
import { notes, shows, watchlist } from './state.js';

/**
 * C1. Показує серіали в списку #results — по картці з шаблону #show-card на кожен, у тому
 * самому порядку, — і оновлює рядок статусу #status. Специфікація — ТЗ, C1.
 *
 * @param {readonly Show[]} list серіали, які треба показати
 */
export function renderShows(list) {
  const results = document.querySelector('#results');
  const status = document.querySelector('#status');
  const template = document.querySelector('#show-card');
  const count = document.querySelector('#watchlist-count');

  if (!(results instanceof HTMLUListElement)) throw new Error('Не знайдено список #results');
  if (!(status instanceof HTMLElement)) throw new Error('Не знайдено рядок статусу #status');
  if (!(count instanceof HTMLElement)) throw new Error('Не знайдено лічильник #watchlist-count');
  if (!(template instanceof HTMLTemplateElement) || !(template.content.firstElementChild instanceof HTMLLIElement)) {
    throw new Error('Не знайдено шаблон картки #show-card');
  }

  const cards = list.map((show) => {
    const card = /** @type {HTMLLIElement} */ (template.content.firstElementChild.cloneNode(true));
    card.dataset.id = String(show.id);

    const values = new Map([
      ['name', show.name],
      ['year', show.year ?? '—'],
      ['genres', show.genres.length ? show.genres.join(', ') : '—'],
      ['rating', show.rating ?? '—'],
    ]);

    for (const [field, value] of values) {
      for (const element of card.querySelectorAll(`[data-field="${field}"]`)) {
        element.textContent = String(value);
      }
    }

    const toggleButton = card.querySelector('[data-action="toggle"]');
    if (!(toggleButton instanceof HTMLButtonElement)) {
      throw new Error('У шаблоні #show-card немає кнопки [data-action="toggle"]');
    }
    toggleButton.setAttribute('aria-pressed', String(watchlist.has(show.id)));

    const note = notes.get(show.id);
    const rating = card.querySelector('[data-field="my-rating"]');
    const noteText = card.querySelector('[data-field="note"]');
    const noteContainer = card.querySelector('.card__mine');
    if (note && rating instanceof HTMLElement && noteText instanceof HTMLElement && noteContainer instanceof HTMLElement) {
      rating.textContent = String(note.rating);
      noteText.textContent = note.text;
      noteContainer.hidden = false;
      noteText.hidden = !note.text;
    }

    return card;
  });

  results.replaceChildren(...cards);
  count.textContent = String(watchlist.size);
  status.textContent = list.length
    ? `Знайдено: ${list.length} з ${shows.length}`
    : 'Нічого не знайдено';
}

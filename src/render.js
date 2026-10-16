/** @typedef {import('./state.js').Show} Show */
import { shows } from './state.js';

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

  if (!(results instanceof HTMLUListElement)) throw new Error('Не знайдено список #results');
  if (!(status instanceof HTMLElement)) throw new Error('Не знайдено рядок статусу #status');
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

    return card;
  });

  results.replaceChildren(...cards);
  status.textContent = list.length
    ? `Знайдено: ${list.length} з ${shows.length}`
    : 'Нічого не знайдено';
}

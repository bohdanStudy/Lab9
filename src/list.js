import { toggle } from './state.js';
import { openDetails } from './details.js';

/**
 * C2. Підключає кнопки карток у списку #results: «До списку» додає серіал до мого списку або
 * прибирає з нього, «Детальніше» відкриває діалог (openDetails з details.js). main.js викликає
 * цю функцію один раз, після першого показу списку. Специфікація — ТЗ, C2.
 *
 * @param {() => void} refresh перемальовує список для поточних фільтрів
 */
export function initList(refresh) {
  const results = document.querySelector('#results');
  if (!(results instanceof HTMLUListElement)) throw new Error('Не знайдено список #results');

  results.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;

    const button = target.closest('button[data-action]');
    if (!(button instanceof HTMLButtonElement) || !results.contains(button)) return;

    const card = button.closest('li[data-id]');
    if (!(card instanceof HTMLLIElement)) return;

    const id = Number(card.dataset.id);
    if (button.dataset.action === 'details') {
      openDetails(id, button);
      return;
    }
    if (button.dataset.action !== 'toggle') return;

    const cardsBefore = [...results.querySelectorAll(':scope > li[data-id]')];
    const index = cardsBefore.indexOf(card);
    toggle(id);
    refresh();

    const cardsAfter = [...results.querySelectorAll(':scope > li[data-id]')];
    const focusCard = cardsAfter[index] ?? cardsAfter[index - 1];
    const focusTarget = focusCard?.querySelector('[data-action="toggle"]')
      ?? document.querySelector('#results-heading');
    if (!(focusTarget instanceof HTMLElement)) throw new Error('Не знайдено ціль для повернення фокусу');
    focusTarget.focus();
  });
}

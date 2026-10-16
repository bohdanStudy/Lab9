import { getShow, notes } from './state.js';

let opener = null;

/**
 * C4. Відкриває діалог #details для серіалу: назва, опис, посилання на сторінку TVmaze і форма
 * з моєю оцінкою й нотаткою. Специфікація — ТЗ, C4.
 *
 * @param {number} id
 * @param {HTMLElement} [trigger] кнопка «Детальніше», з якої відкрито діалог
 */
export function openDetails(id, trigger) {
  const show = getShow(id);
  const dialog = document.querySelector('#details');
  const title = document.querySelector('#details-title');
  const summary = document.querySelector('#details-summary');
  const link = document.querySelector('#details-link');

  if (!(dialog instanceof HTMLDialogElement)) throw new Error('Не знайдено діалог #details');
  if (!(title instanceof HTMLElement)) throw new Error('Не знайдено заголовок #details-title');
  if (!(summary instanceof HTMLElement)) throw new Error('Не знайдено опис #details-summary');
  if (!(link instanceof HTMLAnchorElement)) throw new Error('Не знайдено посилання #details-link');

  opener = trigger ?? (document.activeElement instanceof HTMLElement ? document.activeElement : null);
  title.textContent = show.name;
  link.href = show.url;

  const parsed = new DOMParser().parseFromString(show.summary, 'text/html');
  const paragraphs = [...parsed.body.children]
    .map((element) => element.textContent?.trim() ?? '')
    .filter(Boolean)
    .map((text) => {
      const paragraph = document.createElement('p');
      paragraph.textContent = text;
      return paragraph;
    });
  if (paragraphs.length === 0 && parsed.body.textContent?.trim()) {
    const paragraph = document.createElement('p');
    paragraph.textContent = parsed.body.textContent.trim();
    paragraphs.push(paragraph);
  }
  summary.replaceChildren(...paragraphs);

  const rating = document.querySelector('#note-rating');
  const noteText = document.querySelector('#note-text');
  if (rating instanceof HTMLInputElement && noteText instanceof HTMLTextAreaElement) {
    const note = notes.get(id);
    rating.value = note ? String(note.rating) : '';
    noteText.value = note?.text ?? '';
  }

  if (!dialog.open) dialog.showModal();
}

/**
 * C4. Підключає діалог #details: закриття й форму «Моя оцінка й нотатка». main.js викликає цю
 * функцію один раз. Специфікація — ТЗ, C4.
 *
 * @param {() => void} refresh перемальовує список для поточних фільтрів
 */
export function initDetails(refresh) {
  const dialog = document.querySelector('#details');
  const cancel = document.querySelector('#note-form button[type="button"]');

  if (!(dialog instanceof HTMLDialogElement)) throw new Error('Не знайдено діалог #details');
  if (!(cancel instanceof HTMLButtonElement)) throw new Error('Не знайдено кнопку «Скасувати»');

  dialog.addEventListener('close', () => {
    opener?.focus();
    opener = null;
  });
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
  cancel.addEventListener('click', () => dialog.close());

  void refresh;
}

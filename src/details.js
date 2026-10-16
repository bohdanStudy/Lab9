import { getShow, notes, saveNote } from './state.js';

let opener = null;
/** @type {number | null} */
let currentShowId = null;

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
  const rating = document.querySelector('#note-rating');
  const noteText = document.querySelector('#note-text');
  const ratingError = document.querySelector('#note-rating-error');

  if (!(dialog instanceof HTMLDialogElement)) throw new Error('Не знайдено діалог #details');
  if (!(title instanceof HTMLElement)) throw new Error('Не знайдено заголовок #details-title');
  if (!(summary instanceof HTMLElement)) throw new Error('Не знайдено опис #details-summary');
  if (!(link instanceof HTMLAnchorElement)) throw new Error('Не знайдено посилання #details-link');
  if (!(rating instanceof HTMLInputElement)) throw new Error('Не знайдено поле #note-rating');
  if (!(noteText instanceof HTMLTextAreaElement)) throw new Error('Не знайдено поле #note-text');
  if (!(ratingError instanceof HTMLElement)) throw new Error('Не знайдено повідомлення #note-rating-error');

  opener = trigger ?? (document.activeElement instanceof HTMLElement ? document.activeElement : null);
  currentShowId = show.id;
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

  const note = notes.get(id);
  rating.value = note ? String(note.rating) : '';
  noteText.value = note?.text ?? '';
  rating.removeAttribute('aria-invalid');
  rating.removeAttribute('aria-describedby');
  ratingError.textContent = '';

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
  const form = document.querySelector('#note-form');
  const rating = document.querySelector('#note-rating');
  const noteText = document.querySelector('#note-text');
  const ratingError = document.querySelector('#note-rating-error');

  if (!(dialog instanceof HTMLDialogElement)) throw new Error('Не знайдено діалог #details');
  if (!(cancel instanceof HTMLButtonElement)) throw new Error('Не знайдено кнопку «Скасувати»');
  if (!(form instanceof HTMLFormElement)) throw new Error('Не знайдено форму #note-form');
  if (!(rating instanceof HTMLInputElement)) throw new Error('Не знайдено поле #note-rating');
  if (!(noteText instanceof HTMLTextAreaElement)) throw new Error('Не знайдено поле #note-text');
  if (!(ratingError instanceof HTMLElement)) throw new Error('Не знайдено повідомлення #note-rating-error');

  dialog.addEventListener('close', () => {
    opener?.focus();
    opener = null;
    currentShowId = null;
  });
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
  cancel.addEventListener('click', () => dialog.close());

  form.noValidate = true;

  const clearRatingError = () => {
    rating.removeAttribute('aria-invalid');
    rating.removeAttribute('aria-describedby');
    ratingError.textContent = '';
  };

  const validateRating = () => {
    const value = rating.value.trim();
    const number = Number(value);
    if (value && Number.isInteger(number) && number >= 1 && number <= 10) {
      clearRatingError();
      return number;
    }

    rating.setAttribute('aria-invalid', 'true');
    rating.setAttribute('aria-describedby', ratingError.id);
    ratingError.textContent = value
      ? 'Введіть ціле число від 1 до 10.'
      : 'Вкажіть оцінку від 1 до 10.';
    return null;
  };

  rating.addEventListener('input', () => {
    if (rating.getAttribute('aria-invalid') === 'true') validateRating();
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const score = validateRating();
    if (score === null) {
      rating.focus();
      return;
    }

    const title = document.querySelector('#details-title');
    const status = document.querySelector('#status');
    if (!(title instanceof HTMLElement)) throw new Error('Не знайдено заголовок #details-title');
    if (!(status instanceof HTMLElement)) throw new Error('Не знайдено рядок статусу #status');

    if (currentShowId === null) throw new Error('Немає активного серіалу в діалозі');
    const show = getShow(currentShowId);
    saveNote(show.id, { rating: score, text: noteText.value });
    opener = null;
    dialog.close();
    refresh();
    status.textContent = `Нотатку до ${show.name} збережено`;

    const detailsButton = document.querySelector(
      `#results li[data-id="${show.id}"] [data-action="details"]`,
    );
    if (!(detailsButton instanceof HTMLElement)) {
      throw new Error(`Не знайдено кнопку «Детальніше» для ${show.name} після оновлення списку`);
    }
    detailsButton.focus();
  });
}

import AbstractView from '../framework/view/abstract-view.js';
import { createSortTemplate } from './sort.template.js';

export default class SortView extends AbstractView {
  #handleSortTypeChange = null;
  #currentSortType = null;

  constructor({onSortTypeChange, currentSortType}) {
    super();
    this.#handleSortTypeChange = onSortTypeChange;
    this.#currentSortType = currentSortType;

    this.element.addEventListener('click', this.#sortTypeChangeHandler);
  }

  get template() {
    return createSortTemplate(this.#currentSortType);
  }

  #sortTypeChangeHandler = (evt) => {
    evt.preventDefault();
    if (evt.target.classList.contains('sort__button') && !evt.target.classList.contains('sort__button--active')) {
      this.#handleSortTypeChange(evt.target, evt.target.dataset.sortType);
    }
  };

}

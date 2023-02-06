import { render, replace, remove } from '../framework/render.js';
import FilmCardView from '../view/film-card-view.js';
import PopupPresenter from './popup-presenter.js';
import { UserAction, UpdateType } from '../consts.js';


export default class FilmPresenter {
  #filmListContainer = null;
  #handleUpdateFilmData = null;

  #filmComponent = null;

  #popupPresenter = null;

  constructor({filmListContainer, onDataChange}) {
    this.#filmListContainer = filmListContainer;
    this.#handleUpdateFilmData = onDataChange;
  }

  init(film) {
    this.#popupPresenter = new PopupPresenter({
      film,
      onControlBtnClick: this.#handleControlButton,
      onAddComment: this.#handleAddComment,
      onDeleteComment: this.#handleDeleteComment
    });

    const prevFilmComponent = this.#filmComponent;
    this.#filmComponent = new FilmCardView({
      film,
      onClick: this.#handleClick,
      onControlBtnClick: this.#handleControlButton,
    });

    if (prevFilmComponent === null) {
      render(this.#filmComponent, this.#filmListContainer);
      return;
    }

    //re-render
    replace(this.#filmComponent, prevFilmComponent);

    remove(prevFilmComponent);
  }

  destroy() {
    remove(this.#filmComponent);
  }

  #handleClick = () => {
    this.#popupPresenter.showPopup();
  };

  #handleControlButton = (updatedFilm) => {
    this.#handleUpdateFilmData(
      UserAction.UPDATE_FILM,
      UpdateType.PATCH,
      updatedFilm
    );
  };

  #handleAddComment = (updatedFilm) => {
    this.#handleUpdateFilmData(
      UserAction.ADD_COMMENT,
      UpdateType.PATCH,
      updatedFilm
    );
  };

  #handleDeleteComment = (updatedFilm) => {
    this.#handleUpdateFilmData(
      UserAction.DELETE_COMMENT,
      UpdateType.PATCH,
      updatedFilm
    );
  };

}

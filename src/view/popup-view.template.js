import { humanizeDate } from '../utils.js';
import { COMMENTS_EMOTIONS, DateFormat } from '../consts.js';
import dayjs from 'dayjs';

const createInfoTemplate = (filmInfo) => {
  const {title, alternativeTitle, totalRating, poster, ageRating, director, writers, actors, duration, genre, description} = filmInfo;
  const releaseDateMarkup = humanizeDate(filmInfo.release.date, DateFormat.FILM_POPUP);

  return (`
      <div class="film-details__poster">
        <img class="film-details__poster-img" src="${poster}" alt="">
        <p class="film-details__age">${ageRating}+</p>
      </div>
      <div class="film-details__info">
        <div class="film-details__info-head">
          <div class="film-details__title-wrap">
            <h3 class="film-details__title">${title}</h3>
            <p class="film-details__title-original">${alternativeTitle}</p>
          </div>
          <div class="film-details__rating">
            <p class="film-details__total-rating">${totalRating}</p>
          </div>
        </div>
        <table class="film-details__table">
          <tr class="film-details__row">
            <td class="film-details__term">Director</td>
            <td class="film-details__cell">${director}</td>
          </tr>
          <tr class="film-details__row">
            <td class="film-details__term">Writers</td>
            <td class="film-details__cell">${writers.join(', ')}</td>
          </tr>
          <tr class="film-details__row">
            <td class="film-details__term">Actors</td>
            <td class="film-details__cell">${actors.join(', ')}</td>
          </tr>
          <tr class="film-details__row">
            <td class="film-details__term">Release Date</td>
            <td class="film-details__cell">${releaseDateMarkup}</td>
          </tr>
          <tr class="film-details__row">
            <td class="film-details__term">Duration</td>
            <td class="film-details__cell">${duration}</td>
          </tr>
          <tr class="film-details__row">
            <td class="film-details__term">Country</td>
            <td class="film-details__cell">USA</td>
          </tr>
          <tr class="film-details__row">
            <td class="film-details__term">Genres</td>
            <td class="film-details__cell">
              <span class="film-details__genre">${genre}</span>
              <span class="film-details__genre">Film-Noir</span>
              <span class="film-details__genre">Mystery</span>
          </td>
          </tr>
        </table>
        <p class="film-details__film-description">
          ${description}
        </p>
      </div>
    `);
};

const createControlButtonsTemplate = (filmUserDetails) => {
  const {alreadyWatched, favorite, watchlist} = filmUserDetails;

  return (`
  <button type="button"
  class="film-details__control-button film-details__control-button--watchlist ${watchlist ? 'film-details__control-button--active' : ''}"
  id="watchlist" name="watchlist" data-user-detail="watchlist">Add to watchlist</button>
  <button type="button"
  class="film-details__control-button film-details__control-button--watched ${alreadyWatched ? 'film-details__control-button--active' : ''}"
  id="watched" name="watched" data-user-detail="alreadyWatched">Already watched</button>
  <button type="button"
  class="film-details__control-button film-details__control-button--favorite ${favorite ? 'film-details__control-button--active' : ''}"
  id="favorite" name="favorite" data-user-detail="favorite">Add to favorites</button>
  `);
};

const createCommentsTemplate = (comments) => (`
    <h3 class="film-details__comments-title">Comments <span class="film-details__comments-count">${comments.length}</span></h3>
    <ul class="film-details__comments-list">
      ${comments.map((comment) => `
      <li class="film-details__comment">
      <span class="film-details__comment-emoji">
        <img src="./images/emoji/${comment.emotion}.png" width="55" height="55" alt="emoji-${comment.emotion}">
      </span>
      <div>
        <p class="film-details__comment-text">${comment.comment}</p>
        <p class="film-details__comment-info">
          <span class="film-details__comment-author">${comment.author}</span>
          <span class="film-details__comment-day">${dayjs(comment.date).fromNow()}</span>
          <button class="film-details__comment-delete" data-id="${comment.id}">Delete</button>
        </p>
      </div>
    </li>
      `).join('')}
    </ul>
`);

const createAddCommentFormTemplate = (commentEmoji, commentText = '') => (`
    <div class="film-details__add-emoji-label">
      <img src="./images/emoji/${commentEmoji}.png" width="30" height="30" alt="emoji">
    </div>
    <label class="film-details__comment-label">
      <textarea class="film-details__comment-input" placeholder="Select reaction below and write comment here"
        name="comment">${commentText}</textarea>
    </label>
    <div class="film-details__emoji-list">
      ${COMMENTS_EMOTIONS.map((emotion) => `
        <input class="film-details__emoji-item visually-hidden" name="comment-emoji" type="radio" id="emoji-${emotion}"
          value="${emotion}" ${emotion === commentEmoji ? 'checked' : ''}>
        <label class="film-details__emoji-label" for="emoji-${emotion}">
          <img src="./images/emoji/${emotion}.png" width="30" height="30" alt="emoji">
        </label>
      `).join('')}
    </div>
`);

export const createFilmPopupTemplate = (film) => {
  const {filmInfo, userDetails, comments, commentEmoji, commentText} = film;

  const infoTemplate = createInfoTemplate(filmInfo);
  const controlButtonsTemplate = createControlButtonsTemplate(userDetails);
  const commentsTemplate = createCommentsTemplate(comments);
  const formTemplate = createAddCommentFormTemplate(commentEmoji, commentText);

  return (
    `<section class="film-details">
      <div class="film-details__inner">
        <div class="film-details__top-container">
          <div class="film-details__close">
            <button class="film-details__close-btn" type="button">close</button>
          </div>
          <div class="film-details__info-wrap">
            ${infoTemplate}
          </div>
          <section class="film-details__controls">
            ${controlButtonsTemplate}
          </section>
        </div>
        <div class="film-details__bottom-container">
          <section class="film-details__comments-wrap">
            ${commentsTemplate}
            <form class="film-details__new-comment" action="" method="get">
              ${formTemplate}
            </form>
          </section>
        </div>
      </div>
    </section>`
  );
};

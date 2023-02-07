import { makeUserRank} from '../utils.js';

export const createUserRankTemplate = (watchedFilmsCount) => {
  const userRank = makeUserRank(watchedFilmsCount);
  const profileTemplate = userRank ? `<p class="profile__rating">${userRank}</p>` : '';

  return `
    <section class="header__profile profile">
      ${profileTemplate}
      <img class="profile__avatar" src="images/bitmap@2x.png" alt="Avatar" width="35" height="35">
    </section>
  `;
};

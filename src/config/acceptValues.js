const acceptNumberAndLetter = '^[a-zA-Z0-9_.-]*$';
// const acceptLeague = ['NBA', 'CBA', 'MLB', 'KBO', 'NPB', 'CPBL', 'eSoccer'];

const acceptLeague = ['NBA', 'MLB', 'KBO', 'NPB', 'CPBL', 'Soccer'];

const allLeague = ['MLB', 'CPBL', 'KBO', 'NPB', 'ABL', 'LMB', 'NBA', 'SBL', 'WNBA', 'NBL', 'KBL', 'CBA', 'BJL', 'NHL', 'Soccer', 'eSoccer'];

module.exports = {
  acceptNumberAndLetter,
  acceptLeague,
  allLeague
};

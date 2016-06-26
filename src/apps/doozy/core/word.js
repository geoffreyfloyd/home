function plural (noun) {
   var vowels = ['a', 'e', 'i', 'o', 'u'];
   if (noun[noun.length - 1] === 'y' && vowels.indexOf(noun[noun.length - 2].toLowerCase()) === -1) {
      return noun.substring(0, noun.length - 1) + 'ies';
   }
   else {
      return noun + 's';
   }
}

module.exports = exports = {

   startsWithAVowel (word) {
      if (['a', 'e', 'i', 'o', 'u'].indexOf(word[0].toLowerCase()) > -1) {
         return true;
      }
      return false;
   },

   hasPossessiveNoun (words) {
      if (words.indexOf('\'s ') > 0 || words.indexOf('s\' ') > 0) {
         return true;
      }
      return false;
   },

   /**
   * Pluralizes a word based on how many
   */
   formatNoun (noun, howMany) {
      if (howMany === 0) {
         return 'no ' + plural(noun);
      }
      else if (howMany === 1) {
         return noun;
      }
      else {
         return plural(noun);
      }
   },
};

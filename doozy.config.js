module.exports = {
   log: {
      done: ['^= ?(.*)$', '^x ?(.*)$'],
      note: ['^######+$'], // ['^\/\*', '^\/\/$']
      todo: ['^- ?(.*)$', '^o ?(.*)$'],
      tag: ['^## (.*)$'], // SPANNING ONE LINE, PULL SPACE SEPARATED WORDS AS TAGS FOR THE ENTIRE LOG
   },
   meta: {
      comment: ['\/\* ?([\s\S]*) ?\*\//', '\/\/ ?(.*)$'],
      start: ['~(\S*)'],
      tag: ['#(\S*)'],
      due: ['^(\S*)'],
      location: ['@(\S*)'],
      priority: ['!(\S*)'],
      duration: ['=(\S*)'],
      repeat: ['\*(\S*)'],
   },
};

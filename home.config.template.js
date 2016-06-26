var path = require('path');

module.exports = exports = {
   //
   // Apps
   // -------------------------------------------------------
   apps: {
      console: path.resolve(__dirname, './src/apps/console'),
      doozy: path.resolve(__dirname, './src/apps/doozy'),
      gnidbits: path.resolve(__dirname, './src/apps/gnidbits'),
   },
   plugins: [],

   //
   // Local Filesystem Host Settings
   // -------------------------------------------------------
   dirs: [], // { mnt: 'music', path: path.resolve('c:/music/') }

   //
   // Git Repository Settings
   // -------------------------------------------------------
   remoteUrl: 'https://github.com/mygithub/mygitdb.git', // Remote
   repoPath: path.resolve(__dirname, '../mygitdb'), // Local
   name: '', // For Commit Messages
   email: '', // For Commit Messages
   uid: '', // For Remote Login
   pwd: '', // For Remote Login

   //
   // OAuth Provider Settings
   // -------------------------------------------------------
   passport: {
      // https://code.google.com/apis/console/
      google: {
         id: '',
         secret: '',
         callback: '',
         profileId: '',
      },
   },

   //
   // User Access Settings
   // -------------------------------------------------------
   users: {
      producers: [], // OAuth Provider IDs
      consumers: [], // OAuth Provider IDs
   },

   //
   // Server Session Config
   // -------------------------------------------------------
   sessionSecret: 'sup3rblyS3cretiveS3ssi0nS3cretSampl3',
};

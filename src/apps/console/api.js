module.exports = function (operator) {
   operator.server.get('/api/gnodes/pretty', operator.authenticate, operator.authorize, operator.jsonResponse, (req, res) => {
      operator.getDb(db => {
         // Get all gnodes from db
         var results = [];
         results = results.concat(db.allOf('doozy.action'));
         results = results.concat(db.allOf('doozy.focus'));
         results = results.concat(db.allOf('doozy.logentry'));
         results = results.concat(db.allOf('doozy.plan'));
         results = results.concat(db.allOf('doozy.planstep'));
         results = results.concat(db.allOf('doozy.tag'));
         results = results.concat(db.allOf('doozy.target'));
         results = results.concat(db.allOf('gnidbits.bit'));
         results = results.concat(db.allOf('gnidbits.strip'));
         results = results.concat(db.allOf('tag'));

         results.forEach(gnode => {
            console.log('Set state');
            // Set state to itself
            gnode.setState(gnode.state);
         });

         // Commit the updated gnode states
         db.commitChanges();

         // Done
         res.end();
      });
   });
};

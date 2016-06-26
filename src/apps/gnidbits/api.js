import { create, get, getAll, remove, update } from '../../data/queries/core';
import those from 'those';

module.exports = function (operator) {
   /*****************************************************
   * BITS
   ****************************************************/
   operator.server.get('/gnidbits/api/bit', operator.authenticate, operator.authorize, operator.jsonResponse, (req, res) => {
      getAll(operator, 'gnidbits.bit').then(result => {
         res.end(JSON.stringify(result));
      });
   });

   operator.server.get('/gnidbits/api/bit/:id', operator.authenticate, operator.authorize, operator.jsonResponse, (req, res) => {
      get(operator, req.params.id, 'gnidbits.bit').then(result => {
         res.end(JSON.stringify(result));
      });
   });

   operator.server.post('/gnidbits/api/bit', operator.authenticate, operator.authorize, operator.jsonResponse, (req, res) => {
      create(operator, 'gnidbits.bit', req.body, function (gnode, db, model) {
         // Create tag connections
         if (model.tags && model.tags.length) {
            model.tags.forEach(function (tag) {
               var tagNode = db.find(tag.id, 'tag').first();
               if (tagNode) {
                  gnode.connect(tagNode, db.RELATION.ASSOCIATE);
               }
            });
         }
      }, 'slug').then(result => {
         res.end(JSON.stringify(result));
      });
   });

   operator.server.put('/gnidbits/api/bit', operator.authenticate, operator.authorize, operator.jsonResponse, (req, res) => {
      update(operator, 'gnidbits.bit', req.body, function (gnode, db, model) {
         // remove old connections
         var removeConnections = [];
         gnode.related('tag').forEach(function (tagGnapse) {
            var isInState = false
            if (model.tags && model.tags.length) {
               for (var i = 0; i < model.tags.length; i++) {
                  var thisTagName = typeof model.tags[i] === 'string' ? model.tags[i] : model.tags[i].name;

                  if (thisTagName === tagGnapse.getTarget().tag) {
                     isInState = true;
                     break;
                  }
               }
            }
            if (!isInState) {
               removeConnections.push(tagGnapse);
            }
         });

         // Remove tags
         removeConnections.forEach(function (gnapse) {
            gnode.disconnect(gnapse);
         });

         // Create tag connections
         if (model.tags && model.tags.length) {
            model.tags.forEach(function (tag) {
               var exists, tagNode, tagName;
               if (typeof tag === 'string') {
                  tagName = tag;
               }
               else {
                  tagName = tag.name;
               }
               exists = those(gnode.related('tag').map(function (gnapse) { return gnapse.getTarget().state; })).first({ name: tagName });
               tagNode = db.find(tagName, 'tag').first();
               if (!exists && tagNode) {
                  gnode.connect(tagNode, db.RELATION.ASSOCIATE);
               }
            });
         }
      }).then(result => {
         res.end(JSON.stringify(result));
      });
   });

   operator.server.delete('/gnidbits/api/bit/:id', operator.authenticate, operator.authorize, operator.jsonResponse, (req, res) => {
      remove(operator, 'gnidbits.bit', req.params.id).then(result => {
         res.end(JSON.stringify(result));
      });
   });
};

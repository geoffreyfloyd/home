import { create, get, getAll, remove, update } from '../../data/queries/core';
import those from 'those';

/**
 * Set the context for data access
 */
module.exports = function (operator) {
   /*****************************************************
   * ACTIONS
   ****************************************************/
   operator.server.post('/api/doozy/action', operator.authenticate, operator.authorize, operator.jsonResponse, (req, res) => {
      create(operator, 'doozy.action', req.body, (gnode, db, model) => {
         // Create tag connections
         if (model.tags && model.tags.length) {
            model.tags.forEach(tag => {
               var tagNode = db.find(tag.name, 'tag').first();
               if (tagNode) {
                  gnode.connect(tagNode, db.RELATION.ASSOCIATE);
               }
            });
         }
      }).then(result => {
         res.end(JSON.stringify(result));
      });
   });

   operator.server.put('/api/doozy/action', operator.authenticate, operator.authorize, operator.jsonResponse, (req, res) => {
      update(operator, 'doozy.action', req.body, (gnode, db, model) => {
         // remove old connections
         var removeConnections = [];
         gnode.related('tag').forEach(tagGnapse => {
            var isInState = false;
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
         removeConnections.forEach(gnapse => {
            gnode.disconnect(gnapse);
         });

         // Create tag connections
         if (model.tags && model.tags.length) {
            model.tags.forEach(tag => {
               var exists, tagNode, tagName;
               if (typeof tag === 'string') {
                  tagName = tag;
               }
               else {
                  tagName = tag.name;
               }
               exists = those(gnode.related('tag').map(gnapse => gnapse.getTarget().state)).first({ name: tagName });
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

   operator.server.delete('/api/doozy/action/:id', operator.authenticate, operator.authorize, operator.jsonResponse, (req, res) => {
      remove(operator, 'doozy.action', req.params.id, (gnode, db) => {
         gnode.related('doozy.logentry').forEach(logGnapse => {
            var logGnode = logGnapse.getTarget();
            if (logGnode) {
               // Merge name / content / details
               var details = gnode.state.name || '';
               if (gnode.state.content && gnode.state.content.length > 0) {
                  details += `\n\n${gnode.state.content}`;
               }
               if (logGnode.state.details) {
                  details += `\n\n${gnode.state.details}`;
               }
               logGnode.setState({
                  details,
               });

               // Merge tags
               gnode.related('tag').forEach(tagGnapse => {
                  var tagGnode = tagGnapse.getTarget();
                  if (tagGnode) {
                     var existsInLog = false;
                     logGnode.related('tag').forEach(ltagGnapse => {
                        var ltagGnode = ltagGnapse.getTarget();
                        if (ltagGnode && ltagGnode.state.tag === tagGnode.state.tag) {
                           existsInLog = true;
                        }
                     });
                     if (!existsInLog) {
                        logGnode.connect(tagGnode, db.RELATION.ASSOCIATE);
                     }
                  }
               });
            }
         });
      }).then(result => {
         res.end(JSON.stringify(result));
      });
   });

   /*****************************************************
   * FOCUSES
   ****************************************************/
   operator.server.get('/api/doozy/focus', operator.authenticate, operator.authorize, operator.jsonResponse, (req, res) => {
      getAll(operator, 'doozy.focus').then(result => {
         res.end(JSON.stringify(result));
      });
   });

   operator.server.get('/api/doozy/focus/:id/:version', operator.authenticate, operator.authorize, operator.jsonResponse, (req, res) => {
      get(operator, req.params.id, 'doozy.focus').then(result => {
         res.end(JSON.stringify(result));
      });
   });

   operator.server.post('/api/doozy/focus', operator.authenticate, operator.authorize, operator.jsonResponse, (req, res) => {
      create(operator, 'doozy.focus', req.body).then(result => {
         res.end(JSON.stringify(result));
      });
   });

   operator.server.put('/api/doozy/focus', operator.authenticate, operator.authorize, operator.jsonResponse, (req, res) => {
      update(operator, 'doozy.focus', req.body).then(result => {
         res.end(JSON.stringify(result));
      });
   });

   operator.server.delete('/api/doozy/focus/:id', operator.authenticate, operator.authorize, operator.jsonResponse, (req, res) => {
      remove(operator, 'doozy.focus', req.params.id).then(result => {
         res.end(JSON.stringify(result));
      });
   });

   /*****************************************************
   * TAGS
   ****************************************************/
   operator.server.post('/api/doozy/tag', operator.authenticate, operator.authorize, operator.jsonResponse, (req, res) => {
      create(operator, 'tag', req.body).then(result => {
         res.end(JSON.stringify(result));
      });
   });

   operator.server.put('/api/doozy/tag', operator.authenticate, operator.authorize, operator.jsonResponse, (req, res) => {
      update(operator, 'tag', req.body).then(result => {
         res.end(JSON.stringify(result));
      });
   });

   operator.server.delete('/api/doozy/tag/:id', operator.authenticate, operator.authorize, operator.jsonResponse, (req, res) => {
      remove(operator, 'tag', req.params.id).then(result => {
         res.end(JSON.stringify(result));
      });
   });

   /*****************************************************
   * TARGETS
   ****************************************************/
   operator.server.post('/api/doozy/target', operator.authenticate, operator.authorize, operator.jsonResponse, (req, res) => {
      create(operator, 'doozy.target', req.body).then(result => {
         res.end(JSON.stringify(result));
      });
   });

   operator.server.put('/api/doozy/target', operator.authenticate, operator.authorize, operator.jsonResponse, (req, res) => {
      update(operator, 'doozy.target', req.body).then(result => {
         res.end(JSON.stringify(result));
      });
   });

   operator.server.delete('/api/doozy/target/:id', operator.authenticate, operator.authorize, operator.jsonResponse, (req, res) => {
      remove(operator, 'doozy.target', req.params.id).then(result => {
         res.end(JSON.stringify(result));
      });
   });

   /*****************************************************
   * PLANS
   ****************************************************/
   operator.server.post('/api/doozy/plan', operator.authenticate, operator.authorize, operator.jsonResponse, (req, res) => {
      create(operator, 'doozy.plan', req.body).then(result => {
         res.end(JSON.stringify(result));
      });
   });

   operator.server.put('/api/doozy/plan', operator.authenticate, operator.authorize, operator.jsonResponse, (req, res) => {
      update(operator, 'doozy.plan', req.body).then(result => {
         res.end(JSON.stringify(result));
      });
   });

   operator.server.delete('/api/doozy/plan/:id', operator.authenticate, operator.authorize, operator.jsonResponse, (req, res) => {
      remove(operator, 'doozy.plan', req.params.id).then(result => {
         res.end(JSON.stringify(result));
      });
   });

   /*****************************************************
   * PLAN STEPS
   ****************************************************/
   operator.server.post('/api/doozy/planstep', operator.authenticate, operator.authorize, operator.jsonResponse, (req, res) => {
      create(operator, 'doozy.planstep', req.body, (gnode, db, model) => {
         // set connections
         if (model.planId) {
            // Get plan (may be parent or associate)
            var plan = db.find(model.planId, 'doozy.plan').first();
            if (plan) {
               gnode.connect(plan, (model.parentId ? db.RELATION.ASSOCIATE : db.RELATION.CHILD_PARENT));
            }
         }
         if (model.parentId) {
            // Get parent planstep (if not root)
            var parent = db.find(model.parentId, 'doozy.planstep').first();
            if (parent) {
               gnode.connect(parent, db.RELATION.CHILD_PARENT);
            }
         }
      }).then(result => {
         res.end(JSON.stringify(result));
      });
   });

   operator.server.put('/api/doozy/planstep', operator.authenticate, operator.authorize, operator.jsonResponse, (req, res) => {
      update(operator, 'doozy.planstep', req.body).then(result => {
         res.end(JSON.stringify(result));
      });
   });

   operator.server.delete('/api/doozy/planstep/:id', operator.authenticate, operator.authorize, operator.jsonResponse, (req, res) => {
      remove(operator, 'doozy.planstep', req.params.id).then(result => {
         res.end(JSON.stringify(result));
      });
   });

   /*****************************************************
   * LOG ENTRIES
   ****************************************************/
   operator.server.post('/api/doozy/logentry', operator.authenticate, operator.authorize, operator.jsonResponse, (req, res) => {
      create(operator, 'doozy.logentry', req.body,
         // Create Connections
         (gnode, db, model) => {
            // Create tag connections
            if (model.tags && model.tags.length) {
               model.tags.forEach(tag => {
                  var tagNode = db.find(tag.name, 'tag').first();
                  if (tagNode) {
                     gnode.connect(tagNode, db.RELATION.ASSOCIATE);
                  }
               });
            }

            if (model.actionId) {
               // Create action connection
               var actionNode = db.find(model.actionId, 'doozy.action').first();
               if (actionNode) {
                  gnode.connect(actionNode, db.RELATION.ASSOCIATE);
               }

               if (actionNode.state.recurrenceRules && actionNode.state.recurrenceRules.length) {
                  // Recalculate Next Date for Action
                  var latestPerformance = those(actionNode.related('doozy.logentry').map(gnapse => gnapse.getTarget().state)).max('date');
                  var latestDate;
                  if (latestPerformance && latestPerformance > model.date) {
                     latestDate = latestPerformance.date;
                  }
                  else {
                     latestDate = model.date;
                  }
                  var recurrenceBegin = actionNode.state.beginDate || actionNode.state.created || actionNode.born.toISOString();
                  var nextOccur = doozy.getNextOccurrence(actionNode.state.recurrenceRules, new Date(Date.parse(recurrenceBegin)), new Date(Date.parse(latestDate)));
                  if (nextOccur && nextOccur !== actionNode.state.nextDate) {
                     actionNode.setState({
                        nextDate: nextOccur,
                     });
                  }
               }
            }
         },
         // Generate Tag
         (gnode, db, model) => {
            // generate the log entry tag from data (log entries don't have names)
            var when = `${model.date.split('T')[0]}-`;
            var what;
            if (model.actionId) {
               var actionNode = db.find(model.actionId, 'doozy.action').first();
               if (actionNode) {
                  what = actionNode.tag;
               }
            }
            else if (model.tags && model.tags.length) {
               what = model.tags.map(tag => tag.name).join('_');
            }
            else {
               what = model.details;
            }
            return when + (what || '');
         }).then(result => {
            res.end(JSON.stringify(result));
         });
   });

   operator.server.put('/api/doozy/logentry', operator.authenticate, operator.authorize, operator.jsonResponse, (req, res) => {
      update(operator, 'doozy.logentry', req.body,
         // Update Connections
         (gnode, db, model) => {
            // remove old connections
            var removeConnections = [];
            gnode.related('tag').forEach(tagGnapse => {
               var isInState = false;
               if (model.tags && model.tags.length) {
                  for (var i = 0; i < model.tags.length; i++) {
                     if (model.tags[i].name === tagGnapse.getTarget().tag) {
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
            removeConnections.forEach(gnapse => {
               gnode.disconnect(gnapse);
            });

            // Create tag connections
            if (model.tags && model.tags.length) {
               model.tags.forEach(tag => {
                  var exists, tagNode, tagName;
                  if (typeof tag === 'string') {
                     tagName = tag;
                  }
                  else {
                     tagName = tag.name;
                  }
                  exists = those(gnode.related('tag').map(gnapse => gnapse.getTarget().state)).first({ name: tagName });
                  tagNode = db.find(tagName, 'tag').first();
                  if (!exists && tagNode) {
                     gnode.connect(tagNode, db.RELATION.ASSOCIATE);
                  }
               });
            }

            // action is no longer connected
            removeConnections = [];
            gnode.related('doozy.action').forEach(actionGnapse => {
               var isInState = false;
               if (model.actionId === actionGnapse.getTarget().tag) {
                  isInState = true;
               }
               if (!isInState) {
                  removeConnections.push(actionGnapse);
               }
            });
            removeConnections.forEach(gnapse => {
               gnode.disconnect(gnapse);
            });

            // action is now connected
            if (model.actionId && model.actionId !== gnode.state.actionId) {
               var actionNode = db.find(model.actionId, 'doozy.action').first();
               if (actionNode) {
                  gnode.connect(actionNode, db.RELATION.ASSOCIATE);
               }
            }
         }).then(result => {
            res.end(JSON.stringify(result));
         });
   });

   operator.server.delete('/api/doozy/logentry/:id', operator.authenticate, operator.authorize, operator.jsonResponse, (req, res) => {
      remove(operator, 'doozy.logentry', req.params.id).then(result => {
         res.end(JSON.stringify(result));
      });
   });
};

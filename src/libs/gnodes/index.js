
/**
 * Gnodes.js
 * Git + Node.js + Neural Networks = Intelligently-Evolving, Multi-Relational, Version-Controlled Object Database
 */

import Promise from 'bluebird';
import fse from 'fs-extra';
var fs = Promise.promisifyAll(fse);
import Gnapse from './gnapse';
import Gnode from './gnode';
import Firing from './firing';
import { first, slugify, RELATION, RELEVANCE, REACTION } from './core';

// ensureDir is an alias to mkdirp, which has the callback with a weird name
// and in the 3rd position of 4 (the 4th being used for recursion). We have to
// force promisify it, because promisify-node won't detect it on its
// own and assumes sync
fs.ensureDir = Promise.promisify(fs.ensureDir);
import NodeGit from 'nodegit';
import path from 'path';

/**
 * Publicly exposed enums, methods, and properties are added to this object.
 * This has the additional benefit of easily reading code and seeing what
 * which parts could affect consumers of this library
 */
var db = {
   Gnode: Gnode,
   Gnapse: Gnapse,
   Firing: Firing,
   RELATION: RELATION,
   RELEVANCE: RELEVANCE,
   REACTION: REACTION,
   util: {
      slugify: slugify,
   },
};
db.ns = {};
db.gnodeChanges = {};
db.gnapseChanges = {};

db.gitIndexPath = function (p) {
   return p.slice(db.repoPath.length + 1).replace(/\\/g, '/');
};

db.createGnode = function (tag, kind, state, blob) {
   return new Gnode(db, tag, kind, state, blob);
};

/**********************************************************************
 * File System Helpers
 **********************************************************************/
var deleteFolderRecursiveSync = function (p) {
   if (fs.existsSync(p)) {
      fs.readdirSync(p).forEach(function (file, index) {
         var curPath = PannerNode + '/' + file;
         if (fs.lstatSync(curPath).isDirectory()) { // recurse
            deleteFolderRecursiveSync(curPath);
         }
         else { // delete file
            fs.unlinkSync(curPath);
         }
      });
      fs.rmdirSync(p);
   }
};

var gnodeKindPath = function (gnode) {
   return path.join.apply(this, [db.repoPath].concat(gnode.kind.split('.')));
};

var gnodeDirPath = function (gnode) {
   return path.join.apply(this, [db.repoPath].concat(gnode.path().split('.')));
};

var gnapseFileName = function (gnapse) {
   var relations = ['p', 'a', 'c'];
   return relations[gnapse.relation + 1] + '_' + gnapse.getTarget().path();
};

var gnapseFileNameFromReverse = function (gnapse) {
   var relations = ['p', 'a', 'c'];
   var relation = gnapse.relation * -1; // reverse relation
   return relations[relation + 1] + '_' + gnapse.origin.path();
};

var isSyncing = false;
var syncId;

var sync = function () {
   if (syncId) {
      clearTimeout(syncId);
   }
   syncId = setTimeout(function () {
      if (isSyncing) {
         return;
      }
      isSyncing = true;
      db.context.repo.fetchAll({ callbacks: getRemoteCallbacks() }).then(function () {
         var syncer = NodeGit.Signature.now(db.context.name, db.context.email);
         // Rebase
         db.context.repo.rebaseBranches('master', 'origin/master', 'origin/master', syncer).then(function () {
            // Push
            NodeGit.Remote.lookup(db.context.repo, 'origin').then(function (remote) {
               return remote.push(['refs/heads/master:refs/heads/master'], { callbacks: getRemoteCallbacks() }).catch(function (e) {
                  console.log(String(e));
               }).then(function () {
                  isSyncing = false;
               });
            });
         });
      });
   }, 5000);
};

db.connect = function (source, target, sourceToTargetRelation) {
   source.connect(target, sourceToTargetRelation);
};

db.disconnect = function (gnode, gnapse, doNotDetachFromOrigin) {
   gnode.disconnect(gnapse, doNotDetachFromOrigin);
};

var commitGnode = function (gnodeChg) {
   return new Promise(function (resolve, reject) {
      var pathGnbase = gnodeDirPath(gnodeChg.gnode);
      var pathGnon = path.join.apply(this, [pathGnbase].concat(['.gnon']));
      var movedList = [];

      // This try clause should remain synchonous
      try {
         switch (gnodeChg.transaction) {
            case ('add'):
            case ('update'):
               // Write Gnon to Disk
               fs.ensureDirSync(pathGnbase);
               fs.writeFileSync(pathGnon, JSON.stringify(gnodeChg.gnode.state, null, 4));

               resolve({
                  gnodeChg: gnodeChg,
                  pathGnbase: pathGnbase,
                  pathGnon: pathGnon,
                  movedList: movedList,
               });
               break;

            case ('remove'):
               resolve({
                  gnodeChg: gnodeChg,
                  pathGnbase: pathGnbase,
                  pathGnon: pathGnon,
               });
               break;
            case ('move'):
               var srcKind = gnodeChg.source.split('.').slice(0, -1).join('.');
               var destKind = gnodeChg.destination.split('.').slice(0, -1).join('.');
               var kindDidChange = srcKind !== destKind;
               var destTag = gnodeChg.destination.split('.').slice(-1)[0];
               var destKindPath = path.join.apply(this, [db.repoPath].concat(destKind.split('.')));
               var destBasePath = path.join.apply(this, [destKindPath, destTag]);

               // Ensure kind root dir exists before we move a gnode to it
               if (kindDidChange) {
                  fs.ensureDirSync(destKindPath);
               }

               // rewrite tag and kind as necessary in gnapses
               gnodeChg.gnode.gnapses.forEach(function (gnapse) {
                  // Get the target nodes gnapse filepath that points to origin node
                  var relGnapseFileName = gnapseFileNameFromReverse(gnapse);
                  var relGnode = gnapse.getTarget();
                  var relPathGnbase = gnodeDirPath(relGnode);
                  var relGnapseFilePath = path.join.apply(this, [relPathGnbase].concat(['.gnapses', relGnapseFileName]));

                  // Add external gnapse to array of files to be moved
                  movedList.push({
                     src: relGnapseFilePath,
                     dest: relGnapseFilePath.slice(0, -(relGnapseFileName.length)) + relGnapseFileName.slice(0, 2) + gnodeChg.destination,
                  });
               });

               fs.walk(pathGnbase)
                  .on('readable', function () {
                     var item;
                     while ((item = this.read())) {
                        if (item.stats.isFile()) {
                           movedList.push({
                              src: item.path,
                              dest: item.path.replace(pathGnbase, destBasePath),
                           });
                        }
                     }
                  })
                  .on('end', function () {
                     var count = movedList.length;
                     movedList.forEach(function (move) {
                        fs.move(move.src, move.dest).then(function (result) {
                           count--;
                           if (!count) {
                              resolve({
                                 gnodeChg: gnodeChg,
                                 pathGnbase: pathGnbase,
                                 pathGnon: pathGnon,
                                 movedList: movedList,
                                 destBasePath: destBasePath,
                                 destKind: destKind,
                                 destTag: destTag,
                              });
                           }
                        });
                     });
                  });
               break;
         }
      }
      catch (e) {
         console.log(e);
         reject();
      }
   })
      .then(function (fsArgs) {
         /**
          * All File System Operations have completed, now we write to the repo
          */
         var commitOid;

         // Commit changes to repo
         return db.context.repo.index()
            .catch(function (err) {
               /**
                * Catch error here
                */
               console.log(err);
            })
            .then(function (index) {
               /**
                * Write to index
                */
               switch (fsArgs.gnodeChg.transaction) {
                  case ('add'):
                  case ('update'):
                     // add files to index
                     index.addByPath(db.gitIndexPath(fsArgs.pathGnon));
                     break;
                  case ('remove'):
                     // remove files from index
                     index.removeByPath(db.gitIndexPath(fsArgs.pathGnon));
                     break;
                  case ('move'):
                     fsArgs.movedList.forEach(function (move) {
                        index.removeByPath(db.gitIndexPath(move.src));
                        index.addByPath(db.gitIndexPath(move.dest));
                     });
                     break;
               }
               index.write();
               return index.writeTree();
            })
            .then(function (oid) {
               /**
                * Get Commit head reference
                */
               commitOid = oid;
               return NodeGit.Reference.nameToId(db.context.repo, 'HEAD');
            })
            .then(function (head) {
               return db.context.repo.getCommit(head);
            })
            .then(function (parent) {
               /**
                * Create the commit
                */
               var author, committer;
               if (fsArgs.gnodeChg.transaction === 'add' && fsArgs.gnodeChg.gnode && fsArgs.gnodeChg.gnode.born && fsArgs.gnodeChg.gnode.born.getTime && fsArgs.gnodeChg.gnode.born.getTime()) {
                  // When creating a new gnode, the born date can be backdated, this is the only time it can happen
                  // afterwards the born date should pull from the
                  author = NodeGit.Signature.create(db.context.name, db.context.email, fsArgs.gnodeChg.gnode.born.getTime(), 0);
                  committer = NodeGit.Signature.create(db.context.name, db.context.email, fsArgs.gnodeChg.gnode.born.getTime(), 0);
               }
               else {
                  author = NodeGit.Signature.now(db.context.name, db.context.email);
                  committer = NodeGit.Signature.now(db.context.name, db.context.email);
               }

               // Build commit message
               var commitMsg = fsArgs.gnodeChg.transaction + ' gnode: ' + db.gitIndexPath(fsArgs.pathGnbase);
               if (fsArgs.gnodeChg.transaction === 'move') {
                  commitMsg += ' > ' + db.gitIndexPath(fsArgs.destBasePath);
               }

               // Start the commit promise
               return db.context.repo.createCommit('HEAD', author, committer, commitMsg, commitOid, [parent]);
            })
            .then(function (commitId) {
               console.log(fsArgs.gnodeChg.transaction + ' Gnode `' + fsArgs.gnodeChg.gnode.tag + '` committed: ', commitId);

               // committed, now lets remove it
               if (fsArgs.gnodeChg.transaction === 'add') {
                  // Update in-memory collection to reflect changes
                  setObjectPathway(fsArgs.gnodeChg.gnode);
               }
               else if (fsArgs.gnodeChg.transaction === 'remove') {
                  try {
                     // Delete Gnon from Disk
                     deleteFolderRecursiveSync(fsArgs.pathGnbase);
                  }
                  catch (e) {
                     console.log(e);
                  }
                  // Clean up in-memory collection to reflect changes
                  clearObjectPathway(fsArgs.gnodeChg.gnode);
               }
               else if (fsArgs.gnodeChg.transaction === 'move') {
                  // Update in-memory collection to reflect changes
                  clearObjectPathway(fsArgs.gnodeChg.gnode);
                  fsArgs.gnodeChg.gnode.kind = fsArgs.destKind;
                  fsArgs.gnodeChg.gnode.tag = fsArgs.destTag;
                  setObjectPathway(fsArgs.gnodeChg.gnode);

                  try {
                     // Delete old Gnon from Disk (empty folders left after move)
                     deleteFolderRecursiveSync(fsArgs.pathGnbase);
                  }
                  catch (e) {
                     console.log(e);
                  }
               }
            })
            .then(function () {
               sync();
            });
      });
};

var getRemoteCallbacks = function (config) {
   var opts = {
      // certificateCheck: function() {
      //    return 1;
      // },
      credentials: function (url, userName) {
         // return NodeGit.Cred.sshKeyFromAgent(userName);
         return NodeGit.Cred.userpassPlaintextNew(
            db.context.uid,
            db.context.pwd
         );
      },
   };
   return opts;
};

var commitGnapse = function (gnapseChg) {
   return new Promise(function (resolve, reject) {
      var commitOid;
      var pathGnapseRoot = path.join.apply(this, [gnodeDirPath(gnapseChg.gnapse.origin)].concat(['.gnapses']));
      var pathGnapse = path.join.apply(this, [pathGnapseRoot, gnapseFileName(gnapseChg.gnapse)]);

      try {
         switch (gnapseChg.transaction) {
            case ('add'):
            case ('update'):
               // Write to disk
               fs.ensureDirSync(pathGnapseRoot);
               fs.writeFileSync(pathGnapse, '');
               break;
         }
      }
      catch (e) {
         console.log(e);
         reject();
      }

      // Commit changes to repo
      db.context.repo.index()
         .catch(function (err) {
            console.log(err);
            reject();
         })
         .then(function (index) {
            if (gnapseChg.transaction !== 'remove') {
               // add files to index
               index.addByPath(db.gitIndexPath(pathGnapse));
            }
            else {
               // remove files from index
               index.removeByPath(db.gitIndexPath(pathGnapse));
            }

            index.write();
            return index.writeTree();
         })
         .then(function (oid) {
            commitOid = oid;
            return NodeGit.Reference.nameToId(db.context.repo, 'HEAD');
         })
         .then(function (head) {
            return db.context.repo.getCommit(head);
         })
         .then(function (parent) {
            var author = NodeGit.Signature.now(db.context.name, db.context.email);
            var committer = NodeGit.Signature.now(db.context.name, db.context.email);

            // Since we're creating an inital commit, it has no parents. Note that unlike
            // normal we don't get the head either, because there isn't one yet.
            return db.context.repo.createCommit('HEAD', author, committer, gnapseChg.transaction + ' gnapse: ' + db.gitIndexPath(pathGnapse), commitOid, [parent]);
         })
         .then(function (commitId) {
            console.log(gnapseChg.transaction + ' Gnapse `' + db.gitIndexPath(pathGnapse) + '` committed: ', commitId);

            // committed, now lets remove it
            if (gnapseChg.transaction === 'remove') {
               try {
                  // Remove from disk (could fail if owning gnode has been deleted)
                  fs.unlinkSync(pathGnapse);
               }
               catch (e) {
                  console.log(e);
               }
            }

            resolve();
         })
         .then(function () {
            sync();
         });
   });
};

var commits = [];

var processCommits = function () {
   if (commits && commits.length) {
      return commits.shift()().then(processCommits);
   }
   else {
      return null;
   }
};

db.commitChanges = function (msg) {
   // Write changes to disk
   for (var changedGnode in db.gnodeChanges) {
      if (db.gnodeChanges.hasOwnProperty(changedGnode)) {
         var gnodeChg = db.gnodeChanges[changedGnode];
         delete db.gnodeChanges[changedGnode];
         commits.push(commitGnode.bind(null, gnodeChg));
      }
   }

   for (var changedGnapse in db.gnapseChanges) {
      if (db.gnapseChanges.hasOwnProperty(changedGnapse)) {
         var gnapseChg = db.gnapseChanges[changedGnapse];
         delete db.gnapseChanges[changedGnapse];
         commits.push(commitGnapse.bind(null, gnapseChg));
      }
   }

   return processCommits();
};

db.add = function (gnode) {
   // Set the new change object
   var prop = gnode.path();
   db.gnodeChanges[prop] = {
      gnode: gnode,
      originalCopy: null,
      modifiedCopy: Object.assign({}, gnode.state),
      transaction: 'add',
   };

   // Return the node
   return gnode;
};

db.remove = function (gnode) {
   // sever connections to other gnodes
   gnode.disconnectAll(db);

   // Set the new change object
   var prop = gnode.path();

   db.gnodeChanges[prop] = {
      gnode: gnode,
      originalCopy: Object.assign({}, gnode.state),
      modifiedCopy: null,
      transaction: 'remove',
   };

   // Return the node
   return gnode;
};

db.move = function (source, destination) {
   // Get gnode at its current location
   var gnode = db.get(source);

   // Source does not exist
   if (!gnode) {
      return false;
   }

   // Set the new change object
   db.gnodeChanges[source] = {
      gnode: gnode,
      source: source,
      destination: destination,
      transaction: 'move',
   };

   // Return the node
   return gnode;
};

var navigateTo = function (gnodePath) {
   // Set object pathway to node
   var relativeNs = db.ns;
   gnodePath.split('.').forEach(function (ns) {
      relativeNs[ns] = relativeNs[ns] || {};
      relativeNs = relativeNs[ns];
   });
   return relativeNs;
};

var compareObjProps = function (find, search) {
   var match = true;
   for (var prop in find) {
      if (!search.hasOwnProperty(prop)) {
         match = false;
         break;
      }
      if (String(find[prop]).toLowerCase() !== String(search[prop]).toLowerCase()) {
         match = false;
         break;
      }
   }
   return match;
};

db.get = function (gnodePath) {
   var pathToGnode = gnodePath.split('.');
   var kind = pathToGnode.slice(0, pathToGnode.length - 1).join('.');
   var tag = pathToGnode.slice(-1);
   return navigateTo(kind)[tag];
};

db.all = function () {
   var results = [];
   console.warn('GNODES: all function is deprecated. Use allOf instead.');
   results.concat(db.allOf('doozy.action'));
   results.concat(db.allOf('doozy.focus'));
   results.concat(db.allOf('doozy.logentry'));
   results.concat(db.allOf('doozy.plan'));
   results.concat(db.allOf('doozy.planstep'));
   results.concat(db.allOf('doozy.tag'));
   results.concat(db.allOf('doozy.target'));
   return results;
};

db.allOf = function (kind) {
   var ns = navigateTo(kind);
   var results = [];
   for (var prop in ns) {
      if (ns.hasOwnProperty(prop)) {
         results.push(ns[prop]);
      }
   }
   results.first = first;
   return results;
};

db.find = function (searchFor, kind) {
   var results = [];

   if (kind && typeof kind === 'string') {
      // Utilize kind-path to narrow search object
      var ns = navigateTo(kind);
      for (var prop in ns) {
         if (ns.hasOwnProperty(prop)) {
            if ((typeof searchFor === 'string' && slugify(searchFor) === ns[prop].tag) ||
               ((typeof searchFor !== 'string' && compareObjProps(searchFor, ns[prop].state)))) {
               results.push(ns[prop]);
            }
         }
      }
   }
   else {
      // Search all gnodes
      db.all().forEach(function (gnode) {
         if ((typeof searchFor === 'string' && slugify(searchFor) === gnode.tag) ||
            ((typeof searchFor !== 'string' && compareObjProps(searchFor, gnode.state)))) {
            results.push(gnode);
         }
      });
   }

   // Add 'first' func to result to easily get when you want 1 or 0 of an entity
   results.first = first;

   return results;
};


/*********************************
 * INDEXING
 ********************************/
// TODO: This is where firings are analyzed and intelligent indexes are created for each gnode and gnapse
// Indexes are fluent and are not stored in the database, but are instead calculated after every cycle(), or whenever it is idle()
// This process can be likened to the concept of neural processing during REM. This processing means that every database has nightly downtime

function clearObjectPathway (gnode) {
   // Set object pathway to node
   var relativeNs = db.ns;
   gnode.kind.split('.').forEach(function (ns) {
      relativeNs[ns] = relativeNs[ns] || {};
      relativeNs = relativeNs[ns];
   });
   delete relativeNs[gnode.tag];
}

function setObjectPathway (gnode) {
   // Set object pathway to node
   var relativeNs = db.ns;
   gnode.kind.split('.').forEach(function (ns) {
      relativeNs[ns] = relativeNs[ns] || {};
      relativeNs = relativeNs[ns];
   });
   relativeNs[gnode.tag] = gnode;
}


function ignoreDirectory (path) {
   var ignoreDirs = ['\\.git\\', '\\.vs\\', '\\.gnapses\\', '\\README.md'];
   for (var i = 0; i < ignoreDirs.length; i++) {
      if (path.indexOf(ignoreDirs[i]) > -1) {
         return true;
      }
   }
   return false;
}

function load (context) {
   return new Promise(function (resolve, reject) {
      // Handle nodegit path sep but fall through to uniform approach
      // in case nodegit repo fixes this issue
      var nodeGitPathSep = path.sep;
      if (context.repo.workdir().indexOf('/') > 0 && path.sep !== '/') {
         nodeGitPathSep = '/';
      }

      // Find the depth of the root of the repo
      // to be able to extract the kind and tag from
      // the file system
      var rootDirSplit = context.repo.workdir().split(nodeGitPathSep);
      if (!rootDirSplit[rootDirSplit.length - 1]) {
         rootDirSplit.splice(-1, 1);
      }
      var rootDepth = rootDirSplit.length;
      var fileCleanup = [];

      fs.walk(context.repo.workdir())
         .on('readable', function () {
            var item;
            while ((item = this.read())) {
               // For a folder to be considered a gnode, it must have a '.gnon' file
               // This file can be blank, but it must exist
               if (item.stats.isFile() && path.basename(item.path) === '.gnon' && !ignoreDirectory(item.path)) {
                  // Read json contents of gnode to an object (this is the state)
                  var state = fs.readJsonSync(item.path, { throws: false });
                  if (!state) {
                     state = {};
                  }

                  // Populate gnode; derive tag and kind from the folder structure
                  var sliced = item.path.split(path.sep).slice(rootDepth);
                  var kind = sliced.slice(0, -2).join('.');
                  var tag = sliced.slice(-2)[0];
                  var gnode = {
                     __proto__: Gnode.prototype,
                     db: db,
                     born: item.stats.birthtime || item.stats.atime || null,
                     kind: kind,
                     tag: tag,
                     gnapses: [],
                     state: state,

                     // TODO: Calculate
                     version: 1, // TODO: how resource intensive to pull the latest commit sha for this file
                  };

                  // Set the object pathway
                  setObjectPathway(gnode);

                  // Load this gnodes gnapses
                  loadGnapses(gnode);
               }
            }
         })
         .on('error', function (err) {
            reject(err);
         })
         .on('end', function () {
            fileCleanup.forEach(function (cleanFile) {
               fs.writeFileSync(cleanFile.path, cleanFile.content);
            });
            resolve();
         });
   });
}

/**
 * Load a gnode's gnapses from the filesystem
 */
function loadGnapses (gnode) {
   // Get path of gnode's gnapses folder
   var gnapsesPath = path.join.apply(this, [db.repoPath].concat(gnode.kind.split('.')).concat([gnode.tag]).concat(['.gnapses']));
   var fileCleanup = [];

   // Walk through files and load
   fs.walk(gnapsesPath).on('readable', function () {
      var item;
      while (item = this.read()) {
         // All files in '.gnapses' are by assumed to be a pointer to a gnode
         if (item.stats.isFile()) {
            // Build target and relation from path
            var base = path.basename(item.path);
            var target = base.slice(2);
            var relation = base.slice(0, 1);
            if (relation === 'p') {
               relation = -1;
            }
            else if (relation === 'c') {
               relation = 1;
            }
            else {
               relation = 0;
            }

            // Populate Gnapse object
            var gnapse = {
               __proto__: Gnapse.prototype,
               db: db,
               born: item.stats.birthtime || item.stats.atime || null,
               origin: gnode,
               target: target,
               relation: relation,

               // TODO: Calculate
               originVersion: 1,
               relevance: 1.0,
               targetVersion: 1,
               firings: [],
            };

            // Add gnapse to gnode's array
            gnode.gnapses.push(gnapse);
         }
      }
   })
      .on('error', function (err) {
         switch (err.errno) {
            case (-2): // Ubuntu 16.04
            case (-4058): // Windows 7
               // No such file or directory error:
               // The gnode has no .gnapses folder
               // This is fine, just ignore it
               break;
            default:
               console.log(err);
               break;
         }
         return;
      })
      .on('end', function () {
         fileCleanup.forEach(function (cleanFile) {
            fs.writeFileSync(cleanFile.path, cleanFile.content);
         });
      });
}

/**
 * Return function that expects path for initialization
 */
export default {
   open: function (config) {
      var context, prop;

      // Check for config
      if (!config) {
         throw 'Gnodes config required';
      }

      // Create context object w/ all required props
      context = {
         email: null,
         name: null,
         pwd: null,
         remoteUrl: null,
         repoPath: null,
         uid: null,
      };

      // Validate required props were supplied
      for (prop in context) {
         if (context.hasOwnProperty(prop)) {
            if (!config.hasOwnProperty(prop)) {
               throw 'Gnodes config prop \'' + prop + '\' required';
            }
            context[prop] = config[prop];
         }
      }

      // Resolve path to absolute if given a relative path
      if (context.repoPath.indexOf('.') === 0) {
         context.repoPath = config.repoPath;
      }
      db.repoPath = context.repoPath;

      // Connect to Git Repo
      if (fs.existsSync(context.repoPath)) {
         return NodeGit.Repository.open(context.repoPath)
            .catch(function (err) {
               console.log(err);
            })
            .then(function (repoResult) {
               context.repo = repoResult;
               db.context = context;
               return load(context);
            })
            .then(function () {
               return db;
            });
      }
      else {
         // Create repo dir
         return fs.ensureDir(context.repoPath)
            .catch(function (err) {
               console.log(err);
            })
            .then(function () {
               // Initialize git repo
               return NodeGit.Repository.init(context.repoPath, 0);
            })
            .then(function (repoResult) {
               // Set repo
               context.repo = repoResult;

               // Add remote
               NodeGit.Remote.create(context.repo, 'origin', context.remoteUrl);

               // Create file
               return fs.writeFile(path.join(context.repoPath, 'README.md'), '## The Life and Times of ' + context.name + '\r\n');
            })
            .then(function () {
               return context.repo.openIndex();
            })
            .then(function (index) {
               // Add readme file to index
               index.addByPath('README.md');
               index.write();
               return index.writeTree();
            })
            .then(function (oid) {
               // Do initial commit
               var author = NodeGit.Signature.now(context.name, context.email);
               var committer = NodeGit.Signature.now(context.name, context.email);

               db.HEAD = oid;

               // Since we're creating an inital commit, it has no parents. Note that unlike
               // normal we don't get the head either, because there isn't one yet.
               return context.repo.createCommit('HEAD', author, committer, 'create new repository', oid, []);
            })
            .then(function (commitId) {
               console.log('Repo (' + context.repoPath + ') initialization committed: ', commitId);
               db.context = context;
               return db;
            });
      }
   },
};

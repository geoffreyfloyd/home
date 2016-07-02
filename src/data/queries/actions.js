import { GraphQLList as List, GraphQLString } from 'graphql';
import ActionType from '../types/ActionType';
import Promise from 'bluebird';
import { get, getAll } from './core';

let lastFetchTask;

module.exports = function (operator) {
   return {
      type: new List(ActionType),
      args: {
         id: { type: GraphQLString },
      },
      resolve (_, args) {
         if (args && args.id) {
            // Array filtered to single action
            return new Promise(resolve => {
               var action = get(operator, args.id, 'doozy.action');
               if (action) {
                  action = [action];
               }
               resolve(action);
            });
         }

         if (lastFetchTask) {
            return lastFetchTask;
         }

         lastFetchTask = new Promise(resolve => {
            var actions = getAll(operator, 'doozy.action');
            resolve(actions);
         })
         .finally(() => {
            lastFetchTask = null;
         });

         return lastFetchTask;
      },
   };
};

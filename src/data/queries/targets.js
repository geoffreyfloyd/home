import { GraphQLList as List, GraphQLString } from 'graphql';
import TargetType from '../types/TargetType';
import Promise from 'bluebird';
import { get, getAll } from './core';
import those from 'those';

let lastFetchTask;

module.exports = function (operator) {
   return {
      type: new List(TargetType),
      args: {
         id: { type: GraphQLString },
      },
      resolve (_, args) {
         if (args && args.id) {
            // Array filtered to single action
            return new Promise(resolve => {
               var model = get(operator, args.id, 'doozy.target');
               if (model) {
                  model = [model];
               }
               resolve(model);
            });
         }

         if (lastFetchTask) {
            return lastFetchTask;
         }

         lastFetchTask = new Promise(resolve => {
            var models = getAll(operator, 'doozy.target');

            resolve(models);
         })
         .finally(() => {
            lastFetchTask = null;
         });

         return lastFetchTask;
      },
   };
};

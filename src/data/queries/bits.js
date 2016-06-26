import { GraphQLList as List, GraphQLString } from 'graphql';
import BitType from '../types/BitType';
import Promise from 'bluebird';
import { get, getAll } from './core';

let lastFetchTask;

module.exports = function (operator) {
   return {
      type: new List(BitType),
      args: {
         id: { type: GraphQLString }
      },
      resolve(_, args) {

         if (args && args.id) {
            // Array filtered to single bit
            return new Promise(function (resolve, reject) {
               
               var bit = get(operator, args.id, 'gnidbits.bit');
               if (bit) {
                  bit = [bit];
               }
               resolve(bit);
            });
         }
         else {
            if (lastFetchTask) {
               return lastFetchTask;
            }
            
            lastFetchTask = new Promise(function (resolve, reject) {
               var bits = getAll(operator, 'gnidbits.bit');
               resolve(bits);
            })
            .finally(() => {
               lastFetchTask = null;
            });

            return lastFetchTask;
         }       
      }

   };
   
};

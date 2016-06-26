import { GraphQLList as List, GraphQLString } from 'graphql';
import fetch from '../../libs/fetch';
import TagType from '../types/TagType';
import Promise from 'bluebird';
import { get, getAll } from './core';

let lastFetchTask;

module.exports = function (operator) {
   return {
      type: new List(TagType),
      args: {
         id: { type: GraphQLString }
      },
      resolve(_, args) {

         if (args && args.id) {
            // Array filtered to single tag
            return new Promise(function (resolve, reject) {
               
               var tag = get(operator, args.id, 'tag');
               if (tag) {
                  tag = [tag];
               }
               resolve(tag);
            });
         }
         else {
            if (lastFetchTask) {
               return lastFetchTask;
            }
            
            lastFetchTask = new Promise(function (resolve, reject) {
               var tags = getAll(operator, 'tag');
               resolve(tags);
            })
            .finally(() => {
               lastFetchTask = null;
            });

            return lastFetchTask;
         }       
      }

   };
   
};

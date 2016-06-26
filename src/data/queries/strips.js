import { GraphQLList as List, GraphQLString } from 'graphql';
import fetch from '../../libs/fetch';
import StripType from '../types/StripType';
import Promise from 'bluebird';
import { get, getAll } from './core';

let lastFetchTask;

module.exports = function (operator) {
   return {
      type: new List(StripType),
      args: {
         id: { type: GraphQLString }
      },
      resolve(_, args) {

         if (args && args.id) {
            // Array filtered to single strip
            return new Promise(function (resolve, reject) {
               
               var strip = get(operator, args.id, 'gnidbits.strip');
               if (strip) {
                  strip = [strip];
               }
               resolve(strip);
            });
         }
         else {
            if (lastFetchTask) {
               return lastFetchTask;
            }
            
            lastFetchTask = new Promise(function (resolve, reject) {
               var strips = getAll(operator, 'gnidbits.strip');
               resolve(strips);
            })
            .finally(() => {
               lastFetchTask = null;
            });

            return lastFetchTask;
         }       
      }

   };
   
};

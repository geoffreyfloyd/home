/**
 * @module gnode-store
 * @description Store for gathering, storing, and distributing gnode objects to
 *              client components.
 */

import http from 'libs/http';
import uuid from 'uuid';

// Set base url
var baseUrl = '';
if (global.window) {
   baseUrl = window.location.href.split('/').slice(0, 3).join('/');
}

/**
 * GnodeStore Class
 */
export default class GnodeStore {

   static uuid () {
      return uuid.v4();
   }

   constructor (appName, storeName) {
      // Field level variables
      this.appName = appName;
      this.storeName = storeName;
      this.retry = 5;
      this.url = `${baseUrl}/api/${this.appName.toLowerCase()}/${this.storeName.toLowerCase()}`;

      /***********************************************************************
       * REST API
       **********************************************************************/
      var me = this;
      this._api = {
         post (model) {
            return http(me.url).post().withCreds().withJsonBody(model).requestJson();
         },
         put (model) {
            return http(me.url).put().withCreds().withJsonBody(model).requestJson();
         },
         destroy (id) {
            return http(`${me.url}/${id}`, { method: 'DELETE' }).withCreds().requestJson();
         },
      };
   }

   /**
    * Store Methods
    */
   create (model) {
      return this._api.post(model);
   }

   destroy (id) {
      this._api.destroy(id);
   }

   update (model) {
      return this._api.put(model);
   }
}

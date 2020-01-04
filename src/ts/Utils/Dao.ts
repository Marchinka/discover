import axios, { Method } from 'axios';
import Utils from './Utils';
import { LoaderManager } from './Loader';

export type HttpMethod =
  | 'get' | 'GET'
  | 'delete' | 'DELETE'
  | 'head' | 'HEAD'
  | 'options' | 'OPTIONS'
  | 'post' | 'POST'
  | 'put' | 'PUT'
  | 'patch' | 'PATCH'

// export class Dao {
//     baseUrl: string;

//     constructor(baseUrl: string) {
//         this.baseUrl = baseUrl;
//     }

//     send(options: DaoOptions, callback?: (response : any) => void) {
//         axios({
//             data: options.data,
//             method: options.method as Method,
//             url: Utils.urlCombine(this.baseUrl, options.url)
//         }).then(callback);
//     }
// }

declare var $: any;

export class Dao {
    baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    send(options: DaoOptions, callback?: (response : any) => void) {
        let loaderController = LoaderManager.getController();
        loaderController.show(500);                //per avere sempre il Loader per chiamate "lunghe"              
        $.ajax({
            url: Utils.urlCombine(this.baseUrl, options.url),
            data:  options.method == "GET" ? options.data : JSON.stringify(options.data),
            contentType: "application/json; charset=utf-8",
            method: options.method,
            cache: false
        }).done((responseFromServer :any) => {
            callback({
                data: responseFromServer
            });
        }).always(() => {
            loaderController.hide();                    
        });
    }
}

export class DaoOptions {
    url: string;
    data?: any;
    method: HttpMethod;
}

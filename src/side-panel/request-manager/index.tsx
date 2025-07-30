import IRequests from "./types"
import TConstructorArgs from "./types/constructor-args"
import TCollectRequestHeadersData from "./types/collect-request-data"
import browser from 'webextension-polyfill'
import TRequestData from './types/request-item'

class Requests implements IRequests {

  headers: TRequestData = {}
  cookies: TRequestData = {}

  constructor ( args: TConstructorArgs ) {

  }

  collectRequestData: TCollectRequestHeadersData  = (
    url
  ) => {

    const callback = (
      details: browser.WebRequest.OnSendHeadersDetailsType,
    ) => {
      const { method, tabId, requestId } = details;
      console.log('SETTING HEADERS', { details })
      if (method !== 'OPTIONS') {
        // here is the logic to extract headers and cookies from the request

        
        // const { origin, pathname } = urlify(details.url) || {};

        // const link = [origin, pathname].join('');

        // if (link && details.requestHeaders) {
        //   details.requestHeaders.forEach((header) => {
        //     const { name, value } = header;
        //     if (/^cookie$/i.test(name) && value) {
        //       value.split(';').forEach((cookieStr) => {
        //         const index = cookieStr.indexOf('=');
        //         if (index !== -1) {
        //           const cookieName = cookieStr.slice(0, index).trim();
        //           const cookieValue = cookieStr.slice(index + 1);
        //           this.cookies[link] = { name: cookieName, value: cookieValue };
        //         }
        //       });
        //     } else {
        //       if (value) {
        //         this.headers[link] = { name, value };
        //       }
        //     }
        //   });
          browser.webRequest.onSendHeaders.removeListener(callback)
        }
      }
      browser.webRequest.onSendHeaders.addListener(
        callback,
        {
          // urls: ['<all_urls>'],
    
          urls: [url],
    
        },
        ['requestHeaders', 'extraHeaders'],
      )
    };

}

export default Requests
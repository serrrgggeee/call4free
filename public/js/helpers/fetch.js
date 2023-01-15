"use strict";
// https://www.freecodecamp.org/news/create-a-custom-fetch-api-from-xmlhttprequest-2cad1b84f07c/

function fetch() {
  var url = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
  var arg = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var xhr = new XMLHttpRequest();
  var onFufillment = [];
  var onError = [];
  var onCompletion = [];
  const method = arg.method || "GET";
  const headers = arg.headers || {};
  const content_type = arg.content_type || "application/json";
  const form_data = arg.form_data || {};
  xhr.open(method, url, true);


  for (const header in headers) {
    xhr.setRequestHeader(header, headers[header]);
  }

  xhr.withCredentials = true;
  xhr.onreadystatechange = function () {
    var _data = this;
    if (this.readyState == 4 && this.status == 200) {
      // Action to be performed when the document is read;
      onFufillment.forEach(function (callback) {
          callback(_data);
      });
     onCompletion.forEach(function (callback) {
        callback(_data);
      });
    } else if (this.readyState == 4 && this.status !== 200) {
      onError.forEach(function (callback) {
        callback(_data);
      });
      onCompletion.forEach(function (callback) {
        callback(_data);
      });
    }
  };
  xhr.send(form_data);
      
  return {
    then: function then(fufillmentFunction) {
      onFufillment.push(fufillmentFunction);
      return this;
    },
    catch: function _catch(errorFunction) {
      onError.push(errorFunction);
      return this;
    },
    finally: function _finally(completionFunction) {
      onCompletion.push(completionFunction);
      return this;
    }
  }
}
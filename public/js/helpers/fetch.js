"use strict";
// https://www.freecodecamp.org/news/create-a-custom-fetch-api-from-xmlhttprequest-2cad1b84f07c/

function fetch() {
  var url = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var headers =  arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  var xhr = new XMLHttpRequest();
  var onFufillment = [];
  var onError = [];
  var onCompletion = [];
  var method = options.method || "GET";
  var content_type = options.content_type || "application/json";
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
  xhr.send(options.form_data);
      
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
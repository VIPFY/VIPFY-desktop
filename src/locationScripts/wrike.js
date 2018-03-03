{

    //TODO: buying Proofing&Approval gives me a "Request a quote" window. How to handle this?
    //TODO: account deletion flow

    const path = require('path');
    const con = require('electron').remote.getGlobal('console');
    const app = require('electron').remote.app;
    const appPath = app.getAppPath();
    const todoPath = 'file://' + path.join(appPath, 'todo.html');
  
    module.exports = function() {
      window.addEventListener('DOMContentLoaded', onReady);
      window.addEventListener('load', onLoad);
    };
  
    function onLoad() {
      if (document.getElementById('submit-login-button')) {
        login();
      }
    }
  
    function onReady() {
      con.log(window.location.pathname);
      
      setInterval(modifyAll, 100);
    }
  
    function modifyAll() {
      redirectLinks('/accounts.htm#checkout', todoPath);
    }

    function redirectLinks(originalUrl, targetUrl) {
      //select all links with hrefs starting with originalUrl
      let elements = document.querySelectorAll(`a[href^='${originalUrl}']`);
      for (let i = 0; i < elements.length; i++) {
        elements[i].href = targetUrl;
      }
    }
  
    function hideByQuery(query, parent) {
      let elements = document.querySelectorAll(query);
      for (let i = 0; i < elements.length; i++) {
        //con.log("hiding element " + elements[i])
        elements[i].style.display = 'none';
        if (parent) {
          elements[i].parentElement.style.display = 'none';
        }
      }
    }
  
    function login() {
      document.querySelector("input[name='login']").value = 'jf@vipfy.com';
      document.querySelector("input[name='pwd']").value = 'ytaZGkuOVbIwgua3KdQY';
      document.querySelector("input[name='rememberMe']").checked = 'checked';
      document.querySelector("button[id='submit-login-button']").click();
    }
  }
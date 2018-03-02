{
  const path = require('path');
  const con = require('electron').remote.getGlobal('console');
  const app = require('electron').remote.app;
  const appPath = app.getAppPath();

  module.exports = function() {
    if (window.location.pathname == '/account/delete') {
      window.location.replace('file://' + path.join(appPath, 'todo.html'));
      return;
    }

    if (window.location.pathname == '/upgrade') {
      window.location.replace('file://' + path.join(appPath, 'todo.html'));
      return;
    }

    window.addEventListener('DOMContentLoaded', onReady);
    window.addEventListener('load', onLoad);
  };

  function onLoad() {
    let loginForm = document.getElementById('regular-login-forms');
    if (loginForm) {
      login(loginForm);
    }
  }

  function onReady() {
    con.log(window.location.pathname);
    if (window.location.pathname.startsWith('/account')) {
      setInterval(modifySettings, 100);
      /*modifySettings();
      let url = location.href;
      document.body.addEventListener('click', ()=>{
          requestAnimationFrame(()=>{
            url!==location.href&&modifySettings();
            url = location.href;
          });
      }, true);*/
    }
  }

  function modifySettings() {
    //con.log("page changed");
    hideByQuery('.preference-email-row', false);
    hideByQuery('.change-password-block', true);
    hideByQuery('.account-tfa-settings', false);
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

  function login(form) {
    form.querySelector("input[name='login_email']").value = 'jf@vipfy.com';
    form.querySelector("input[name='login_password']").value = 'zdwMYqQPE4gSHr3QQSkm';
    form.querySelector("input[name='remember_me']").checked = 'checked';
    form.querySelector("button[type='submit']").click();
  }
}
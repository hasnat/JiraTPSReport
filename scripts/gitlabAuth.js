var CLIENT_ID,
    CLIENT_SECRET,
    GITLAB_DOMAIN,
    AUTHORIZATION_ENDPOINT,
    RESOURCE_ENDPOINT,
    AUTH_TOKEN,
    AUTHORIZED = false,
    GITLAB_USER = false,
    GITLAB_PROJECTS;
function checkIfGitlabConnected(refreshProjects)
{
    chrome.storage.sync.get([ 'gitlabToken', 'gitlabDomain', 'gitlabClientID', 'gitlabClientSecret', 'gitlabProjects'], function(items){
    if (items.gitlabClientID && typeof items.gitlabClientID != 'undefined' && 
        items.gitlabClientSecret && typeof items.gitlabClientSecret != 'undefined' && 
        items.gitlabDomain && typeof items.gitlabDomain != 'undefined') {

        GITLAB_DOMAIN = items.gitlabDomain;
        CLIENT_ID = items.gitlabClientID;
        CLIENT_SECRET = items.gitlabClientSecret;
        AUTHORIZATION_ENDPOINT = "https://"+items.gitlabDomain+"/oauth/authorize";
        RESOURCE_ENDPOINT = "https://"+items.gitlabDomain+"/oauth/token";
        GITLAB_PROJECTS = items.gitlabProjects;
      //check if auth_token is available
      if (items.gitlabToken && typeof items.gitlabToken != 'undefined' && 
          items.gitlabToken.access_token) {

        AUTH_TOKEN = items.gitlabToken.access_token;
          if (document.getElementById('gitlabStatus')) {
              document.getElementById('gitlabStatus').value = 'Checking Authentication Token';
          }
          if (refreshProjects) {
              initGitlab();
          }
        //getUser(AUTH_TOKEN, function(response){
        //
        //    if(response && response.id){
        //      document.getElementById('gitlabStatus').value = 'Connected To Gitlab';
        //      AUTHORIZED = true;
        //      GITLAB_USER = response;
        //      saveGitlabUser(GITLAB_USER);
        //      if (refreshProjects) {
        //        getContributedProjects();
        //      }
        //    } else {
        //      document.getElementById('gitlabStatus').value = 'Invalid Auth Token, Please connect again.';
        //    }
        //
        //})

      } else {
        document.getElementById('gitlabStatus').value = 'Click Connect to start with Gitlab';
      }
    } else {
      document.getElementById('gitlabStatus').value = 'Please add domain + API client id & secret';
    }
  });
}
checkIfGitlabConnected(false);
function gitlabAction()
{
  checkIfGitlabConnected(false);
}

$(function () {




});
var extractToken = function() {
    return (getUrlVars()['code']) ? getUrlVars()['code'] : false;
};
function connectGitlab(){
  var token = extractToken(document.location.hash);
    if (token) {
      $('span.token').text(token);
      $.ajax({
          url: RESOURCE_ENDPOINT,
          type: 'POST',
          data: {
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            code: token,
            grant_type: 'authorization_code',
            redirect_uri: window.location.href.split('?')[0]
          }
        , success: function (response) {
            var container = $('span.user');
            saveGitlabToken(response);
            if (response) {
              container.text(response);
            } else {
              container.text("An error occurred.");
            }
          }
      });
    } else {
      var authUrl = AUTHORIZATION_ENDPOINT + 
        "?response_type=code" +
        "&client_id="    + CLIENT_ID +
        "&redirect_uri=" + window.location;
        console.log(authUrl);
    }
}
function getUrlVars()
{
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for(var i = 0; i < hashes.length; i++)
    {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
}
var gitlabToken = false;
chrome.storage.sync.get(["domain", "email", "dateformat", "subject", "gitlabToken", "gitlabDomain", "gitlabClientID", "gitlabClientSecret"], function(items) {
  var domain = items.domain;
  var email = items.email;
  var dateformat = items.dateformat;
  var subject = items.subject;
  var gitlabDomain = items.gitlabDomain;
  var gitlabClientID = items.gitlabClientID;
  var gitlabClientSecret = items.gitlabClientSecret;

  if (typeof domain != 'undefined') {
    document.getElementById('domain').value = domain;
  }
  if (typeof email != 'undefined') {
    document.getElementById('email').value = email;
  }
  if (typeof dateformat != 'undefined') {
    document.getElementById('dateformat').value = dateformat;
  }
  if (typeof subject != 'undefined') {
    document.getElementById('subject').value = subject;
  }
  if (typeof gitlabDomain != 'undefined') {
    document.getElementById('gitlabDomain').value = gitlabDomain;
  }
  if (typeof gitlabClientID != 'undefined') {
    document.getElementById('gitlabClientID').value = gitlabClientID;
  }
  if (typeof gitlabClientSecret != 'undefined') {
    document.getElementById('gitlabClientSecret').value = gitlabClientSecret;
  }
  
});
function saveChanges() {
  // Get a value saved in a form.
  var domain = document.getElementById('domain').value;
  var email = document.getElementById('email').value;
  var dateformat = document.getElementById('dateformat').value;
  var subject = document.getElementById('subject').value;
  var gitlabDomain = document.getElementById('gitlabDomain').value;
  var gitlabClientID = document.getElementById('gitlabClientID').value;
  var gitlabClientSecret = document.getElementById('gitlabClientSecret').value;
  // Check that there's some code there.
  
  // Save it using the Chrome extension storage API.
  chrome.storage.sync.set({
    'domain': domain, 
    'email': email,
    'subject': subject, 
    'dateformat': dateformat, 
    'gitlabDomain': gitlabDomain, 
    'gitlabClientID': gitlabClientID, 
    'gitlabClientSecret': gitlabClientSecret}, function() {
      // Notify that we saved.
      console.log('Settings saved');
      alert('Options saved');
  });
}
function saveGitlabToken(_gitlabToken) {
  chrome.storage.sync.set({
    'gitlabToken': _gitlabToken
  }, function() {
    console.log('Gitlab settings saved');
    alert('Sucessfully logged in gitlab');
  });
}
function getGitlabToken(_callback) {
  chrome.storage.sync.get(["gitlabToken"], function(items) {
    if (typeof items.gitlabToken != 'undefined') {
      return _callback(items.gitlabToken['access_token']);
    }
    return false;
  });
}
function saveGitlabUser(_gitlabUser) {
  chrome.storage.sync.set({
    'getGitlabUser': _gitlabUser
  }, function() {
    console.log('Gitlab projects saved');
  });
}
function getGitlabUser(_callback) {
  chrome.storage.sync.get(["gitlabUser"], function(items) {
    if (typeof items.gitlabUser != 'undefined') {
      return _callback(items.gitlabUser);
    }
    return false;
  });
}
function addGitlabProject(_gitlabProject) {
  getGitlabProjects(function(projects){
    console.log('already saved');
    console.log(projects);
    for (var i = 0; i < projects.length; i++) {
      if (projects[i].id == _gitlabProject.id) {
        projects.splice(i, 1);
      }
    };
    if (projects) {
      projects.push(_gitlabProject);
    } else {
      projects = [_gitlabProject];
    }
    saveGitlabProjects(projects);
  });
}
function saveGitlabProjects(_gitlabProjects) {
  chrome.storage.sync.set({
    'gitlabProjects': _gitlabProjects
  }, function() {
    console.log('Gitlab projects saved');
  });
}
function getGitlabProjects(_callback) {
  chrome.storage.sync.get(["gitlabProjects"], function(items) {
    if (typeof items.gitlabProjects != 'undefined') {
      return _callback(items.gitlabProjects);
    }
      return false;
  });
}
document.getElementById('save').onclick=function(){saveChanges();};
document.getElementById('enableGitlab').onclick=function(){$('#enableGitlab').prop('checked') ? $('#gitlab').show() : $('#gitlab').hide();};
document.getElementById('connectGitlab').onclick=function(){gitlabAction();};

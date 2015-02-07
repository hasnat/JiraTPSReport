chrome.storage.sync.get(["domain", "email", "progress", "dateformat", "subject"], function(items) {
  var domain = items.domain;
  var email = items.email;
  var dateformat = items.dateformat;
  var subject = items.subject;
  var progress = items.progress;

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
  if (typeof progress != 'undefined') {
    document.getElementById('progress').checked = progress;
  }
  
});
function saveChanges() {
  // Get a value saved in a form.
  var domain = document.getElementById('domain').value;
  var email = document.getElementById('email').value;
  var dateformat = document.getElementById('dateformat').value;
  var subject = document.getElementById('subject').value;
  var progress = document.getElementById('progress').checked;
  // Check that there's some code there.
  
  // Save it using the Chrome extension storage API.
  chrome.storage.sync.set({
    'domain': domain, 
    'email': email, 
    'progress': progress, 
    'subject': subject, 
    'dateformat': dateformat}, function() {
    // Notify that we saved.
    console.log('Settings saved');
    alert('Options saved');
  });
}

document.getElementById('save').onclick=function(){saveChanges();};
function checkForValidUrl(url, tabId, changeInfo, tab) {
  var domain = '';
  chrome.storage.sync.get(["domain"], function(items) {
    domain = items.domain;
    if (url.indexOf(domain) < 0 || typeof domain == 'undefined' || domain == '') {
      return false;
    }
    showIcon(tabId, changeInfo, tab);
  });
};
function showIcon(tabId, changeInfo, tab) {
  chrome.pageAction.show(tabId);
  chrome.pageAction.setTitle({
    tabId: tab.id,
    title: 'TPS Report'
  });
}
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  chrome.tabs.query({
      active: true,               // Select active tabs
      lastFocusedWindow: true     // In the current window
    }, function(tabs) {
      if (tabs.length>0)
      {
          var tab = tabs[0];

          var url = tab.url;

          checkForValidUrl(url, tabId, changeInfo, tab);
      }

    });
  
});
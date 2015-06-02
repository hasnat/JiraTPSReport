function getLocalStorage(variableNames) {
	var deferred = $.Deferred();

	chrome.storage.sync.get(variableNames, function(items) {
    	deferred.resolve(items);
  	});
  	return deferred.promise();
}
var EMAIL_TEXT = '';
function prepareData(data) {
    console.log('prepared', data);
    EMAIL_TEXT += data;
}
function clearData() {
    EMAIL_TEXT += '';
}
function showAllData(){
    if ($('#body')) {
        $('#body').val(EMAIL_TEXT);
    }
}
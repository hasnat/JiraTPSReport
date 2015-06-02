$(function() {
    var startDate;
    var endDate;
    var dateFormat = "dd/mm/yyyy";
    var workedOn = [];
    var username = '';
    var subject = 'Weekly Report';

    var domain = '';
    var selectCurrentWeek = function() {
        window.setTimeout(function () {
            $('.week-picker').find('.ui-datepicker-current-day a').addClass('ui-state-active')
        }, 1);
    };
    chrome.tabs.executeScript( null,
        {code:"document.getElementById('header-details-user-fullname').getAttribute('data-username')"},
        function(results){ username = results; console.log(results);
            chrome.storage.sync.get(["domain", "email", "subject", "dateformat"], function(items) {
                if (typeof items.email != 'undefined')
                    $('#sendto').val(items.email);
                if (typeof items.subject != 'undefined')
                    subject = items.subject;
                if (typeof items.dateformat != 'undefined')
                    dateFormat = items.dateformat;
                if (typeof items.domain != 'undefined')
                    domain = items.domain;
                showCalendar();
            });
        }
    );

    
    function showCalendar(){
        $('.week-picker').datepicker( {
            showOtherMonths: true,
            selectOtherMonths: true,
            altFormat: '@',
            onSelect: function(dateText, inst) { 
                var date = $(this).datepicker('getDate');
                startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay());
                endDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay() + 6);
                
                requestReport(startDate, endDate);
            },
            beforeShowDay: function(date) {
                var cssClass = '';
                if(date >= startDate && date <= endDate)
                    cssClass = 'ui-datepicker-current-day';
                return [true, cssClass];
            },
            onChangeMonthYear: function(year, month, inst) {
                selectCurrentWeek();
            }
        });
        $('#mailform').on('submit', function() {
            $('#mailform').attr('action', 'mailto:'+$('#sendto').val());
        });
        $('.week-picker .ui-datepicker-calendar tr').on('mouseover', function() { 
            $(this).find('td a').addClass('ui-state-hover'); 
        });
        $('.week-picker .ui-datepicker-calendar tr').on('mouseout', function() { 
            $(this).find('td a').removeClass('ui-state-hover'); 
        });
        $(".ui-datepicker-current-day").trigger("click");
    }

    function requestReport(startDate, endDate) {
        var startDateUnix = Date.parse(startDate);
        var endDateUnix = Date.parse(endDate);
        var emailSubject = subject;
        var weeklyReportText = 'Weekly Report '+ startDate.format(dateFormat) + ' - ' + endDate.format(dateFormat);
        if(typeof emailSubject != undefined || emailSubject!='')
            emailSubject += ' ';
        emailSubject += startDate.format(dateFormat) + ' - ' + endDate.format(dateFormat);
        $('#subject').val(emailSubject);

        selectCurrentWeek();
        if (typeof domain == 'undefined' || domain=='' || domain == 'undefined') {
            alert('Seems like you didn\'t setup your domain for JIRA'+"\n"+
                'Please check extension options in'+"\n"+
                'Chrome->settings->extensions->TPS Reports For Jira'
                );
            return;
        }
        if (typeof username == 'undefined' || username=='' || username == 'undefined') {
            alert('Seems like you\'re not logged in JIRA'+"\n"+
                'Please login and try again.'+"\n"+
                'Or you\'re on a wrong tab, please check extension options in'+"\n"+
                'Chrome->settings->extensions->TPS Reports For Jira'
                );
            return;
        }
        $('#body').val('Loading.....');
        var whatYaUpto = getFeedBoiiii(startDateUnix, endDateUnix, username);
        console.log('whatYaUpto');
        console.log(whatYaUpto);
        whatYaUpto.then(function(res){
            console.log(workedOn);
            clearData();
            prepareData(weeklyReportText + "\n");
            prepareData(buildReport());
            initGitlab();
        });
    }


    function getFeedBoiiii (startDate, endDate, user) {
        var url = 'https://'+domain+'/activity?maxResults=200&streams=user+IS+'+user+'&streams=update-date+BETWEEN+'+startDate+'+'+endDate+'&os_authType=basic&title=undefined';

        return $.get(url, function (data) {
            var workedOnCopy = [];
            workedOn = [];
                $(data).find("entry").each(function () { // or "item" or whatever suits your feed
                    var item = [];
                    var el = $(this);
                    var date = new Date(el.find("updated").text().split('T')[0]);

                    item['time'] = date.format(dateFormat);
                    item['type'] = el.find("category").attr('term');
                    var validTag = "activity\\:object, object";
                    if (el.find("activity\\:target, target").length>0) {
                        validTag = "activity\\:target, target";
                    }
                    item['ticket'] = el.find(validTag).find("title").text();
                    item['title'] = el.find(validTag).find("summary").text();
                    item['link'] = el.find(validTag).find("link").attr("href");

                    if (item['ticket']=='')
                        console.log(el.find(validTag), el.find("target"));
                    if (workedOnCopy.indexOf(item['ticket'])<0) {
                        workedOn.push(item);
                        workedOnCopy.push(item['ticket']);
                    }
                });

            return workedOn;
        })

    }

    function removeDuplicates() {
        for (var i = workedOn.length - 1; i >= 0; i--) {
            if (workedOn[i]['type'] == 'finished') {
                findAndRemove(workedOn[i]['ticket']);
            }
        };
    }

    function findAndRemove(ticket) {
    for (var i = workedOn.length - 1; i >= 0; i--) {
        console.log('Checking '+workedOn[i]['ticket']+ ' == '+ ticket + 'type = '+workedOn[i]['type']);
        if (workedOn[i]['ticket'] == ticket && workedOn[i]['type'] == 'started') {
                console.log('Removed '+ workedOn[i]['ticket']);
                workedOn.splice(i, 1);

            }
        }
    }

    
    function buildReport() {
        var reportArray = [];

        for (var i = workedOn.length - 1; i >= 0; i--) {
            reportArray.push(workedOn[i]['ticket'] + ' - ' + workedOn[i]['title'] + "\n");
        }

        return "\n\n       " + reportArray.sort().join("       ");
    }



});

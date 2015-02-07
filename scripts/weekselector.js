$(function() {
    var startDate;
    var endDate;
    var dateFormat = "dd/mm/yyyy";
    var workedOn = [];
    var username = '';
    var subject = 'Weekly Report';
    var showprogress = false;
    var selectCurrentWeek = function() {
        window.setTimeout(function () {
            $('.week-picker').find('.ui-datepicker-current-day a').addClass('ui-state-active')
        }, 1);
    }
    chrome.tabs.executeScript( null, {code:"document.getElementById('header-details-user-fullname').getAttribute('data-username')"},
       function(results){ username = results; console.log(results); 
            chrome.storage.sync.get(["email", "progress", "subject", "dateformat"], function(items) {
                if (typeof items.email != 'undefined')
                    $('#sendto').val(items.email);
                if (typeof items.progress != 'undefined')
                    showprogress = items.progress;
                if (typeof items.subject != 'undefined')
                    subject = items.subject;
                if (typeof items.dateformat != 'undefined')
                    dateFormat = items.dateformat;
                showCalendar();
            });
        });
    
    
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
        if (typeof username == 'undefined' || username=='' || username == 'undefined') {
            alert('Seems like you\'re not logged in JIRA'+"\n"+
                'Please login and try again.'+"\n"+
                'Or you\'re on a wrong tab, please check extension options in'+"\n"+
                ' chrome->settings->extensions->TPS Reports For Jira'
                );
            return;
        }
        $('#body').val('Loading.....');
        var whatYaUpto = getFeedBoiiii(startDateUnix, endDateUnix, username);
        console.log('whatYaUpto');
        console.log(whatYaUpto);
        whatYaUpto.then(function(res){
            console.log(workedOn);
            $('#body').val(weeklyReportText + "\n"); 
            buildReport();   
        })
    }



    function getFeedBoiiii (startDate, endDate, user) {
        return $.get('https://jira.dotmobi.mobi/activity?maxResults=40&streams=user+IS+'+user+'&streams=update-date+BETWEEN+'+startDate+'+'+endDate+'&os_authType=basic&title=undefined', function (data) {
            workedOn = [];
                $(data).find("entry").each(function () { // or "item" or whatever suits your feed
                    var item = [];
                    var el = $(this);
                    var date = new Date(el.find("updated").text().split('T')[0]);
                    console.log(el.find("updated").text().split('T')[0]);
                    if (el.find("category").attr('term') == 'started' || 
                        el.find("category").attr('term') == 'Ready To Test'){
                        switch (el.find("category").attr('term')) {
                            case 'started':
                            item['type'] = 'started';
                            break;
                            case 'Ready To Test':
                            item['type'] = 'finished';
                            break;       
                        }
                        item['ticket'] = el.find("object").find("title").text();
                        item['title'] = el.find("object").find("summary").text();
                        item['time'] = date.format(dateFormat);
                        workedOn.push(item);

                    }

                });
            removeDuplicates();
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
        var prevDay = '';
        var report = '';

        for (var i = workedOn.length - 1; i >= 0; i--) {
            if (prevDay != workedOn[i]['time'])
                report += "\n" + workedOn[i]['time'] + "\n";
            prevDay = workedOn[i]['time'];
            report += "       "
            if (workedOn[i]['type'] == 'started' && showprogress)
                report +='Started ' + "         "
            else if (showprogress)
                report +='Finished ' + "       "
            report += workedOn[i]['ticket'] + ' - ' + workedOn[i]['title'];

            report += "\n";

        };
        console.log(report);
        $('#body').val($('#body').val() + report); 
        return report;
    }



});


//start checking gitlab settings

//check if have auth_token
//check if auth_token is valid
//get projects	
//get projects with contribution
//get project feeds for dates
//sort arrays
//add commits + details to email

function initGitlab() {
  console.log('initGitlab');
  $.when(getUser())
      .then(getProjects)
      .then(filterUserProjects)
      .then(getCommits)
      //.then(getCommits, null, getCommits)
      .then(showCommits)
      .then(prepareData)
      .then(showAllData);

}

function showCommits(commits, projects) {
    console.log('commits', arguments, projects);
    var deferred = $.Deferred();
    var commitsText = "\n\n--------Commits--------\n\n";
    var date = $('.week-picker').datepicker('getDate');
    var startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay());
    var endDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay() + 6);

    for (var i = 0; i < commits.length; i++) {
        var projectCommitsText = '';
        for (var j = 0; j < commits[i].length; j++) {
            var projectCommits = commits[i][j];
            var commitDate = new Date(projectCommits.created_at.split('T')[0]);
            console.log(startDate, endDate, commitDate);
            if (commitDate.getTime() < endDate.getTime() && commitDate.getTime() > startDate.getTime()) {
                if (projectCommits.title.substring(0, 14) == "Merge branch '") {
                    continue;
                }
                projectCommitsText += "       ";
                projectCommitsText += projectCommits.title;
                projectCommitsText += "\n";

            }

        }
        if (projectCommitsText.length>0) {
            projectCommitsText = projects[i].name_with_namespace + "\n" + projectCommitsText;
            commitsText += projectCommitsText;
        }

    }
    deferred.resolve(commitsText);
    return deferred.promise();
}

function getCommits(projects, contributed){
    var deferred = $.Deferred();
    var loaders = [];
    var recentProjects = [];
    for (var i = 0; i < projects.length; i++) {
        if(contributed[i]) {
            loaders.push(getProjectUserCommits(projects[i]));
            recentProjects.push(projects[i]);
        }
    }

    $.when.apply(this, loaders).then(function() {
        deferred.resolve(arguments, recentProjects);
    });

    return deferred.promise();
}
function getProjectUserCommits(project) {
    var deferred = $.Deferred();
    $.ajax({
        url: 'https://'+GITLAB_DOMAIN+'/api/v3/projects/'+project.id+'/repository/commits',
        type: 'GET',
        data: {access_token: AUTH_TOKEN, per_page: 99}
    }).fail(function(){
        deferred.resolve([]);
    }).success(function(response){
        console.log('getProjectContributors', project.name_with_namespace);
        var userCommits = [],
            commits = response;
        for (var j = 0; j < commits.length; j++) {
            if (commits[j].author_email == GITLAB_USER.email) {
                userCommits.push(commits[j]);
            }
        }
        deferred.resolve(userCommits);
    });

    return deferred.promise();
}
function filterUserProjects(userInformation, projects){
    var deferred = $.Deferred();
    var loaders = [];
    for (var i = 0; i < projects.length; i++) {
        var project = projects[i];

        loaders.push(getProjectIfContributed(project));
        //getProjectContributors(GITLAB_DOMAIN, AUTH_TOKEN, projects[i].id, function(contributors){
        //    for (var j = 0; j < contributors.length; j++) {
        //        if (contributors[j].email == GITLAB_USER.email) {
        //            addGitlabProject(project);
        //        }
        //    }
        //});
    }
    $.when.apply(this, loaders).then(function() {
        deferred.resolve(projects, arguments);
    });
    //deferred.resolve(projects);
    return deferred.promise();
}

function getProjectIfContributed(project) {
    var deferred = $.Deferred();
        $.ajax({
            url: 'https://'+GITLAB_DOMAIN+'/api/v3/projects/'+project.id+'/repository/contributors',
            type: 'GET',
            data: {access_token: AUTH_TOKEN}
        }).fail(function(){
            console.log('contributed-fail', project.name_with_namespace);
            deferred.resolve(false);
        }).success(function(response){
            console.log('getProjectIfContributed', project.name_with_namespace);
            contributors = response;
            for (var j = 0; j < contributors.length; j++) {
                if (contributors[j].email == GITLAB_USER.email) {
                    deferred.resolve(true);
                    console.log('contributed-yes', project.name_with_namespace, contributors);
                    return;
                }
            }
            console.log('contributed-no', project.name_with_namespace, contributors);
            deferred.resolve(false);
        });
    return deferred.promise();
}


function getProjects(userInformation) {
    var deferred = $.Deferred();
    $.ajax({
        url: 'https://'+GITLAB_DOMAIN+'/api/v3/projects',
        type: 'GET',
        data: {access_token: AUTH_TOKEN, order_by: 'last_activity_at', per_page: 99}
    }).pipe(function(response){

        console.log('getProjects', response);
        deferred.resolve(userInformation, response);
    });

    return deferred.promise();
}

function gitlabRequest(domain, token, url, data) {

}

function getUser() {
    var deferred = $.Deferred();
	$.ajax({
          url: 'https://'+GITLAB_DOMAIN+'/api/v3/user',
          type: 'GET',
          data: {access_token: AUTH_TOKEN}
        }).pipe(function(response){
            console.log('getUser', response);
            GITLAB_USER = response;
            if (typeof saveGitlabUser == 'function')
                saveGitlabUser(GITLAB_USER);
            deferred.resolve(response);
        });
    return deferred.promise();
}


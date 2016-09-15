new Vue({
    el: '#main',
    data: {
        loadedProjects: []
    },

    created: function () {
        var projects = window.projects;
        if ( ! projects) {
            alert('You need to define your projects by copying "projects.js.default" to "projects.js".');
            return;
        }
        projects.forEach(this.fetchIssues);
    },

    methods: {
        fetchIssues: function (project) {
            var self = this
            var baseUrl = 'https://api.rollbar.com/api/1/items?status=active&access_token=';
            var xhr = new XMLHttpRequest()

            xhr.open('GET', baseUrl + project.key)
            xhr.onload = function () {
                var response = JSON.parse(xhr.responseText);
                self.loadedProjects.push({
                    title: project.title,
                    items: response.result.items.map(function(rawItem) {
                        var lastOccurrence = new Date(rawItem['last_occurrence_timestamp'] * 1000);
                        rawItem['last_occurrence'] = lastOccurrence.toLocaleString();
                        return rawItem;
                    })
                });
            }
            xhr.send()
        }
    }
})
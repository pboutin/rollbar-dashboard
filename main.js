new Vue({
    el: '#main',
    data: {
        loadedProjects: [],
        mapping: null
    },

    created: function () {
        var config = window.config;
        if ( ! config) {
            alert('You need to define your projects by copying "projects.js.default" to "projects.js".');
            return;
        }
        this.mapping = config.mapping;
        config.projects.forEach(this.fetchIssues);
    },

    methods: {
        fetchIssues: function (project) {
            var self = this
            var baseUrl = 'https://api.rollbar.com/api/1/items?status=active&access_token=';
            var xhr = new XMLHttpRequest()
            var mapping = this.mapping;

            xhr.open('GET', baseUrl + project.key)
            xhr.onload = function () {
                var response = JSON.parse(xhr.responseText);
                self.loadedProjects.push({
                    title: project.title,
                    items: response.result.items.map(function(item) {
                        var lastOccurrence = new Date(item['last_occurrence_timestamp'] * 1000);
                        item['last_occurrence'] = lastOccurrence.toLocaleString();

                        item['isSuccess'] = mapping['success'].test(item['environment']);
                        item['isWarning'] = mapping['warning'].test(item['environment']);
                        item['isDanger'] = mapping['danger'].test(item['environment']);

                        return item;
                    })
                });
            }
            xhr.send()
        }
    }
})
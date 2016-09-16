new Vue({
    el: '#main',
    data: {
        projects: [],
        projectsBuffer: [],
        mapping: null,
        timer: 0,
        interval: 0
    },
    computed: {
        progress: function () {
            return this.timer / this.interval * 100
        }
    },

    created: function () {
        var config = window.config;
        if ( ! config) {
            alert('You need to define your projects by copying "projects.js.default" to "projects.js".');
            return;
        }
        this.mapping = config.mapping;
        this.projects = config.projects;
        this.interval = config.refreshInterval * 2;
        this.timer = this.interval;

        this.refresh();
    },

    methods: {
        refresh: function() {
            if (this.timer === this.interval) {
                this.projects.forEach(this.fetchIssues);
                this.timer = 0;
            } else {
                this.timer++;
            }
            setTimeout(this.refresh, 500);
        },
        fetchIssues: function (project) {
            var self = this
            var baseUrl = 'https://api.rollbar.com/api/1/items?status=active&access_token=';
            var xhr = new XMLHttpRequest()
            var mapping = this.mapping;

            xhr.open('GET', baseUrl + project.key)
            xhr.onload = function () {
                var response = JSON.parse(xhr.responseText);
                var processedItems = response.result.items.map(function(item) {
                    var lastOccurrence = new Date(item['last_occurrence_timestamp'] * 1000);
                    item['last_occurrence'] = lastOccurrence.toLocaleString();

                    item['isWarning'] = mapping['warning'].test(item['environment']);
                    item['isDanger'] = mapping['danger'].test(item['environment']);
                    item['isDefault'] = ! (item['isWarning'] || item['isDanger']);

                    item['isLevelWarning'] = /warning/.test(item['level']);
                    item['isLevelDanger'] = /critical|error/.test(item['level']);
                    item['isLevelDefault'] = ! (item['isLevelWarning'] || item['isLevelDanger']);

                    return item;
                });

                self.projectsBuffer.push({
                    title: project.title,
                    key: project.key,
                    items: processedItems
                });

                if (self.projectsBuffer.length === self.projects.length) {
                    self.projects = self.projectsBuffer;
                    self.projectsBuffer = [];
                }
            }
            xhr.send()
        }
    }
})
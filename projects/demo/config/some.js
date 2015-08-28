/* Some config settings available in projects */

function thisModule() {
    var self = this;
    self.disabled = false; // Enable /disable controller
    self.identity = 'demo-config'; // Unique controller id used in routes, policies and followups
    self.version = '1.0'; // Version number of service
    self.created = '2015-07-14T12:00:00'; // Creation date of controller
    self.modified = '2015-07-14T12:00:00'; // Last modified date of controller
    self.group = 'demo'; // Group this service to a origin

    // Config variables
    self.title = "This is a demo api";

    self.defaultToDos = [
        "Eat some icecreme",
        "Go out for lunch",
        "Get some sleep",
        "Get this demo done",
        "Create own project"
    ];

    return self;
}

module.exports = new thisModule();
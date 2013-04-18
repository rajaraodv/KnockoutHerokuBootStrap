/**
 * This initializes AngularJS app. Place this file BEFORE app.js (where your actual app is located).
 */
//var app = angular.module('AngularSFDemo', ['AngularForce', 'AngularForceObjectFactory', 'Contact']);
//app.constant('SFConfig', getSFConfig());


var sammy = Sammy(function () {
    //this.get('', function() { this.app.runRoute('get', '#Inbox') });
    self = this;

    this.get('/', function () {
        if (!contactsApp.knockoutForce.authenticated()) {
            this.app.runRoute('get', '/login'); //redirect to login
        } else {
            this.render('/partials/home.html').replace('#mainContainer');

            contactsApp.setViewModelByRoute("/");
        }
    });

    this.get('/login', function () {
        this.render('/partials/login.html').replace('#mainContainer');

        contactsApp.setViewModelByRoute("/login");
    });


    this.get('/callback:cbInfo', function () {
        if (!contactsApp.knockoutForce.authenticated()) {
            location.hash = '/login';
            // this.app.runRoute('get', '/login'); //redirect to login
        } else {
            contactsApp.knockoutForce.oauthCallback(document.location.href);
            location.hash = '/contacts';
            //this.app.runRoute('get', '/contacts');
        }
    });

    this.get('/contacts', function () {
        if (!contactsApp.knockoutForce.authenticated()) {
            location.hash = '/login';
            //this.app.runRoute('get', '/login'); //redirect to login
        } else {
            contactsApp.setViewModelByRoute("/contacts");
            this.render('/partials/contact/list.html').replace('#mainContainer');
        }
    });

    this.get('/view/:id', function () {
        if (!contactsApp.knockoutForce.authenticated()) {
            location.hash = '/login';
            //this.app.runRoute('get', '/login'); //redirect to login
        } else {
            contactsApp.setViewModelByRoute("/view", {id: this.params.id});
            this.render('/partials/contact/view.html').replace('#mainContainer');
        }
    });

    this.get('/edit/:id', function () {
        if (!contactsApp.knockoutForce.authenticated()) {
            location.hash = '/login';
            //this.app.runRoute('get', '/login'); //redirect to login
        } else {
            contactsApp.setViewModelByRoute("/edit", {id: this.params.id});
            this.render('/partials/contact/edit.html').replace('#mainContainer');
        }
    });

    this.get('/new', function () {
        if (!contactsApp.knockoutForce.authenticated()) {
            location.hash = '/login';
            //this.app.runRoute('get', '/login'); //redirect to login
        } else {
            contactsApp.setViewModelByRoute("/edit", {});
            this.render('/partials/contact/edit.html').replace('#mainContainer');
        }
    });


    //bind to 'changed' event and reapply bindings if mainContainer has changed
    //This is required to essentially wait until new view is swapped before applying bindings.
    this.bind('changed', function () {
        var mainContainer = document.getElementById('mainContainer');
        if (mainContainer && mainContainer.childNodes.length > 0) {
            ko.applyBindings(contactsApp.currentViewModel, mainContainer);
        }
    });

});


function ContactsApp(sammy, SFconfig) {
    this._vmList = {};

    this.knockoutForce = new KnockoutForce(SFconfig);

    this.sammy = sammy;

    this.setViewModelByRoute = function (route, data) {
        // if (this._vmList[route]) {
        //    return this.currentViewModel = this._vmList[route];
        //}

        switch (route) {
            case "/login"://fall-through
            case "/":
                this._vmList[route] = new LoginViewModel();
                break;
            case "/contacts":
                this._vmList[route] = new ContactListViewModel();
                break;
            case "/view":
                this._vmList[route] = new ContactViewModel(data);
                break;
            case "/edit":
                this._vmList[route] = new ContactDetailViewModel(data);
                break;

        }
        return this.currentViewModel = this._vmList[route];
    }
}

var SFConfig = getSFConfig();

var Contact = (function () {
    var objDesc = {
        type: 'Contact',
        fields: ['FirstName', 'LastName', 'Title', 'Phone', 'Email', 'Id', 'Account.Name'],
        where: '',
        orderBy: 'LastName',
        limit: 20
    };
    return KnockoutForceObjectFactory(objDesc, SFConfig);
})();

Contact.prototype.isValid = function () {
    if (!this.LastName() || this.LastName() == "") {
        return false;
    }
    return this.FirstName() != this._orig["FirstName"]
        || this.LastName() != this._orig["LastName"]
        || this.Title() != this._orig["Title"]
        || this.Email() != this._orig["Email"]
        || this.Phone() != this._orig["Phone"];
};


Contact.prototype.save = function () {
    debugger;
};

Contact.prototype.getAccount = function () {

    return this.Account && this.Account.Name ? this.Account.Name : '';
};

var contactsApp = new ContactsApp(sammy, SFConfig);
contactsApp.sammy.run();

//var SFconfig =  getSFConfig();

//var contactsApp = {
//    knockoutForce: new KnockoutForce(SFconfig),
//    "loginViewModel": new LoginViewModel(),
//    "contactDetailViewModel": new ContactDetailViewModel(),
//    "contactListViewModel": new ContactListViewModel(),
//    "currentViewModel": null,  //This is set by the routes
//
//};

function ContactDetailViewModel(data) {
    var self = this;
    debugger;
    self.contact = ko.observable(new Contact({}));
    if (data.id) {
        Contact.get({id: data.id}, function (contact, rawJSON) {
            debugger;
            self.original = contact;
            self.contact(new Contact(rawJSON));
        });
    }


//    self.contact = ko.observable({});
//    debugger;
//    if (data.id) {
//        Contact.get({id: data.id}, function (contact, rawJSON) {
//            self.original = contact;
//            self.contact(new Contact(rawJSON));
//        });
//    } else {
//        self.contact(new Contact({}));
//    }

//    self.LN.subscribe(function () {
//        debugger;
//        alert(1);
//    });
//
//    self.contact.subscribe(function () {
//        debugger;
//        alert(1);
//    })


    self.destroy = function () {
        self.original.destroy(
            function () {
                location.hash = '/contacts';
            },
            errCB
        );
    };

    self.save = function () {
        debugger;
        if (self.contact().Id) {
            self.contact().update(function () {
                debugger;
                location.hash = '/view/' + self.contact().Id;
            }, errCB);
        } else {
            Contact.save(self.contact(), function (contactObj) {
                debugger;
                location.hash = '/view/' + contactObj.Id || contactObj.id;
            }, errCB);
        }
    };

    self.cancel = function () {
        debugger;
        if (self.contact().Id) {
            location.hash = '/view/' + self.contact().Id;
        } else {
            location.hash = '/contacts/';
        }
    }
}
//helper errCB
function errCB(jqXHR, textStatus, errorThrown) {
    alert(jqXHR.status + " " + errorThrown);
}

function LoginViewModel() {
    // Client-side routes
    var self = this;


    self.login = function () {
        contactsApp.knockoutForce.login(function () {
            contactsApp.sammy.runRoute('get', '/contacts');
        });
    };

    self.folders = ['Inbox', 'Archive', 'Sent', 'Spam'];
}

function ContactViewModel(data) {
    var self = this;
    self.contact = ko.observable(new Contact({}));
    Contact.get({id: data.id}, function (contact, rawJSON) {
        self.original = contact;
        self.contact(new Contact(rawJSON));
    });
}

function ContactListViewModel() {
    var self = this;
    self.contacts = ko.observableArray([]);

//    var authenticated = contactsApp.knockoutForce.authenticated();
//    if (!authenticated) {
//        return contactsApp.sammy.runRoute('get', '/login');
//    }

    this.searchTerm = '';
    this.working = false;

    Contact.query(function (data) {
        self.formatAndSetContacts(data.records);

    }, errCB);

    self.formatAndSetContacts = function(dataArry) {
        //Note: Create custom fields for display (there are other ways, but this is simplest)
        var records = ko.utils.arrayMap(dataArry, function (record) {
            record.FullName = (record.FirstName ? record.FirstName + ' ' : ' ') + (record.LastName ? record.LastName : '');
            record.Company = record.Account && record.Account.Name ? record.Account.Name : '';
            record.viewUri = '#/view/' + record.Id;
            return record;
        });
        //Note: Don't use self.contacts= data.records coz self.contacts is an observableArray
        self.contacts.push.apply(self.contacts, records);
    };

    this.isWorking = function () {
        return $scope.working;
    };

    this.doSearch = function () {
        Contact.search(this.searchTerm, function (records) {
            if(records.length > 0) {
                self.contacts.removeAll();//remove original items
                self.formatAndSetContacts(records);
            } else {
                alert("Item Not Found");
            }

        }, errCB);
    };

    this.doView = function (contactObj) {
        location.hash = '/view/' + contactObj.Id;
    };

    this.doCreate = function () {
        $location.path('/new');
    }
}

function HomeCtrl($scope, AngularForce, $location, $route) {
    $scope.authenticated = AngularForce.authenticated();
    if (!$scope.authenticated) {
        return $location.path('/login');
    }

    $scope.logout = function () {
        AngularForce.logout();
        $location.path('/login');
    }
}


//function ContactDetailViewModel() {
//    var self = this;

//    if ($routeParams.contactId) {
//        AngularForce.login(function () {
//            Contact.get({id: $routeParams.contactId},
//                function (contact) {
//                    self.original = contact;
//                    $scope.contact = new Contact(self.original);
//                    $scope.$apply();//Required coz sfdc uses jquery.ajax
//                });
//        });
//    } else {
//        $scope.contact = new Contact();
//        //$scope.$apply();
//    }
//
//    $scope.isClean = function () {
//        return angular.equals(self.original, $scope.contact);
//    }
//
//    $scope.destroy = function () {
//        self.original.destroy(
//            function () {
//                $scope.$apply(function () {
//                    $location.path('/contacts');
//                });
//            },
//            function(errors) {
//                alert("Could not delete contact!\n" + JSON.parse(errors.responseText)[0].message);
//            }
//        );
//    };
//
//    $scope.save = function () {
//        if ($scope.contact.Id) {
//            $scope.contact.update(function () {
//                $scope.$apply(function () {
//                    $location.path('/view/' + $scope.contact.Id);
//                });
//
//            });
//        } else {
//            Contact.save($scope.contact, function (contact) {
//                var c = contact;
//                $scope.$apply(function () {
//                    $location.path('/view/' + c.Id || c.id);
//                });
//            });
//        }
//    };
//
//    $scope.doCancel = function () {
//        if ($scope.contact.Id) {
//            $location.path('/view/' + $scope.contact.Id);
//        } else {
//            $location.path('/contacts');
//        }
//    }
//}
//
//contactsApp.sammy = Sammy(function () {
//    //this.get('', function() { this.app.runRoute('get', '#Inbox') });
//    self = this;
//
//    self.viewModels = {
//        "loginViewModel": new LoginViewModel(),
//        "contactDetailViewModel": new ContactDetailViewModel()
//    };
//
//    debugger;
//
//    this.get('/', function () {
//        if (!KnockoutForce.authenticated) {
//            this.app.runRoute('get', '/login'); //redirect to login
//        } else {
//            self.currentViewModel = ContactsApp.mainViewModel;
//            this.render('/partials/home.html').replace('#mainContainer');
//        }
//    });
//
//    this.get('/login', function () {
//        self.currentViewModel = ContactsApp.loginViewModel;
//        this.render('/partials/login.html').replace('#mainContainer');
//    });
//
//    this.get('#:folder', function () {
//        debugger;
//        this.render('/partials/home.html').replace('#mainContainer');
//        debugger;
////            self.chosenFolderId(this.params.folder);
////            self.chosenMailData(null);
////            $.get("/mail", { folder: this.params.folder }, self.chosenFolderData);
//    });
//
//    this.get('#:folder/:mailId', function () {
//        debugger;
//        self.chosenFolderId(this.params.folder);
//        self.chosenFolderData(null);
//        $.get("/mail", { mailId: this.params.mailId }, self.chosenMailData);
//    });
//
//    //bind to 'changed' event and reapply bindings if mainContainer has changed
//    this.bind('changed', function () {
//        var mainContainer = document.getElementById('mainContainer');
//        if (mainContainer && mainContainer.childNodes.length > 0) {
//            debugger;
//            ko.applyBindings(self.currentViewModel, mainContainer);
//        }
//    });
//
//});

function LoginVM() {

    //If in visualforce, directly login
    if (AngularForce.inVisualforce) {
        AngularForce.login();
    }
}


//ko.applyBindings(new LoginViewModel());


//
///**
// * Configure all the AngularJS routes here.
// */
//app.config(function ($routeProvider) {
//    $routeProvider.
//        when('/', {controller: HomeCtrl, templateUrl: 'partials/home.html'}).
//        when('/login', {controller: LoginCtrl, templateUrl: 'partials/login.html'}).
//        when('/callback', {controller: CallbackCtrl, templateUrl: 'partials/callback.html'}).
//        when('/contacts', {controller: ContactListCtrl, templateUrl: 'partials/contact/list.html'}).
//        when('/view/:contactId', {controller: ContactViewCtrl, templateUrl: 'partials/contact/view.html'}).
//        when('/edit/:contactId', {controller: ContactDetailCtrl, templateUrl: 'partials/contact/edit.html'}).
//        when('/new', {controller: ContactDetailCtrl, templateUrl: 'partials/contact/edit.html'}).
//        otherwise({redirectTo: '/'});
//});

/**
 * Please configure Salesforce consumerkey, proxyUrl etc in getSFConfig().
 *
 * SFConfig is a central configuration JS Object. It is used by angular-force.js and also your app to set and retrieve
 * various configuration or authentication related information.
 *
 * Note: Please configure SFConfig Salesforce consumerkey, proxyUrl etc in getSFConfig() below.
 *
 * @property SFConfig Salesforce Config object with the following properties.
 * @attribute {String} sfLoginURL       Salesforce login url
 * @attribute {String} consumerKey      Salesforce app's consumer key
 * @attribute {String} oAuthCallbackURL OAuth Callback URL. Note: If you are running on Heroku or elsewhere you need to set this.
 * @attribute {String} proxyUrl         URL to proxy cross-domain calls. Note: This nodejs app acts as a proxy server as well at <location>/proxy/
 * @attribute {String} client           ForcetkClient. Set by forcetk lib
 * @attribute {String} sessionId        Session Id. Set by forcetk lib
 * @attribute {String} apiVersion       REST Api version. Set by forcetk (Set this manually for visualforce)
 * @attribute {String} instanceUrl      Your Org. specific url. Set by forcetk.
 *
 * @returns SFConfig object depending on where (localhost v/s heroku v/s visualforce) the app is running.
 */
function getSFConfig() {
    var location = document.location;
    var href = location.href;
    if (href.indexOf('file:') >= 0) { //Phonegap
        return {};
    } else if (configFromEnv && configFromEnv.sessionId) { //VisualForce just sets sessionId (as that's all what is required)
        return {
            sessionId: configFromEnv.sessionId
        }
    } else {
        if (!configFromEnv || configFromEnv.client_id == "" || configFromEnv.client_id == "undefined"
            || configFromEnv.app_url == "" || configFromEnv.app_url == "undefined") {
            throw 'Environment variable client_id and/or app_url is missing. Please set them before you start the app';
        }
        return {
            sfLoginURL: 'https://login.salesforce.com/',
            consumerKey: configFromEnv.client_id,
            oAuthCallbackURL: removeTrailingSlash(configFromEnv.app_url) + '/#/callback',
            proxyUrl: removeTrailingSlash(configFromEnv.app_url) + '/proxy/'
        }
    }
}

//Helper
function removeTrailingSlash(url) {
    return url.replace(/\/$/, "");
}
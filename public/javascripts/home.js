var app = new Vue({
    el: '#ui',
    created: function () {
        this.showDate();
        this.showTask();
        this.getPostTodo();
        this.getPostDone();
        this.show_profile();
        this.admin_or_user();
        this.showTaskType();
        this.show_member();
        this.user_get_task();
    },

    data: {
        //home:'',
        view: '',
        see: 'profile-info',
        //admin_user: '',
        button_admin_user: true,

        pTitle:'',
        pContent: '',
        pDueDate:'',
        tBeginDate:'',

        tTitle:'',
        tContent:'',

        task_type:'',
        posts:[],
        postsTodo:[],
        postsDone:[],
        profile: '',
        pDate:[],
        member:'',
        user_task_preference:[],

        id:'',
        mail: '',
        firstname:'',
        lastname:'',
        contact:'',

        pName:'',
        pDateAvailable:'',


        pContent2:'',

        pNamePrefer:'',

        preferredTask:[{nameMember: "Tony Nguyen", comment:" I would like to do the tasks relating Marketing", dateCreated: new Date()},
                       {nameMember: "Shahmeer Chaudhry", comment:" I would like to do the tasks relating Finance", dateCreated: new Date()},
                       {nameMember: "Jame Thompson", comment:" I would like to do the tasks relating Trading", dateCreated: new Date()},
        ],

        luser: '',
        lpass: '',

        myFirstName:'',
        myLastName:'',
        myAge:'',
        myUni:'',
        myJob:'',
        myContact:'',
        myGmail:'',


        user:'',
        pass:'',
        email:'',


    },


    mounted: function(){
        gapi.signin2.render('google-signin-button', {
          onsuccess: this.onSignIn,
        });
    },

    methods: {

        login: function() {
            var xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {
                    window.location.pathname = "homepage.html";
                } else if (this.readyState == 4 && this.status == 401) {
                    alert("Failed Login");
                }
            };

            xhttp.open("POST", "/login", true);
            xhttp.setRequestHeader("Content-type", "application/json");
            xhttp.send(JSON.stringify({ user: this.luser, pass: this.lpass }));

        },

        logout: function() {
            var xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {
                    window.location.pathname = "login.html";
                } else if (this.readyState == 4 && this.status == 401) {
                    alert("Failed Logout");
                }
            };
            xhttp.open("GET", "/logout", true);
            xhttp.send();
        },

        admin_or_user: function(){
            var xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {
                    a = JSON.parse(xhttp.responseText);
                    if (a.admin == '1'){
                        app.id = a.id;
                        app.view = a.admin;
                        app.button_admin_user = true;
                    }else{
                        app.id = a.id;
                        app.view = a.admin;
                        app.button_admin_user = false;
                    }

                }else if (this.readyState == 4 && this.status == 401) {
                    alert("Failed !");
                }
            };
            xhttp.open("GET", "/admin_user", true);
            xhttp.send();
        },


        signup: function() {
            var xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {
                    alert("You signed up successfully! Now you can sign in");
                } else if (this.readyState == 4 && this.status == 401) {
                    alert("Failed Signup");
                }
            };
            xhttp.open("POST", "/signup", true);
            xhttp.setRequestHeader("Content-type", "application/json");
            xhttp.send(JSON.stringify({ username: this.user, password : this.pass, email: this.email}));
        },


        addTask:function(index) {
                var xhttp = new XMLHttpRequest();
                xhttp.onreadystatechange = function() {
                    if (this.readyState == 4 && this.status == 200) {
                        alert("Successfully Created Task");
                    }
                };
                xhttp.open("POST", "/addpost", true);
                xhttp.setRequestHeader("Content-type", "application/json");
                xhttp.send(JSON.stringify({ name: app.user_task_preference[index].fname, title: app.user_task_preference[index].title, content: app.user_task_preference[index].content, due: app.user_task_preference[index].date}));

                Vue.delete(app.user_task_preference, index);
        },

        deleteTaskPreference: function(index){
            var xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {
                     console.log("x");
                }
            };
            xhttp.open("GET", "/deleteTask", true);
            xhttp.send();
        },


        showTask:function() {
            var xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {
                    app.posts = JSON.parse(xhttp.responseText);

                }
            };
            xhttp.open("GET", "/getPosts", true);
            xhttp.send();
        },


        start_doing: function(postIndex){
            // send to server-side
            var xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {
                    app.getPostTodo();
                }
            };
            xhttp.open("POST", "/addpostsTodo", true);
            xhttp.setRequestHeader("Content-type", "application/json");
            xhttp.send(JSON.stringify( {stat:"doing", idHolder: app.posts[postIndex].id}));

            //client-side
            this.postsTodo.push(app.posts[postIndex]);
            Vue.delete(this.posts, postIndex);
        },

        getPostTodo: function(){
            var xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {
                    app.postsTodo = JSON.parse(xhttp.responseText);
                }
            };
            xhttp.open("GET", "/getpostsTodo", true);
            xhttp.send();
        },

        start_done: function(postIndex){
            var xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {
                    app.getPostDone();
                }
            };
            xhttp.open("POST", "/addpostsDone", true);
            xhttp.setRequestHeader("Content-type", "application/json");
            xhttp.send(JSON.stringify( {stat:"done", idHolder: app.postsTodo[postIndex].id}));

            this.postsDone.push(app.postsTodo[postIndex]);
            Vue.delete(this.postsTodo, postIndex);
        },


        getPostDone:function(){
            var xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {
                    app.postsDone = JSON.parse(xhttp.responseText);
                }
            };
            xhttp.open("GET", "/getpostsDone", true);
            xhttp.send();
        },

        start_delete: function(postIndex){

            // send to server-side id to delete task
            var xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {
                    console.log('remove successfully');
                }
            };
            xhttp.open("POST", "/removeTaskDone", true);
            xhttp.setRequestHeader("Content-type", "application/json");
            xhttp.send(JSON.stringify({idHolder: app.postsDone[postIndex].id}));
            // client-side
            Vue.delete(this.postsDone, postIndex);
        },

         changeprofile: function(){
            if(this.myFirstName !=='' && this.myLastName!=='' && this.myContact!==''&&this.myGmail!==''){
                var xhttp = new XMLHttpRequest();
                xhttp.onreadystatechange = function() {
                    if (this.readyState == 4 && this.status == 200) {
                        alert("Successfully Updated Profile");
                        app.show_profile();
                        window.location.pathname = "homepage.html";
                    }
                };
                xhttp.open("POST", "/updateProfile", true);
                xhttp.setRequestHeader("Content-type", "application/json");
                xhttp.send(JSON.stringify({ a: this.myFirstName, b: this.myLastName, c: this.myContact, d: this.myGmail}));
            }
            else{
                alert("Input is empty! try again");
            }
        },

        show_profile: function(){
            var xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {
                    var x = JSON.parse(xhttp.responseText);
                    app.mail = x.email;
                    app.firstname = x.first_name;
                    app.lastname = x.last_name;
                    app.contact = x.contact_No;
                }
            };
            xhttp.open("GET", "/profile", true);
            xhttp.send();
        },

        setDate: function(){
            if(this.pDateAvailable !=''){
                var xhttp = new XMLHttpRequest();
                xhttp.onreadystatechange = function() {
                    if (this.readyState == 4 && this.status == 200) {
                        console.log('Added date successfully!');
                        window.location.pathname = "homepage.html";
                    }
                };
                xhttp.open("POST", "/addDate", true);
                xhttp.setRequestHeader("Content-type", "application/json");
                xhttp.send(JSON.stringify({id: this.id, dateA: this.pDateAvailable}));
            }else{
                alert("Input is empty! try again");
            }
        },

        showDate: function(){
            var xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {
                    var x = JSON.parse(xhttp.responseText);
                    var user  = x.user;
                    var date = x.dates;

                    for(var i=0; i<date.length;i++){
                        if(user.first_name == date[i].fname && user.last_name == date[i].lname ){
                            app.pDate.push(date[i]);
                        }else{
                            continue;
                        }
                    }
                }

            };
            xhttp.open("GET", "/date", true);
            xhttp.send();
        },


        removeDate: function(postIndex){
            // send to server-side id to delete task
            var xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {
                    console.log('Removed available date successfully');
                }
            };
            xhttp.open("POST", "/removeDate", true);
            xhttp.setRequestHeader("Content-type", "application/json");
            xhttp.send(JSON.stringify({date: app.pDate[postIndex].date}));

            // client-side
             Vue.delete(this.pDate, postIndex);
        },

        //tBeginDate:'',
        //tTitle:'',
        //tContent:'',

        addTaskType: function(){
            if(this.tBeginDate !=='' && this.tTitle!==''&& this.tContent!==''&&this.pDueDate !==''){
                var xhttp = new XMLHttpRequest();
                xhttp.onreadystatechange = function() {
                    if (this.readyState == 4 && this.status == 200) {
                        console.log("Added Task Type Successfully!");
                        app.showTaskType();
                    }
                };
                xhttp.open("POST", "/addTaskType", true);
                xhttp.setRequestHeader("Content-type", "application/json");
                xhttp.send(JSON.stringify({ content: this.tContent, title: this.tTitle, date: this.tBeginDate, dateEnd: this.pDueDate}));

            }else{
                alert("Input is empty! try again");
            }
        },

        showTaskType: function(){
            var xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {
                    console.log(JSON.parse(xhttp.responseText));
                    app.task_type = JSON.parse(xhttp.responseText);
                }
            };
            xhttp.open("GET", "/getTaskType", true);
            xhttp.send();
        },


        removeTaskType: function(postIndex){
            // send to server-side id to delete task
            var xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {
                    console.log('Removed Task type successfully');
                }
            };
            xhttp.open("POST", "/removeTaskType", true);
            xhttp.setRequestHeader("Content-type", "application/json");
            xhttp.send(JSON.stringify({date:app.task_type[postIndex].date_begin}));

            // client-side
             Vue.delete(this.task_type, postIndex);
        },

        show_member: function(){
            var xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {
                    app.member = JSON.parse(xhttp.responseText);
                }
            };
            xhttp.open("GET", "/getMember", true);
            xhttp.send();
        },

        user_get_task: function(){
            var xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {
                    var x = JSON.parse(xhttp.responseText);
                    var user  = x.user;
                    var tasks = x.task;

                    for(var i=0; i<tasks.length;i++){
                        if(user.first_name == tasks[i].fname && user.last_name == tasks[i].lname ){
                            app.user_task_preference.push(tasks[i]);
                        }else{
                            continue;
                        }
                    }
                }
            };
            xhttp.open("GET", "/userGetTask", true);
            xhttp.send();
        },
    }

});


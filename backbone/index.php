<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
  <title>To-do App in Backbone.js</title>
  
  <!-- ========= -->
  <!--    CSS    -->
  <!-- ========= -->
  <style type="text/css">
    /* Hides bullet points from todo list */
    #todoapp ul {
      list-style-type: none;
    }
    
    #todo-list input.edit {
    	display: none;
    }
    #todo-list .editing label {
    	display: none;
    }
    #todo-list .editing input.edit {
    	display: inline;
    }
  </style>  
</head>
<body>
  <!-- ========= -->
  <!-- Your HTML -->
  <!-- ========= -->

  <section id="todoapp">
    <header id="header">
      <h1>Todos</h1>
      <input id="new-todo" placeholder="What needs to be done?" autofocus>
    </header>
    <section id="main">
      <ul id="todo-list"></ul>
    </section>
  </section>
  <div>
    <p>Find the tutorial and code in <a href="http://adrianmejia.com/blog/2012/09/11/backbone-dot-js-for-absolute-beginners-getting-started/">here</a></p>
  </div>  

  <!-- Templates -->
  <script type="text/template" id="item-template">
    <div class="view">
      <input class="toggle" type="checkbox">
      <label><%- title %></label>
      <input class="edit" value="<%- title %>">
    </div>
  </script>  

  <!-- ========= -->
  <!-- Libraries -->
  <!-- ========= -->
  <script src="/scripts/jquery.min.js" type="text/javascript"></script>
  <script src="/scripts/underscore.js" type="text/javascript"></script>
  <script src="/scripts/backbone.js" type="text/javascript"></script>
  <script src="/scripts/backbone.localStorage.js" type="text/javascript"></script>

  <!-- =============== -->
  <!-- Javascript code -->
  <!-- =============== -->
  <script type="text/javascript">
    'use strict';

    var app = {}; // create namespace for our app
    
    //--------------
    // Models
    //--------------
    app.Todo = Backbone.Model.extend({
      defaults: {
        title: '',
        completed: false
      }
    });

    //--------------
    // Collections
    //--------------
    app.TodoList = Backbone.Collection.extend({
      model: app.Todo,
      localStorage: new Store("backbone-todo")
    });

    // instance of the Collection
    app.todoList = new app.TodoList();

    //--------------
    // Views
    //--------------
    
    // renders individual todo items list (li)
    app.TodoView = Backbone.View.extend({
      tagName: 'li',
      template: _.template($('#item-template').html()),
      render: function(){
        this.$el.html(this.template(this.model.toJSON()));
        this.input = this.$('.edit');
        return this; // enable chained calls
      },
      initialize: function(){
      	this.model.on('change', this.render, this);
      },
      events: {
      	'dblclick label' : 'edit',
      	'keypress .edit' : 'updateOnEnter',
      	'blur .edit' : 'close'
      },
      edit: function(){
      	this.$el.addClass('editing');
      	this.input.focus();
      },
      close: function(){
      	var value = this.input.val().trim();
      	if(value) {
      		this.model.save({title: value});
      	}
      	this.$el.removeClass('editing');
      },
      updateOnEnter: function(e){
      	if(e.wich == 13){
      		this.close();
      	}
      }
    });

    // renders the full list of todo items calling TodoView for each one.
    app.AppView = Backbone.View.extend({
      el: '#todoapp',
      initialize: function () {
        this.input = this.$('#new-todo');
        app.todoList.on('add', this.addAll, this);
        app.todoList.on('reset', this.addAll, this);
        app.todoList.fetch(); // Loads list from local storage
      },
      events: {
        'keypress #new-todo': 'createTodoOnEnter'
      },
      createTodoOnEnter: function(e){
        if ( e.which !== 13 || !this.input.val().trim() ) { // ENTER_KEY = 13
          return;
        }
        app.todoList.create(this.newAttributes());
        this.input.val(''); // clean input box
      },
      addOne: function(todo){
        var view = new app.TodoView({model: todo});
        $('#todo-list').append(view.render().el);
      },
      addAll: function(){
        this.$('#todo-list').html(''); // clean the todo list
        app.todoList.each(this.addOne, this);
      },
      newAttributes: function(){
        return {
          title: this.input.val().trim(),
          completed: false
        }
      }
    });

    //--------------
    // Initializers
    //--------------   

    app.appView = new app.AppView(); 

  </script>
  
</body>
</html>
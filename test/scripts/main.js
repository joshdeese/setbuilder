var getSongList = function(){
	var Songs = {
	    Models: {},
	    Collections: {},
	    Views: {},
	    Templates:{}
	}
	
	Songs.Models.Song = Backbone.Model.extend({})
	Songs.Collections.Songs = Backbone.Collection.extend({
	    model: Songs.Models.Song,
	    url: "../scripts/getSongs.php",
	    initialize: function(){
	        //console.log("Movies initialize")
	    }
	});
	
	Songs.Templates.songs = _.template($("#tmplt-Songs").html())
	
	Songs.Views.Songs = Backbone.View.extend({
	    el: $("#mainContainer"),
	    template: Songs.Templates.songs,
	    //collection: new Songs.Collections.Songs(), //Not needed
	
	    initialize: function () {
	        _.bindAll(this, "render", "addOne", "addAll");
	        this.collection.bind("reset", this.render, this);
	        this.collection.bind("add", this.addOne, this);
	        this.render();
	    },
	
	    render: function () {
	        //console.log("render");
	        //console.log(this.collection.length);
	        $(this.el).html(this.template());
	        this.addAll();
	    },
	
	    addAll: function () {
	        //console.log("addAll")
	        this.collection.each(this.addOne);
	    },
	
	    addOne: function (model) {
	        //console.log("addOne")
	        view = new Songs.Views.Song({ model: model });
	        $("#song_list_container", this.el).append(view.render());
	    }
	
	})
	
	
	Songs.Templates.song = _.template($("#tmplt-Song").html())
	Songs.Views.Song = Backbone.View.extend({
	    tagName: "div",
	    template: Songs.Templates.song,
	    //events: { "click .delete": "test" },
	
	    initialize: function () {
	        //_.bindAll(this, 'render', 'test');
	        this.model.bind('destroy', this.destroyItem, this);
	        this.model.bind('remove', this.removeItem, this);
	    },
	
	    render: function () {
	        return $(this.el).append(this.template(this.model.toJSON())) ;
	    },
	
	    removeItem: function (model) {
	        //console.log("Remove - " + model.get("Name"))
	        this.remove();
	    }
	})
	
	
	Songs.Router = Backbone.Router.extend({
	    routes: {
	        "": "defaultRoute"  //http://localhost:22257/Theater/theater.htm
	    },
	
	    defaultRoute: function () {
	        //console.log("defaultRoute");
	        Songs.songs = new Songs.Collections.Songs()
	        new Songs.Views.Songs({ collection: Songs.songs }); //Add this line
	        Songs.songs.fetch();
	        //console.log(Songs.songs.length)
	    }
	})
	
	var appRouter = new Songs.Router();
	Backbone.history.start();
}
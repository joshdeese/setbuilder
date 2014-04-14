// todo: now that we're using backbone, dragging a song to a setlist adds an new line, but doesn't have any data in it
//   this is probably because there's an extra <div> wrapper on each song.
//   However, double clicking a song will add the correct data, because I've corrected that method

var singers;

var pageSetup = function(){
	$.ajax({
		type: "GET",
		dataType: "json",
		url: "/scripts/getSingers.php",
		async: false,
		success: function(data){
			singers = data;
		}
	});
	
	$( "#set_songs_table" ).droppable({
    activeClass: "ui-state-default",
    hoverClass: "ui-state-hover",
    accept: ":not(.ui-sortable-helper)",
    drop: function(event, ui){
	    var songID = ui.draggable.attr('id');
	    var objSong = $.grep(Songs.songs.models, function(e){
	    	return e.id == songID;
	    });
	    
	    dropSong(objSong[0].attributes);
    }
  }).sortable({
    items: "tr:not(.placeholder, .empty)",
    sort: function() {
      $( this ).removeClass( "ui-state-default" );
    }
  });
	
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
		events: { "dblclick": "add_to_set" },
		
		initialize: function () {
			//_.bindAll(this, 'render', 'test');
			this.model.bind('destroy', this.destroyItem, this);
			this.model.bind('remove', this.removeItem, this);
		},
		render: function () {
			$(this.el).append(this.template(this.model.toJSON()));
			$(".song_container", this.el).draggable({appendTo: "body",helper: "clone"});
			return $(this.el);
		},
		removeItem: function (model) {
			//console.log("Remove - " + model.get("Name"))
			this.remove();
		},
		add_to_set: function(){
			dropSong(this.model.attributes);
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
	
	$.ajax({
		type: "GET",
		dataType: "json",
		url: "/scripts/getArtists.php",
		async: false,
		success: function(data){
			for(var i=0; i<data.length; i++){
				$('#artist_filter').append($('<option>').attr('value', data[i].artist).html(data[i].artist));
			}
		}
	});
	
	$('#artist_filter').change(function(){
		$('.song_container').show();
		if($(this).val() != 0){
			var songs = $('.song_container');
			for(var i=0; i<songs.length; i++){
				if($(songs[i]).attr('artist') != $(this).val()){
					$(songs[i]).hide();
				}
			}
		}
	});
	
	$('#txtSearch').keyup(function(){
		if($(this).val() != ''){
			var search_string = $(this).val().toLowerCase();
			$('.song_container').each(function(){
				var myTitle = $(this).attr('title').toLowerCase();
				var myArtist = $(this).attr('artist').toLowerCase();
				if(myTitle.indexOf(search_string) == -1 && myArtist.indexOf(search_string) == -1){
					$(this).css('display', 'none');
				} else {
					$(this).css('display', '');
				}
			});
		} else {
			$('.song_container').css('display', '');
		}
	});
	
	$('.song_container').dblclick(function(){
		dropSong($(this));
	});
	
	$('#btnSend').button().click(function(){
		var mySubject = $('#mail_subject').val();
		var myMessage = '<html><head></head><body><div style="font-size:12pt;font-family:Calibri,Arial,Helvetica,sans-serif">'+$('#mail_message').val() + '<br/><br/><b>Set List:</b><br/>';
		
		// todo: create message by adding song titles, youtube urls, and pdf urls like in tim's e-mails
		
		for(var i=0; i < $('.setlist_song', $('#set_songs_table')).length; i++){
			var song = $('.setlist_song', $('#set_songs_table'))[i];
			var video = "https://www.youtube.com/watch?v="+$(song).attr('youtube');
			var pdf = $(song).attr('pdf');
			myMessage += $(song).attr('title') + ' - Singer - Key | <a href="'+video+'">Video</a> | <a href="'+pdf+'">Chord Chart</a><br/>';
		}
		
		myMessage += "</div></body></html>"
		
		$.ajax({
			type: "GET",
			url: "/scripts/setemail.php",
			data: {subject: mySubject, message: myMessage},
			async: true,
			success: function(data){
				console.log(data);
			}
		});
	});
	
	$('#btnSave').button().click(function(){
		alert('Saved');
	});
}

function dropSong(draggable){
	$(this).find( ".placeholder" ).remove();
	var empty_row = $('.empty', $('#set_songs_table'))[0];
	$(empty_row).removeClass('empty').addClass('setlist_song').addClass('just_added').empty().append($('<td>').append(draggable.title)).append($('<td>').addClass('leadvox')).append($('<td>').addClass('key'));
	if($('.empty', $('#set_songs_table')).length == 0){
	  $('#set_songs_table').append($('<tr>').addClass('table_body').addClass('empty').append($('<td>').attr('colspan', 3)));
	}
	
	$('.leadvox', $('.just_added')).append($('<select>').addClass('leadvox_select'));
	
	for(var i=0; i<singers.length; i++){
		$('.just_added .leadvox_select').append($('<option>').attr('value', singers[i].id).append(singers[i].FName + ' ' + singers[i].LName));
	}
	
	$('.just_added .leadvox_select').val(draggable.LeadVoc);
	
	var mySong = $('.just_added', $('#set_songs_table'))[0];
	$(mySong).removeClass('just_added').attr('songID', draggable.id).attr('title', draggable.title).attr('artist', draggable.artist).attr('pdf', draggable.PDF).attr('youtube', draggable.YouTube);
}
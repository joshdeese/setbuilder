<?php session_start(); ?>
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
<head>
<meta http-equiv="content-type" content="text/html; charset=utf-8" />
<meta name="description" content="" />
<meta name="keywords" content="" />
<meta name="author" content="" />
<link rel="stylesheet" type="text/css" href="../style.css" media="screen" />
<link rel="stylesheet" type="text/css" href="style.css" media="screen" />
<?php include('../includes/headfiles.php'); ?>
<title>New Set</title>
<script type="text/javascript">
	$(document).ready(function(){
		var Song = Backbone.Model.extend({
			defaults: {
				title: 'Song Title',
				artist: 'Artist Name',
				key: 'C',
				lead_vox: 'Josh Deese'
			}
		});
		
		var Songs = Backbone.Collection.extend({
			model: Song
		});
		
		var SongsList = Backbone.View.extend({
			el: $('body'), // attaches 'this.el' to an existing element.
			
			events: {
				'click button#add': 'addItem'
			},
			initialize: function(){
				_.bindAll(this, 'render', 'addItem', 'appendItem'); // every function that uses 'this' as the current object should be in here
				
				this.collection = new Songs();
				this.collection.bind('add', this.appendItem); // collection event binder
				
				this.counter = 0; // total nubmer of items added thus far
				this.render(); // not all views are self-rendering. This one is.
			},
			render: function(){
				var self = this;
				$(this.el).append("<button id='add'>Add list item</button>");
				$(this.el).append("<ul></ul>");
				_(this.collection.models).each(function(song){ // in case collection is not empty
					self.appendItem(song);
				}, this);
			},
			addItem: function(title, artist){
				this.counter++;
				var song = new Song();
				song.set({
					title: title,
					artist: artist
				});
				this.collection.add(song);// add item to collection; view is updated via event 'add'
			},
			appendItem: function(song){
				$('ul', this.el).append("<li>"+song.get('title')+" "+song.get('artist')+"</li>");
			}
		});
		
		var songsList = new SongsList();
		
		$.ajax({
			type: "GET",
			dataType: "json",
			url: "/scripts/getSongs.php",
			async: false,
			success: function(data){
				for(var i=0; i<data.length; i++){
					//$('#song_list_container').append($('<div>').addClass('song_container').attr('id', data[i].id).attr('title', data[i].title).attr('artist', data[i].artist).append($('<div>').addClass('song_info').append($('<span>').addClass('song').html(data[i].title))));
					songsList.addItem(data[i].title, data[i].artist);
				}
			}
		});
	});	
</script>
</head>
<body>
</body>
</html>
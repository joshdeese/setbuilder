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
		
		var SongView = Backbone.View.extend({
      tagName: 'li',
      //template: _.template($('#item-template').html()),
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
      	'blur .edit' : 'close',
      	'dblclick #song_container' : 'displayInfo'
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
      },
      displayInfo: function(){
	      alert(this.model.get('title'));
      }
    });
		
		var SongsList = Backbone.View.extend({
			el: $('#song_list_container'),
			
			events: {
				//'dblclick': 'display_info'
			},
			initialize: function(){
				_.bindAll(this, 'render', 'addItem', 'appendItem', 'display_info');
				
				this.collection = new Songs();
				this.collection.bind('add', this.appendItem);
				
				this.counter = 0;
				this.render();
			},
			render: function(){
				var self = this;
				_(this.collection.models).each(function(song){
					self.appendItem(song);
				}, this);
			},
			addItem: function(id, title, artist){
				this.counter++;
				var song = new Song();
				song.set({
					id: id,
					title: title,
					artist: artist
				});
				this.collection.add(song);
			},
			display_info: function(){
				alert('Title: '+this.get('title')+', Artist: '+this.get('artist')+', ID: '+this.get('id'));
			},
			appendItem: function(song){
				$(this.el).append($('<div>').addClass('song_container').append($('<div>').addClass('song_info').append($('<span>').addClass('song').html(song.get('title')))));
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
					songsList.addItem(data[i].id, data[i].title, data[i].artist);
				}
			}
		});
	});	
</script>
</head>
    <body>
        <div id="wrapper">

<?php include('../includes/header.php'); ?>

<?php include('../includes/nav.php'); ?>

<div id="content" style="width: 940px;">
	<div id="left_bar" style="width: 440px; float: left;">
		<div id="song_list_container">
		</div>
	</div>
</div> <!-- end #content -->

<!-- Templates -->
<script type="text/template" id="item-template">
  <div class="song_container">
    <div class="song_info">
    	<span class="song"><%- title %></span>
    </div>
  </div>
</script>  

<?php include('../includes/sidebar.php'); ?>

<?php include('../includes/footer.php'); ?>

        </div> <!-- End #wrapper -->
    </body>
</html>
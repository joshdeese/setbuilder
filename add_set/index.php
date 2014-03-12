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
		
		function dropSong(draggable){
			$(this).find( ".placeholder" ).remove();
			var empty_row = $('.empty', $('#set_songs_table'))[0];
			$(empty_row).removeClass('empty').addClass('setlist_song').addClass('just_added').empty().append($('<td>').append(draggable.text())).append($('<td>')).append($('<td>'));
			if($('.empty', $('#set_songs_table')).length == 0){
			  $('#set_songs_table').append($('<tr>').addClass('table_body').addClass('empty').append($('<td>').attr('colspan', 3)));
			}
			
			var songID = draggable.attr('id');
			$.ajax({
				type: "GET",
				dataType: "json",
				url: "/scripts/songData.php",
				data: {songID: songID},
				async: true,
				success: function(data){
					for(var i=0; i<data.length; i++){
						// parse data
						var mySong = $('.just_added', $('#set_songs_table'))[0];
						var id = data[i].id;
						var pdf = data[i].PDF;
						var youtube = data[i].YouTube;
						// todo: create variables for title and artist
						$(mySong).removeClass('just_added').attr('songID', id).attr('title', title).attr('artist', artist).attr('pdf', pdf).attr('youtube', youtube);
					}
				}
			});
		}
		
	  $( "#set_songs_table" ).droppable({
	    activeClass: "ui-state-default",
	    hoverClass: "ui-state-hover",
	    accept: ":not(.ui-sortable-helper)",
	    drop: function(event, ui){
		    dropSong(ui.draggable);
	    }
	  }).sortable({
	    items: "tr:not(.placeholder, .empty)",
	    sort: function() {
	      // gets added unintentionally by droppable interacting with sortable
	      // using connectWithSortable fixes this, but doesn't allow you to customize active/hoverClass options
	      $( this ).removeClass( "ui-state-default" );
	    }
	  });
	
		$.ajax({
			type: "GET",
			dataType: "json",
			url: "/scripts/getSongs.php",
			async: false,
			success: function(data){
				for(var i=0; i<data.length; i++){
					$('#song_list_container').append($('<div>').addClass('song_container').attr('id', data[i].id).attr('title', data[i].title).attr('artist', data[i].artist).append($('<div>').addClass('song_info').append($('<span>').addClass('song').html(data[i].title))));
				}
				
				$( "#song_list_container .song_container" ).draggable({
			    appendTo: "body",
			    helper: "clone"
			  });
			}
		});
		
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
			var myMessage = $('#mail_message').val() + '<br/>';
			
			// todo: create message by adding song titles, youtube urls, and pdf urls like in tim's e-mails
			
			$('.setlist_song', $('#set_songs_table')).each(function(){
				myMessage += $(this).
			});
						
			$.ajax({
				type: "GET",
				dataType: "json",
				url: "/scripts/setemail.php",
				data: {subject: mySubject, message; myMessage},
				async: true,
				success: function(data){}
			});
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
		<div id="filters">
			<table>
				<tr>
					<td>Filters:</td>
				</tr>
				<tr>
					<td><input type="text" id="txtSearch" /></td>
				</tr>
				<tr>
					<td>
						<select id="artist_filter">
							<option value=0>All</option>
						</select>
					</td>
				</tr>
			</table>
		</div>
		<div id="song_list_container">
		</div>
	</div>
	<div id="setlist" style="width: 490px; float: right;">
		<div id="set_details">
			<table>
				<tr>
					<td>Subject:</td>
					<td>
						<input type="text" id="mail_subject" />
					</td>
					<td>Date:</td>
					<td>
						<input type="text" id="set_date" />
					</td>
				</tr>
				<tr>
					<td>Message:</td>
					<td colspan="3">
						<textarea rows="3" cols="50" id="mail_message"></textarea>
					</td>
				</tr>
			</table>
		</div>
		<div id="set_songs">
			<table id="set_songs_table">
				<tr class="table_head">
					<th width="200">Title</td>
					<th width="150">Lead Vocals</td>
					<th width="75">Key</td>
				</tr>
				<tr class="table_body empty">
					<td colspan="3"></td>
				</tr>
				<tr class="table_body empty">
					<td colspan="3"></td>
				</tr>
				<tr class="table_body empty">
					<td colspan="3"></td>
				</tr>
				<tr class="table_body empty">
					<td colspan="3"></td>
				</tr>
				<tr class="table_body empty">
					<td colspan="3"></td>
				</tr>
			</table>
			
			<div id="btnSend">Send</div>
		</div>
	</div>
</div> <!-- end #content -->

<?php include('../includes/sidebar.php'); ?>

<?php include('../includes/footer.php'); ?>

        </div> <!-- End #wrapper -->
    </body>
</html>
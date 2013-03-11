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
<script type="text/javascript">
	$(document).ready(function(){
		// Title, Artist, YouTubeID, PDFID
		var songs = new Array();
		
		$.ajax({
			type: "GET",
			dataType: "json",
			url: "/scripts/getSongs.php",
			async: false,
			success: function(data){
				songs = data;
			}
		})
		
		var template = $('<div>');
		template.append($('<div>').addClass('song_info').append($('<span>').addClass('song')));
		template.append($('<div>').addClass('icon play').append($('<a>').addClass('various iframe').attr('href', 'http://www.youtube.com/embed/vidid?autoplay=1')));
		template.append($('<div>').addClass('icon pdf lyrics').append($('<a>').addClass('iframe')));
		template.append($('<div>').addClass('icon pdf chord').append($('<a>').addClass('iframe')));
		
		$('.icon.play a', template).fancybox({ type: 'iframe'});
		$('.icon.pdf a', template).fancybox({ 
			type: 'iframe',
			autoSize : false,
			//height: $(window).height(),
			beforeShow : function(){
				// code to resize fancybox goes here
			} 
		});
		
		for(var i=0; i<songs.length; i++){
			write_song(songs[i]);
		}
		
		function write_song(arrSong){
			var mySong = template.clone();
			
			$('.song', mySong).append(arrSong[0] + ' - ' + arrSong[1]);
			
			var youtube = 'http://www.youtube.com/embed/' + arrSong[2] + '?autoplay=1';
			var lyrics = 'pdf_load.php?id=' + arrSong[3] + '&type=lyrics';
			var chord = 'pdf_load.php?id=' + arrSong[3] + '&type=chord';
			
			$('.play a', mySong).attr('href', youtube);
			$('.lyrics a', mySong).attr('href', lyrics);
			$('.chord a', mySong).attr('href', chord);
			
			$('#song_list').append(mySong);
		}
		
		$('#btnAdd').button().click(function(){
			$('#song_list').css('display', 'none');
			$('#btnAdd').css('display', 'none');
			$('#new_song').css('display', '');
			$('#btnSave').css('display', '');
		});
		
		$('#btnSave').button().click(function(){
			// todo: make ajax request to page that will append the new info as JSON to songs.txt
			var myData = new Array();
			var mySong = new Array();
			
			mySong.push($('#txtTitle').val());
			mySong.push($('#txtArtist').val());
			
			$.ajax({
				type:"GET",
				url: "/scripts/addSong.php",
				data: { songData: mySong },
				success: function(data){
					alert(data);
					write_song(mySong);
				}
			});
			
			$('#song_list').css('display', '');
			$('#btnAdd').css('display', '');
			$('#new_song').css('display', 'none');
			$('#btnSave').css('display', 'none');
		});
	});
</script>
<title>Songs</title>
</head>
    <body>
        <div id="wrapper">

<?php include('../includes/header.php'); ?>

<?php include('../includes/nav.php'); ?>

<div id="content">
	<div id="song_list">
		<div id="song_list_header">
			<div class="list_title">Songs</div>
			<div class="list_header">Play</div>
			<div class="list_header">Lyrics</div>
			<div class="list_header">Chord</div>
			<!--<div class="list_header">Lead</div>
			<div class="list_header">Vocal</div>-->
		</div>
	</div>
	<div id="btnAdd">Add Song</div>
	<div id="new_song" style="display: none;">
		<h2>New Song</h2>
		<form id="frmNewSong">
			Title: <input type="text" id="txtTitle" name="txtTitle" />
			Artist: <input type="text" id="txtArtist" name="txtArtist" />
			<div id="btnSave">Save</div>
		</form>
	</div>
</div> <!-- end #content -->

<?php include('../includes/sidebar.php'); ?>

<?php include('../includes/footer.php'); ?>

        </div> <!-- End #wrapper -->
    </body>
</html>
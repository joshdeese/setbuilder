<?php
	session_id();
	session_start();
?>
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
<head>
<meta http-equiv="content-type" content="text/html; charset=utf-8" />
<meta name="description" content="" />
<meta name="keywords" content="" />
<meta name="author" content="" />
<link rel="stylesheet" type="text/css" href="../style.css" media="screen" />
<link rel="stylesheet" type="text/css" href="style.css" media="screen" />

<?php include('../includes/headfiles.php'); ?>
<script type="text/javascript" src="/scripts/songs.js"></script>
<script type="text/javascript">
	$(document).ready(function(){
		load_songs();
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
		<div id="searchbox">
			<input type="text" id="txtSearch" />
		</div>
		<div id="song_list_header">
			<div class="list_title">Songs</div>
			<div class="list_header">Play</div>
			<div class="list_header">Lyrics</div>
			<div class="list_header">Chord</div>
		</div>
	</div>
	<?php
		if($_SESSION["user_group"]==1)
		{
	?>
	<div id="btnAdd">Add Song</div>
	<div id="new_song" style="display: none;">
		<h2>New Song</h2>
		<form id="frmNewSong">
			Title: <input type="text" id="txtTitle" name="txtTitle" />
			Artist: <input type="text" id="txtArtist" name="txtArtist" />
			<div id="btnSave">Save</div>
		</form>
	</div>
	<?php
		}
	?>
</div> <!-- end #content -->

<?php include('../includes/sidebar.php'); ?>

<?php include('../includes/footer.php'); ?>

        </div> <!-- End #wrapper -->
    </body>
</html>
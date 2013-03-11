<?php
	session_id();
	session_start();
	
	include('scripts/getbrowser.php');
	
	if (getbrowser() == 'iPhone')
	{
		//header ("Location: m/");
		//exit;
	}
?>
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
<head>
<meta http-equiv="content-type" content="text/html; charset=utf-8" />
<meta name="description" content="" />
<meta name="keywords" content="" />
<meta name="author" content="" />
<link rel="stylesheet" type="text/css" href="style.css" media="screen" />
<?php include('includes/headfiles.php'); ?>
<title>CFPB</title>
</head>
    <body>
        <div id="wrapper">

<?php include('includes/header.php'); ?>

<?php include('includes/nav.php'); ?>

<div id="content">
	
	<h2>Cornerstone Fellowship Praise Band</h2>
	
	<p>
	
	Welcome to the interactive setbuilder site for Cornerstone Fellowship Praise Band! Here you'll be able to view current and past set lists, view song information(i.e. chord/lyric charts, youtube/mp3 links, song notes...) and communicate with team members.
	
	</p>

</div> <!-- end #content -->

<?php include('includes/sidebar.php'); ?>

<?php include('includes/footer.php'); ?>

        </div> <!-- End #wrapper -->
    </body>
</html>
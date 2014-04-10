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
<script type="text/javascript" src="/scripts/view_set.js"></script>
<title></title>
<script type="text/javascript">
	$(document).ready(function(){
		set_data(<?php echo $_GET['id']; ?>);
	});
</script>
</head>
    <body>
        <div id="wrapper">

<?php include('../includes/header.php'); ?>

<?php include('../includes/nav.php'); ?>

<div id="content">
	
	<div id="title"></div>
	<div id="date"></div>
	<div id="message"></div>
	<table id="songs">
		<tr>
			<th>Title</th>
			<th>Singer</th>
			<th>Key</th>
			<th>Video</th>
			<th>Lyrics</th>
			<th>Chords</th>
		</tr>
	</table>

</div> <!-- end #content -->

<?php include('../includes/sidebar.php'); ?>

<?php include('../includes/footer.php'); ?>

        </div> <!-- End #wrapper -->
    </body>
</html>
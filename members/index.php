<?php session_start(); ?>
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
<head>
<meta http-equiv="content-type" content="text/html; charset=utf-8" />
<meta name="description" content="" />
<meta name="keywords" content="" />
<meta name="author" content="" />
<link rel="stylesheet" type="text/css" href="../style.css" media="screen" />
<?php include('../includes/headfiles.php'); ?>
<script type="text/javascript">
	$(document).ready(function(){
		var template = $('<tr>').append($('<td>').addClass('member_name')).append($('<td>').addClass('member_email')).append($('<td>').addClass('member_username'));
		
		$.ajax({
			type: "GET",
			dataType: "json",
			url: "/scripts/getUsers.php",
			async: false,
			success: function(data){
				for(var i=0; i<data.length; i++){
					var row = template.clone();
					$('.member_name', row).append(data[i].FName + ' ' + data[i].LName);
					$('.member_email', row).append(data[i].Contact);
					$('.member_username', row).append(data[i].Username);
					$('#members_table').append(row);
				}
			}
		});
	});
</script>
<title>Members</title>
</head>
<body>
<div id="wrapper">

<?php include('../includes/header.php'); ?>

<?php include('../includes/nav.php'); ?>

<div id="content">
	<?php
		if($_SESSION["user_group"]==1){
	?>
	<h2>Members</h2>
	
	<table id="members_table">
		<tr>
			<th>Name</th>
			<th>E-Mail</th>
			<th>UserName</th>
		<tr>
	</table>
	<?php
		} else {
	?>
		<h2>You do not have permission to view this page</h2>
	<?php
		}
	?>	
</div> <!-- end #content -->

<?php include('../includes/sidebar.php'); ?>

<?php include('../includes/footer.php'); ?>

</div> <!-- End #wrapper -->
</body>
</html>
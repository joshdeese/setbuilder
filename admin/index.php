<?php 
	session_start();
?>
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
<head>
<meta http-equiv="content-type" content="text/html; charset=utf-8" />
<meta name="description" content="" />
<meta name="keywords" content="" />
<meta name="author" content="" />
<link rel="stylesheet" type="text/css" href="../style.css" media="screen" />
<title>Admin</title>
</head>
    <body>
        <div id="wrapper">

<?php include('../includes/header.php'); ?>

<?php include('../includes/nav.php'); ?>

<div id="content">
	<?php
		if($_SESSION["user_group"]!=5)
		{
			echo "You do not have permission to view this page";
		} else
		{
	?>
	<h2>Hello Administrator</h2>
	
	<?php
		//show table of users and the groups they are in
		include '../scripts/mySqlConnect.php';
		include '../scripts/showtable.php';
		$db = ConnectToDB();
		mysql_select_db("myDB", $db);
		$Link1 = '<a href="users/?id=';
		$Link2 = '">';
		$Link3 = '</a>';
		$sqlUserGroups = "SELECT CONCAT('$Link1', tblUsers.ID, '$Link2', tblUsers.UserName, '$Link3') AS myUserName, tblGroups.Name FROM tblUsers LEFT JOIN (tblPrivelage INNER JOIN tblGroups ON tblPrivelage.GroupID = tblGroups.ID) ON tblUsers.ID = tblPrivelage.UserID ORDER BY tblUsers.ID;";
		$rUserGroups = mysql_query($sqlUserGroups, $db);
		showTable($rUserGroups);
	?>
	<?php
		}
	?>
	
</div> <!-- end #content -->

<?php include('../includes/sidebar.php'); ?>

<?php include('../includes/footer.php'); ?>

        </div> <!-- End #wrapper -->
    </body>
</html>
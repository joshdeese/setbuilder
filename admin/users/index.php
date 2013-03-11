<?php session_start(); ?>
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
<head>
<meta http-equiv="content-type" content="text/html; charset=utf-8" />
<meta name="description" content="" />
<meta name="keywords" content="" />
<meta name="author" content="" />
<link rel="stylesheet" type="text/css" href="../../style.css" media="screen" />
<title>Admin</title>
</head>
    <body>
        <div id="wrapper">

<?php include('../../includes/header.php'); ?>

<?php include('../../includes/nav.php'); ?>

<div id="content">
	
	<?php
		include '../../scripts/mySqlConnect.php';
		$db = ConnectToDB();
		mysql_select_db("myDB", $db);
		
		$myID = $_GET["id"];
		
		$sql = "SELECT tblUsers.UserName, tblUserData.FName, tblUserData.LName, tblUserData.email FROM tblUsers INNER JOIN tblUserData ON tblUsers.ID = tblUserData.id WHERE tblUsers.ID = $myID;";
		$result = mysql_query($sql, $db);
		echo mysql_result($result,0,0)." || ".mysql_result($result,0,1)." || ".mysql_result($result,0,2)." || ".mysql_result($result,0,3);
	?>

</div> <!-- end #content -->

<?php include('../../includes/sidebar.php'); ?>

<?php include('../../includes/footer.php'); ?>

        </div> <!-- End #wrapper -->
    </body>
</html>
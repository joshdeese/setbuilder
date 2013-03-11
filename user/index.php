<?php session_start(); ?>
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
	<head>
		<meta http-equiv="content-type" content="text/html; charset=utf-8" />
		<meta name="description" content="" />
		<meta name="keywords" content="" />
		<meta name="author" content="" />
		<link rel="stylesheet" type="text/css" href="../style.css" media="screen" />
		<title>1stWebDesigner PHP Template</title>
	</head>
	<body>
		<div id="wrapper">
	
			<?php include('../includes/header.php'); ?>
			
			<?php include('../includes/nav.php'); ?>
			
			<div id="content">
				<form name="UserInfo" method="POST">
					<?php
						include "../scripts/mySqlConnect.php";
						
						$db = connectToDb();
						mySql_select_db("myDB", $db);
						$fname = $_POST["fname"];
						$lname = $_POST["lname"];
						$email = $_POST["email"];
						if ($fname!="" && $lname!="" && $email!="")
						{
							$sqlCheckID = 'SELECT FName FROM tblUserData WHERE id = "'.$_SESSION["user_id"].'";';
							$UserData = mysql_query($sqlCheckID, $db);
							
							if (mysql_num_rows($UserData)>0)
							{
								$sqlUpdateUserData = 'UPDATE tblUserData SET FName = "'.$fname.'", LName = "'.$lname.'", email = "'.$email.'" WHERE id = "'.$_SESSION["user_id"].'";';
								mysql_query($sqlUpdateUserData, $db);
							} else
							{
								$sqlInsertData = "INSERT INTO tblUserData(id, FName, LName, email) VALUES (".$_SESSION["user_id"].', "'.$fname.'", "'.$lname.'", "'.$email.'");';
								mysql_query($sqlInsertData, $db);
							}
						}
						
						$sqlGetUserData = 'SELECT FName, LName, email FROM tblUserData WHERE (tblUserData.id = '.$_SESSION["user_id"].');';
						$user = mysql_query($sqlGetUserData, $db);
						
						if (mysql_num_rows($user)>0)
						{
							$FName = mysql_result($user, 0, 0);
							$LName = mysql_result($user, 0, 1);
							$email = mysql_result($user, 0, 2);
						}
						
						echo '<p>First Name: <input type="text" name="fname" value="'.$FName.'" /></p>';
						echo '<p>Last Name: <input type="text" name="lname" value="'.$LName.'" /></p>';
						echo '<p>E-mail: <input type="text" name="email" value="'.$email.'" size = "30" /></p>';
						echo '<p><input type="submit" value="Save Changes" /></p>';
						echo '<p><a href="../logout/">Log Out</a></p>';
					?>
				</form>
			
			</div> <!-- end #content -->
			
			<?php include('../includes/sidebar.php'); ?>
			
			<?php include('../includes/footer.php'); ?>

        </div> <!-- End #wrapper -->
	</body>
</html>
<?php 
	session_start();
	
	include "../scripts/auth.php";
	
	if ($_POST["username"] && $_POST["password"])
	{
		register($_POST["username"], $_POST["password"], $_POST["again"]);
		authenticate($_POST["username"], $_POST["password"]);
		//header ("Location: ../");
		//exit;
	}	
?>
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
	<head>
		<meta http-equiv="content-type" content="text/html; charset=utf-8" />
		<meta name="description" content="" />
		<meta name="keywords" content="" />
		<meta name="author" content="" />
		<link rel="stylesheet" type="text/css" href="../style.css" media="screen" />
		<title>Register</title>
	</head>
	<body>
		<div id="wrapper">
	
			<?php include('../includes/header.php'); ?>
			
			<?php include('../includes/nav.php'); ?>
			
			<div id="content">
				
				<form name="register" method="post">
					<p>Username: <input type="text" name="username" /></p>
					<p>Password: <input type="password" name="password" /></p>
					<p>Again: <input type="password" name="again" /></p>
					<p><input type="submit" value="Submit" /></p>
				</form>
			
			</div> <!-- end #content -->
			
			<?php include('../includes/sidebar.php'); ?>
			
			<?php include('../includes/footer.php'); ?>

        </div> <!-- End #wrapper -->
		
	</body>
</html>
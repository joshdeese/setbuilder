<?php
	session_start();
	
	include "../scripts/auth.php";
	
	if ($_POST["username"] && $_POST["password"])
	{
		if (authenticate($_POST["username"], $_POST["password"]))
		{
			header ("Location: ../");
			exit;
		}
	} else if ($_POST["username"]!="" && $_POST["password"]!="")
	{
		$_SESSION["login_fail"] = "You must supply a Username and Password.";
	}
?>

<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
	<head>
		<meta http-equiv="content-type" content="text/html; charset=utf-8" />
		<meta name="description" content="" />
		<meta name="keywords" content="" />
		<meta name="author" content="" />
		<link rel="stylesheet" type="text/css" href="../style.css" media="screen" />
		<title>Login</title>
	</head>
    <body>
    	<div id="wrapper">

			<?php include('../includes/header.php'); ?>
			
			<?php include('../includes/nav.php'); ?>
			
			<?php include('../includes/sidebar.php'); ?>
			
			<div id="content">
				<?php
					$myPath = $_SERVER['PHP_SELF'];
					$root = $_SERVER['SERVER_ADDR'];
					
					if($_SESSION["login_fail"]!=null)
					{
						echo $_SESSION["login_fail"];
					}
						
					echo '<form name="login" method="post">';
					echo '<p>Username: <input type="text" name="username" /></p>';
					echo '<p>Password: <input type="password" name="password" /></p>';
					echo '<p><input type="submit" value="Login" /></p>';
					echo '</form>';
					echo '<a href="http://'.$root.'/register">register</a>';
				?>
			</div> <!-- end #content -->
			
			<?php include('../includes/footer.php'); ?>

        </div> <!-- End #wrapper -->
	</body>
</html>
<?php
	session_start();
	$_SESSION["auth_username"] = null;
	$_SESSION["user_id"] = null;
	$_SESSION["user_group"] = null;
	header("Location: ../");
	exit;
?>

<html>
	<body>
	</body>
</html>
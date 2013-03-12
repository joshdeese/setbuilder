<?php
	function ConnectToDB()
	{
		$userDB = mysql_connect(/* connection string, username, password */);
		return $userDB;
	}
?>

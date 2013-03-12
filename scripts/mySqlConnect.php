<?php
	function ConnectToDB()
	{
		$userDB = mysql_connect(/* Connection String, UserName, Password*/);
		return $userDB;
	}
?>

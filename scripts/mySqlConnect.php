<?php
	function ConnectToDB()
	{
		$userDB = mysql_connect(":/tmp/mysql.sock", 'root', 'firebirdvii63');
		return $userDB;
	}
?>
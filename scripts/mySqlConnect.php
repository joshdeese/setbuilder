<?php
  function ConnectToDB()
	{
		$userDB = mysql_connect(/* connection string, UserName, Password */);
		return $userDB;
	}
?>

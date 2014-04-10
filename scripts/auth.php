<?php

	include "mySqlConnect.php";
	
	function authenticate($user, $passw)
	{		
		$userDB = ConnectToDB();
		
		if(!$userDB)
		{
			die('Could not connect: ' . mysql_error());
		}
		
		if($user=="" or $passw=="")
		{
			$_SESSION["auth_username"] = null;
			$_SESSION["user_id"] = null;
			$_SESSION["user_group"] = null;
			$_SESSION["login_fail"] = "You must supply a Username and Password.";
			return false;
			exit;
		}
		
		mysql_select_db('musicDB');
		$sqlFindUser = 'SELECT Username, Password, id FROM tblUser WHERE Username="'.$user.'"';
		$rUser = mysql_query($sqlFindUser, $userDB);
		if (mysql_num_rows($rUser)>0)
		{
			$sqlUserPrivelage = 'SELECT AccessID FROM tblUserAccess WHERE UserID = "'.mysql_result($rUser,0,2).'";';
			$rPrivelage = mysql_query($sqlUserPrivelage, $userDB);
		} else
		{
			$_SESSION["auth_username"] = null;
			$_SESSION["user_id"] = null;
			$_SESSION["user_group"] = null;
			$_SESSION["login_fail"] = "Username or Password is incorrect.";
			return false;
			exit;
		}
		
		$crypt = hash("sha256", $passw);
		if($crypt == mysql_result($rUser,0,1))
		{
			$_SESSION["auth_username"] = $user;
			$_SESSION["user_id"] = mysql_result($rUser,0,2);
			if(mysql_num_rows($rPrivelage) > 0)
			{
				$_SESSION["user_group"] = mysql_result($rPrivelage,0,0);
			} else
			{
				$_SESSION["user_group"] = null;
			}
			$_SESSION["login_fail"] = null;
			return true;
		}
		else
		{
			$_SESSION["auth_username"] = null;
			$_SESSION["user_id"] = null;
			$_SESSION["user_group"] = null;
			$_SESSION["login_fail"] = "Username or Password is incorrect.";
			return false;
		}
	}
	
	function register($user, $passw, $passw2)
	{
		$userDB = ConnectToDB();
		
		if($user!="")
		{
			if ($passw == $passw2)
			{
				$crypt = hash("sha256", $passw);
				mysql_select_db('musicDB');
				$sqlAddUser = "INSERT INTO tblUser(Username, Password) VALUES('".$user."', '".$crypt."');";
				mysql_query($sqlAddUser, $userDB);
				$sqlFindUser = "SELECT ID, Username FROM tblUser WHERE (Username = '".$user."');";
				$myUser = mysql_query($sqlFindUser, $userDB);
				$_SESSION["auth_username"] = mysql_result($myUser,0,1);
				$_SESSION["user_id"] = mysql_result($myUser,0,0);
				$sqlUserPrivelage = "SELECT AccessID FROM tblUserAccess WHERE UserID = '".$_SESSION["user_id"]."';";
				$myUserGroup = mysql_query($sqlUserPrivelage, $userDB);
				if (mysql_num_rows($myUserGroup)>0)
				{
					$_SESSION["user_group"] = mysql_result($myUserGroup,0,0);
				} else
				{
					$_SESSION["user_group"] = null;
				}
			}
		}
	}
?>
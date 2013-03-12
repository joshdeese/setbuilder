<?php
	include_once('mySqlConnect.php');
	
	$musicDB = ConnectToDB();
	
	if(!$musicDB){
		die("Could not connect: ".mysql_error());
	}
	
	mysql_select_db('musicDB');
	
	$key = $_GET['key'];
	$field = $_GET['update'];
	$value = $_GET['myData'];
	
	$sql = "UPDATE tblSongs SET ".$field."='".$value."' WHERE id=".$key.";";
	$result = mysql_query($sql, $musicDB);
	
	echo 'Done';
?>
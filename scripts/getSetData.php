<?php	
	include_once("mySqlConnect.php");
	
	$musicDB = ConnectToDB();
	
	if(!$musicDB){
		die("Could not connect: ".mysql_error());
	}
	
	mysql_select_db('musicDB');
	$sql = 'SELECT * FROM tblSetlists WHERE id = '.$_GET['setID'].';';
	$result = mysql_query($sql, $musicDB);
	
	$set_data = recordSetToArray($result);
	
	$sql = 'SELECT title, FName, LName, tblKeys.Key, PDF, YouTube, tblSongs.id AS songID FROM tblSongs, tblSetlistSongs, tblKeys, tblUser WHERE tblSongs.id = Song AND tblKeys.id = tblSetlistSongs.Key AND tblUser.id = tblSetlistSongs.LeadVoc AND setlistID = '.$_GET['setID'].';';
	$result = mysql_query($sql, $musicDB);
	
	$set_songs = recordSetToArray($result);
	
	echo json_encode(array_merge($set_data, $set_songs));
	
	function recordSetToArray($mysql_result){
		$rs = array();
		while($rs[] = mysql_fetch_assoc($mysql_result)){
			// you don't really need to do anything here.
		}
		
		$last = count($rs) - 1;
		unset($rs[$last]);
		
		return $rs;
	}
?>
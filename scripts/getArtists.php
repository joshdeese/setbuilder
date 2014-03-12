<?php
	include_once("mySqlConnect.php");
	
	$musicDB = ConnectToDB();
	
	if(!$musicDB){
		die("Could not connect: ".mysql_error());
	}
	
	mysql_select_db('musicDB');
	$sql = "SELECT artist FROM tblSongs WHERE artist != '' GROUP BY artist ORDER BY artist";
	$result = mysql_query($sql, $musicDB);
	
	echo recordSetToJson($result);
	
	function recordSetToJson($mysql_result){
		$rs = array();
		while($rs[] = mysql_fetch_assoc($mysql_result)){
			// you don't really need to do anything here.
		}
		
		$last = count($rs) - 1;
		unset($rs[$last]);
		
		// 
		
		return json_encode($rs);
	}
?>
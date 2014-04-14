<?php	
	include_once("mySqlConnect.php");
	
	$musicDB = ConnectToDB();
	
	if(!$musicDB){
		die("Could not connect: ".mysql_error());
	}
	
	mysql_select_db('musicDB');
	$sql = 'SELECT tblUser.id, tblUser.FName, tblUser.LName FROM tblSingers, tblUser WHERE tblUser.id = tblSingers.userID ORDER BY FName, LName;';
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
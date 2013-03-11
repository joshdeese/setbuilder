<?php
	$filename = '../data/songs.txt';
	$handler = fopen($filename, 'r');
	$read = fread($handler, filesize($filename));
	$liveData = array();
	$liveData = json_decode($read);
	
	fclose($handler);
	
	array_multisort($liveData);	
	
	for($i=0; $i<count($liveData); $i++){
		echo '<div>'.$liveData[$i][0].' - '.$liveData[$i][1].'</div>';
	}
	
	//echo json_encode($liveData);
?>
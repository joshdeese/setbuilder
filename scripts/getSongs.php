<?php
	$filename = '../data/songs.txt';
	$handler = fopen($filename, 'r');
	$read = fread($handler, filesize($filename));
	$liveData = array();
	$liveData = json_decode($read);
	
	fclose($handler);	
	
	echo json_encode($liveData);
?>
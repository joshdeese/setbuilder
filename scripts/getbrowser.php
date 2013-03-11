<?php
	function getBrowser()
	{
		$u_agent = $_SERVER['HTTP_USER_AGENT'];
		
		if (preg_match('|iPhone|',$u_agent,$matched))
		{
			return "iPhone";
		
		} else
		{
			return $u_agent;
		}
	}
	
	function getUserAgent()
	{
		$u_agent = $_SERVER['HTTP_USER_AGENT'];
		
		return $u_agent;
	}
?>
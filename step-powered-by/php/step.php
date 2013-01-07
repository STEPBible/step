<?php
    class STEP {
        const STEP_URI = "http://step.tyndalehouse.com/rest/";
        const GET_TEXT = "bible/getBibleText/%s/%s/%s";
        const API_VERSION = "1.0";
        private $stepSession;
        
        public function getPassage($version, $reference) {
            $url = self::STEP_URI . sprintf(STEP::GET_TEXT, $version, $reference, "HEADINGS,VERSE_NUMBERS");
            return json_decode($this->accessBackend($url))->{"value"};
        }
        
        private function accessBackend($url) {
            $stepSession = $ch = curl_init( $url );

            // Configuring curl options
            $options = array(
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_HTTPHEADER => array('Content-type: application/json') ,
            );
 
            // Setting curl options
            curl_setopt_array( $stepSession, $options );
 
 
            // Getting results
            $response = curl_exec($stepSession);
            
            echo curl_error($stepSession);
            curl_close($stepSession);
            return $response;
        }
    }
?>

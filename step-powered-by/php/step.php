<?php
    class STEP {
        const STEP_URI = "http://localhost:8080/step-web/external/v1/";
        const GET_TEXT = "getBibleText/%s/%s/%s";
        const API_VERSION = "1.0";
        private $stepSession;
        
        public function getPassage($version, $reference) {
            $url = self::STEP_URI . sprintf(STEP::GET_TEXT, $version, $reference, "HEADINGS,VERSE_NUMBERS");
            
            echo $url;
            echo "aaa...".$this->accessBackend($url)  ."...bbb";
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

# You will need to run this program when there is an updated tos_morphology.csv file.
# After you run this program, you will need to copy the output (tos_morph.js) to
# \step\step-web\src\main\webapp\js folder in your development environment.

# Read the TOS csv file to create a summarized (smaller) version of the information.
# The output information is a Javascript source file which is an object that is used
# when the TOS morphology is needed.
# This process reduce from 860KB to 27KB.  THe smaller size would reduce the download
# from the web server to the browser.

# This program expects two input inputs:
#   Name of input file (e.g.: tos.csv)
#   Name of output file (e.g.: tos_morph.js)



sub trim {
    $string = shift;
    $string =~ s/^\s+|\s+$//g;
    return $string;
}

sub analyze_hash {
    %current_hash = @_;
    my $longestKeyLen = 0;
    for my $key (keys %current_hash) {
        if (length($key) > $longestKeyLen) {
            $longestKeyLen = length($key);
        }
    }
    for ($i = ($longestKeyLen - 1); $i > 0; $i--) {
        my %tmpShortenKeyCountHash; my %tmpAllShortenKeys; my %keysCannotBeShorten;
        my %tmpShortenKeyHash;
        for my $key (keys %current_hash) {
            my $shortenKey = substr($key, 0, $i);
            if (!exists($tmpShortenKeyHash{$shortenKey})) {
                $tmpShortenKeyHash{$shortenKey} = $current_hash{$key};
                $tmpShortenKeyCountHash{$shortenKey} = 1;
                $tmpAllShortenKeys{$shortenKey} = [ $key ];
            }
            else {
                $tmpShortenKeyCountHash{$shortenKey} ++;
                push @{ $tmpAllShortenKeys{$shortenKey} }, $key;
                if ($current_hash{$key} ne $tmpShortenKeyHash{$shortenKey}) {
                    $tmpShortenKeyHash{$shortenKey} = "CANNOT-BE-SHORTEN";
                    if ($i == 1) {
                        $keysCannotBeShorten{$shortenKey} = $key;
                    }
                }
            }
        }
        my %partialShorten;
        for my $key (sort keys %keysCannotBeShorten) {
            my $count = $#{ $tmpAllShortenKeys{$key} };
            if ($count > 1) {
                my %countEqualValues;
                for $i ( 0 .. $count ) {
                    $currentKey = $tmpAllShortenKeys{$key}[$i];
                    $currentValue = $current_hash{$currentKey};
                    if (!exists($countEqualValues{$currentValue})) {
                        $countEqualValues{$currentValue} = 1;
                    }
                    else {
                        $countEqualValues{$currentValue} ++;
                    }
                }
                my $highestCount = 0;
                my $valueOfHighestCount = '';
                for my $value (sort keys %countEqualValues) {
                    if ($countEqualValues{$value} > $highestCount) {
                        $highestCount = $countEqualValues{$value};
                        $valueOfHighestCount = $value;
                    }
                }
                $partialShorten{$key} = $valueOfHighestCount;
            }
        }
        my %result;
        for my $key (keys %current_hash) {
            my $shortenKey = substr($key, 0, $i);
            if (($tmpShortenKeyHash{$shortenKey} eq "CANNOT-BE-SHORTEN")) {
                if ($partialShorten{$shortenKey} == $current_hash{$key}) {
                    $result{$shortenKey} = $current_hash{$key};
                }
                else {
                    $result{$key} = $current_hash{$key};
                }
            }
            else {
                $result{$shortenKey} = $current_hash{$key};
            }
        }
        %current_hash = %result;
    }
    return %current_hash;
}

sub print_hash {
    ($type_name, %current_hash) = @_;
    %current_hash = analyze_hash(%current_hash);
    $type_name = $type_name;
    print OUT $optionalSpace . $optionalSpace . "$type_name" . $optionalSpace . ":" . $optionalSpace . "{" . $lineBreak;
    my $count = 0;
#    if ($type_name eq 'description') {
#        $txtArrayRef = \@descArray;
#    }
#    else {
        $txtArrayRef = \@txtArray;
#    }
    for my $key (sort keys %current_hash) {
        if ($count > 0) {
            print OUT "," . $lineBreak;
        }
        $tmpKey = $key;
        if ($tmpKey =~ /^\d+\D/) { # If the key starts with a number but has non-number, then it must be in quotes.
            $tmpKey = "\"" . $tmpKey . "\"";
        }
        my $tmpValue = $current_hash{$key};
        if ($lineBreak ne  '') {
            $tmpValue = ${ $txtArrayRef }[$tmpValue];
        }
        print OUT $optionalSpace . $optionalSpace . "$tmpKey:" . $optionalSpace . $tmpValue;
        $count ++;
    }
    print OUT $lineBreak . "},\n";
}

sub print_array {
    ($type_name) = @_;
    my $txtArrayRef;
#    if ($type_name eq 'description') {
#        $txtArrayRef = \@descArray;
#        print OUT $optionalSpace . $optionalSpace . "descArray: [";
#    }
#    else {
        $txtArrayRef = \@txtArray;
        print OUT $optionalSpace . $optionalSpace . "txtArray: [";
#    }
    print OUT $lineBreak;
    foreach my $i (0 .. $#$txtArrayRef) {
        print OUT $optionalSpace . $optionalSpace . "\"${ $txtArrayRef }[$i]\"";
        if ($i < $#$txtArrayRef) {
            print OUT "," . $lineBreak;
        }
        my $tmp = ${ $txtArrayRef }[$i];
        for my $j (0..length($tmp)-1) {
            my $char = substr($tmp, $j, 1);
        }
    }
    print OUT $lineBreak . "]\n";
}

sub findTextInArray {
    my $value_to_find = shift;
    my $found = 0;
    foreach my $i (0 .. $#txtArray) {
        if ($txtArray[$i] eq $value_to_find) {
            $found = $i;
            last;
        }
    }
    if ($found == 0) {
        push @txtArray, $value_to_find;
        $found = $#txtArray;
    }
    return $found;
}

sub add_value_to_hash1 {
    ($type_name, $code_positions, $field_pos, $line_count, %current_hash) = @_;
    my $current_code = '';
    for (my $i = 0; $i < length($code_positions); $i ++) {
        $currentCodePosition = substr($code_positions, $i, 1);
        $current_code = $current_code . substr($fields[0], $currentCodePosition, 1);
    }
    $current_value = lc(trim($fields[$field_pos]));
#    if ($current_value eq uc $current_value) {
#        $current_value = lc $current_value;
#    }
    if ((length($current_code) == 0) || (length($current_value) == 0)) { return ($current_code, %current_hash); }
    if (!exists($current_hash{$current_code})) {
        $current_hash{$current_code} = findTextInArray($current_value);
    }
    elsif ($txtArray[$current_hash{$current_code}] ne $current_value) {
        my $adj_count = $line_count + 1;
        print "$type_name $adj_count $fields[0] current hash $current_code has value of \'$txtArray[$current_hash{$current_code}]\', but there is a new value of \'$current_value\'\n";
    }
    return ($current_code, %current_hash);
}

sub add_value_to_hash {
    ($type_name, $current_code, $current_value, $line_count, %current_hash) = @_;
    $current_code = trim($current_code);
    $current_value = lc(trim($current_value));
    if ((length($current_code) == 0) || (length($current_value) == 0)) { return %current_hash; }
    my $txtArrayRef;
#    if ($type_name eq 'Description') {
#        $txtArrayRef = \@descArray;
#    }
#    else {
        $txtArrayRef = \@txtArray;
#    }
    if (!exists($current_hash{$current_code})) {
        my $found = -1;
        foreach my $i (0 .. $#$txtArrayRef) {
            if (${ $txtArrayRef }[$i] eq $current_value) {
                $found = $i;
                last;
            }
        }
        if ($found == -1) {
            push @{ $txtArrayRef }, $current_value;
            $found = $#$txtArrayRef;
        }
        $current_hash{$current_code} = $found;
    }
    else {
        my $txt1 = lc(${ $txtArrayRef }[$current_hash{$current_code}]);
        my $txt2 = lc($current_value);
        if (($txt1 =~ /^an /) && ($txt2 !~ /^an /)) { $txt2 = 'an ' . $txt2;}
        elsif (($txt2 =~ /^an /) && ($txt1 !~ /^an /)) { $txt1 = 'an ' . $txt1;}
        if (($txt1 =~ /^a /) && ($txt2 !~ /^a /)) { $txt2 = 'a ' . $txt2;}
        elsif (($txt2 =~ /^a /) && ($txt1 !~ /^a /)) { $txt1 = 'a ' . $txt1;}
        if ($txt1 ne $txt2) {
            my $adj_count = $line_count + 1;
            if ($printError) {
                print "$type_name $adj_count $fields[0] current hash $current_code has value of \'${ $txtArrayRef }[$current_hash{$current_code}]\', but there is a new value of \'$current_value\'\n";
                print "$txt1\n$txt2\n";
            }
        }
    }
    return %current_hash;
}

my $num_args = $#ARGV + 1;
if ($num_args != 2) {
    print "\nUsage: name.pl name_of_input_file name_of_output_file\n";
    exit;
}
my $input_file_name = $ARGV[0];
my $output_file_name = $ARGV[1];

use open ':std', ':encoding(UTF-8)';


my $count = 0;
@txtArray = ();
@descArray = ();
@fields = ();
$lineBreak = ''; $optionalSpace = '';$printError = 0;
#$allChar = '';
#$lineBreak = "\n"; $optionalSpace = ' ';

open (F, $input_file_name) || die ("Could not open $input_file_name!");
open (OUT, ">$output_file_name");
# utf8 is needed because of Internet Explorer.  If it is not for IE, take the following line out.
binmode(OUT, ":utf8");

push @txtArray, "Hebrew";
push @txtArray, "Aramaic";
my %language = ('H', 0, 'A', 1);
my %function; my %function_explain; my %function_desc;
my %form; my %form_explain; my %form_desc;
my %stem; my %stem_explain; my %stem_desc;
my %person; my %person_explain; my %person_desc;
my %gender; my %gender_explain; my %gender_desc;
my %number; my %number_explain; my %number_desc;
my %state; my %state_explain; my %state_desc;
my %action; my %action_explain; my %action_desc;
my %voice;  my %voice_explain;  my %voice_desc;
my %tense;  my %tense_explain;  my %tense_desc;
my %mood;   my %mood_explain;   my %mood_desc;
my %description;
my $functionCd;

use Text::CSV_XS;
$sep_char = ",";
my $csv = Text::CSV_XS->new({sep_char => $sep_char, auto_diag => 1, binary => 1});
while ($line = <F>) {
    if ($count > 0) {
        $csv->parse(trim($line));
        @fields = $csv->fields();
        if (($fields[0] ne $fields[26]) || ($fields[0] ne $fields[39]) || ($fields[0] ne $fields[52])) {
            print "On line $count, the codes are not equal $fields[0] $fields[26] $fields[39] $fields[52]\n";
            print $line;
            exit;
        }
        my $code_length = length($fields[0]);
        my $languageCd = substr(trim($fields[0]), 0, 1);
        my $stemExpandCd = ''; my $formExpandedCd = '';
        if (!exists($language{$languageCd})) {
            print "\'$languageCd\' \'$fields[0]\' is not Hebrew or Aramaic, line $count\n";
        }
        ($functionCd, %function) = add_value_to_hash1('Function', 1, 2, $count, %function);
        if ($code_length > 2) {
            my $form_location = 2;
            my $stateCd = '';
            if ($functionCd eq 'V') {
                ($stemExpandedCd, %stem) = add_value_to_hash1('Stem', '20', 3, $count, %stem);
                $form_location = 3;
                # handle infinitives
                if ( ($code_length == 5) && ((substr($fields[0], 3, 2) == 'aa') || (substr($fields[0], 3, 2) == 'cc')) ) {
                    $stateCd = substr($fields[0], 4, 1);
                    $fields[0] = substr($fields[0], 0, 3) . 'f' . $stateCd;
                    %state = add_value_to_hash('State', $stateCd, $fields[12], $count, %state);
                }
            }
            my $formCd = substr($fields[0], $form_location, 1);
            my $formExpandedCd = $formCd . $functionCd;
            %form = add_value_to_hash('Form', $formExpandedCd, $fields[6], $count, %form);
            my $personCd = ''; my $numberCd = ''; my $genderCd = '';
            if ($code_length == ($form_location + 4)) {
                my $pos1 = substr($fields[0], $form_location + 1, 1);
                my $pos2 = substr($fields[0], $form_location + 2, 1);
                my $pos3 = substr($fields[0], $form_location + 3, 1);
                if (($pos1 == '1') || ($pos1 == '2') || ($pos1 == '3') ) {
                    $personCd = $pos1;
                    %person = add_value_to_hash('Person', $pos1, $fields[9], $count, %person);
                    %gender = add_value_to_hash('Gender', $pos2, $fields[10], $count, %gender);
                    $genderCd = $pos2;
                    %number = add_value_to_hash('Number', $pos3, $fields[11], $count, %number);
                    $numberCd = $pos3;
                    %person_explain = add_value_to_hash('Person explain', $pos1 . $numberCd, $fields[35], $count, %person_explain);
                    %person_desc = add_value_to_hash('Person desc', $pos1 . $numberCd, $fields[48], $count, %person_desc);
                }
                else {
                    %gender = add_value_to_hash('Gender', $pos1, $fields[10], $count, %gender);
                    $genderCd = $pos1;
                    %number = add_value_to_hash('Number', $pos2, $fields[11], $count, %number);
                    $numberCd = $pos2;
                    %state = add_value_to_hash('State', $pos3, $fields[12], $count, %state);
                    $stateCd = $pos3;
                }
                %gender_explain = add_value_to_hash('Gender explain', $genderCd , $fields[36], $count, %gender_explain);
                %number_explain = add_value_to_hash('Number explain', $numberCd, $fields[37], $count, %number_explain);
                %gender_desc = add_value_to_hash('Gender desc', $genderCd . $numberCd, $fields[49], $count, %gender_desc);
                %number_desc = add_value_to_hash('Number desc', $numberCd, $fields[50], $count, %number_desc);

            }
            elsif (($code_length == 4) && ($functionCd eq 'N')) {
                %gender = add_value_to_hash('Gender', substr($fields[0], 3, 1), $fields[10], $count, %gender);
            }
            if ($functionCd eq 'V') {
                %action = add_value_to_hash('Action', $stemExpandedCd, $fields[4], $count, %action);
                my $voiceCd = $stemExpandedCd;
                if (($formExpandedCd eq 'sV') && ($stemExpandedCd eq 'qH')) {
                    $voiceCd = $stemExpandedCd . $formCd;
                }
                %voice = add_value_to_hash('Voice', $voiceCd, $fields[5], $count, %voice);
                $voiceCd = $voiceCd . $numberCd;
                %tense = add_value_to_hash('Tense', $formExpandedCd, $fields[7], $count, %tense);
                my $moodCd = $formExpandedCd;
                if ($formExpandedCd eq 'iV') {
                    $moodCd = $moodCd . $personCd;
                }
                %mood = add_value_to_hash('Mood', $moodCd, $fields[8], $count, %mood);
                %stem_explain = add_value_to_hash('Stem explain', $stemExpandedCd, $fields[29], $count, %stem_explain);
                %stem_desc = add_value_to_hash('Stem desc', $stemExpandedCd, $fields[42], $count, %stem_desc);
                %action_explain = add_value_to_hash('Action explain', $stemExpandedCd, $fields[30], $count, %action_explain);
                %voice_explain = add_value_to_hash('Voice explain', $voiceCd, $fields[31], $count, %voice_explain);
                %tense_explain = add_value_to_hash('Tense explain', $formExpandedCd, $fields[33], $count, %tense_explain);
                %mood_explain = add_value_to_hash('Mood explain', $moodCd, $fields[34], $count, %mood_explain);
                %action_desc = add_value_to_hash('Action desc', $stemExpandedCd, $fields[43], $count, %action_desc);
                %voice_desc = add_value_to_hash('Voice desc', $voiceCd, $fields[44], $count, %voice_desc);
                %tense_desc = add_value_to_hash('Tense desc', $formExpandedCd, $fields[46], $count, %tense_desc);
                %mood_desc = add_value_to_hash('Mood desc', $moodCd, $fields[47], $count, %mood_desc);
            }
            my $tempFuncCode = $functionCd . $formCd . $numberCd;
            %function_explain = add_value_to_hash('Function explain', $tempFuncCode, $fields[28], $count, %function_explain);
            %function_desc = add_value_to_hash('Function desc', $tempFuncCode, $fields[41], $count, %function_desc);
            %form_desc = add_value_to_hash('Form desc', $formExpandedCd, $fields[45], $count, %form_desc);

            %form_explain = add_value_to_hash('Form explain', $formExpandedCd, $fields[32], $count, %form_explain);
            if ($stateCd ne '') {
                %state_explain = add_value_to_hash('State explain', $stateCd, $fields[38], $count, %state_explain);
                %state_desc = add_value_to_hash('State desc', $stateCd, $fields[51], $count, %state_desc);
            }
        }
        my $descCd = substr($fields[0], 1) . substr($fields[0], 0, 1);
        %description = add_value_to_hash('Description', $descCd, $fields[57], $count, %description);
    }
    $count ++;
}
close (F);
print OUT "const C_otMorph = 1;\n";
print OUT "cv[C_otMorph] = {\n";
print_hash("language", %language);
print_hash("ot_function", %function);
print_hash("ot_form", %form);
print_hash("stem", %stem);
print_hash("person", %person);
print_hash("gender", %gender);
print_hash("number", %number);
print_hash("state", %state);
print_hash("ot_action", %action);
print_hash("ot_voice", %voice);
print_hash("ot_tense", %tense);
print_hash("ot_mood", %mood);
print_hash("ot_functionExplained", %function_explain);
print_hash("ot_formExplained", %form_explain);
print_hash("stemExplained", %stem_explain);
print_hash("ot_actionExplained", %action_explain);
print_hash("ot_voiceExplained", %voice_explain);
print_hash("ot_tenseExplained", %tense_explain);
print_hash("ot_moodExplained", %mood_explain);
print_hash("personExplained", %person_explain);
print_hash("genderExplained", %gender_explain);
print_hash("numberExplained", %number_explain);
print_hash("stateExplained", %state_explain);
print_hash("ot_functionDesc", %function_desc);
print_hash("ot_formDesc", %form_desc);
print_hash("stemDesc", %stem_desc);
print_hash("personDesc", %person_desc);
print_hash("genderDesc", %gender_desc);
print_hash("numberDesc", %number_desc);
print_hash("stateDesc", %state_desc);
print_hash("ot_actionDesc", %action_desc);
print_hash("ot_voiceDesc", %voice_desc);
print_hash("ot_tenseDesc", %tense_desc);
print_hash("ot_moodDesc", %mood_desc);
print_hash("description", %description);
print_array();
print OUT "};\n";

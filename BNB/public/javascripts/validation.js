function isEmptyString(string) {
    return (string == null || string == "");
}

function isNonEmptyString(string) {
    return !isEmptyString(string)
}

function isMatching(string1, string2){
	return (string1 == string2)
}
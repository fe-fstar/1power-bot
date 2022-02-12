function isInvalidCommand(message, prefix) {
    if (message.charAt(0) === prefix) {
        for (var i = 1; i < message.length; ++i) {
            if (!isLetter(message.charAt(i))) {
                return false;
            }
        }
        return true;
    }
    else {
        return false;
    }
}

function isLetter(character) {
    if (character.length != 1 || character == '_' || character == '$')
        return false;
    if (character.toUpperCase() != character.toLowerCase())
        return true; // Speed up accepting latin letters
    if (character.charCodeAt(0) < 128)
        return false; // Speed up rejecting non-letter ASCII characters
    try {
        eval("function " + character + "(){}");
        return true;
    } catch {
        return false;
    }
}

module.exports = isInvalidCommand;
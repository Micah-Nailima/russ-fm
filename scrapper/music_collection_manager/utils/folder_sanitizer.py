"""Shared folder name sanitization utilities for consistent naming across the application."""

import re


def sanitize_folder_name(name: str) -> str:
    """
    Sanitize a name for use as a folder name in the filesystem.
    
    This method ensures consistent folder naming across the application by:
    - Converting to lowercase
    - Replacing spaces and underscores with dashes
    - Transliterating accented characters to ASCII
    - Handling special cases like empty titles and numeric symbols
    - Removing special characters except dashes
    - Cleaning up multiple/leading/trailing dashes
    
    Args:
        name: The name to sanitize (artist name, album name, etc.)
        
    Returns:
        A sanitized string safe for use as a folder name
        
    Examples:
        >>> sanitize_folder_name("Björk")
        'bjork'
        >>> sanitize_folder_name("Children of the Sün")
        'children-of-the-sun'
        >>> sanitize_folder_name("( )")
        'unknown'
        >>> sanitize_folder_name("4½")
        '4-half'
    """
    # Handle empty or whitespace-only names
    if not name or not name.strip():
        return "unknown"
    
    # Handle special case of empty parentheses or similar
    if name.strip() in ['( )', '()', '[ ]', '[]', '{ }', '{}']:
        return "unknown"
    
    # Convert to lowercase and replace all types of spaces with dashes
    # Handle regular space, en space, em space, thin space, hair space, etc.
    sanitized = name.lower()
    # Replace any Unicode whitespace character with a regular dash
    sanitized = re.sub(r'\s+', '-', sanitized)
    
    # Handle underscores more carefully
    # For names like "G_d's" (underscore between letters) - remove underscore  
    # For names like "The_Puzzle" (underscore between words) - replace with dash
    # After lowercase conversion: check if underscore is between single chars (like g_d)
    sanitized = re.sub(r'([a-z])_([a-z])(?![a-z])', r'\1\2', sanitized)  # Remove underscore between single letters
    sanitized = sanitized.replace("_", "-")  # Replace remaining underscores with dashes
    
    # Handle brackets - remove them but preserve content
    sanitized = sanitized.replace("[", "").replace("]", "").replace("{", "").replace("}", "")
    
    # Remove common characters that should just be deleted (but preserve commas in numbers)
    sanitized = sanitized.replace("&", "").replace("'", "").replace('"', "")
    sanitized = sanitized.replace(".", "").replace("!", "")
    sanitized = sanitized.replace("?", "").replace(";", "").replace(":", "")
    
    # Handle common accented characters by transliterating to ASCII equivalents
    accent_map = {
        'á': 'a', 'à': 'a', 'ä': 'a', 'â': 'a', 'ã': 'a', 'å': 'a',
        'é': 'e', 'è': 'e', 'ë': 'e', 'ê': 'e',
        'í': 'i', 'ì': 'i', 'ï': 'i', 'î': 'i',
        'ó': 'o', 'ò': 'o', 'ö': 'o', 'ô': 'o', 'õ': 'o', 'ø': 'o',
        'ú': 'u', 'ù': 'u', 'ü': 'u', 'û': 'u',
        'ý': 'y', 'ÿ': 'y',
        'ñ': 'n',
        'ç': 'c',
        'ß': 'ss',
        'æ': 'ae',
        'œ': 'oe',
        'ð': 'd',
        'þ': 'th'
    }
    
    # Special characters and symbols map - only for special cases that need replacement
    # Most symbols should just be removed for backward compatibility
    symbol_map = {
        '½': 'half', '⅓': 'third', '¼': 'quarter', '¾': 'three-quarters',
        '⅛': 'eighth', '⅜': 'three-eighths', '⅝': 'five-eighths', '⅞': 'seven-eighths',
        '²': '2', '³': '3', '¹': '1',
        '–': '-', '—': '-', '−': '-',  # en dash, em dash, minus sign
    }
    
    # Characters to simply remove (for backward compatibility)
    remove_chars = ['°', '©', '®', '™', ''', ''', '"', '"', '«', '»', '‹', '›', '„', '‚',
                    '(', ')', '+', '=', '%', '@', '#', '$', '€', '£', '…']
    
    # Greek character transliteration map
    greek_map = {
        'Α': 'a', 'α': 'a', 'ά': 'a', 'Ά': 'a',
        'Β': 'b', 'β': 'b',
        'Γ': 'g', 'γ': 'g',
        'Δ': 'd', 'δ': 'd',
        'Ε': 'e', 'ε': 'e', 'έ': 'e', 'Έ': 'e',
        'Ζ': 'z', 'ζ': 'z',
        'Η': 'e', 'η': 'e', 'ή': 'e', 'Ή': 'e',
        'Θ': 'th', 'θ': 'th',
        'Ι': 'i', 'ι': 'i', 'ί': 'i', 'ϊ': 'i', 'ΐ': 'i', 'Ί': 'i', 'Ϊ': 'i',
        'Κ': 'k', 'κ': 'k',
        'Λ': 'l', 'λ': 'l',
        'Μ': 'm', 'μ': 'm',
        'Ν': 'n', 'ν': 'n',
        'Ξ': 'x', 'ξ': 'x',
        'Ο': 'o', 'ο': 'o', 'ό': 'o', 'Ό': 'o',
        'Π': 'p', 'π': 'p',
        'Ρ': 'r', 'ρ': 'r',
        'Σ': 's', 'σ': 's', 'ς': 's',
        'Τ': 't', 'τ': 't',
        'Υ': 'u', 'υ': 'u', 'ύ': 'u', 'ϋ': 'u', 'ΰ': 'u', 'Ύ': 'u', 'Ϋ': 'u',
        'Φ': 'f', 'φ': 'f',
        'Χ': 'ch', 'χ': 'ch',
        'Ψ': 'ps', 'ψ': 'ps',
        'Ω': 'o', 'ω': 'o', 'ώ': 'o', 'Ώ': 'o'
    }
    
    # Apply accent transliteration
    for accented, ascii_equiv in accent_map.items():
        sanitized = sanitized.replace(accented, ascii_equiv)
    
    # Apply special character and symbol transliteration
    for symbol, replacement in symbol_map.items():
        if replacement:  # Only add dashes around non-empty replacements
            # Add dashes around fractions and special words
            if replacement in ['half', 'third', 'quarter', 'three-quarters', 'eighth', 'three-eighths', 'five-eighths', 'seven-eighths']:
                sanitized = sanitized.replace(symbol, f'-{replacement}')
            else:
                sanitized = sanitized.replace(symbol, replacement)
        else:
            sanitized = sanitized.replace(symbol, replacement)
    
    # Remove characters that should just be deleted (for backward compatibility)
    for char in remove_chars:
        sanitized = sanitized.replace(char, '')
    
    # Apply Greek character transliteration
    for greek_char, latin_equiv in greek_map.items():
        sanitized = sanitized.replace(greek_char, latin_equiv)
    
    # Remove any remaining special characters except dashes
    sanitized = "".join(c for c in sanitized if c.isalnum() or c in "-")
    
    # Remove multiple consecutive dashes
    while "--" in sanitized:
        sanitized = sanitized.replace("--", "-")
        
    # Remove leading/trailing dashes
    sanitized = sanitized.strip("-")
    
    # Final check - if result is empty, return "unknown"
    if not sanitized:
        return "unknown"
    
    return sanitized
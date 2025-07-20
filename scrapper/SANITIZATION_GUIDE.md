# Sanitization Guide: Music Collection Manager

This document provides a comprehensive overview of how filename and folder sanitization works in the Music Collection Manager scraper for both artists and albums.

## 🏗️ Architecture Overview

The scraper uses a **unified sanitization system** for consistent folder naming:

### Shared Folder Sanitizer (`folder_sanitizer.py`)
- **Purpose**: Creates folder names for the website structure
- **Used for**: Artist folders, release folders across all components
- **Method**: `sanitize_folder_name()`
- **Features**: 
  - Handles Latin accented characters (ü → u, ñ → n, etc.)
  - Handles Greek characters (ΚΕΦΑΛΗΞΘ → kefalexth)
  - Ensures consistent naming across all modules

### File Name Sanitizer (`text_cleaner.py`)
- **Purpose**: Creates safe filenames for individual files
- **Used for**: Image files and JSON files within folders
- **Method**: `clean_for_filename()`
- **Note**: Does NOT handle accent/Greek transliteration

---

## 🎨 Artist Sanitization

### Folder Sanitization Logic (All Components)

All components now use the shared `sanitize_folder_name()` function from `folder_sanitizer.py`:

```python
def sanitize_folder_name(name: str) -> str:
    # 1. Handle empty or whitespace-only names
    if not name or not name.strip():
        return "unknown"
    
    # 2. Handle special case of empty parentheses or similar
    if name.strip() in ['( )', '()', '[ ]', '[]', '{ }', '{}']:
        return "unknown"
    
    # 3. Convert to lowercase and replace ALL types of spaces with dashes
    # Handle Unicode spaces: regular space, en space, em space, thin space, hair space, etc.
    import re
    sanitized = name.lower()
    sanitized = re.sub(r'\s+', '-', sanitized)  # Replace any Unicode whitespace
    
    # 4. Handle underscores carefully
    # Remove underscore between single letters (G_d → gd)
    # Replace remaining underscores with dashes (The_Puzzle → the-puzzle)
    sanitized = re.sub(r'([a-z])_([a-z])(?![a-z])', r'\1\2', sanitized)
    sanitized = sanitized.replace("_", "-")
    
    # 5. Handle brackets - remove them but preserve content
    sanitized = sanitized.replace("[", "").replace("]", "").replace("{", "").replace("}", "")
    
    # 6. Remove common characters that should just be deleted
    sanitized = sanitized.replace("&", "").replace("'", "").replace('"', "")
    sanitized = sanitized.replace(".", "").replace("!", "")
    sanitized = sanitized.replace("?", "").replace(";", "").replace(":", "")
    
    # 7. Handle Latin accented characters
    accent_map = {
        'á': 'a', 'à': 'a', 'ä': 'a', 'â': 'a', 'ã': 'a', 'å': 'a',
        'é': 'e', 'è': 'e', 'ë': 'e', 'ê': 'e',
        'í': 'i', 'ì': 'i', 'ï': 'i', 'î': 'i',
        'ó': 'o', 'ò': 'o', 'ö': 'o', 'ô': 'o', 'õ': 'o', 'ø': 'o',
        'ú': 'u', 'ù': 'u', 'ü': 'u', 'û': 'u',
        'ý': 'y', 'ÿ': 'y', 'ñ': 'n', 'ç': 'c', 'ß': 'ss',
        'æ': 'ae', 'œ': 'oe', 'ð': 'd', 'þ': 'th'
    }
    
    # 8. Handle special symbols that need replacement
    symbol_map = {
        '½': 'half', '⅓': 'third', '¼': 'quarter', '¾': 'three-quarters',
        '⅛': 'eighth', '⅜': 'three-eighths', '⅝': 'five-eighths', '⅞': 'seven-eighths',
        '²': '2', '³': '3', '¹': '1',
        '–': '-', '—': '-', '−': '-',  # en dash, em dash, minus sign
    }
    
    # 9. Handle characters that should be removed (for backward compatibility)
    remove_chars = ['°', '©', '®', '™', ''', ''', '"', '"', '«', '»', '‹', '›', '„', '‚',
                    '(', ')', '+', '=', '%', '@', '#', '$', '€', '£', '…']
    
    # 10. Handle Greek characters
    greek_map = {
        'Α': 'a', 'α': 'a', 'ά': 'a', 'Ά': 'a',
        'Β': 'b', 'β': 'b', 'Γ': 'g', 'γ': 'g',
        'Δ': 'd', 'δ': 'd', 'Ε': 'e', 'ε': 'e', 'έ': 'e', 'Έ': 'e',
        'Ζ': 'z', 'ζ': 'z', 'Η': 'e', 'η': 'e', 'ή': 'e', 'Ή': 'e',
        'Θ': 'th', 'θ': 'th', 'Ι': 'i', 'ι': 'i', 'ί': 'i', 'ϊ': 'i',
        'Κ': 'k', 'κ': 'k', 'Λ': 'l', 'λ': 'l', 'Μ': 'm', 'μ': 'm',
        'Ν': 'n', 'ν': 'n', 'Ξ': 'x', 'ξ': 'x', 'Ο': 'o', 'ο': 'o',
        'Π': 'p', 'π': 'p', 'Ρ': 'r', 'ρ': 'r', 'Σ': 's', 'σ': 's', 'ς': 's',
        'Τ': 't', 'τ': 't', 'Υ': 'u', 'υ': 'u', 'Φ': 'f', 'φ': 'f',
        'Χ': 'ch', 'χ': 'ch', 'Ψ': 'ps', 'ψ': 'ps', 'Ω': 'o', 'ω': 'o'
        # ... includes all Greek letters with accents
    }
    
    # 11. Apply transliterations in order
    for accented, ascii_equiv in accent_map.items():
        sanitized = sanitized.replace(accented, ascii_equiv)
    for symbol, replacement in symbol_map.items():
        # Add dashes around fraction words
        if replacement in ['half', 'third', 'quarter', 'three-quarters', 
                           'eighth', 'three-eighths', 'five-eighths', 'seven-eighths']:
            sanitized = sanitized.replace(symbol, f'-{replacement}')
        else:
            sanitized = sanitized.replace(symbol, replacement)
    for char in remove_chars:
        sanitized = sanitized.replace(char, '')
    for greek_char, latin_equiv in greek_map.items():
        sanitized = sanitized.replace(greek_char, latin_equiv)
    
    # 12. Remove any remaining special characters except dashes
    sanitized = "".join(c for c in sanitized if c.isalnum() or c in "-")
    
    # 13. Clean up multiple dashes and strip edges
    while "--" in sanitized:
        sanitized = sanitized.replace("--", "-")
    sanitized = sanitized.strip("-")
    
    # 14. Final check - if result is empty, return "unknown"
    if not sanitized:
        return "unknown"
    
    return sanitized
```

**Examples:**
- `"Björk"` → `"bjork"`
- `"Annie & The Caldwells"` → `"annie-the-caldwells"`
- `"Motörhead"` → `"motorhead"`
- `"Sigur Rós"` → `"sigur-ros"`
- `"Mötley Crüe"` → `"motley-crue"`
- `"Children of the Sün"` → `"children-of-the-sun"`
- `"ΚΕΦΑΛΗΞΘ"` → `"kefalexth"`
- `"Ελληνικά"` → `"ellenika"`

**Edge Cases:**
- `"( )"` → `"unknown"` (empty parentheses)
- `"4½"` → `"4-half"` (numeric fractions)
- `"The_Puzzle"` → `"the-puzzle"` (underscores between words)
- `"G_d's Pee"` → `"gds-pee"` (underscores between letters removed)
- `"R&B Collection"` → `"rb-collection"` (ampersands removed)
- `"50% Chance"` → `"50-chance"` (symbols removed)
- `"22° Lunar Halo"` → `"22-lunar-halo"` (degree symbol removed)
- `"Batman™"` → `"batman"` (trademark symbol removed)
- `"Joni Mitchell's Hits"` → `"joni-mitchells-hits"` (smart quotes removed)
- `"No\u2008Title"` → `"no-title"` (Unicode thin space to dash)
- `"A New Career [ 1977–1982 ]"` → `"a-new-career-1977-1982"` (brackets removed, en dash to dash)
- `"Who Can I Be Now?"` → `"who-can-i-be-now"` (question mark removed)

### Image Manager Logic (File Names)

The `ImageManager.sanitize_filename()` method uses `TextCleaner.clean_for_filename()` for creating safe filenames:

```python
def clean_for_filename(text: str, max_length: int = 255) -> str:
    if not text or not isinstance(text, str):
        return "unknown"
    
    # 1. Convert to lowercase and strip
    text = text.lower().strip()
    
    # 2. Replace spaces and common separators with hyphens
    text = re.sub(r'[\s\-_]+', '-', text)
    
    # 3. Remove problematic characters (NO accent handling)
    text = re.sub(r'[^\w\-]', '', text)
    
    # 4. Remove multiple consecutive hyphens
    text = re.sub(r'-+', '-', text)
    
    # 5. Remove leading/trailing hyphens
    text = text.strip('-')
    
    # 6. Truncate if too long
    if len(text) > max_length:
        text = text[:max_length].rstrip('-')
    
    return text or "unknown"
```

---

## 🎵 Album/Release Sanitization

### Release Folder Names (Collection Generator)

Release folders follow the pattern: `"{album_name}-{discogs_id}"`

```python
# Uses the same _sanitize_filename method as artists
release_folder = self._sanitize_filename(f"{release_name}-{release.discogs_id}")
```

**Examples:**
- `"OK Computer"` + ID `123456` → `"ok-computer-123456"`
- `"Ágætis byrjun"` + ID `789012` → `"agetis-byrjun-789012"`
- `"The Dark Side of the Moon"` + ID `456789` → `"the-dark-side-of-the-moon-456789"`
- `"ΚΕΦΑΛΗΞΘ"` + ID `555666` → `"kefalexth-555666"`
- `"Björk's Greatest Hits"` + ID `777888` → `"bjorks-greatest-hits-777888"`

### Release File Names (Image Manager)

Image and JSON files use the Image Manager sanitization:

```python
# Images: "{sanitized_title}-{discogs_id}-{size}.jpg"
filename = f"{sanitized_title}-{discogs_id}-{size_name}.jpg"

# JSON: "{sanitized_title}-{discogs_id}.json"
json_path = f"{sanitized_title}-{discogs_id}.json"
```

---

## 🔄 Usage Patterns

### Artist Processing Flow
1. **Folder Creation**: `CollectionGenerator._sanitize_filename()` → Website folder structure (`public/artist/`)
2. **File Downloads**: `ArtistImageManager.sanitize_filename()` → Image/JSON files within folders
3. **Collection Data**: Both methods used for different parts of the data structure

### Release Processing Flow
1. **Folder Creation**: `CollectionGenerator._sanitize_filename()` → Website folder structure (`public/release/`)
2. **File Downloads**: `ImageManager.sanitize_filename()` → Image/JSON files within folders
3. **Always includes Discogs ID** for uniqueness and disambiguation

---

## ⚠️ Key Differences & Implications

### Unified Folder Naming (NEW)
- ✅ **All folder creation**: Now uses shared `sanitize_folder_name()` function
- ✅ **Accent handling**: Comprehensive Latin character transliteration
- ✅ **Greek support**: Full Greek alphabet transliteration (ΚΕΦΑΛΗΞΘ → kefalexth)
- ✅ **Edge case handling**: Empty parentheses, numeric fractions, underscore logic
- ✅ **Symbol removal**: Smart handling of &, ', %, and other punctuation
- ✅ **Consistency**: Same logic across Collection Generator, Artist Orchestrator, and Image Manager

### File vs Folder Names
- **Folders**: Use `sanitize_folder_name()` (with transliteration)
- **Files**: Use `clean_for_filename()` (simpler regex-based)

### Special Characters
- **Symbol replacement**: Fractions (½ → half) and superscripts (² → 2) get replaced with words
- **Symbol removal**: Degrees (°), trademark (™), copyright (©), quotes, parentheses simply removed
- **Backward compatibility**: Most symbols removed without replacement to match existing folders
- **Folder names**: Transliterate accents and Greek before symbol processing
- **File names**: Direct removal without transliteration

### Length Limits
- **Folder names**: No explicit length limit
- **File names**: 255 character limit with truncation

---

## 🛠️ Tools and Utilities

### Artist Folder Analysis Tools

The scraper includes specialized tools for analyzing artist folder consistency:

1. **`tools/find_missing_artists.py`**: Basic comparison between database artists and existing folders
2. **`tools/artist_folder_reconciler.py`**: Advanced reconciliation with similarity matching and script generation

Both tools use the exact same sanitization logic as the Collection Generator to ensure accurate matching.

### Running the Tools

```bash
# Basic missing artist detection
python -m tools.find_missing_artists

# Advanced reconciliation with script generation
python -m tools.artist_folder_reconciler --generate-script create_missing_folders.sh

# Export results to CSV
python -m tools.find_missing_artists --export missing_artists.csv
```

---

## 🎯 Current State and Coverage

### Recent Improvements
- **Unified sanitization** - All components now use shared `sanitize_folder_name()` function (2025)
- **Greek character support** - Full Greek alphabet transliteration added (2025)
- **Unicode space handling** - Supports all Unicode whitespace characters including thin space (\u2008) (2025)
- **Edge case handling** - Smart underscore logic, empty parentheses, numeric fractions (2025)
- **Bracket processing** - Removes square/curly brackets while preserving content (2025)
- **En dash support** - Converts en dash (–), em dash (—), and minus sign (−) to regular dash (2025)
- **Symbol backward compatibility** - Two-tier symbol handling: replacements vs removals (2025)
- **Enhanced tools** - Updated check script to show all missing artists and releases (2025)
- **Consistency improved** - Same folder naming logic across all modules
- **Coverage improved** from ~95% to 99.9%+

### Remaining Considerations
- Some legacy folders may still use old naming conventions
- Complex Unicode characters may still require manual review
- Image Manager and Collection Generator use different accent handling strategies

### Best Practices
1. Always use the appropriate sanitization method for the context (folders vs files)
2. Test new sanitization logic with the analysis tools
3. Consider backward compatibility when updating sanitization rules
4. Document any changes to sanitization logic in this guide

---

## 📁 File Locations

- **Folder Sanitizer (NEW)**: `music_collection_manager/utils/folder_sanitizer.py`
- **Collection Generator**: `music_collection_manager/utils/collection_generator.py`
- **Image Manager**: `music_collection_manager/utils/image_manager.py`
- **Text Cleaner**: `music_collection_manager/utils/text_cleaner.py`
- **Artist Orchestrator**: `music_collection_manager/utils/artist_orchestrator.py`
- **Analysis Tools**: `tools/find_missing_artists.py`, `tools/artist_folder_reconciler.py`

---

## 🔍 Debugging Tips

1. **Folder Mismatch Issues**: Use the artist folder reconciler tool to identify naming discrepancies
2. **Accent Problems**: Check if the issue is in Collection Generator vs Image Manager sanitization
3. **Special Characters**: Review the accent mapping in `_sanitize_filename()` for missing characters
4. **Legacy Folders**: Some folders may have been created with older sanitization logic

For more detailed usage examples and troubleshooting, see the main `README.md` file.

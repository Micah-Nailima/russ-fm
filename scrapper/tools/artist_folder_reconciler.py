#!/usr/bin/env python3
"""
Artist Folder Reconciler

This enhanced tool not only finds missing artists but also attempts to reconcile
naming differences between database artists and existing folders.
"""

import argparse
import os
import re
import sqlite3
import sys
from pathlib import Path
from typing import List, Set, Dict, Any, Tuple
from tabulate import tabulate
from difflib import SequenceMatcher

import logging

# Add the parent directory to the path so we can import the module
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from music_collection_manager.utils.database import DatabaseManager
from music_collection_manager.config import setup_logging

# Set up logging
setup_logging(level="INFO")
logger = logging.getLogger(__name__)


class ArtistFolderReconciler:
    def __init__(self, db_path: str = "collection_cache.db", public_path: str = "../public/artist"):
        self.db = DatabaseManager(db_path)
        self.db_path = db_path
        self.public_path = Path(public_path)
        
        # Ensure public path exists
        if not self.public_path.exists():
            logger.error(f"Public artist path does not exist: {self.public_path}")
            sys.exit(1)
    
    def slugify(self, text: str) -> str:
        """Convert artist name to URL-friendly slug format using the same logic as music_collection_manager"""
        # Convert to lowercase and replace spaces with dashes
        sanitized = text.lower().replace(" ", "-")
        
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
        
        # Apply accent transliteration
        for accented, ascii_equiv in accent_map.items():
            sanitized = sanitized.replace(accented, ascii_equiv)
        
        # Remove special characters except dashes (this removes & and ' characters)
        sanitized = "".join(c for c in sanitized if c.isalnum() or c in "-")
        
        # Remove multiple consecutive dashes
        while "--" in sanitized:
            sanitized = sanitized.replace("--", "-")
            
        # Remove leading/trailing dashes
        sanitized = sanitized.strip("-")
        
        return sanitized
    
    def alternative_slugify(self, text: str) -> List[str]:
        """Generate alternative slug formats for better matching"""
        alternatives = []
        
        # Original slugify (using correct music_collection_manager logic)
        base_slug = self.slugify(text)
        alternatives.append(base_slug)
        
        # Try without "the" prefix
        if text.lower().startswith('the '):
            no_the = self.slugify(text[4:])
            alternatives.append(no_the)
        
        # Try with legacy & -> "and" conversion (for backward compatibility)
        text_lower = text.lower()
        if '&' in text_lower:
            # Convert & to "and" (old logic)
            legacy_and = text_lower.replace('&', 'and')
            legacy_slug = self.slugify(legacy_and)
            alternatives.append(legacy_slug)
        
        # Try removing common suffixes/prefixes
        for pattern in [r'\s+\(.*\)$', r'\s+featuring.*$', r'\s+feat\..*$', r'\s+ft\..*$']:
            cleaned = re.sub(pattern, '', text, flags=re.IGNORECASE)
            if cleaned != text:
                alternatives.append(self.slugify(cleaned))
        
        return list(set(alternatives))  # Remove duplicates
    
    def similarity_score(self, a: str, b: str) -> float:
        """Calculate similarity between two strings"""
        return SequenceMatcher(None, a.lower(), b.lower()).ratio()
    
    def get_database_artists(self) -> List[Dict[str, Any]]:
        """Get all artists from the database with alternative slugs"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT id, name, discogs_id FROM artists ORDER BY name")
            
            artists = []
            for row in cursor.fetchall():
                artist_data = {
                    'id': row[0],
                    'name': row[1],
                    'discogs_id': row[2],
                    'slug': self.slugify(row[1]),
                    'alternative_slugs': self.alternative_slugify(row[1])
                }
                artists.append(artist_data)
            
            return artists
    
    def get_public_artist_folders(self) -> Set[str]:
        """Get all artist folder names from the public directory"""
        folders = set()
        
        try:
            for item in self.public_path.iterdir():
                if item.is_dir() and not item.name.startswith('.'):
                    folders.add(item.name)
        except Exception as e:
            logger.error(f"Error reading public artist directory: {e}")
            
        return folders
    
    def find_potential_matches(self, threshold: float = 0.8) -> Dict[str, List[Tuple[str, float]]]:
        """Find potential matches between orphaned folders and missing artists"""
        db_artists = self.get_database_artists()
        public_folders = self.get_public_artist_folders()
        
        # Find exact matches first
        matched_artists = set()
        for artist in db_artists:
            for slug in artist['alternative_slugs']:
                if slug in public_folders:
                    matched_artists.add(artist['id'])
                    break
        
        # Get unmatched artists and folders
        unmatched_artists = [a for a in db_artists if a['id'] not in matched_artists]
        
        matched_folders = set()
        for artist in db_artists:
            if artist['id'] in matched_artists:
                for slug in artist['alternative_slugs']:
                    if slug in public_folders:
                        matched_folders.add(slug)
                        break
        
        orphaned_folders = public_folders - matched_folders
        
        # Find potential matches using similarity
        potential_matches = {}
        
        for folder in orphaned_folders:
            matches = []
            for artist in unmatched_artists:
                # Check similarity with artist name
                name_similarity = self.similarity_score(folder, artist['name'])
                if name_similarity >= threshold:
                    matches.append((artist['name'], name_similarity))
                
                # Check similarity with all alternative slugs
                for slug in artist['alternative_slugs']:
                    slug_similarity = self.similarity_score(folder, slug)
                    if slug_similarity >= threshold:
                        matches.append((artist['name'], slug_similarity))
            
            if matches:
                # Remove duplicates and sort by similarity
                unique_matches = {}
                for name, score in matches:
                    if name not in unique_matches or score > unique_matches[name]:
                        unique_matches[name] = score
                
                sorted_matches = sorted(unique_matches.items(), key=lambda x: x[1], reverse=True)
                potential_matches[folder] = sorted_matches
        
        return potential_matches
    
    def analyze_coverage(self) -> Dict[str, Any]:
        """Comprehensive analysis of artist coverage"""
        db_artists = self.get_database_artists()
        public_folders = self.get_public_artist_folders()
        
        exact_matches = 0
        alternative_matches = 0
        missing_artists = []
        matched_folders = set()
        
        for artist in db_artists:
            matched = False
            
            # Check exact slug match
            if artist['slug'] in public_folders:
                exact_matches += 1
                matched_folders.add(artist['slug'])
                matched = True
            else:
                # Check alternative slugs
                for alt_slug in artist['alternative_slugs'][1:]:  # Skip first one (same as slug)
                    if alt_slug in public_folders:
                        alternative_matches += 1
                        matched_folders.add(alt_slug)
                        matched = True
                        break
            
            if not matched:
                missing_artists.append(artist)
        
        orphaned_folders = public_folders - matched_folders
        
        return {
            'total_db_artists': len(db_artists),
            'total_public_folders': len(public_folders),
            'exact_matches': exact_matches,
            'alternative_matches': alternative_matches,
            'total_matches': exact_matches + alternative_matches,
            'missing_artists': missing_artists,
            'orphaned_folders': list(orphaned_folders),
            'coverage_percentage': ((exact_matches + alternative_matches) / len(db_artists)) * 100
        }
    
    def generate_folder_creation_script(self, missing_artists: List[Dict[str, Any]]) -> str:
        """Generate a shell script to create missing artist folders"""
        script_lines = [
            "#!/bin/bash",
            "# Script to create missing artist folders",
            "# Generated by artist_folder_reconciler.py",
            "",
            "PUBLIC_DIR=\"../public/artist\"",
            "",
            "echo \"Creating missing artist folders...\"",
            ""
        ]
        
        for artist in missing_artists:
            folder_name = artist['slug']
            script_lines.append(f"echo \"Creating folder: {folder_name}\"")
            script_lines.append(f"mkdir -p \"$PUBLIC_DIR/{folder_name}\"")
            script_lines.append("")
        
        script_lines.extend([
            "echo \"Done! Created folders for {} artists.\"".format(len(missing_artists)),
            "echo \"You may need to manually review and adjust folder names for artists with special characters.\""
        ])
        
        return "\n".join(script_lines)


def main():
    parser = argparse.ArgumentParser(description="Reconcile artist folders with database")
    parser.add_argument(
        "--db-path", 
        default="collection_cache.db",
        help="Path to the SQLite database file"
    )
    parser.add_argument(
        "--public-path",
        default="../public/artist",
        help="Path to the public artist directory"
    )
    parser.add_argument(
        "--find-matches",
        action="store_true",
        help="Find potential matches between orphaned folders and missing artists"
    )
    parser.add_argument(
        "--threshold",
        type=float,
        default=0.8,
        help="Similarity threshold for potential matches (0.0-1.0)"
    )
    parser.add_argument(
        "--generate-script",
        help="Generate shell script to create missing folders"
    )
    parser.add_argument(
        "--detailed-analysis",
        action="store_true",
        help="Show detailed coverage analysis"
    )
    
    args = parser.parse_args()
    
    try:
        reconciler = ArtistFolderReconciler(args.db_path, args.public_path)
        analysis = reconciler.analyze_coverage()
        
        print(f"{'='*60}")
        print("ENHANCED ARTIST FOLDER ANALYSIS")
        print(f"{'='*60}")
        print(f"Total artists in database: {analysis['total_db_artists']}")
        print(f"Total folders in public/artist: {analysis['total_public_folders']}")
        print(f"Exact slug matches: {analysis['exact_matches']}")
        print(f"Alternative slug matches: {analysis['alternative_matches']}")
        print(f"Total matched artists: {analysis['total_matches']}")
        print(f"Missing artists: {len(analysis['missing_artists'])}")
        print(f"Orphaned folders: {len(analysis['orphaned_folders'])}")
        print(f"Coverage: {analysis['coverage_percentage']:.1f}%")
        
        if args.detailed_analysis:
            print(f"\n{'='*60}")
            print("MISSING ARTISTS")
            print(f"{'='*60}")
            if analysis['missing_artists']:
                headers = ["Artist Name", "Suggested Folder Name", "Database ID"]
                rows = []
                for artist in analysis['missing_artists']:
                    rows.append([
                        artist['name'],
                        artist['slug'],
                        artist['id']
                    ])
                print(tabulate(rows, headers=headers, tablefmt="grid"))
            else:
                print("No missing artists!")
            
            print(f"\n{'='*60}")
            print("ORPHANED FOLDERS")
            print(f"{'='*60}")
            if analysis['orphaned_folders']:
                for folder in sorted(analysis['orphaned_folders']):
                    print(f"  - {folder}")
            else:
                print("No orphaned folders!")
        
        if args.find_matches:
            print(f"\n{'='*60}")
            print(f"POTENTIAL MATCHES (threshold: {args.threshold})")
            print(f"{'='*60}")
            matches = reconciler.find_potential_matches(args.threshold)
            
            if matches:
                for folder, artist_matches in matches.items():
                    print(f"\nFolder: {folder}")
                    for artist_name, similarity in artist_matches[:3]:  # Show top 3 matches
                        print(f"  → {artist_name} (similarity: {similarity:.3f})")
            else:
                print("No potential matches found above the threshold.")
        
        if args.generate_script:
            script_content = reconciler.generate_folder_creation_script(analysis['missing_artists'])
            with open(args.generate_script, 'w') as f:
                f.write(script_content)
            
            # Make script executable
            os.chmod(args.generate_script, 0o755)
            print(f"\nGenerated script: {args.generate_script}")
            print("Run with: ./{}".format(args.generate_script))
    
    except Exception as e:
        logger.error(f"Error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()

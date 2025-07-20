#!/usr/bin/env python3
"""
Find Missing Artists Tool

This tool compares artists in the database with those present in the public/artist folder
to identify which artists are missing from the website.
"""

import argparse
import os
import re
import sqlite3
import sys
from pathlib import Path
from typing import List, Set, Dict, Any
from tabulate import tabulate

import logging

# Add the parent directory to the path so we can import the module
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from music_collection_manager.utils.database import DatabaseManager
from music_collection_manager.config import setup_logging

# Set up logging
setup_logging(level="INFO")
logger = logging.getLogger(__name__)


class MissingArtistsFinder:
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
    
    def get_database_artists(self) -> List[Dict[str, Any]]:
        """Get all artists from the database"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT id, name, discogs_id FROM artists ORDER BY name")
            
            artists = []
            for row in cursor.fetchall():
                artist_data = {
                    'id': row[0],
                    'name': row[1],
                    'discogs_id': row[2],
                    'slug': self.slugify(row[1])
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
    
    def find_missing_artists(self) -> Dict[str, List[Dict[str, Any]]]:
        """Find artists that are in the database but missing from public folder"""
        db_artists = self.get_database_artists()
        public_folders = self.get_public_artist_folders()
        
        missing_artists = []
        present_artists = []
        
        for artist in db_artists:
            if artist['slug'] in public_folders:
                present_artists.append(artist)
            else:
                missing_artists.append(artist)
        
        return {
            'missing': missing_artists,
            'present': present_artists,
            'total_db': len(db_artists),
            'total_public': len(public_folders)
        }
    
    def find_orphaned_folders(self) -> List[str]:
        """Find folders in public that don't match any database artist"""
        db_artists = self.get_database_artists()
        public_folders = self.get_public_artist_folders()
        
        db_slugs = {artist['slug'] for artist in db_artists}
        orphaned = [folder for folder in public_folders if folder not in db_slugs]
        
        return sorted(orphaned)
    
    def format_artist_table(self, artists: List[Dict[str, Any]]) -> str:
        """Format artists as a table"""
        if not artists:
            return "No artists found."
        
        headers = ["Artist Name", "Slug", "Database ID", "Discogs ID"]
        rows = []
        
        for artist in artists:
            rows.append([
                artist['name'],
                artist['slug'],
                artist['id'],
                artist.get('discogs_id', 'N/A')
            ])
        
        return tabulate(rows, headers=headers, tablefmt="grid")
    
    def print_summary(self, results: Dict[str, Any]):
        """Print a summary of the analysis"""
        print(f"\n{'='*60}")
        print("ARTIST FOLDER ANALYSIS SUMMARY")
        print(f"{'='*60}")
        print(f"Total artists in database: {results['total_db']}")
        print(f"Total folders in public/artist: {results['total_public']}")
        print(f"Artists with folders: {len(results['present'])}")
        print(f"Missing artists: {len(results['missing'])}")
        
        if results['missing']:
            coverage = (len(results['present']) / results['total_db']) * 100
            print(f"Coverage: {coverage:.1f}%")
        else:
            print("Coverage: 100% - All artists have folders!")


def main():
    parser = argparse.ArgumentParser(description="Find missing artist folders")
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
        "--show-missing",
        action="store_true",
        help="Show detailed list of missing artists"
    )
    parser.add_argument(
        "--show-present",
        action="store_true", 
        help="Show detailed list of present artists"
    )
    parser.add_argument(
        "--show-orphaned",
        action="store_true",
        help="Show folders that don't match any database artist"
    )
    parser.add_argument(
        "--limit",
        type=int,
        default=0,
        help="Limit number of results shown (0 = no limit)"
    )
    parser.add_argument(
        "--export",
        help="Export missing artists to JSON file"
    )
    
    args = parser.parse_args()
    
    try:
        finder = MissingArtistsFinder(args.db_path, args.public_path)
        results = finder.find_missing_artists()
        
        # Always show summary
        finder.print_summary(results)
        
        # Show missing artists if requested or if no specific option given
        if args.show_missing or not any([args.show_present, args.show_orphaned]):
            missing = results['missing']
            if args.limit > 0:
                missing = missing[:args.limit]
            
            print(f"\n{'='*60}")
            print(f"MISSING ARTISTS ({len(results['missing'])} total)")
            print(f"{'='*60}")
            
            if missing:
                print(finder.format_artist_table(missing))
                if args.limit > 0 and len(results['missing']) > args.limit:
                    print(f"\n... and {len(results['missing']) - args.limit} more")
            else:
                print("No missing artists found!")
        
        # Show present artists if requested
        if args.show_present:
            present = results['present']
            if args.limit > 0:
                present = present[:args.limit]
            
            print(f"\n{'='*60}")
            print(f"PRESENT ARTISTS ({len(results['present'])} total)")
            print(f"{'='*60}")
            print(finder.format_artist_table(present))
            if args.limit > 0 and len(results['present']) > args.limit:
                print(f"\n... and {len(results['present']) - args.limit} more")
        
        # Show orphaned folders if requested
        if args.show_orphaned:
            orphaned = finder.find_orphaned_folders()
            if args.limit > 0:
                orphaned = orphaned[:args.limit]
            
            print(f"\n{'='*60}")
            print(f"ORPHANED FOLDERS ({len(finder.find_orphaned_folders())} total)")
            print(f"{'='*60}")
            print("These folders exist but don't match any database artist:")
            
            if orphaned:
                for folder in orphaned:
                    print(f"  - {folder}")
                if args.limit > 0 and len(finder.find_orphaned_folders()) > args.limit:
                    print(f"  ... and {len(finder.find_orphaned_folders()) - args.limit} more")
            else:
                print("No orphaned folders found!")
        
        # Export to JSON if requested
        if args.export:
            import json
            export_data = {
                'summary': {
                    'total_db_artists': results['total_db'],
                    'total_public_folders': results['total_public'],
                    'missing_count': len(results['missing']),
                    'present_count': len(results['present'])
                },
                'missing_artists': results['missing'],
                'orphaned_folders': finder.find_orphaned_folders()
            }
            
            with open(args.export, 'w') as f:
                json.dump(export_data, f, indent=2)
            print(f"\nResults exported to: {args.export}")
    
    except Exception as e:
        logger.error(f"Error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()

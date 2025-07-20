#!/usr/bin/env python3
"""
Check which artists and albums need folder name changes based on new sanitization rules.

This tool analyzes your current folder structure and shows:
1. Which folders need to be renamed
2. What the new names would be
3. Any potential conflicts

Usage:
    python check_sanitization_changes.py [--export report.csv]
"""

import argparse
import csv
import logging
import sys
from pathlib import Path
from typing import List, Tuple, Dict

# Add the parent directory to Python path so we can import the module
sys.path.insert(0, str(Path(__file__).parent.parent))

from music_collection_manager.config import ConfigManager
from music_collection_manager.utils.database import DatabaseManager
from music_collection_manager.utils.folder_sanitizer import sanitize_folder_name

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger('check_sanitization')


class SanitizationChecker:
    """Check for needed sanitization changes."""
    
    def __init__(self, base_path: Path):
        self.base_path = base_path
        self.changes_needed = []
        self.conflicts = []
        self.already_correct = []
        self.missing_folders = []
    
    def check_entity(self, name: str, entity_id: str = None) -> Dict[str, str]:
        """Check if an entity (artist/release) needs folder changes."""
        if entity_id:
            expected_name = f"{sanitize_folder_name(name)}-{entity_id}"
        else:
            expected_name = sanitize_folder_name(name)
        
        # Find existing folder
        existing_folder = self.find_existing_folder(name, entity_id)
        
        result = {
            'name': name,
            'id': entity_id or '',
            'expected_folder': expected_name,
            'current_folder': existing_folder or 'NOT FOUND',
            'status': 'unknown'
        }
        
        if not existing_folder:
            result['status'] = 'missing'
            self.missing_folders.append(result)
        elif existing_folder == expected_name:
            result['status'] = 'correct'
            self.already_correct.append(result)
        else:
            # Check if target already exists
            if (self.base_path / expected_name).exists():
                result['status'] = 'conflict'
                self.conflicts.append(result)
            else:
                result['status'] = 'needs_change'
                self.changes_needed.append(result)
        
        return result
    
    def find_existing_folder(self, name: str, entity_id: str = None) -> str:
        """Try to find the existing folder for this entity."""
        # Try exact match first
        if entity_id:
            test_name = f"{sanitize_folder_name(name)}-{entity_id}"
        else:
            test_name = sanitize_folder_name(name)
        
        if (self.base_path / test_name).exists():
            return test_name
        
        # Try common variations
        variations = [
            name.lower().replace(" ", "-"),
            name.lower().replace(" ", "_"),
            ''.join(c for c in name.lower().replace(" ", "-") if c.isascii()),
        ]
        
        if entity_id:
            # For releases, check with ID
            for var in variations:
                test = f"{var}-{entity_id}"
                if (self.base_path / test).exists():
                    return test
        else:
            # For artists, check without ID
            for var in variations:
                if (self.base_path / var).exists():
                    return var
        
        # Last resort: scan directory for partial matches
        if entity_id:
            # For releases, must have the ID
            for folder in self.base_path.iterdir():
                if folder.is_dir() and entity_id in folder.name:
                    return folder.name
        else:
            # For artists, try to match beginning of name
            name_start = name[:5].lower() if len(name) > 5 else name.lower()
            for folder in self.base_path.iterdir():
                if folder.is_dir() and folder.name.lower().startswith(name_start):
                    return folder.name
        
        return None


def main():
    """Main checking process."""
    parser = argparse.ArgumentParser(description='Check for needed sanitization changes')
    parser.add_argument('--export', help='Export results to CSV file')
    args = parser.parse_args()
    
    # Load configuration
    config_manager = ConfigManager()
    config = config_manager.config
    
    logger.info(f"Loaded config keys: {list(config.keys())}")
    logger.info(f"Full data config: {config.get('data', {})}")
    
    # Initialize database
    db_path = config.get('database', {}).get('path', 'collection_cache.db')
    db = DatabaseManager(db_path, logger)
    
    # Force the correct paths (ConfigManager is loading wrong config)
    data_path_config = '../public'  # Force correct path
    releases_path = config.get('releases', {}).get('path', 'album')
    artists_path = config.get('artists', {}).get('path', 'artist')
    
    logger.info(f"Config data path: {data_path_config}")
    
    data_path = Path(data_path_config)
    
    # Handle relative paths from scrapper directory
    if not data_path.is_absolute():
        data_path = (Path(__file__).parent.parent / data_path).resolve()
    
    logger.info(f"Resolved data path: {data_path}")
    
    artists_base = data_path / artists_path
    releases_base = data_path / releases_path
    
    # Check Artists
    logger.info("=" * 70)
    logger.info("CHECKING ARTISTS")
    logger.info("=" * 70)
    logger.info(f"Looking for artists in: {artists_base}")
    
    # Only create directories if they don't exist (shouldn't need to for checking)
    if not artists_base.exists():
        logger.warning(f"Artists directory doesn't exist: {artists_base}")
        logger.info("This is normal if you haven't processed any artists yet")
    artist_checker = SanitizationChecker(artists_base)
    
    # Get unique artists from the database by searching releases
    artists = []
    releases = db.get_all_releases()
    artist_names = set()
    
    for release in releases:
        for artist in release.artists:
            if artist.name not in artist_names:
                artist_names.add(artist.name)
                artists.append(artist)
    
    logger.info(f"Checking {len(artists)} unique artists...\n")
    
    for artist in artists:
        artist_checker.check_entity(artist.name)
    
    # Print artist results
    if artist_checker.changes_needed:
        logger.info(f"🔄 Artists needing folder changes: {len(artist_checker.changes_needed)}")
        for item in artist_checker.changes_needed[:10]:  # Show first 10
            logger.info(f"  {item['name']}")
            logger.info(f"    Current: {item['current_folder']}")
            logger.info(f"    New:     {item['expected_folder']}")
        if len(artist_checker.changes_needed) > 10:
            logger.info(f"  ... and {len(artist_checker.changes_needed) - 10} more")
    
    if artist_checker.conflicts:
        logger.warning(f"\n⚠️  Artist conflicts: {len(artist_checker.conflicts)}")
        for item in artist_checker.conflicts[:5]:
            logger.warning(f"  {item['name']}: {item['current_folder']} → {item['expected_folder']} (exists!)")
    
    if artist_checker.missing_folders:
        logger.warning(f"\n❌ Missing artist folders: {len(artist_checker.missing_folders)}")
        for item in artist_checker.missing_folders:
            logger.warning(f"  {item['name']} (expected: {item['expected_folder']})")
    
    logger.info(f"\n✅ Artists already correct: {len(artist_checker.already_correct)}")
    
    # Check Releases
    logger.info("\n" + "=" * 70)
    logger.info("CHECKING RELEASES")
    logger.info("=" * 70)
    logger.info(f"Looking for releases in: {releases_base}")
    
    # Only create directories if they don't exist (shouldn't need to for checking)
    if not releases_base.exists():
        logger.warning(f"Releases directory doesn't exist: {releases_base}")
        logger.info("This is normal if you haven't processed any releases yet")
    release_checker = SanitizationChecker(releases_base)
    
    releases = db.get_all_releases()
    logger.info(f"Checking {len(releases)} releases...\n")
    
    for release in releases:
        release_checker.check_entity(release.title, str(release.discogs_id))
    
    # Print release results
    if release_checker.changes_needed:
        logger.info(f"🔄 Releases needing folder changes: {len(release_checker.changes_needed)}")
        for item in release_checker.changes_needed[:10]:  # Show first 10
            logger.info(f"  {item['name']} [{item['id']}]")
            logger.info(f"    Current: {item['current_folder']}")
            logger.info(f"    New:     {item['expected_folder']}")
        if len(release_checker.changes_needed) > 10:
            logger.info(f"  ... and {len(release_checker.changes_needed) - 10} more")
    
    if release_checker.conflicts:
        logger.warning(f"\n⚠️  Release conflicts: {len(release_checker.conflicts)}")
        for item in release_checker.conflicts[:5]:
            logger.warning(f"  {item['name']}: {item['current_folder']} → {item['expected_folder']} (exists!)")
    
    if release_checker.missing_folders:
        logger.warning(f"\n❌ Missing release folders: {len(release_checker.missing_folders)}")
        for item in release_checker.missing_folders:
            logger.warning(f"  {item['name']} [{item['id']}] (expected: {item['expected_folder']})")
    
    logger.info(f"\n✅ Releases already correct: {len(release_checker.already_correct)}")
    
    # Summary
    logger.info("\n" + "=" * 70)
    logger.info("SUMMARY")
    logger.info("=" * 70)
    
    total_artists = len(artists)
    total_releases = len(releases)
    
    logger.info(f"Artists:")
    logger.info(f"  Total: {total_artists}")
    logger.info(f"  Need changes: {len(artist_checker.changes_needed)} ({len(artist_checker.changes_needed)/total_artists*100:.1f}%)")
    logger.info(f"  Conflicts: {len(artist_checker.conflicts)}")
    logger.info(f"  Missing: {len(artist_checker.missing_folders)}")
    logger.info(f"  Correct: {len(artist_checker.already_correct)} ({len(artist_checker.already_correct)/total_artists*100:.1f}%)")
    
    logger.info(f"\nReleases:")
    logger.info(f"  Total: {total_releases}")
    logger.info(f"  Need changes: {len(release_checker.changes_needed)} ({len(release_checker.changes_needed)/total_releases*100:.1f}%)")
    logger.info(f"  Conflicts: {len(release_checker.conflicts)}")
    logger.info(f"  Missing: {len(release_checker.missing_folders)}")
    logger.info(f"  Correct: {len(release_checker.already_correct)} ({len(release_checker.already_correct)/total_releases*100:.1f}%)")
    
    # Export if requested
    if args.export:
        logger.info(f"\nExporting results to {args.export}...")
        with open(args.export, 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=['type', 'name', 'id', 'status', 'current_folder', 'expected_folder'])
            writer.writeheader()
            
            # Write all artist results
            for result in (artist_checker.changes_needed + artist_checker.conflicts + 
                          artist_checker.missing_folders + artist_checker.already_correct):
                result['type'] = 'artist'
                writer.writerow(result)
            
            # Write all release results
            for result in (release_checker.changes_needed + release_checker.conflicts + 
                          release_checker.missing_folders + release_checker.already_correct):
                result['type'] = 'release'
                writer.writerow(result)
        
        logger.info(f"Export complete!")
    
    # Recommendation
    if artist_checker.changes_needed or release_checker.changes_needed:
        logger.info("\n" + "🔧 " * 20)
        logger.info("To apply these changes, run:")
        logger.info("  python tools/regenerate_all_with_migration.py --dry-run")
        logger.info("Then if everything looks good:")
        logger.info("  python tools/regenerate_all_with_migration.py")
        logger.info("🔧 " * 20)


if __name__ == '__main__':
    main()
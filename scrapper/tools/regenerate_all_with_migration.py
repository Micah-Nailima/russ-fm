#!/usr/bin/env python3
"""
Regenerate all JSON files and migrate folder names to use the new sanitization rules.

This tool:
1. Identifies folders that need renaming based on new sanitization rules
2. Safely moves folders to their new names
3. Regenerates all JSON files with updated paths
4. Updates collection.json with correct references

Usage:
    python regenerate_all_with_migration.py [--dry-run] [--force]
    
Options:
    --dry-run: Show what would be changed without making changes
    --force: Force regeneration even if folders are already correct
"""

import argparse
import logging
import shutil
import json
import sys
from pathlib import Path
from typing import Dict, List, Tuple, Optional

# Add the parent directory to Python path so we can import the module
sys.path.insert(0, str(Path(__file__).parent.parent))

from music_collection_manager.config import ConfigManager
from music_collection_manager.utils.database import DatabaseManager
from music_collection_manager.utils.collection_generator import CollectionGenerator
from music_collection_manager.utils.image_manager import ImageManager
from music_collection_manager.utils.serializers import ArtistSerializer, ReleaseSerializer
from music_collection_manager.utils.text_cleaner import clean_for_json
from music_collection_manager.utils.folder_sanitizer import sanitize_folder_name

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger('regenerate_with_migration')


class FolderMigrator:
    """Handles migration of folders to new naming scheme."""
    
    def __init__(self, base_path: Path, dry_run: bool = False):
        self.base_path = base_path
        self.dry_run = dry_run
        self.migrations_needed = []
        self.migrations_completed = []
        self.conflicts = []
    
    def analyze_folder(self, current_name: str, expected_name: str) -> str:
        """Analyze if a folder needs migration."""
        if current_name == expected_name:
            return "correct"
        elif not (self.base_path / current_name).exists():
            return "missing"
        elif (self.base_path / expected_name).exists():
            return "conflict"
        else:
            return "needs_migration"
    
    def migrate_folder(self, old_name: str, new_name: str) -> bool:
        """Migrate a folder from old name to new name."""
        old_path = self.base_path / old_name
        new_path = self.base_path / new_name
        
        if self.dry_run:
            logger.info(f"[DRY RUN] Would migrate: {old_name} → {new_name}")
            return True
        
        try:
            logger.info(f"Migrating folder: {old_name} → {new_name}")
            shutil.move(str(old_path), str(new_path))
            self.migrations_completed.append((old_name, new_name))
            return True
        except Exception as e:
            logger.error(f"Failed to migrate {old_name} to {new_name}: {e}")
            return False


def find_existing_folder(base_path: Path, artist_name: str, discogs_id: Optional[str] = None) -> Optional[str]:
    """Try to find an existing folder that might match this artist/release."""
    # Try various common variations
    variations = [
        artist_name,
        artist_name.lower(),
        artist_name.lower().replace(" ", "-"),
        artist_name.lower().replace(" ", "_"),
        # Try without accents (simple approach)
        ''.join(c for c in artist_name.lower().replace(" ", "-") if c.isascii()),
    ]
    
    if discogs_id:
        # For releases, also try with ID
        base_variations = variations.copy()
        variations = []
        for var in base_variations:
            variations.append(f"{var}-{discogs_id}")
    
    for variant in variations:
        if (base_path / variant).exists():
            return variant
    
    # Try to find any folder containing key parts of the name
    if len(artist_name) > 5:
        key_part = artist_name[:5].lower()
        for folder in base_path.iterdir():
            if folder.is_dir() and key_part in folder.name.lower():
                if discogs_id is None or discogs_id in folder.name:
                    logger.info(f"Found potential match: {folder.name} for {artist_name}")
                    return folder.name
    
    return None


def main():
    """Main regeneration and migration process."""
    parser = argparse.ArgumentParser(description='Regenerate all data with folder migration')
    parser.add_argument('--dry-run', action='store_true', help='Show what would be changed without making changes')
    parser.add_argument('--force', action='store_true', help='Force regeneration even if folders are correct')
    args = parser.parse_args()
    
    # Load configuration
    config_manager = ConfigManager()
    config = config_manager.config
    
    # Initialize components
    db_path = config.get('database', {}).get('path', 'collection_cache.db')
    db = DatabaseManager(db_path, logger)
    
    data_path = Path(config.get('data', {}).get('path', 'data'))
    releases_path = config.get('releases', {}).get('path', 'album')
    artists_path = config.get('artists', {}).get('path', 'artist')
    
    releases_base = data_path / releases_path
    artists_base = data_path / artists_path
    
    # Create directories if they don't exist
    releases_base.mkdir(parents=True, exist_ok=True)
    artists_base.mkdir(parents=True, exist_ok=True)
    
    image_manager = ImageManager(str(releases_base), config)
    
    # Initialize migrators
    artist_migrator = FolderMigrator(artists_base, dry_run=args.dry_run)
    release_migrator = FolderMigrator(releases_base, dry_run=args.dry_run)
    
    # Process Artists
    logger.info("=" * 60)
    logger.info("PHASE 1: Analyzing and migrating artist folders")
    logger.info("=" * 60)
    
    # Get unique artists from releases
    releases = db.get_all_releases()
    artist_names = set()
    artists = []
    
    for release in releases:
        for artist in release.artists:
            if artist.name not in artist_names:
                artist_names.add(artist.name)
                artists.append(artist)
    
    logger.info(f"Found {len(artists)} unique artists from {len(releases)} releases")
    
    artist_mappings = {}  # old_folder -> new_folder mapping
    
    for artist in artists:
        expected_folder = sanitize_folder_name(artist.name)
        existing_folder = find_existing_folder(artists_base, artist.name)
        
        if existing_folder:
            status = artist_migrator.analyze_folder(existing_folder, expected_folder)
            
            if status == "needs_migration":
                artist_migrator.migrations_needed.append((existing_folder, expected_folder))
                if artist_migrator.migrate_folder(existing_folder, expected_folder):
                    artist_mappings[existing_folder] = expected_folder
            elif status == "conflict":
                artist_migrator.conflicts.append((existing_folder, expected_folder))
                logger.warning(f"Conflict for {artist.name}: {existing_folder} → {expected_folder} (target exists)")
            elif status == "correct":
                logger.debug(f"✓ {artist.name} folder is correct: {expected_folder}")
        else:
            logger.warning(f"No folder found for artist: {artist.name} (expected: {expected_folder})")
    
    # Process Releases
    logger.info("\n" + "=" * 60)
    logger.info("PHASE 2: Analyzing and migrating release folders")
    logger.info("=" * 60)
    
    logger.info(f"Found {len(releases)} releases in database")
    
    release_mappings = {}  # old_folder -> new_folder mapping
    
    for release in releases:
        expected_folder = f"{sanitize_folder_name(release.title)}-{release.discogs_id}"
        existing_folder = find_existing_folder(releases_base, release.title, str(release.discogs_id))
        
        if existing_folder:
            status = release_migrator.analyze_folder(existing_folder, expected_folder)
            
            if status == "needs_migration":
                release_migrator.migrations_needed.append((existing_folder, expected_folder))
                if release_migrator.migrate_folder(existing_folder, expected_folder):
                    release_mappings[existing_folder] = expected_folder
            elif status == "conflict":
                release_migrator.conflicts.append((existing_folder, expected_folder))
                logger.warning(f"Conflict for {release.title}: {existing_folder} → {expected_folder} (target exists)")
            elif status == "correct":
                logger.debug(f"✓ {release.title} folder is correct: {expected_folder}")
        else:
            logger.warning(f"No folder found for release: {release.title} (expected: {expected_folder})")
    
    # Migration summary
    logger.info("\n" + "=" * 60)
    logger.info("MIGRATION SUMMARY")
    logger.info("=" * 60)
    logger.info(f"Artist folders needing migration: {len(artist_migrator.migrations_needed)}")
    logger.info(f"Artist folders migrated: {len(artist_migrator.migrations_completed)}")
    logger.info(f"Artist folder conflicts: {len(artist_migrator.conflicts)}")
    logger.info(f"Release folders needing migration: {len(release_migrator.migrations_needed)}")
    logger.info(f"Release folders migrated: {len(release_migrator.migrations_completed)}")
    logger.info(f"Release folder conflicts: {len(release_migrator.conflicts)}")
    
    if args.dry_run:
        logger.info("\n*** DRY RUN MODE - No actual changes were made ***")
        logger.info("Run without --dry-run to apply changes")
        return
    
    # Regenerate JSON files
    logger.info("\n" + "=" * 60)
    logger.info("PHASE 3: Regenerating JSON files")
    logger.info("=" * 60)
    
    # Regenerate release JSON files
    logger.info("Regenerating release JSON files...")
    release_success = 0
    for i, release in enumerate(releases, 1):
        try:
            # Ensure folder exists with correct name
            folder_name = f"{sanitize_folder_name(release.title)}-{release.discogs_id}"
            release_folder = releases_base / folder_name
            release_folder.mkdir(exist_ok=True)
            
            # Save JSON using centralized serializer
            json_path = release_folder / f"{folder_name}.json"
            json_content = ReleaseSerializer.to_json(release, include_enrichment=True)
            json_content = clean_for_json(json_content)
            
            with open(json_path, 'w', encoding='utf-8') as f:
                f.write(json_content)
            
            release_success += 1
            if i % 50 == 0:
                logger.info(f"Progress: {i}/{len(releases)} releases processed")
        except Exception as e:
            logger.error(f"Error regenerating {release.title}: {e}")
    
    logger.info(f"Successfully regenerated {release_success}/{len(releases)} release JSON files")
    
    # Regenerate artist JSON files
    logger.info("\nRegenerating artist JSON files...")
    artist_success = 0
    for i, artist in enumerate(artists, 1):
        try:
            # Ensure folder exists with correct name
            folder_name = sanitize_folder_name(artist.name)
            artist_folder = artists_base / folder_name
            artist_folder.mkdir(exist_ok=True)
            
            # Save JSON
            json_path = artist_folder / f"{folder_name}.json"
            json_content = ArtistSerializer.to_json(artist, include_enrichment=True)
            json_content = clean_for_json(json_content)
            
            with open(json_path, 'w', encoding='utf-8') as f:
                f.write(json_content)
            
            artist_success += 1
            if i % 50 == 0:
                logger.info(f"Progress: {i}/{len(artists)} artists processed")
        except Exception as e:
            logger.error(f"Error regenerating {artist.name}: {e}")
    
    logger.info(f"Successfully regenerated {artist_success}/{len(artists)} artist JSON files")
    
    # Regenerate collection.json
    logger.info("\nRegenerating collection.json...")
    generator = CollectionGenerator(str(data_path), config, logger)
    collection_path = generator.generate_collection_json()
    
    if collection_path.exists():
        logger.info(f"Successfully regenerated collection.json")
    else:
        logger.error("Failed to regenerate collection.json")
    
    # Final summary
    logger.info("\n" + "=" * 60)
    logger.info("REGENERATION COMPLETE - FINAL SUMMARY")
    logger.info("=" * 60)
    logger.info(f"Artist folders migrated: {len(artist_migrator.migrations_completed)}")
    logger.info(f"Release folders migrated: {len(release_migrator.migrations_completed)}")
    logger.info(f"Artist JSON files regenerated: {artist_success}/{len(artists)}")
    logger.info(f"Release JSON files regenerated: {release_success}/{len(releases)}")
    logger.info(f"Collection.json: {'✓ Regenerated' if collection_path.exists() else '✗ Failed'}")
    
    if artist_migrator.conflicts or release_migrator.conflicts:
        logger.warning("\n⚠️  CONFLICTS DETECTED - Manual intervention required:")
        for old, new in artist_migrator.conflicts:
            logger.warning(f"  Artist: {old} → {new}")
        for old, new in release_migrator.conflicts:
            logger.warning(f"  Release: {old} → {new}")
    
    logger.info("\n✅ All done!")


if __name__ == '__main__':
    main()
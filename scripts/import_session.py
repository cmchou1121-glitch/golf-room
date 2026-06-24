#!/usr/bin/env python3
"""Import one launch-monitor CSV into data/<player>/ and manifest.json."""

from __future__ import annotations

import argparse
import csv
import json
import re
import shutil
import sys
from datetime import date
from pathlib import Path


DATE_RE = re.compile(r"(20\d{2})[-_](\d{2})[-_](\d{2})")
REQUIRED_COLUMNS = {
    "球桿",
    "無坡落點距離-比賽球(碼)",
    "無坡總距離-比賽球(碼)",
}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Copy a golf CSV into the site data folder and update data/manifest.json."
    )
    parser.add_argument("player_id", help="Player id in manifest.json, e.g. tony or renwen.")
    parser.add_argument("csv_path", help="Path to the exported CSV file.")
    parser.add_argument("--date", help="Session date, YYYY-MM-DD. Inferred from filename when possible.")
    parser.add_argument("--label", help="Short label shown in the session dropdown.")
    parser.add_argument("--device", default="Garmin R10", help="Launch monitor name. Default: Garmin R10.")
    parser.add_argument("--equipment", help="Equipment note shown in the dashboard header.")
    parser.add_argument("--note", help="Short session note.")
    parser.add_argument("--file-name", help="Destination CSV filename under data/<player_id>/.")
    parser.add_argument(
        "--exclude-club",
        action="append",
        default=[],
        help="Exclude rows whose 球桿 value matches this label. Can be repeated.",
    )
    parser.add_argument("--replace", action="store_true", help="Overwrite destination CSV if it already exists.")
    return parser.parse_args()


def infer_date(path: Path) -> str | None:
    match = DATE_RE.search(path.name)
    if not match:
        return None
    return "-".join(match.groups())


def validate_date(value: str) -> str:
    if not re.fullmatch(r"20\d{2}-\d{2}-\d{2}", value):
        raise ValueError("date must use YYYY-MM-DD")
    return value


def safe_filename(csv_path: Path, session_date: str, explicit_name: str | None) -> str:
    name = explicit_name or csv_path.name
    if not name.lower().endswith(".csv"):
        name += ".csv"
    name = re.sub(r"[^A-Za-z0-9._-]+", "-", name).strip(".-")
    if not DATE_RE.search(name):
        name = f"{session_date}_{name}"
    return name


def validate_csv(csv_path: Path) -> None:
    with csv_path.open("r", encoding="utf-8-sig", newline="") as handle:
        reader = csv.reader(handle)
        try:
            header = next(reader)
        except StopIteration as exc:
            raise ValueError("CSV is empty") from exc
    missing = sorted(REQUIRED_COLUMNS.difference(h.strip() for h in header))
    if missing:
        raise ValueError("CSV missing required columns: " + ", ".join(missing))


def copy_csv(csv_path: Path, dest_path: Path, excluded_clubs: set[str]) -> tuple[int, int]:
    if not excluded_clubs:
        shutil.copy2(csv_path, dest_path)
        return 0, 0

    total = 0
    removed = 0
    with csv_path.open("r", encoding="utf-8-sig", newline="") as source:
        reader = csv.reader(source)
        header = next(reader)
        club_index = header.index("球桿")
        with dest_path.open("w", encoding="utf-8-sig", newline="") as target:
            writer = csv.writer(target)
            writer.writerow(header)
            for row in reader:
                total += 1
                club = row[club_index].strip() if len(row) > club_index else ""
                if club in excluded_clubs:
                    removed += 1
                    continue
                writer.writerow(row)
    return total, removed


def load_manifest(path: Path) -> dict:
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def write_manifest(path: Path, manifest: dict) -> None:
    with path.open("w", encoding="utf-8") as handle:
        json.dump(manifest, handle, ensure_ascii=False, indent=2)
        handle.write("\n")


def main() -> int:
    args = parse_args()
    repo = Path(__file__).resolve().parents[1]
    manifest_path = repo / "data" / "manifest.json"
    csv_path = Path(args.csv_path).expanduser().resolve()

    if not csv_path.exists():
        print(f"CSV not found: {csv_path}", file=sys.stderr)
        return 1

    try:
        validate_csv(csv_path)
        session_date = validate_date(args.date or infer_date(csv_path) or "")
    except ValueError as exc:
        print(f"Import stopped: {exc}", file=sys.stderr)
        if not args.date and not infer_date(csv_path):
            print("Tip: pass --date YYYY-MM-DD when the filename has no date.", file=sys.stderr)
        return 1

    manifest = load_manifest(manifest_path)
    player_id = args.player_id.strip().lower()
    players = manifest.get("players", [])
    player = next((p for p in players if p.get("id") == player_id), None)
    if player is None:
        valid = ", ".join(p.get("id", "") for p in players)
        print(f"Unknown player_id: {player_id}. Valid players: {valid}", file=sys.stderr)
        return 1

    dest_dir = repo / "data" / player_id
    dest_dir.mkdir(parents=True, exist_ok=True)
    dest_name = safe_filename(csv_path, session_date, args.file_name)
    dest_path = dest_dir / dest_name
    if dest_path.exists() and not args.replace:
        print(f"Destination already exists: {dest_path}", file=sys.stderr)
        print("Use --replace to overwrite it.", file=sys.stderr)
        return 1

    excluded_clubs = {club.strip() for club in args.exclude_club if club.strip()}
    total_rows, removed_rows = copy_csv(csv_path, dest_path, excluded_clubs)

    session = {
        "date": session_date,
        "file": f"{player_id}/{dest_name}",
    }
    if args.label:
        session["label"] = args.label
    if args.device:
        session["device"] = args.device
    if args.equipment:
        session["equipment"] = args.equipment
    if args.note:
        session["note"] = args.note

    sessions = player.setdefault("sessions", [])
    existing = next((s for s in sessions if s.get("file") == session["file"]), None)
    if existing:
        existing.update(session)
    else:
        sessions.append(session)
    sessions.sort(key=lambda s: (s.get("date", ""), s.get("file", "")), reverse=True)
    manifest["updated"] = date.today().isoformat()
    write_manifest(manifest_path, manifest)

    print(f"Imported {csv_path.name} -> data/{player_id}/{dest_name}")
    if excluded_clubs:
        labels = ", ".join(sorted(excluded_clubs))
        print(f"Excluded club labels: {labels} ({removed_rows} of {total_rows} rows)")
    print(f"Updated {manifest_path.relative_to(repo)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

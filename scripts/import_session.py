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
    parser.add_argument("player_id", nargs="?", help="Player id in manifest.json, e.g. tony or renwen.")
    parser.add_argument("csv_path", nargs="?", help="Path to the exported CSV file.")
    parser.add_argument("-i", "--interactive", action="store_true", help="Prompt for missing import details.")
    parser.add_argument("--date", help="Session date, YYYY-MM-DD. Inferred from filename when possible.")
    parser.add_argument("--label", help="Short label shown in the session dropdown.")
    parser.add_argument("--device", default="Garmin R10", help="Launch monitor name. Default: Garmin R10.")
    parser.add_argument("--equipment", help="Equipment note shown in the dashboard header.")
    parser.add_argument("--bag-profile", help="Use a bagProfiles id from manifest.json as the equipment note.")
    parser.add_argument("--note", help="Short session note.")
    parser.add_argument("--file-name", help="Destination CSV filename under data/<player_id>/.")
    parser.add_argument(
        "--exclude-club",
        action="append",
        default=[],
        help="Exclude rows whose 球桿 value matches this label. Can be repeated.",
    )
    parser.add_argument("--replace", action="store_true", help="Overwrite destination CSV if it already exists.")
    parser.add_argument("--dry-run", action="store_true", help="Validate and preview changes without writing files.")
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


def clean_input(value: str) -> str:
    return value.strip().strip("\"'")


def prompt_text(label: str, default: str | None = None, required: bool = False) -> str:
    while True:
        suffix = f" [{default}]" if default else ""
        value = clean_input(input(f"{label}{suffix}: "))
        if not value and default is not None:
            value = default
        if value or not required:
            return value
        print("This value is required.")


def prompt_yes_no(label: str, default: bool = False) -> bool:
    hint = "Y/n" if default else "y/N"
    value = clean_input(input(f"{label} [{hint}]: ")).lower()
    if not value:
        return default
    return value in {"y", "yes", "是", "好", "1", "true"}


def choose_player(players: list[dict], current: str | None) -> str:
    valid = {p.get("id", ""): p for p in players}
    if current in valid:
        return current or ""
    print("Players:")
    for index, player in enumerate(players, start=1):
        label = player.get("name") or player.get("id")
        print(f"  {index}. {player.get('id')} ({label})")
    while True:
        raw = prompt_text("Player id or number", "tony", required=True)
        if raw.isdigit() and 1 <= int(raw) <= len(players):
            return players[int(raw) - 1].get("id", "")
        if raw in valid:
            return raw
        print("Unknown player. Choose one of: " + ", ".join(valid))


def find_player(manifest: dict, player_id: str) -> dict | None:
    return next((p for p in manifest.get("players", []) if p.get("id") == player_id), None)


def pick_bag_profile(player: dict, session_date: str, requested: str | None, interactive: bool) -> dict | None:
    profiles = player.get("bagProfiles") or []
    if not profiles:
        return None
    if requested:
        found = next((p for p in profiles if p.get("id") == requested), None)
        if not found:
            raise ValueError("Unknown bag profile: " + requested)
        return found
    default_index = 0
    for index, profile in enumerate(profiles):
        start = profile.get("effectiveFrom")
        before = profile.get("effectiveBefore")
        if start and session_date >= start:
            default_index = index
            break
        if before and session_date < before:
            default_index = index
            break
    if not interactive:
        return None
    print("Bag profiles:")
    print("  0. 不帶入球袋資訊")
    for index, profile in enumerate(profiles, start=1):
        print(f"  {index}. {profile.get('id')} - {profile.get('label')} ({profile.get('summary', '')})")
    raw = prompt_text("Bag profile", str(default_index + 1))
    if raw in {"", "0", "none", "no"}:
        return None
    if raw.isdigit() and 1 <= int(raw) <= len(profiles):
        return profiles[int(raw) - 1]
    found = next((p for p in profiles if p.get("id") == raw), None)
    if found:
        return found
    raise ValueError("Unknown bag profile: " + raw)


def equipment_from_profile(profile: dict | None) -> str | None:
    if not profile:
        return None
    label = profile.get("label") or profile.get("id") or "球袋"
    summary = profile.get("summary") or ""
    return f"{label}：{summary}" if summary else label


def fill_interactive(args: argparse.Namespace, manifest: dict) -> argparse.Namespace:
    players = manifest.get("players", [])
    args.player_id = choose_player(players, (args.player_id or "").strip().lower() or None)
    while not args.csv_path:
        args.csv_path = prompt_text("CSV path", required=True)
    csv_path = Path(args.csv_path).expanduser()
    inferred = infer_date(csv_path)
    args.date = validate_date(prompt_text("Session date", args.date or inferred, required=True))
    args.label = prompt_text("Session label", args.label or "練習場") or None
    args.device = prompt_text("Device", args.device or "Garmin R10") or None
    player = find_player(manifest, args.player_id)
    if player and not args.equipment:
        profile = pick_bag_profile(player, args.date, args.bag_profile, True)
        args.bag_profile = profile.get("id") if profile else None
        args.equipment = equipment_from_profile(profile)
    args.note = prompt_text("Session note", args.note or "") or None
    excluded = prompt_text("Exclude clubs (comma-separated, optional)", "")
    if excluded:
        args.exclude_club.extend([v.strip() for v in excluded.split(",") if v.strip()])
    if not args.file_name:
        default_name = safe_filename(csv_path, args.date, None)
        args.file_name = prompt_text("Destination file name", default_name, required=True)
    return args


def main() -> int:
    args = parse_args()
    repo = Path(__file__).resolve().parents[1]
    manifest_path = repo / "data" / "manifest.json"
    manifest = load_manifest(manifest_path)

    if args.interactive or not args.player_id or not args.csv_path:
        try:
            args = fill_interactive(args, manifest)
        except ValueError as exc:
            print(f"Import stopped: {exc}", file=sys.stderr)
            return 1

    player_id = (args.player_id or "").strip().lower()
    csv_path = Path(args.csv_path or "").expanduser().resolve()
    if not player_id:
        print("Import stopped: player_id is required. Use --interactive to be prompted.", file=sys.stderr)
        return 1
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

    players = manifest.get("players", [])
    player = find_player(manifest, player_id)
    if player is None:
        valid = ", ".join(p.get("id", "") for p in players)
        print(f"Unknown player_id: {player_id}. Valid players: {valid}", file=sys.stderr)
        return 1
    try:
        profile = pick_bag_profile(player, session_date, args.bag_profile, False)
    except ValueError as exc:
        print(f"Import stopped: {exc}", file=sys.stderr)
        return 1
    if profile and not args.equipment:
        args.equipment = equipment_from_profile(profile)

    dest_dir = repo / "data" / player_id
    dest_name = safe_filename(csv_path, session_date, args.file_name)
    dest_path = dest_dir / dest_name
    if dest_path.exists() and not args.replace and not args.dry_run:
        if args.interactive and prompt_yes_no(f"Destination exists, overwrite {dest_path.name}?", False):
            args.replace = True
        else:
            print(f"Destination already exists: {dest_path}", file=sys.stderr)
            print("Use --replace to overwrite it.", file=sys.stderr)
            return 1

    excluded_clubs = {club.strip() for club in args.exclude_club if club.strip()}
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
    same_date = [s for s in sessions if s.get("date") == session_date and s.get("file") != session["file"]]
    existing = next((s for s in sessions if s.get("file") == session["file"]), None)
    if args.dry_run:
        print("Dry run: no files will be written.")
        print(f"CSV: {csv_path}")
        print(f"Destination: data/{player_id}/{dest_name}")
        print("Session:")
        print(json.dumps(session, ensure_ascii=False, indent=2))
        if excluded_clubs:
            print("Excluded club labels: " + ", ".join(sorted(excluded_clubs)))
        if same_date:
            print("Note: same-date sessions already exist: " + ", ".join(s.get("file", "") for s in same_date))
        return 0

    dest_dir.mkdir(parents=True, exist_ok=True)
    total_rows, removed_rows = copy_csv(csv_path, dest_path, excluded_clubs)
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
    if same_date:
        print("Note: same-date sessions already exist: " + ", ".join(s.get("file", "") for s in same_date))
    print(f"Updated {manifest_path.relative_to(repo)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

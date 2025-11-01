#!/usr/bin/env python3
"""
Script to generate SQL INSERT statements from JSON data files.
Reads all JSON files from the data folder and creates a SQL file with INSERT queries.
"""

import json
import os
from pathlib import Path


def escape_sql_string(text):
    """
    Escape single quotes in SQL strings to prevent SQL injection and syntax errors.

    Args:
        text: The text to escape

    Returns:
        Escaped text safe for SQL
    """
    if text is None:
        return "NULL"
    # Replace single quotes with two single quotes (SQL standard escaping)
    return text.replace("'", "''")


def generate_sql_inserts(
    data_folder="data", output_file="insert_data.sql", table_name="Email"
):
    """
    Generate SQL INSERT statements from JSON files in the data folder.

    Args:
        data_folder: Path to the folder containing JSON files
        output_file: Path to the output SQL file
        table_name: Name of the database table
    """
    data_path = Path(data_folder)

    # Check if data folder exists
    if not data_path.exists():
        print(f"Error: Data folder '{data_folder}' not found!")
        return

    # Get all JSON files
    json_files = sorted(data_path.glob("*.json"))

    if not json_files:
        print(f"Error: No JSON files found in '{data_folder}'!")
        return

    print(f"Found {len(json_files)} JSON files:")
    for file in json_files:
        print(f"  - {file.name}")

    # Label mapping - Vietnamese label names to SQL variable names
    label_mapping = {
        "Bảo mật": "@label_bao_mat",
        "Công việc": "@label_cong_viec",
        "Gia đình": "@label_gia_dinh",
        "Giao dịch": "@label_giao_dich",
        "Học tập": "@label_hoc_tap",
        "Quảng cáo": "@label_quang_cao",
        "Spam": "@label_spam",
    }

    # Open output SQL file
    with open(output_file, "w", encoding="utf-8") as sql_file:
        # Write header comment
        sql_file.write("-- SQL INSERT statements generated from JSON data files\n")
        sql_file.write(f"-- Generated for table: {table_name}\n")
        sql_file.write(f"-- Total files processed: {len(json_files)}\n")
        sql_file.write("-- \n")
        sql_file.write("-- Table schema:\n")
        sql_file.write(f"-- CREATE TABLE {table_name} (\n")
        sql_file.write("--     id INT AUTO_INCREMENT PRIMARY KEY,\n")
        sql_file.write("--     title VARCHAR(255) NOT NULL,\n")
        sql_file.write("--     content VARCHAR(255) NOT NULL,\n")
        sql_file.write("--     label_id INT,\n")
        sql_file.write("--     userId INT,\n")
        sql_file.write("--     datasetId INT,\n")
        sql_file.write("--     createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,\n")
        sql_file.write(
            "--     updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP\n"
        )
        sql_file.write("-- );\n")
        sql_file.write("--\n\n")

        # Write label variable declarations
        sql_file.write("-- Set label variables from existing Label table\n")
        sql_file.write(
            "SET @label_bao_mat = (SELECT id FROM Labels WHERE name = 'Bảo mật' LIMIT 1);\n"
        )
        sql_file.write(
            "SET @label_cong_viec = (SELECT id FROM Labels WHERE name = 'Công việc' LIMIT 1);\n"
        )
        sql_file.write(
            "SET @label_gia_dinh = (SELECT id FROM Labels WHERE name = 'Gia đình' LIMIT 1);\n"
        )
        sql_file.write(
            "SET @label_giao_dich = (SELECT id FROM Labels WHERE name = 'Giao dịch' LIMIT 1);\n"
        )
        sql_file.write(
            "SET @label_hoc_tap = (SELECT id FROM Labels WHERE name = 'Học tập' LIMIT 1);\n"
        )
        sql_file.write(
            "SET @label_quang_cao = (SELECT id FROM Labels WHERE name = 'Quảng cáo' LIMIT 1);\n"
        )
        sql_file.write(
            "SET @label_spam = (SELECT id FROM Labels WHERE name = 'Spam' LIMIT 1);\n"
        )
        sql_file.write("\n")

        total_records = 0

        # Process each JSON file
        for json_file in json_files:
            print(f"\nProcessing {json_file.name}...")

            try:
                # Read JSON file
                with open(json_file, "r", encoding="utf-8") as f:
                    data = json.load(f)

                if not isinstance(data, list):
                    print(
                        f"  Warning: {json_file.name} does not contain a list. Skipping."
                    )
                    continue

                # Write comment for this file
                sql_file.write(f"-- Data from {json_file.name} ({len(data)} records)\n")

                # Generate INSERT statements
                for record in data:
                    if not isinstance(record, dict):
                        continue

                    # Get text from JSON (could be 'Text' or 'text')
                    text = record.get("Text", record.get("text", ""))
                    # Get label from JSON (could be 'Label' or 'label')
                    label = record.get("Label", record.get("label", ""))

                    # Escape strings for SQL
                    text_escaped = escape_sql_string(text)
                    label_escaped = escape_sql_string(label)

                    # Get label variable for labelId
                    label_var = label_mapping.get(label, "NULL")

                    # Write INSERT statement with correct field names
                    # Using 'title' for the email subject/title and 'content' for the body
                    # Include labelId and timestamps (Sequelize uses snake_case in DB: created_at, updated_at)
                    sql_file.write(
                        f"INSERT INTO {table_name} (title, content, label_id, user_id, dataset_id, created_at, updated_at) "
                        f"VALUES ('{label_escaped}', '{text_escaped}', {label_var}, NULL, NULL, NOW(), NOW());\n"
                    )
                    total_records += 1

                sql_file.write("\n")
                print(f"  Processed {len(data)} records from {json_file.name}")

            except json.JSONDecodeError as e:
                print(f"  Error: Failed to parse {json_file.name}: {e}")
            except Exception as e:
                print(f"  Error: Failed to process {json_file.name}: {e}")

        # Write footer comment
        sql_file.write(f"-- Total records inserted: {total_records}\n")

    print(f"\n✓ SQL file generated successfully: {output_file}")
    print(f"✓ Total records: {total_records}")
    print(f"\nYou can now import this file into your database using:")
    print(f"  mysql -u username -p database_name < {output_file}")
    print(f"  or")
    print(f"  psql -U username -d database_name -f {output_file}")


if __name__ == "__main__":
    # You can customize these parameters
    DATA_FOLDER = "data"
    OUTPUT_FILE = "insert_data.sql"
    TABLE_NAME = "Email"  # Updated to match the Email model (Sequelize pluralizes it)

    print("=" * 60)
    print("SQL INSERT Generator")
    print("=" * 60)

    generate_sql_inserts(
        data_folder=DATA_FOLDER, output_file=OUTPUT_FILE, table_name=TABLE_NAME
    )

    print("\nDone!")
